import { useI18n } from '../../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function ScrapingSpecPage() {
  const { t } = useI18n();

  const fields = [
    'title',
    'price',
    'product_url',
    'image_url',
    'source_site',
    'category',
    'is_limited',
    'is_available',
    'stock_status',
    'scraped_at'
  ];

  return (
    <section className="legal-page panel-card">
      <h1>{t('scrape_spec_title')}</h1>
      <p>{t('scrape_spec_intro')}</p>

      <h2>{t('scrape_spec_sources_title')}</h2>
      <ul>
        <li>{t('scrape_spec_source_animate')}</li>
        <li>{t('scrape_spec_source_kadokawa')}</li>
        <li>{t('scrape_spec_source_charaon')}</li>
        <li>{t('scrape_spec_source_cospa')}</li>
      </ul>

      <h2>{t('scrape_spec_fields_title')}</h2>
      <p>{t('scrape_spec_fields_desc')}</p>
      <ul>
        {fields.map((field) => (
          <li key={field}>{field}</li>
        ))}
      </ul>

      <h2>{t('scrape_spec_rules_title')}</h2>
      <ul>
        <li>{t('scrape_spec_rules_1')}</li>
        <li>{t('scrape_spec_rules_2')}</li>
        <li>{t('scrape_spec_rules_3')}</li>
        <li>{t('scrape_spec_rules_4')}</li>
      </ul>

      <h2>{t('scrape_spec_disclosure_title')}</h2>
      <ul>
        <li>{t('scrape_spec_disclosure_user_agent')}</li>
        <li>{t('scrape_spec_disclosure_frequency')}</li>
        <li>{t('scrape_spec_disclosure_keywords')}</li>
        <li>{t('scrape_spec_disclosure_delay')}</li>
      </ul>

      <h2>{t('scrape_spec_flow_title')}</h2>
      <p>{t('scrape_spec_flow_desc')}</p>
      <ul>
        <li>{t('scrape_spec_flow_1')}</li>
        <li>{t('scrape_spec_flow_2')}</li>
        <li>{t('scrape_spec_flow_3')}</li>
      </ul>
    </section>
  );
}
