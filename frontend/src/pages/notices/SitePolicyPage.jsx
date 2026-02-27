import { useI18n } from '../../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function SitePolicyPage() {
  const { t } = useI18n();

  return (
    <section className="legal-page panel-card">
      <h1>{t('site_policy_title')}</h1>
      <p>{t('site_policy_intro')}</p>

      <h2>{t('site_policy_purpose_title')}</h2>
      <p>{t('site_policy_purpose_body')}</p>

      <h2>{t('site_policy_revenue_title')}</h2>
      <p>{t('site_policy_revenue_body')}</p>

      <h2>{t('site_policy_scraping_title')}</h2>
      <p>{t('site_policy_scraping_body')}</p>

      <h2>{t('site_policy_operator_title')}</h2>
      <ul>
        <li>{t('site_policy_operator_name')}</li>
        <li>{t('site_policy_operator_type')}</li>
      </ul>
    </section>
  );
}
