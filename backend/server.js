import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import {
  getCachedTitleTranslation,
  getCachedTitleTranslations,
  getGoodsByUrls,
  getGoodsPage,
  hasSiteSupportClickByIpHash,
  insertSiteSupportClickByIpHash,
  getRecentGoods,
  getStats,
  searchGoods,
  upsertTitleTranslation,
  upsertTitleTranslations
} from './db/database.js';
import {importFromJson} from './utils/importer.js';
import {createHash, timingSafeEqual} from 'crypto';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

/**
 * Authors: h_ypi and A.R.O.N.A
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = Number.parseInt(process.env.PORT, 10);
const HOST = process.env.HOST;
const TRUST_PROXY = ['1', 'true', 'yes', 'on'].includes(`${process.env.TRUST_PROXY || 'true'}`.toLowerCase());

const IMPORT_API_TOKEN = process.env.IMPORT_API_TOKEN || '';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
const IMPORT_ALLOWLIST = parseCsvList(process.env.IMPORT_ALLOWLIST || '127.0.0.1,::1');

const MAX_PER_PAGE = 30;
const MAX_TRANSLATE_BATCH = 120;
const TRANSLATE_CONCURRENCY = 6;
const MAX_FEEDBACK_MESSAGE = 4000;
const MAX_URLS_BATCH = 500;
const MAX_URL_LENGTH = 2048;
const FEEDBACK_MIN_ELAPSED_MS = 1200;
const FEEDBACK_DUP_WINDOW_MS = 10 * 60 * 1000;
const FEEDBACK_BURST_WINDOW_MS = 60 * 1000;
const FEEDBACK_BURST_MAX = 5;
const APP_USER_AGENT = 'megumin.vip/1.0 (+https://megumin.vip)';

const ALLOWED_STOCK = new Set(['available', 'sold_out', 'ended', 'preorder']);
const ALLOWED_CHARACTER = new Set(['', 'アクア', 'めぐみん', 'ダクネス', 'カズマ', 'ちょむすけ', 'ゆんゆん']);
const ALLOWED_SOURCE = new Set(['', 'animate', 'kadokawa', 'cospa', 'charaon']);

const MAX_TRANSLATION_CACHE_SIZE = 8000;
const titleTranslationCache = new Map();
const translateInFlight = new Map();
const STRICT_POST_PATHS = new Set([
  '/api/feedback',
  '/api/import',
  '/api/translate/titles',
  '/api/goods/by-urls',
  '/api/service-support'
]);
const feedbackSpamCache = new Map();

const SEARCH_ALIAS_MAP = {
  megumin: ['めぐみん'],
  aqua: ['アクア'],
  darkness: ['ダクネス'],
  kazuma: ['カズマ'],
  yunyun: ['ゆんゆん'],
  chomusuke: ['ちょむすけ', 'ちょむ助'],
  konosuba: ['このすば', 'この素晴らしい世界に祝福を'],
  acrylic: ['アクリル'],
  'acrylic stand': ['アクリルスタンド'],
  stand: ['スタンド'],
  figure: ['フィギュア'],
  badge: ['缶バッジ'],
  keychain: ['キーホルダー'],
  keyholder: ['キーホルダー'],
  coaster: ['コースター'],
  canbadge: ['缶バッジ'],
  tshirt: ['Tシャツ'],
  't-shirt': ['Tシャツ'],
  tapestry: ['タペストリー'],
  sticker: ['ステッカー'],
  poster: ['ポスター'],
  novel: ['小説'],
  comic: ['コミック'],
  manga: ['コミック'],
  artbook: ['画集'],
  'blu-ray': ['Blu-ray'],
  bluray: ['Blu-ray'],
  dvd: ['DVD'],
  apparel: ['アパレル'],
  hoodie: ['パーカー'],
  perfume: ['香水', 'フレグランス']
};

const CATEGORY_EN_MAP = {
  'フィギュア': 'figure',
  'アクリルスタンド': 'acrylic stand',
  'キーホルダー': 'keychain',
  'バッグ': 'bag',
  'パスケース': 'pass case',
  'マグカップ・グラス': 'mug glass coaster',
  'マット・マウスパッド': 'mat mouse pad',
  'スマホケース': 'phone case',
  '複製原画・アート': 'art print',
  'プラモデル': 'plastic model',
  '缶バッジ': 'can badge',
  'クリアファイル': 'clear file',
  'カード・ブロマイド': 'card bromide',
  'ポスター': 'poster',
  'ステッカー': 'sticker',
  'つままれ': 'tsumamare',
  'ぬいぐるみ': 'plush',
  '香水': 'perfume',
  'タペストリー': 'tapestry',
  'アパレル': 'apparel',
  'コミック': 'comic',
  '小説': 'novel',
  '画集': 'art book',
  'Blu-ray': 'blu-ray',
  'DVD': 'dvd',
  '音楽・主題歌': 'music soundtrack',
  'アルバム': 'album',
  'その他': 'other'
};

const TRANSLATION_TERM_MAP = [
  ['この素晴らしい世界に祝福を！', "KonoSuba: God's Blessing on This Wonderful World!"],
  ['この素晴らしい世界に祝福を!', "KonoSuba: God's Blessing on This Wonderful World!"],
  ['続・この素晴らしい世界に爆焔を！', 'KonoSuba: Continued Explosions on This Wonderful World!'],
  ['この素晴らしい世界に爆焔を！', 'KonoSuba: An Explosion on This Wonderful World!'],
  ['この素晴らしい世界に日常を！', 'KonoSuba: Everyday Life in This Wonderful World!'],
  ['この仮面の悪魔に相談を！', 'Consult This Masked Devil!'],
  ['めぐみん', 'Megumin'],
  ['アクア', 'Aqua'],
  ['ダクネス', 'Darkness'],
  ['カズマ', 'Kazuma'],
  ['ゆんゆん', 'Yunyun'],
  ['ちょむすけ', 'Chomusuke'],
  ['アクリルスタンド', 'Acrylic Stand'],
  ['アクリルキャラスタンド', 'Acrylic Character Stand'],
  ['アクリルジオラマ', 'Acrylic Diorama'],
  ['アクリルキーホルダー', 'Acrylic Keychain'],
  ['アクリルコースター', 'Acrylic Coaster'],
  ['キャラクターラバーマット', 'Character Rubber Mat'],
  ['ラバーマット', 'Rubber Mat'],
  ['タペストリー', 'Tapestry'],
  ['缶バッジ', 'Can Badge'],
  ['クリアファイル', 'Clear File'],
  ['ブロマイド', 'Bromide'],
  ['ポストカード', 'Postcard'],
  ['フルグラフィックTシャツ', 'Full Graphic T-Shirt'],
  ['Tシャツ', 'T-Shirt'],
  ['パーカー', 'Hoodie'],
  ['フィギュア', 'Figure'],
  ['ぬいぐるみ', 'Plush'],
  ['キーホルダー', 'Keychain'],
  ['香水', 'Perfume'],
  ['フレグランス', 'Fragrance'],
  ['予約受付中', 'Pre-order Open'],
  ['在庫切れ', 'Sold Out'],
  ['販売終了', 'Sales Ended'],
  ['映画 ', 'Movie: ']
];

function getRequestPath(request) {
  return request.routerPath || request.routeOptions?.url || request.url || '';
}

function parseCsvList(value) {
  return `${value || ''}`
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function secureTokenEquals(actual, expected) {
  const a = Buffer.from(`${actual || ''}`);
  const b = Buffer.from(`${expected || ''}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sanitizeUrlList(values) {
  const deduped = new Set();
  for (const raw of values || []) {
    const value = `${raw || ''}`.trim();
    if (!value || value.length > MAX_URL_LENGTH) continue;
    if (!value.startsWith('http://') && !value.startsWith('https://')) continue;
    deduped.add(value);
    if (deduped.size >= MAX_URLS_BATCH) break;
  }
  return [...deduped];
}

function sanitizeTitles(values) {
  const deduped = new Set();
  for (const raw of values || []) {
    const value = `${raw || ''}`.trim();
    if (!value || value.length > 200) continue;
    deduped.add(value);
    if (deduped.size >= MAX_TRANSLATE_BATCH) break;
  }
  return [...deduped];
}

function preprocessTitleForTranslation(value) {
  return `${value || ''}`
    .replace(/【[^】]*】/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*CV[^)]*\)/gi, ' ')
    .replace(/［/g, '[')
    .replace(/］/g, ']')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

function applyTranslationDictionary(value) {
  let next = `${value || ''}`;
  for (const [from, to] of TRANSLATION_TERM_MAP) {
    next = next.replaceAll(from, to);
  }
  return next;
}

const TRANSLATION_HINT_WORDS = [
  'KonoSuba',
  'Megumin',
  'Aqua',
  'Darkness',
  'Kazuma',
  'Yunyun',
  'Chomusuke',
  'Acrylic',
  'Figure',
  'Keychain',
  'Can Badge',
  'Tapestry',
  'Hoodie',
  'T-Shirt',
  'Pre-order',
  'Sold Out'
];

function countJapaneseChars(value) {
  const text = `${value || ''}`;
  const matched = text.match(/[ぁ-んァ-ン一-龯]/g);
  return matched ? matched.length : 0;
}

function containsJapanese(value) {
  return countJapaneseChars(value) > 0;
}

function scoreTranslationQuality(source, translated) {
  const output = `${translated || ''}`.trim();
  if (!output) return Number.NEGATIVE_INFINITY;

  const sourceText = `${source || ''}`.trim();
  const sourceLen = Math.max(1, sourceText.length);
  const outputLen = output.length;
  const jpCount = countJapaneseChars(output);

  let score = 0;
  score -= jpCount * 3;

  const lengthRatio = outputLen / sourceLen;
  if (lengthRatio >= 0.45 && lengthRatio <= 2.5) score += 4;
  if (lengthRatio >= 0.7 && lengthRatio <= 1.8) score += 3;

  for (const hint of TRANSLATION_HINT_WORDS) {
    if (output.includes(hint)) score += 1;
  }

  if (/\bundefined\b|\bnull\b/i.test(output)) score -= 8;
  if (/\?{3,}/.test(output)) score -= 3;

  return score;
}

function pickBestTranslation(source, candidates) {
  let best = '';
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const normalized = normalizeTranslatedTitle(candidate);
    const score = scoreTranslationQuality(source, normalized);
    if (score > bestScore) {
      best = normalized;
      bestScore = score;
    }
  }

  return best || '';
}

function normalizeTranslatedTitle(value) {
  return `${value || ''}`
    .replace(/［/g, '[')
    .replace(/］/g, ']')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/【[^】]*】/g, ' ')
    .replace(/god'?s\s+blessing\s+on\s+this\s+wonderful\s+world!?/gi, "KonoSuba: God's Blessing on This Wonderful World!")
    .replace(/movie\s+konosuba/gi, 'Movie: KonoSuba')
    .replace(/KonoSuba:\s*KonoSuba:/g, 'KonoSuba:')
    .replace(/crimson\s+legend/gi, 'Crimson Legend')
    .replace(/full\s+graphic\s+t-?shirt/gi, 'Full Graphic T-Shirt')
    .replace(/acrylic\s+coaster/gi, 'Acrylic Coaster')
    .replace(/\s*ver\.?\s*/gi, ' Ver. ')
    .replace(/\s*\[\s*/g, ' [')
    .replace(/\s*\]\s*/g, '] ')
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ')
    .replace(/\bxl\b/gi, 'XL')
    .replace(/\bl\b/g, 'L')
    .replace(/\bm\b/g, 'M')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTranslateEndpoints(query) {
  const encoded = encodeURIComponent(query);
  return [
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encoded}`,
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encoded}`
  ];
}

