import { useI18n } from '../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function SourcesPage() {
  const { t } = useI18n();

  const sources = [
    { key: 'animate', name: t('site_animate'), desc: t('source_animate_desc') },
    { key: 'kadokawa', name: t('site_kadokawa'), desc: t('source_kadokawa_desc') },
    { key: 'cospa', name: t('site_cospa'), desc: t('source_cospa_desc') },
    { key: 'charaon', name: t('site_charaon'), desc: t('source_charaon_desc') }
  ];

  return (
    <section className="legal-page panel-card">
      <h1>{t('sources_title')}</h1>
      <p>{t('sources_intro')}</p>
      <h2>{t('sources_list_title')}</h2>
      <ul>
        {sources.map((source) => (
          <li key={source.key}>
            <strong>{source.name}</strong>: {source.desc}
          </li>
        ))}
      </ul>
      <p>{t('sources_note')}</p>
    </section>
  );
}
