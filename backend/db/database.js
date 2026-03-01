import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Authors: h_ypi and A.R.O.N.A
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../goods.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const ACTIVE_SOURCES = ['animate', 'kadokawa', 'cospa', 'charaon'];

const CHARACTER_KEYWORDS = {
  'アクア': ['アクア'],
  'めぐみん': ['めぐみん'],
  'ダクネス': ['ダクネス'],
  'カズマ': ['カズマ'],
  'ちょむすけ': ['ちょむすけ', 'ちょむ助'],
  'ゆんゆん': ['ゆんゆん']
};

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

const DEFAULT_PAGE_LIMIT = 30;
const MAX_PAGE_LIMIT = 200;

try {
  db.prepare('ALTER TABLE goods_items ADD COLUMN stock_status TEXT').run();
} catch (error) {
  const message = `${error?.message || ''}`;
  if (!message.includes('duplicate column name')) {
    throw error;
  }
}

function inferCategoryFromTitle(title) {
  const text = `${title || ''}`.normalize('NFKC');
  const lower = text.toLowerCase();
  const compact = text.replace(/\s+/g, ' ').trim();
  const looksLikeKonosubaMerch = KONOSUBA_MERCH_KEYWORDS.some((v) => text.includes(v));

  for (const rule of CATEGORY_RULES) {
    if (rule.guard && !rule.guard({ text, lower, compact, looksLikeKonosubaMerch })) {
      continue;
    }
    if (matchesCategoryRule(rule, { text, lower, compact })) {
      return rule.category;
    }
  }

  return null;
}

const KONOSUBA_MERCH_KEYWORDS = [
  'アクリル', 'コースター', '缶バッジ', 'キーホルダー', 'タペストリー',
  'Tシャツ', 'パーカー', 'ポスター', 'ステッカー', 'カード', 'ブロマイド',
  'ぬいぐるみ', '香水', 'マグカップ', 'グラス', 'バッグ', 'パスケース',
  'フィギュア', 'トート', 'クッション', '抱き枕', 'チャーム'
];

