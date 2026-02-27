import { useI18n } from '../hooks/useI18n.js';
import { Link } from 'react-router-dom';

/**
 * Author: A.R.O.N.A
 */

export default function PrivacyPage() {
  const { t } = useI18n();
  const sections = t('privacy_sections') || [];

  return (
    <section className="legal-page panel-card">
      <h1>{t('privacy_title')}</h1>
      <p>{t('privacy_date')}</p>
      <p>{t('privacy_intro')}</p>
      {sections.map((s) => (
        <div key={s.h}>
          <h2>{s.h}</h2>
          <p>{s.p}</p>
        </div>
      ))}
      <h2>{t('legal_contact_heading')}</h2>
      <p>
        {t('privacy_contact_prefix')} <Link to="/contact">{t('contact_link_text')}</Link>
        {t('privacy_contact_suffix')}
      </p>
    </section>
  );
}
