import { HiOutlineTag, HiOutlineViewGrid } from 'react-icons/hi';
import { useI18n } from '../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

const CATEGORY_LABEL_KEY_BY_VALUE = {
  'フィギュア': 'category_figure',
  'アクリルスタンド': 'category_acrylic_stand',
  'キーホルダー': 'category_keyholder',
  'バッグ': 'category_bag',
  'パスケース': 'category_pass_case',
  'マグカップ・グラス': 'category_cup_glass',
  'マット・マウスパッド': 'category_mat_mousepad',
  'スマホケース': 'category_phone_case',
  '複製原画・アート': 'category_art_print',
  'プラモデル': 'category_plastic_model',
  '缶バッジ': 'category_badge',
  'クリアファイル': 'category_clear_file',
  'カード・ブロマイド': 'category_card_bromide',
  'ポスター': 'category_poster',
  'ステッカー': 'category_sticker',
  'つままれ': 'category_tsumamare',
  'ぬいぐるみ': 'category_plush',
  '香水': 'category_fragrance',
  'タペストリー': 'category_tapestry',
  'アパレル': 'category_apparel',
  'コミック': 'category_comic',
  '小説': 'category_novel',
  '画集': 'category_artbook',
  'Blu-ray': 'category_bluray',
  'DVD': 'category_dvd',
  '音楽・主題歌': 'category_music',
  'アルバム': 'category_album',
  'その他': 'category_other'
};

export default function FilterPanel({ filters, onChange, categories = [] }) {
  const { t } = useI18n();
  const categoryValues = categories.length ? categories : (filters.category ? [filters.category] : []);
  const categoryOptions = [...new Set([...categoryValues, filters.category].filter(Boolean))].map((value) => {
    const key = CATEGORY_LABEL_KEY_BY_VALUE[value];
    return {
      value,
      label: key ? t(key) : value
    };
  });

  const siteOptions = [
    { value: 'animate', label: t('site_animate') },
    { value: 'kadokawa', label: t('site_kadokawa') },
    { value: 'cospa', label: t('site_cospa') },
    { value: 'charaon', label: t('site_charaon') }
  ];

  const characterOptions = [
    { value: 'アクア', label: t('character_aqua') },
    { value: 'めぐみん', label: t('character_megumin') },
    { value: 'ダクネス', label: t('character_darkness') },
    { value: 'カズマ', label: t('character_kazuma') },
    { value: 'ちょむすけ', label: t('character_chomusuke') },
    { value: 'ゆんゆん', label: t('character_yunyun') }
  ];

  const stockOptions = [
    { value: 'available', label: t('stock_available') },
    { value: 'sold_out', label: t('stock_sold_out') },
    { value: 'ended', label: t('stock_ended') },
    { value: 'preorder', label: t('stock_preorder') }
  ];

  return (
    <div className="filter-panel">
      <label>
        <span className="label-with-icon">
          <HiOutlineTag />
          {t('filter_category')}
        </span>
        <select value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })}>
          <option value="">{t('all_categories')}</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label-with-icon">
          <HiOutlineViewGrid />
          {t('filter_site')}
        </span>
        <select value={filters.source} onChange={(e) => onChange({ ...filters, source: e.target.value })}>
          <option value="">{t('all_sites')}</option>
          {siteOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label-with-icon">
          <HiOutlineTag />
          {t('filter_character')}
        </span>
        <select value={filters.character} onChange={(e) => onChange({ ...filters, character: e.target.value })}>
          <option value="">{t('all_characters')}</option>
          {characterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label-with-icon">
          <HiOutlineViewGrid />
          {t('filter_stock')}
        </span>
        <select value={filters.stock} onChange={(e) => onChange({ ...filters, stock: e.target.value })}>
          <option value="">{t('all_stock')}</option>
          {stockOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