const CATEGORY_RULES = [
  { category: 'キーホルダー', priority: 1000, includes: ['キーホルダー', 'キーチェーン', 'アクキー', 'ラバーキーホルダー', 'メタルキーホルダー'], includesLower: ['keyholder', 'key chain'], regex: [] },
  { category: 'バッグ', priority: 990, includes: ['トート', 'バッグ', 'ショルダーバッグ', 'ニュースペーパーバッグ', 'リュック', 'ポーチ'], includesLower: ['bag', 'tote'], regex: [] },
  { category: 'アパレル', priority: 980, includes: ['タオル', 'ブランケット', 'クッション', '抱き枕', 'ピローケース', 'アイマスク', 'マスク'], includesLower: [], regex: [] },
  { category: 'キーホルダー', priority: 970, includes: ['ピンズ', 'ストラップ', 'チャーム'], includesLower: [], regex: [] },
  { category: 'パスケース', priority: 960, includes: ['カードホルダー', 'デッキケース', 'カードボックス'], includesLower: [], regex: [] },
  { category: 'パスケース', priority: 950, includes: ['パスケース'], includesLower: ['pass case', 'card case'], regex: [] },
  { category: 'マグカップ・グラス', priority: 940, includes: ['マグカップ', 'タンブラー', 'グラス', 'ジョッキ', '湯のみ', 'カップ', 'ソーサー', 'スプーン', 'コースター'], includesLower: ['mug', 'tumbler', 'glass', 'coaster'], regex: [] },
  { category: 'マット・マウスパッド', priority: 930, includes: ['ラバーマット', 'デスクマット', 'プレイマット', 'マウスパッド', '万能ラバーマット'], includesLower: ['desk mat', 'mouse pad', 'play mat'], regex: [] },
  { category: 'スマホケース', priority: 920, includes: ['スマホケース', 'カバーホルダー'], includesLower: ['phone case', 'smartphone case'], regex: [] },
  { category: '複製原画・アート', priority: 910, includes: ['ピクチャーボード', 'マルチスタンド', 'アルミプレート', 'ナンバープレート'], includesLower: [], regex: [] },
  { category: '複製原画・アート', priority: 900, includes: ['複製原画', 'キャラファイングラフ', '3dクリスタル', '3Dクリスタル', '木版画', '複製サイン', 'ミストグラフ'], includesLower: ['fine graph', 'art print', '3d crystal'], regex: [] },
  { category: 'フィギュア', priority: 890, includes: ['原作版', 'CAworks', 'Anime Opening Edition', 'レースクイーンver.', '波打ち際のコスプレver.', '猫耳メイドver.', 'ネグリジェver.', '学生服ver.'], includesLower: [], regex: [] },
  { category: 'プラモデル', priority: 880, includes: ['プラモデル'], includesLower: ['plastic model', 'plamodel'], regex: [] },
  { category: '缶バッジ', priority: 870, includes: ['缶バッジ', 'カンバッジ', 'canバッジ', '名札バッジ', 'ネームバッジ'], includesLower: ['badge', 'can badge', 'pin badge'], regex: [] },
  { category: 'クリアファイル', priority: 860, includes: ['クリアファイル', 'クリアホルダー'], includesLower: ['clear file'], regex: [] },
  { category: 'カード・ブロマイド', priority: 850, includes: ['ブロマイド', 'ポストカード'], includesLower: ['photo card', 'bromide', 'postcard'], regex: [] },
  { category: 'ポスター', priority: 840, includes: ['ポスター'], includesLower: ['poster'], regex: [] },
  { category: 'ステッカー', priority: 830, includes: ['ステッカー', 'シール'], includesLower: ['sticker', 'seal'], regex: [] },
  { category: 'つままれ', priority: 820, includes: ['つままれ'], includesLower: [], regex: [] },
  { category: 'ぬいぐるみ', priority: 810, includes: ['ぬいぐるみ', 'ぬい'], includesLower: ['plush'], regex: [] },
  { category: '香水', priority: 800, includes: ['香水', 'フレグランス', 'パフューム'], includesLower: ['fragrance', 'perfume'], regex: [] },
  { category: 'タペストリー', priority: 790, includes: ['タペストリー'], includesLower: ['tapestry'], regex: [] },
  { category: 'アクリルスタンド', priority: 780, includes: ['アクリルスタンド', 'アクスタ'], includesLower: ['acrylic stand'], regex: [] },
  { category: 'フィギュア', priority: 770, includes: ['フィギュア', 'ねんどろいど'], includesLower: ['figure', 'figma'], regex: [] },
  { category: 'Blu-ray', priority: 760, includes: ['ブルーレイ'], includesLower: ['blu-ray', 'blu ray'], regex: [] },
  { category: 'DVD', priority: 750, includes: [], includesLower: ['dvd'], regex: [] },
  { category: '音楽・主題歌', priority: 740, includes: ['主題歌', 'サウンドトラック', 'キャラソン'], includesLower: ['soundtrack', 'character song'], regex: [/^(?!.*音楽祭).*音楽/] },
  { category: 'アルバム', priority: 730, includes: ['アルバム'], includesLower: ['album', 'cd'], regex: [] },
  { category: '画集', priority: 720, includes: ['画集', '設定資料集', 'ビジュアルブック', 'ファンブック', 'Fan Book', 'パンフレット', 'ブックカバー', 'ブックマーク', '卓上カレンダー', '付箋'], includesLower: ['art book', 'visual book', 'fan book'], regex: [] },
  { category: '音楽・主題歌', priority: 710, includes: ['歌アニメーション'], includesLower: [], regex: [] },
  { category: '小説', priority: 700, includes: [], includesLower: [], regex: [/^この素晴らしい世界に祝福を!\s*よりみち(?:\s*[0-9]+\s*回目)?!?$/] },
  {
    category: '小説',
    priority: 690,
    includes: [],
    includesLower: [],
    regex: [/^この素晴らしい世界に祝福を!\s*[0-9]+(?:\s+[^0-9].*)?$/],
    guard: ({ looksLikeKonosubaMerch }) => !looksLikeKonosubaMerch
  },
  { category: '小説', priority: 680, includes: [], includesLower: [], regex: [/^この素晴らしい世界に祝福を!\s*スピンオフ\s*この素晴らしい世界に爆焔を!/] },
  { category: '小説', priority: 670, includes: ['あの愚か者にも脚光を!', 'あの愚か者にも脚光を！'], includesLower: [], regex: [] },
  { category: 'コミック', priority: 660, includes: ['あぁ、駄女神さま'], includesLower: [], regex: [] },
  { category: 'フィギュア', priority: 650, includes: [], includesLower: [], regex: [/^(?=.*【再販】)(?=.*この素晴らしい世界に祝福を！２)(?=.*めぐみん).*/] },
  { category: 'その他', priority: 640, includes: [], includesLower: [], regex: [/^(?=.*この素晴らしい世界に祝福を[!！])(?=.*TRPG).*/] },
  { category: 'コミック', priority: 630, includes: [], includesLower: [], regex: [/^続・この素晴らしい世界に爆焔を!.*スピンオフ/] },
  { category: 'コミック', priority: 620, includes: [], includesLower: [], regex: [/^続・この素晴らしい世界に爆焔を!\s*[0-9]+(?:\s|$)/] },
  { category: 'コミック', priority: 610, includes: [], includesLower: [], regex: [/^この素晴らしい世界に爆焔を!\s*[0-9]+(?:\s|$)/] },
  { category: 'コミック', priority: 600, includes: [], includesLower: [], regex: [/^この素晴らしい世界に祝福を!\s*かっぽれ!\s*(?:\(?[0-9]+\)?)(?:\s|$)/] },
  { category: 'コミック', priority: 590, includes: [], includesLower: [], regex: [/^(?=.*この素晴らしい世界に祝福を[!！])(?=.*アンソロジー).*/] },
  { category: 'コミック', priority: 580, includes: ['この素晴らしい世界に日常を!', 'この素晴らしい世界に日常を！'], includesLower: [], regex: [] },
  { category: '小説', priority: 570, includes: ['この仮面の悪魔に相談'], includesLower: [], regex: [] },
  { category: 'コミック', priority: 560, includes: ['コミック', '漫画'], includesLower: ['comic', 'manga'], regex: [] },
  { category: '小説', priority: 550, includes: ['小説', '文庫', 'ライトノベル', 'ノベル'], includesLower: ['novel', 'light novel'], regex: [] },
  { category: 'スマホケース', priority: 540, includes: ['POPSOCKETS', 'レザーケース'], includesLower: [], regex: [] },
  { category: 'アパレル', priority: 530, includes: ['Tシャツ', 'パーカー', 'トレーナー', 'ジャケット', 'シャツ', 'キャップ', '帽子', 'ソックス'], includesLower: ['t-shirt', 'hoodie', 'jacket', 'cap', 'socks', 'apparel'], regex: [] },
  { category: 'アパレル', priority: 520, includes: ['扇子'], includesLower: [], regex: [] },
  { category: 'アパレル', priority: 510, includes: ['甚平'], includesLower: [], regex: [] }
].sort((a, b) => b.priority - a.priority);

