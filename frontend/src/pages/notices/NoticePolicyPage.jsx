import { useI18n } from '../../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function NoticePage() {
  const { t } = useI18n();

  return (
    <section className="legal-page panel-card">
      <h1>{t('notice_title')}</h1>
      <p>{t('notice_intro')}</p>

      <h2>{t('notice_priority_title')}</h2>
      <p>{t('notice_priority_desc')}</p>
      <ul>
        <li>{t('notice_priority_1')}</li>
        <li>{t('notice_priority_2')}</li>
        <li>{t('notice_priority_3')}</li>
        <li>{t('notice_priority_4')}</li>
        <li>{t('notice_priority_5')}</li>
      </ul>

      <h2>{t('notice_caution_title')}</h2>
      <p>{t('notice_caution_1')}</p>
      <p>{t('notice_caution_2')}</p>
      <p>{t('notice_caution_3')}</p>
      <p>{t('notice_caution_4')}</p>

      <h2>{t('notice_fix_title')}</h2>
      <p>{t('notice_fix_desc')}</p>

      <h2>{t('notice_unavailable_title')}</h2>
      <p>{t('notice_unavailable_desc')}</p>
      <ul>
        <li>{t('notice_unavailable_1')}</li>
        <li>{t('notice_unavailable_2')}</li>
        <li>{t('notice_unavailable_3')}</li>
      </ul>
    </section>
  );
}