async function fetchTranslatedText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': APP_USER_AGENT
      }
    });

    if (!res.ok) {
      return '';
    }

    const data = await res.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => part?.[0] || '').join('').trim()
      : '';
    return normalizeTranslatedTitle(translated);
  } finally {
    clearTimeout(timeout);
  }
}

function getCachedTranslation(key) {
  const hit = titleTranslationCache.get(key);
  if (!hit) return null;
  titleTranslationCache.delete(key);
  titleTranslationCache.set(key, hit);
  return hit;
}

function setCachedTranslation(key, value) {
  if (!key || !value) return;
  if (titleTranslationCache.has(key)) {
    titleTranslationCache.delete(key);
  }
  titleTranslationCache.set(key, value);
  if (titleTranslationCache.size > MAX_TRANSLATION_CACHE_SIZE) {
    const oldest = titleTranslationCache.keys().next().value;
    if (oldest) {
      titleTranslationCache.delete(oldest);
    }
  }
}

function shouldPersistTranslation(source, translated) {
  if (!source || !translated) return false;
  return `${source}`.trim() !== `${translated}`.trim();
}

function persistTitleTranslationSafe(source, translated) {
  if (!shouldPersistTranslation(source, translated)) return;
  try {
    upsertTitleTranslation(source, translated);
  } catch (error) {
    app.log.warn({
          err: error
    },
        'failed to persist translation cache'
    );
  }
}

