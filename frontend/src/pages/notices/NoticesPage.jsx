import { NavLink } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function NoticesPage() {
  const { t } = useI18n();

  const items = [
    {
      key: 'service-status',
      title: t('notices_item_service_status_title'),
      desc: t('notices_item_service_status_desc'),
      to: '/notices/service-status'
    },
    {
      key: 'site-policy',
      title: t('notices_item_site_policy_title'),
      desc: t('notices_item_site_policy_desc'),
      to: '/notices/site-policy'
    },
    {
      key: 'cospa',
      title: t('notices_item_cospa_title'),
      desc: t('notices_item_cospa_desc'),
      to: '/notices/cospa-update'
    },
    {
      key: 'policy',
      title: t('notices_item_policy_title'),
      desc: t('notices_item_policy_desc'),
      to: '/notices/policy'
    },
    {
      key: 'scrape-spec',
      title: t('notices_item_scrape_spec_title'),
      desc: t('notices_item_scrape_spec_desc'),
      to: '/notices/scraping-spec'
    }
  ];

  return (
    <section className="legal-page panel-card">
      <h1>{t('notices_title')}</h1>
      <p>{t('notices_intro')}</p>

      <div className="notice-list">
        {items.map((item) => (
          <article key={item.key} className="notice-item panel-card">
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <NavLink to={item.to} className="announcement-link">
              {t('notices_read_more')}
            </NavLink>
          </article>
        ))}
      </div>
    </section>
  );
}
