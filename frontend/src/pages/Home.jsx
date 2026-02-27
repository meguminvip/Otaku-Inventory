import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import gsap from 'gsap';
import { HiChartBar, HiGlobeAlt, HiHeart } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import GoodsCard from '../components/GoodsCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import StatCard from '../components/StatCard.jsx';
import { useI18n } from '../hooks/useI18n.js';
import api from '../api/api.js';

/**
 * Authors: h_ypi and A.R.O.N.A
 */

const FAVORITES_KEY = 'otaku_inventory_favorites';
const FAVORITE_ITEMS_CACHE_KEY = 'otaku_inventory_favorite_items';
const LAST_UPDATED_KEY = 'otaku_inventory_last_updated';
const CHARACTER_KEYWORDS = {
  アクア: ['アクア'],
  めぐみん: ['めぐみん'],
  ダクネス: ['ダクネス'],
  カズマ: ['カズマ'],
  ちょむすけ: ['ちょむすけ', 'ちょむ助'],
  ゆんゆん: ['ゆんゆん']
};

function itemKey(item) {
  return item?.product_url || `${item?.source_site || 'unknown'}::${item?.title || 'untitled'}`;
}

export default function Home({ initialFavoritesOnly = false }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [goods, setGoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filters, setFilters] = useState({ category: '', source: '', character: '', stock: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searching, setSearching] = useState(false);
  const [favoriteQuery, setFavoriteQuery] = useState('');
  const [favoriteKeys, setFavoriteKeys] = useState([]);
  const [favoriteItemsByKey, setFavoriteItemsByKey] = useState({});
  const [translatedTitles, setTranslatedTitles] = useState({});
  const translatedTitlesRef = useRef({});
  const goodsRequestIdRef = useRef(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(initialFavoritesOnly);
  const isInitialLoading = loading && goods.length === 0;

  const getRequestErrorMessage = (error) => {
    if (error?.response?.status === 429) {
      return t('rate_limited_error');
    }
    return t('load_error');
  };

  const syncLastUpdated = (value) => {
    if (!value) return;
    localStorage.setItem(LAST_UPDATED_KEY, value);
    window.dispatchEvent(new CustomEvent('otaku:last-updated', { detail: value }));
  };

  useEffect(() => {
    setShowFavoritesOnly(initialFavoritesOnly);
  }, [initialFavoritesOnly]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      if (Array.isArray(stored)) {
        setFavoriteKeys(stored);
      }
      const storedItems = JSON.parse(localStorage.getItem(FAVORITE_ITEMS_CACHE_KEY) || '{}');
      if (storedItems && typeof storedItems === 'object' && !Array.isArray(storedItems)) {
        setFavoriteItemsByKey(storedItems);
      }
    } catch {
      setFavoriteKeys([]);
      setFavoriteItemsByKey({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteKeys));
  }, [favoriteKeys]);

  useEffect(() => {
    localStorage.setItem(FAVORITE_ITEMS_CACHE_KEY, JSON.stringify(favoriteItemsByKey));
  }, [favoriteItemsByKey]);

  const syncFavoriteItemCache = (items, keys = favoriteKeys) => {
    if (!Array.isArray(items) || items.length === 0 || keys.length === 0) {
      return;
    }
    const keySet = new Set(keys);
    setFavoriteItemsByKey((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const item of items) {
        const key = itemKey(item);
        if (!keySet.has(key)) continue;
        const before = prev[key];
        if (!before || before.updated_at !== item.updated_at || before.price !== item.price || before.title !== item.title || before.image_url !== item.image_url) {
          next[key] = item;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  };

  const fetchGoods = async (activeFilters, targetPage = 1) => {
    const requestId = ++goodsRequestIdRef.current;
    setLoading(true);
    setSearching(false);
    setErrorMessage('');
    try {
      const params = {};
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.source) params.source = activeFilters.source;
      if (activeFilters.character) params.character = activeFilters.character;
      if (activeFilters.stock) params.stock = activeFilters.stock;
      params.page = targetPage;
      params.per_page = 24;

      const [goodsRes, statsRes] = await Promise.all([api.get('/goods', { params }), api.get('/stats')]);
      if (requestId !== goodsRequestIdRef.current) return;
      setGoods(goodsRes.data.items || []);
      syncFavoriteItemCache(goodsRes.data.items || []);
      setPage(goodsRes.data.page || targetPage);
      setTotalPages(goodsRes.data.total_pages || 1);
      const nextStats = statsRes.data || null;
      setStats(nextStats);
      syncLastUpdated(nextStats?.last_updated);
    } catch (error) {
      if (requestId !== goodsRequestIdRef.current) return;
      setErrorMessage(getRequestErrorMessage(error));
      setGoods([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      if (requestId === goodsRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const fetchFavoriteGoods = async () => {
    const requestId = ++goodsRequestIdRef.current;
    setLoading(true);
    setSearching(false);
    setErrorMessage('');
    try {
      const urlKeys = favoriteKeys.filter((key) => key.startsWith('http://') || key.startsWith('https://'));
      const [favRes, statsRes] = await Promise.all([
        api.post('/goods/by-urls', { urls: urlKeys }),
        api.get('/stats')
      ]);
      if (requestId !== goodsRequestIdRef.current) return;

      const fetched = favRes.data.items || [];
      syncFavoriteItemCache(fetched, favoriteKeys);
      setGoods(fetched);
      const nextStats = statsRes.data || null;
      setStats(nextStats);
      syncLastUpdated(nextStats?.last_updated);
      setPage(1);
      setTotalPages(1);
    } catch (error) {
      if (requestId !== goodsRequestIdRef.current) return;
      setErrorMessage(getRequestErrorMessage(error));
      setGoods([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      if (requestId === goodsRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (showFavoritesOnly) {
      fetchFavoriteGoods();
    }
  }, [showFavoritesOnly, favoriteKeys, lang]);

  useEffect(() => {
    if (!showFavoritesOnly) {
      fetchGoods(filters, 1);
    }
  }, [filters, showFavoritesOnly, lang]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const has = (selector) => Boolean(rootRef.current?.querySelector(selector));
      const tl = gsap.timeline();
      if (has('.hero-block .eyebrow')) {
        tl.from('.hero-block .eyebrow', { opacity: 0, y: 8, duration: 0.35, ease: 'power2.out' });
      }
      if (has('.hero-block h1')) {
        tl.from('.hero-block h1', { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out' }, '-=0.12');
      }
      if (has('.hero-block p')) {
        tl.from('.hero-block p:not(.eyebrow)', { opacity: 0, y: 8, duration: 0.4, ease: 'power2.out' }, '-=0.22');
      }
      if (has('.stats-grid .stat-card')) {
        tl.from('.stats-grid .stat-card', { opacity: 0, y: 10, duration: 0.35, stagger: 0.06, ease: 'power2.out' }, '-=0.15');
      }
      if (has('.control-panel')) {
        tl.from('.control-panel', { opacity: 0, y: 10, duration: 0.35, ease: 'power2.out' }, '-=0.12');
      }
      if (has('.pager')) {
        tl.from('.pager', { opacity: 0, y: 8, duration: 0.25, ease: 'power2.out' }, '-=0.12');
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    const cardAnim = animate('.goods-card', {
      scale: [{ from: 0.97, to: 1 }],
      opacity: [{ from: 0.55, to: 1 }],
      translateY: [{ from: 14, to: 0 }],
      delay: stagger(24),
      duration: 520,
      easing: 'easeOutQuad'
    });

    return () => {
      cardAnim.cancel();
    };
  }, [loading, page, goods.length]);

  const handleSearch = async (keyword) => {
    if (showFavoritesOnly) {
      setFavoriteQuery(keyword);
      setSearching(Boolean(keyword));
      return;
    }

    if (!keyword) {
      fetchGoods(filters, 1);
      return;
    }
    const requestId = ++goodsRequestIdRef.current;
    setLoading(true);
    setSearching(true);
    setErrorMessage('');
    try {
      const res = await api.get('/search', { params: { q: keyword } });
      if (requestId !== goodsRequestIdRef.current) return;
      setGoods(res.data.items || []);
      syncFavoriteItemCache(res.data.items || []);
      setPage(1);
      setTotalPages(1);
    } catch (error) {
      if (requestId !== goodsRequestIdRef.current) return;
      setErrorMessage(getRequestErrorMessage(error));
      setGoods([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      if (requestId === goodsRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    translatedTitlesRef.current = translatedTitles;
  }, [translatedTitles]);

  useEffect(() => {
    if (lang !== 'en' || goods.length === 0) {
      return;
    }

    const queue = [
      ...new Set(
        goods
          .map((item) => item?.title)
          .filter((title) => title && /[^\x00-\x7F]/.test(title) && !translatedTitlesRef.current[title])
      )
    ];

    if (queue.length === 0) {
      return;
    }

    let canceled = false;

    const run = async () => {
      try {
        for (let i = 0; i < queue.length; i += 60) {
          const chunk = queue.slice(i, i + 60);
          const res = await api.post('/translate/titles', { titles: chunk });
          if (canceled) return;
          const entries = res.data?.items || [];

          setTranslatedTitles((prev) => {
            const next = { ...prev };
            entries.forEach((row) => {
              if (row?.original && row?.translated) {
                next[row.original] = row.translated;
              }
            });
            translatedTitlesRef.current = next;
            return next;
          });

          if (i + 60 < queue.length) {
            await new Promise((resolve) => setTimeout(resolve, 120));
          }
        }
      } catch {
        // keep original titles when translation endpoint fails
      }
    };

    run();

    return () => {
      canceled = true;
    };
  }, [goods, lang]);

  const favoriteSet = new Set(favoriteKeys);
  const favoriteGoods = favoriteKeys.map((key) => favoriteItemsByKey[key]).filter(Boolean);

  const matchesFilters = (item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.source && item.source_site !== filters.source) return false;
    if (filters.stock) {
      const status = item.stock_status || (item.is_available === false ? 'sold_out' : 'available');
      if (status !== filters.stock) return false;
    }
    if (filters.character) {
      const keys = CHARACTER_KEYWORDS[filters.character] || [filters.character];
      const title = `${item.title || ''}`;
      if (!keys.some((k) => title.includes(k))) return false;
    }
    return true;
  };

  const visibleGoods = (showFavoritesOnly ? favoriteGoods : goods).filter((item) => favoriteSet.has(itemKey(item)) || !showFavoritesOnly).filter(matchesFilters);
  const filteredVisibleGoods = showFavoritesOnly && favoriteQuery
    ? visibleGoods.filter((item) => `${item.title || ''}`.toLowerCase().includes(favoriteQuery.toLowerCase()))
    : visibleGoods;

  const toggleFavorite = (item) => {
    const key = itemKey(item);
    setFavoriteKeys((prev) => {
      if (prev.includes(key)) {
        setFavoriteItemsByKey((cachePrev) => {
          const next = { ...cachePrev };
          delete next[key];
          return next;
        });
        return prev.filter((v) => v !== key);
      }
      setFavoriteItemsByKey((cachePrev) => ({ ...cachePrev, [key]: item }));
      return [...prev, key];
    });
  };

  const statCards = stats
    ? [
        {
          key: 'total',
          icon: <HiChartBar />,
          value: stats.total,
          label: t('stats_total')
        },
        {
          key: 'sites',
          icon: <HiGlobeAlt />,
          value: Object.keys(stats.by_source || {}).length,
          label: t('stats_sites'),
          hint: t('stats_sites_open'),
          onClick: () => navigate('/sources')
        },
        {
          key: 'favorites',
          icon: <HiHeart />,
          value: favoriteKeys.length,
          label: t('stats_favorites')
        }
      ]
    : [];

  const availableCategories = Object.entries(stats?.by_category || {})
    .filter(([category, count]) => category && Number(count) > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  return (
    <div ref={rootRef}>
      <div className="hero-block panel-card">
        <p className="eyebrow">Otaku Inventory</p>
        <h1>{t('hero_title')}</h1>
        <p>{t('hero_desc')}</p>
      </div>
      {stats && (
        <div className="stats-grid">
          {statCards.map((card) => (
            <StatCard key={card.key} icon={card.icon} value={card.value} label={card.label} hint={card.hint} onClick={card.onClick} />
          ))}
        </div>
      )}
      <section className="control-panel panel-card">
        <SearchBar
          onSearch={handleSearch}
          onReset={() => {
            if (showFavoritesOnly) {
              setFavoriteQuery('');
              setSearching(false);
              return;
            }
            fetchGoods(filters);
          }}
        />
        <FilterPanel filters={filters} onChange={setFilters} categories={availableCategories} />
      </section>
      <section className="goods-section" aria-busy={loading}>
        {loading ? (
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="spinner" />
            <p>{goods.length === 0 ? t('loading_initial') : t('loading_update')}</p>
          </div>
        ) : null}
        <div className="goods-grid">
          {isInitialLoading
            ? Array.from({ length: 8 }).map((_, idx) => <div key={`skeleton-${idx}`} className="skeleton-card" />)
            : filteredVisibleGoods.map((item) => (
                <GoodsCard
                  key={item.id || item.product_url}
                  item={item}
                  displayTitle={lang === 'en' ? translatedTitles[item.title] || item.title : item.title}
                  isFavorite={favoriteSet.has(itemKey(item))}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
        </div>
        {!loading && errorMessage ? (
          <div className="favorite-empty panel-card">
            <p>{errorMessage}</p>
          </div>
        ) : null}
        {!loading && !errorMessage && filteredVisibleGoods.length === 0 ? (
          <div className="favorite-empty panel-card">
            <p>{showFavoritesOnly ? t('empty_favorite') : t('empty_default')}</p>
          </div>
        ) : null}
        {!searching && totalPages > 1 && (
          <div className="pager panel-card">
            <button
              type="button"
              className="action-btn ghost-btn"
              disabled={page <= 1 || loading}
              onClick={() => fetchGoods(filters, page - 1)}
            >
              {t('pager_prev')}
            </button>
            <span>{`${page} / ${totalPages}`}</span>
            <button
              type="button"
              className="action-btn ghost-btn"
              disabled={page >= totalPages || loading}
              onClick={() => fetchGoods(filters, page + 1)}
            >
              {t('pager_next')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
