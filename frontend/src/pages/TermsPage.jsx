import { useI18n } from '../hooks/useI18n.js';
import { Link } from 'react-router-dom';

/**
 * Author: A.R.O.N.A
 */

export default function TermsPage() {
  const { t } = useI18n();
  const sections = t('terms_sections') || [];

  return (
    <section className="legal-page panel-card">
      <h1>{t('terms_title')}</h1>
      <p>{t('terms_date')}</p>
      <p>{t('terms_intro')}</p>
      {sections.map((s) => (
        <div key={s.h}>
          <h2>{s.h}</h2>
          <p>{s.p}</p>
        </div>
      ))}
      <h2>{t('legal_contact_heading')}</h2>
      <p>
        {t('terms_contact_prefix')} <Link to="/contact">{t('contact_link_text')}</Link>
        {t('terms_contact_suffix')}
      </p>
    </section>
  );
}