function buildSearchVariants(query) {
  const normalized = `${query || ''}`.trim();
  const lower = normalized.toLowerCase();
  const variants = new Set([normalized]);

  for (const [alias, mapped] of Object.entries(SEARCH_ALIAS_MAP)) {
    if (!lower.includes(alias)) continue;
    for (const value of mapped) variants.add(value);
  }

  return [...variants].slice(0, 12);
}

function isEnglishSearchQuery(query) {
  const text = `${query || ''}`;
  return /[a-z]/i.test(text) && !/[ぁ-んァ-ン一-龯]/.test(text);
}

function includesAllTokens(haystack, query) {
  const normalizedHaystack = `${haystack || ''}`.toLowerCase();
  const tokens = `${query || ''}`
    .toLowerCase()
    .split(/\s+/)
    .map((v) => v.trim())
    .filter((v) => v.length >= 2);

  if (!tokens.length) {
    return normalizedHaystack.includes(`${query || ''}`.toLowerCase());
  }

  return tokens.every((token) => normalizedHaystack.includes(token));
}

async function mapWithConcurrency(values, worker, concurrency = 4) {
  const results = new Array(values.length);
  let index = 0;

  const run = async () => {
    while (index < values.length) {
      const current = index;
      index += 1;
      results[current] = await worker(values[current], current);
    }
  };

  const runners = Array.from({ length: Math.max(1, Math.min(concurrency, values.length || 1)) }, () => run());
  await Promise.all(runners);
  return results;
}

