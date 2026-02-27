import { useI18n } from '../../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function CospaUpdateNoticePage() {
  const { t } = useI18n();

  return (
    <section className="legal-page panel-card">
      <h1>{t('cospa_notice_title')}</h1>
      <p>{t('cospa_notice_intro')}</p>

      <h2>{t('cospa_notice_change_title')}</h2>
      <ul>
        <li>{t('cospa_notice_change_1')}</li>
        <li>{t('cospa_notice_change_2')}</li>
      </ul>

      <h2>{t('cospa_notice_actions_title')}</h2>
      <ul>
        <li>{t('cospa_notice_actions_1')}</li>
        <li>{t('cospa_notice_actions_2')}</li>
        <li>{t('cospa_notice_actions_3')}</li>
      </ul>

      <p>{t('cospa_notice_apology')}</p>
      <p>{t('cospa_notice_date')}</p>
    </section>
  );
}
