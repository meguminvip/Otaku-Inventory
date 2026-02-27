import { HiExternalLink } from 'react-icons/hi';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { useI18n } from '../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

const JPY_PER_USD = 155;

export default function GoodsCard({ item, displayTitle, isFavorite = false, onToggleFavorite }) {
  const { t, lang } = useI18n();
  const title = displayTitle || item.title;
  const usdPrice = item.price ? (Number(item.price) / JPY_PER_USD).toFixed(2) : null;
  const categoryMap = {
    フィギュア: t('category_figure'),
    アクリルスタンド: t('category_acrylic_stand'),
    キーホルダー: t('category_keyholder'),
    バッグ: t('category_bag'),
    パスケース: t('category_pass_case'),
    'マグカップ・グラス': t('category_cup_glass'),
    'マット・マウスパッド': t('category_mat_mousepad'),
    スマホケース: t('category_phone_case'),
    '複製原画・アート': t('category_art_print'),
    プラモデル: t('category_plastic_model'),
    缶バッジ: t('category_badge'),
    クリアファイル: t('category_clear_file'),
    'カード・ブロマイド': t('category_card_bromide'),
    ポスター: t('category_poster'),
    ステッカー: t('category_sticker'),
    つままれ: t('category_tsumamare'),
    ぬいぐるみ: t('category_plush'),
    香水: t('category_fragrance'),
    タペストリー: t('category_tapestry'),
    アパレル: t('category_apparel'),
    コミック: t('category_comic'),
    小説: t('category_novel'),
    画集: t('category_artbook'),
    'Blu-ray': t('category_bluray'),
    DVD: t('category_dvd'),
    '音楽・主題歌': t('category_music'),
    アルバム: t('category_album'),
    その他: t('category_other')
  };

  const sourceMap = {
    animate: t('site_animate'),
    kadokawa: t('site_kadokawa'),
    cospa: t('site_cospa')
  };

  const status = item.stock_status || (item.is_available === false ? 'sold_out' : 'available');
  const stockLabelMap = {
    available: t('stock_available'),
    sold_out: t('stock_sold_out'),
    ended: t('stock_ended'),
    preorder: t('stock_preorder')
  };

  const stockClassMap = {
    available: 'chip-stock-on',
    sold_out: 'chip-stock-off',
    ended: 'chip-stock-end',
    preorder: 'chip-stock-pre'
  };

  return (
    <article className="goods-card">
      <div className="card-image">
        {item.image_url ? <img src={item.image_url} alt={title} loading="lazy" /> : <div className="no-image">{t('no_image')}</div>}
      </div>
      <div className="card-body">
        <div className="chip-row">
          <div className="chip-group">
            <span className="chip">{categoryMap[item.category] || item.category || t('category_other')}</span>
            <span className="chip chip-muted">{sourceMap[item.source_site] || item.source_site || t('unknown_source')}</span>
          </div>
          <span className={`chip chip-stock ${stockClassMap[status] || 'chip-stock-on'}`}>
            {stockLabelMap[status] || t('stock_available')}
          </span>
        </div>
        <h3>{title}</h3>
        {item.price ? (
          <p className="price">{lang === 'en' ? `¥${Number(item.price).toLocaleString()} / $${usdPrice}` : `¥${Number(item.price).toLocaleString()}`}</p>
        ) : (
          <p className="muted">{t('no_price')}</p>
        )}
        <div className="card-actions">
          <button type="button" className={`favorite-btn ${isFavorite ? 'active' : ''}`} onClick={() => onToggleFavorite?.(item)}>
            {isFavorite ? <HiHeart /> : <HiOutlineHeart />}
            {isFavorite ? t('favorited') : t('favorite')}
          </button>
          <a className="card-link" href={item.product_url} target="_blank" rel="noreferrer">
            <HiExternalLink />
            {t('open_product')}
          </a>
        </div>
      </div>
    </article>
  );
}