function compactSpaces(value) {
  return `${value || ''}`.replace(/\s+/g, ' ').trim();
}

function hashText(value) {
  return createHash('sha256').update(value).digest('hex');
}

function getFeedbackClientKey(request) {
  const origin = compactSpaces(request.headers.origin || '');
  return `${normalizeIp(request.ip) || 'unknown'}|${origin || 'no-origin'}`;
}

function isLikelySpamMessage(value) {
  const text = compactSpaces(value);
  if (!text) return true;

  const repeatedChar = /(.)\1{24,}/.test(text);
  if (repeatedChar) return true;

  return (text.match(/https?:\/\//gi) || []).length >= 6;
}

function isSpamFeedback(clientKey, message) {
  const now = Date.now();
  const messageHash = hashText(compactSpaces(message).toLowerCase());
  const state = feedbackSpamCache.get(clientKey) || { recent: [], burst: [] };

  state.recent = state.recent.filter((item) => now - item.time <= FEEDBACK_DUP_WINDOW_MS);
  state.burst = state.burst.filter((time) => now - time <= FEEDBACK_BURST_WINDOW_MS);

  const duplicate = state.recent.some((item) => item.hash === messageHash);
  const burstExceeded = state.burst.length >= FEEDBACK_BURST_MAX;

  state.recent.push({ hash: messageHash, time: now });
  state.burst.push(now);
  feedbackSpamCache.set(clientKey, state);

  if (feedbackSpamCache.size > 500) {
    for (const [key, value] of feedbackSpamCache.entries()) {
      if (!value.recent.length && !value.burst.length) {
        feedbackSpamCache.delete(key);
      }
    }
  }

  return duplicate || burstExceeded;
}

function anonymizeIp(ip) {
  const raw = `${ip || ''}`.trim();
  if (!raw) return 'unknown';

  if (raw.includes('.')) {
    const parts = raw.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  if (raw.includes(':')) {
    const parts = raw.split(':');
    return `${parts.slice(0, 4).join(':')}::`;
  }

  return 'unknown';
}

function normalizeIp(ip) {
  const raw = `${ip || ''}`.trim();
  if (!raw) return '';
  if (raw === '::1') return '127.0.0.1';
  if (raw.startsWith('::ffff:')) return raw.slice('::ffff:'.length);
  return raw;
}

function isImportClientAllowed(ip) {
  const normalized = normalizeIp(ip);
  return IMPORT_ALLOWLIST.includes(normalized);
}

function hasJsonContentType(contentType) {
  return `${contentType || ''}`.toLowerCase().startsWith('application/json');
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

function sanitizeCategory(value) {
  return `${value || ''}`.trim().slice(0, 60);
}

const allowedOrigins = [
  'https://megumin.vip',
  'https://www.megumin.vip',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const app = Fastify({
  logger: true,
  bodyLimit: 64 * 1024,
  trustProxy: TRUST_PROXY
});

await app.register(cors, {
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['content-type', 'authorization'],
  origin(origin, callback) {
    callback(null, allowedOrigins.includes(origin));
  }
});

await app.register(rateLimit, {
  global: true,
  max: 150,
  timeWindow: '1 minute'
});

app.addHook('onRequest', async (request, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Referrer-Policy', 'no-referrer');
  reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (request.raw.url?.startsWith('/api/')) {
    reply.header('Cache-Control', 'no-store');

    const origin = `${request.headers.origin || ''}`.trim();
    if (!isAllowedOrigin(origin)) {
      reply.code(403).send({
        success: false,
        error: 'Forbidden origin'
      });
      return;
    }
  }
});

app.addHook('onResponse', async (request, reply) => {
  if (!request.raw.url?.startsWith('/api/')) {
    return;
  }

  request.log.info({
    sec_event: 'api_access',
    method: request.method,
    path: getRequestPath(request),
    status: reply.statusCode,
    ip_masked: anonymizeIp(request.ip)
  });
});

app.addHook('preHandler', async (request, reply) => {
  if (request.method !== 'POST' || !STRICT_POST_PATHS.has(getRequestPath(request))) {
    return;
  }

  if (!hasJsonContentType(request.headers['content-type'])) {
    reply.code(415).send({
      success: false,
      error: 'Content-Type must be application/json'
    });
    return;
  }

  const origin = `${request.headers.origin || ''}`.trim();
  if (!isAllowedOrigin(origin)) {
    reply.code(403).send({
      success: false,
      error: 'Forbidden origin'
    });
  }
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  if (error.statusCode && error.statusCode < 500) {
    reply.code(error.statusCode).send({
      success: false,
      error: error.message || 'Bad request'
    });
    return;
  }

  reply.code(500).send({
    success: false,
    error: 'Internal server error'
  });
});

function parsePositiveInt(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

async function translateToEnglish(text, options = {}) {
  const { skipPersistentLookup = false, persistResult = true } = options;
  const source = `${text || ''}`.trim();
  if (!source) return '';

  if (!containsJapanese(source)) {
    return source;
  }

  const cached = getCachedTranslation(source);
  if (cached) {
    return cached;
  }

  if (!skipPersistentLookup) {
    try {
      const persisted = getCachedTitleTranslation(source);
      if (persisted) {
        setCachedTranslation(source, persisted);
        return persisted;
      }
    } catch (error) {
      app.log.warn({ err: error }, 'failed to read translation cache');
    }
  }

  if (translateInFlight.has(source)) {
    return translateInFlight.get(source);
  }

  const job = (async () => {
    const cleanedSource = preprocessTitleForTranslation(source) || source;
    const dictionaryCandidate = normalizeTranslatedTitle(applyTranslationDictionary(cleanedSource));
    if (dictionaryCandidate && !containsJapanese(dictionaryCandidate)) {
      setCachedTranslation(source, dictionaryCandidate);
      if (persistResult) {
        persistTitleTranslationSafe(source, dictionaryCandidate);
      }
      return dictionaryCandidate;
    }

    const endpoints = buildTranslateEndpoints(cleanedSource);
    const candidates = [];
    if (dictionaryCandidate) {
      candidates.push(dictionaryCandidate);
    }

    for (const url of endpoints) {
      try {
        const translated = await fetchTranslatedText(url);

        if (translated) {
          const improved = normalizeTranslatedTitle(applyTranslationDictionary(translated) || translated);
          if (improved) {
            candidates.push(improved);
          }
        }
      } catch (error) {
        app.log.debug({ err: error, source }, 'translation endpoint fallback');
      }
    }

    const fallback = normalizeTranslatedTitle(applyTranslationDictionary(source));
    if (fallback) {
      candidates.push(fallback);
    }

    const best = pickBestTranslation(source, candidates) || source;
    setCachedTranslation(source, best);
    if (persistResult) {
      persistTitleTranslationSafe(source, best);
    }
    return best;
  })();

  translateInFlight.set(source, job);
  try {
    return await job;
  } finally {
    translateInFlight.delete(source);
  }
}

app.get('/api/goods', async (request) => {
  const {
    page = 1,
    per_page = 20,
    category = '',
    source = '',
    character = '',
    stock = ''
  } = request.query;

  const currentPage = parsePositiveInt(page, 1);
  const limit = parsePositiveInt(per_page, 20, MAX_PER_PAGE);
  const offset = (currentPage - 1) * limit;

  const safeSource = ALLOWED_SOURCE.has(source) ? source : '';
  const safeCharacter = ALLOWED_CHARACTER.has(character) ? character : '';
  const safeStock = ALLOWED_STOCK.has(stock) ? stock : '';

  const { items, total } = getGoodsPage({
    limit,
    offset,
    category: sanitizeCategory(category),
    source: safeSource,
    character: safeCharacter,
    stock: safeStock
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    page: currentPage,
    per_page: limit,
    total,
    total_pages: totalPages,
    has_next: currentPage < totalPages,
    has_prev: currentPage > 1
  };
});

app.get('/api/search', async (request) => {
  const q = `${request.query.q || ''}`.trim();
  if (!q) {
    return { items: [] };
  }

  const variants = buildSearchVariants(q.slice(0, 80));
  const merged = new Map();

  for (const term of variants) {
    const rows = searchGoods(term);
    for (const item of rows) {
      const key = item.product_url || `${item.source_site}::${item.title}`;
      if (!merged.has(key)) {
        merged.set(key, item);
      }
    }
    if (merged.size >= 120) break;
  }

  if (isEnglishSearchQuery(q) && merged.size < 50) {
    const recent = getRecentGoods(1200);
    for (const item of recent) {
      const key = item.product_url || `${item.source_site}::${item.title}`;
      if (merged.has(key)) {
        continue;
      }

      const englishTitle = normalizeTranslatedTitle(
        applyTranslationDictionary(preprocessTitleForTranslation(item.title || ''))
      );
      const englishCategory = CATEGORY_EN_MAP[item.category] || '';
      const haystack = `${englishTitle} ${englishCategory}`;

      if (includesAllTokens(haystack, q)) {
        merged.set(key, item);
      }

      if (merged.size >= 120) {
        break;
      }
    }
  }

  return {
    items: [...merged.values()].slice(0, 50)
  };
});

app.get('/api/stats', async () => getStats());

app.post('/api/goods/by-urls', {
  config: {
    rateLimit: {
      max: 40,
      timeWindow: '1 minute'
    }
  }
}, async (request) => {
  const urls = sanitizeUrlList(Array.isArray(request.body?.urls) ? request.body.urls : []);

  return {
    items: getGoodsByUrls(urls)
  };
});

app.post('/api/translate/titles', {
  config: {
    rateLimit: {
      max: 80,
      timeWindow: '1 minute'
    }
  }
}, async (request) => {
  const titles = sanitizeTitles(Array.isArray(request.body?.titles) ? request.body.titles : []);

  let persistedMap = new Map();
  try {
    persistedMap = getCachedTitleTranslations(titles);
  } catch (error) {
    app.log.warn({ err: error }, 'failed to read translation cache batch');
  }

  const pending = titles.filter((title) => !persistedMap.has(title));

  const translatedPending = await mapWithConcurrency(
    pending,
    async (title) => {
      const translated = await translateToEnglish(title, {
        skipPersistentLookup: true,
        persistResult: false
      });
      return { original: title, translated };
    },
    TRANSLATE_CONCURRENCY
  );

  try {
    upsertTitleTranslations(translatedPending);
  } catch (error) {
    app.log.warn({ err: error }, 'failed to persist translation cache batch');
  }

  const pendingMap = new Map(translatedPending.map((row) => [row.original, row.translated]));

  const items = titles.map((title) => ({
    original: title,
    translated: persistedMap.get(title) || pendingMap.get(title) || title
  }));

  return { items };
});

app.post('/api/service-support', {
  config: {
    rateLimit: {
      max: 12,
      timeWindow: '1 minute'
    }
  }
}, async (request, reply) => {
  const normalizedIp = normalizeIp(request.ip) || 'unknown';
  const ipHash = hashText(`service-support:${normalizedIp}`);

  try {
    if (hasSiteSupportClickByIpHash(ipHash)) {
      reply.code(409);
      return {
        success: false,
        error: 'Already submitted from this network'
      };
    }

    const inserted = insertSiteSupportClickByIpHash(ipHash);
    if (!inserted?.changes) {
      reply.code(409);
      return {
        success: false,
        error: 'Already submitted from this network'
      };
    }
  } catch (error) {
    request.log.error(error);
    reply.code(500);
    return {
      success: false,
      error: 'Failed to record support'
    };
  }

  let notified = false;

  if (DISCORD_WEBHOOK_URL) {
    const payload = {
      content: '先生！ 継続希望ボタンが押されました！',
      allowed_mentions: {
        parse: []
      },
      embeds: [
        {
          title: '継続希望リアクション',
          description: '「維持する可能性が上がるかもしれない」ボタンが押されました。',
          fields: [
            {
              name: 'IP(匿名化)',
              value: anonymizeIp(request.ip)
            }
          ]
        }
      ]
    };

    try {
      const webhookRes = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });
      notified = webhookRes.ok;
      if (!webhookRes.ok) {
        request.log.warn({ status: webhookRes.status }, 'service support webhook failed');
      }
    } catch (error) {
      request.log.warn({ err: error }, 'service support webhook error');
    }
  }

  return {
    success: true,
    notified
  };
});

app.post('/api/feedback', {
  config: {
    rateLimit: {
      max: 25,
      timeWindow: '1 minute'
    }
  }
}, async (request, reply) => {
  if (!DISCORD_WEBHOOK_URL) {
    reply.code(503);
    return {
      success: false,
      error: 'Feedback endpoint disabled'
    };
  }

  const kind = `${request.body?.kind || 'request'}`.trim().toLowerCase();

  const message = `${request.body?.message || ''}`.trim();
  const page = `${request.body?.page || ''}`.trim();
  const honeypot = `${request.body?.website || request.body?.hp || ''}`.trim();
  const elapsedMs = Number.parseInt(request.body?.elapsed_ms, 10);

  if (honeypot) {
    reply.code(400);
    return {
      success: false,
      error: 'Invalid submission'
    };
  }

  if (!Number.isFinite(elapsedMs) || elapsedMs < FEEDBACK_MIN_ELAPSED_MS || elapsedMs > 2 * 60 * 60 * 1000) {
    reply.code(400);
    return {
      success: false,
      error: 'Invalid submission timing'
    };
  }

  if (!message || message.length < 8) {
    reply.code(400);
    return {
      success: false,
      error: 'Message too short'
    };
  }

  const safeKind = kind === 'bug' ? 'bug' : 'request';
  const clippedMessage = message.slice(0, MAX_FEEDBACK_MESSAGE);
  const clientKey = getFeedbackClientKey(request);

  if (isLikelySpamMessage(clippedMessage) || isSpamFeedback(clientKey, clippedMessage)) {
    reply.code(429);
    return {
      success: false,
      error: 'Too many similar submissions'
    };
  }

  const payload = {
    content: '先生！ 新しい仕事ですよ！',
    allowed_mentions: {
      parse: []
    },
    embeds: [
      {
        title: `種類: ${safeKind}`,
        description: clippedMessage,
        fields: page
          ? [
              {
                name: 'ページ',
                value: page.slice(0, 200)
              }
            ]
          : []
      }
    ]
  };

  try {
    const webhookRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    if (!webhookRes.ok) {
      reply.code(502);
      return {
        success: false,
        error: 'Webhook failed'
      };
    }

    return { success: true };
  } catch (error) {
    request.log.error(error);
    reply.code(500);
    return {
      success: false,
      error: 'Feedback delivery failed'
    };
  }
});

//Token必須に変更
app.post('/api/import', {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute'
    }
  }
}, async (request, reply) => {
  if (!isImportClientAllowed(request.ip)) {
    reply.code(403);
    return {
      success: false,
      error: 'Import client is not allowed'
    };
  }

  if (!IMPORT_API_TOKEN) {
    reply.code(503);
    return {
      success: false,
      error: 'Import endpoint disabled'
    };
  }

  const auth = request.headers.authorization || '';
  const expected = `Bearer ${IMPORT_API_TOKEN}`;

  if (!secureTokenEquals(auth, expected)) {
    reply.code(401);
    return {
      success: false,
      error: 'Unauthorized'
    };
  }

  try {
    const jsonPath = join(__dirname, '../scraper/output/goods_data.json');

    const result = importFromJson(jsonPath);

    return {
      success: true,
      ...result
    };
  } catch (error) {
    request.log.error(error);
    reply.code(500);
    return {
      success: false,
      error: 'Import failed'
    };
  }
});

try {
  await app.listen({ port: PORT, host: HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