function matchesCategoryRule(rule, context) {
  const includeMatched = Array.isArray(rule.includes) && rule.includes.some((value) => context.text.includes(value));
  const includeLowerMatched =
    Array.isArray(rule.includesLower) && rule.includesLower.some((value) => context.lower.includes(value));
  const regexMatched = Array.isArray(rule.regex) && rule.regex.some((pattern) => pattern.test(context.compact));

  return includeMatched || includeLowerMatched || regexMatched;
}

export function recategorizeExistingGoods() {
  const rows = db.prepare('SELECT id, title, category FROM goods_items').all();
  const update = db.prepare('UPDATE goods_items SET category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

  const tx = db.transaction(() => {
    for (const row of rows) {
      const inferred = inferCategoryFromTitle(row.title);
      if (!inferred) continue;
      if ((row.category || 'その他') === inferred) continue;
      update.run(inferred, row.id);
    }
  });

  tx();
}

export function pruneInactiveSources() {
  return db
    .prepare(`DELETE FROM goods_items WHERE source_site NOT IN (${ACTIVE_SOURCES.map(() => '?').join(', ')})`)
    .run(...ACTIVE_SOURCES);
}

export function getActiveSources() {
  return [...ACTIVE_SOURCES];
}

function normalizeCategory(category, title) {
  return inferCategoryFromTitle(title) || category || 'その他';
}

function toSafeLimit(value, fallback = DEFAULT_PAGE_LIMIT, max = MAX_PAGE_LIMIT) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function toSafeOffset(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

function escapeLikeTerm(value) {
  return `${value || ''}`
    .trim()
    .slice(0, 80)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

function normalizeTranslationTitle(value) {
  return `${value || ''}`.trim().slice(0, 300);
}

function normalizeIpHash(value) {
  return `${value || ''}`.trim().slice(0, 128);
}

export function getCachedTitleTranslation(title) {
  const original = normalizeTranslationTitle(title);
  if (!original) return '';

  const row = db
    .prepare('SELECT translated_title FROM title_translations WHERE original_title = ? LIMIT 1')
    .get(original);

  return row?.translated_title || '';
}

export function getCachedTitleTranslations(titles = []) {
  const normalized = [...new Set((titles || []).map((v) => normalizeTranslationTitle(v)).filter(Boolean))];
  if (!normalized.length) {
    return new Map();
  }

  const rows = db
    .prepare(`SELECT original_title, translated_title FROM title_translations WHERE original_title IN (${normalized.map(() => '?').join(', ')})`)
    .all(...normalized);

  return new Map(rows.map((row) => [row.original_title, row.translated_title]));
}

export function upsertTitleTranslation(originalTitle, translatedTitle) {
  const original = normalizeTranslationTitle(originalTitle);
  const translated = normalizeTranslationTitle(translatedTitle);

  if (!original || !translated) return;

  db.prepare(
    `INSERT INTO title_translations (original_title, translated_title)
     VALUES (?, ?)
     ON CONFLICT(original_title) DO UPDATE SET
       translated_title = excluded.translated_title,
       updated_at = CURRENT_TIMESTAMP`
  ).run(original, translated);
}

export function upsertTitleTranslations(pairs = []) {
  const rows = (pairs || [])
    .map((pair) => ({
      original: normalizeTranslationTitle(pair?.original),
      translated: normalizeTranslationTitle(pair?.translated)
    }))
    .filter((pair) => pair.original && pair.translated && pair.original !== pair.translated);

  if (!rows.length) return 0;

  const stmt = db.prepare(
    `INSERT INTO title_translations (original_title, translated_title)
     VALUES (?, ?)
     ON CONFLICT(original_title) DO UPDATE SET
       translated_title = excluded.translated_title,
       updated_at = CURRENT_TIMESTAMP`
  );

  const tx = db.transaction(() => {
    for (const row of rows) {
      stmt.run(row.original, row.translated);
    }
  });

  tx();
  return rows.length;
}

export function hasSiteSupportClickByIpHash(ipHash) {
  const safeHash = normalizeIpHash(ipHash);
  if (!safeHash) return false;

  const row = db
    .prepare('SELECT 1 AS found FROM site_support_clicks WHERE ip_hash = ? LIMIT 1')
    .get(safeHash);

  return Boolean(row?.found);
}

export function insertSiteSupportClickByIpHash(ipHash) {
  const safeHash = normalizeIpHash(ipHash);
  if (!safeHash) {
    return { changes: 0 };
  }

  return db
    .prepare('INSERT OR IGNORE INTO site_support_clicks (ip_hash) VALUES (?)')
    .run(safeHash);
}

export function getAllGoods(limit, offset) {
  const safeLimit = toSafeLimit(limit);
  const safeOffset = toSafeOffset(offset);

  return db
    .prepare(`SELECT * FROM goods_items WHERE source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')}) ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...ACTIVE_SOURCES, safeLimit, safeOffset);
}

export function getGoodsPage({ limit = 30, offset = 0, category = '', source = '', character = '', stock = '' } = {}) {
  const safeLimit = toSafeLimit(limit);
  const safeOffset = toSafeOffset(offset);

  const where = [`source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')})`];
  const params = [...ACTIVE_SOURCES];

  if (category) {
    where.push('category = ?');
    params.push(category);
  }

  if (source && ACTIVE_SOURCES.includes(source)) {
    where.push('source_site = ?');
    params.push(source);
  }

  if (character && CHARACTER_KEYWORDS[character]) {
    const keys = CHARACTER_KEYWORDS[character];
    where.push(`(${keys.map(() => 'title LIKE ?').join(' OR ')})`);
    keys.forEach((k) => params.push(`%${k}%`));
  }

  if (stock && ['available', 'sold_out', 'ended', 'preorder'].includes(stock)) {
    where.push('stock_status = ?');
    params.push(stock);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const items = db
    .prepare(`SELECT * FROM goods_items ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, safeLimit, safeOffset);

  const total = db.prepare(`SELECT COUNT(*) AS count FROM goods_items ${whereClause}`).get(...params).count;

  return { items, total };
}

export function getGoodsByUrls(urls = []) {
  const cleaned = [...new Set((urls || []).filter((u) => typeof u === 'string' && u.trim()).map((u) => u.trim()))].slice(0, 500);
  if (!cleaned.length) {
    return [];
  }

  return db
    .prepare(
      `SELECT * FROM goods_items WHERE product_url IN (${cleaned
        .map(() => '?')
        .join(', ')}) AND source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')}) ORDER BY created_at DESC`
    )
    .all(...cleaned, ...ACTIVE_SOURCES);
}

export function getGoodsByCategory(category, limit = 30) {
  const safeLimit = toSafeLimit(limit);

  return db
    .prepare(
      `SELECT * FROM goods_items WHERE category = ? AND source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')}) ORDER BY created_at DESC LIMIT ?`
    )
    .all(category, ...ACTIVE_SOURCES, safeLimit);
}

export function getGoodsBySource(source, limit = 30) {
  const safeLimit = toSafeLimit(limit);

  if (!ACTIVE_SOURCES.includes(source)) {
    return [];
  }
  return db
    .prepare('SELECT * FROM goods_items WHERE source_site = ? ORDER BY created_at DESC LIMIT ?')
    .all(source, safeLimit);
}

export function searchGoods(keyword) {
  const escaped = escapeLikeTerm(keyword);
  const value = `%${escaped}%`;

  return db
    .prepare(
      `SELECT * FROM goods_items
       WHERE (title LIKE ? ESCAPE '\\' OR category LIKE ? ESCAPE '\\')
         AND source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')})
       ORDER BY created_at DESC
       LIMIT 50`
    )
    .all(value, value, ...ACTIVE_SOURCES);
}

export function getRecentGoods(limit = 1200) {
  const safeLimit = toSafeLimit(limit, 1200, 3000);

  return db
    .prepare(
      `SELECT * FROM goods_items
       WHERE source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')})
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(...ACTIVE_SOURCES, safeLimit);
}

export function getStats() {
  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM goods_items WHERE source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')})`)
    .get(...ACTIVE_SOURCES);
  const byCategory = db
    .prepare(
      `SELECT category, COUNT(*) AS count FROM goods_items WHERE source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')}) GROUP BY category`
    )
    .all(...ACTIVE_SOURCES);
  const bySource = db
    .prepare(
      `SELECT source_site, COUNT(*) AS count FROM goods_items WHERE source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')}) GROUP BY source_site`
    )
    .all(...ACTIVE_SOURCES);
  const thisMonth = db
    .prepare(
      `SELECT COUNT(*) AS count FROM goods_items WHERE created_at >= date('now', 'start of month') AND source_site IN (${ACTIVE_SOURCES.map(() => '?').join(', ')})`
    )
    .get(...ACTIVE_SOURCES);
  const lastUpdated = db
    .prepare(
      `SELECT MAX(COALESCE(scraped_at, updated_at, created_at)) AS last_updated FROM goods_items WHERE source_site IN (${ACTIVE_SOURCES
        .map(() => '?')
        .join(', ')})`
    )
    .get(...ACTIVE_SOURCES);

  return {
    total: total.count,
    new_this_month: thisMonth.count,
    last_updated: lastUpdated.last_updated || null,
    by_category: Object.fromEntries(byCategory.map((r) => [r.category || '未分類', r.count])),
    by_source: Object.fromEntries(bySource.map((r) => [r.source_site || 'unknown', r.count]))
  };
}

export function upsertGoods(item) {
  const stockStatus = ['available', 'sold_out', 'ended', 'preorder'].includes(item.stock_status)
    ? item.stock_status
    : (item.is_available === false ? 'sold_out' : 'available');

  const stmt = db.prepare(`
    INSERT INTO goods_items (
      title, price, category, product_url, image_url,
      source_site, is_limited, is_available, stock_status, scraped_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_url) DO UPDATE SET
      title = excluded.title,
      price = excluded.price,
      category = excluded.category,
      image_url = excluded.image_url,
      source_site = excluded.source_site,
      is_limited = excluded.is_limited,
      is_available = excluded.is_available,
      stock_status = excluded.stock_status,
      updated_at = CURRENT_TIMESTAMP,
      scraped_at = excluded.scraped_at
  `);

  return stmt.run(
    item.title,
    item.price ?? null,
    normalizeCategory(item.category, item.title),
    item.product_url,
    item.image_url ?? null,
    item.source_site,
    item.is_limited ? 1 : 0,
    item.is_available === false ? 0 : 1,
    stockStatus,
    item.scraped_at ?? new Date().toISOString()
  );
}
