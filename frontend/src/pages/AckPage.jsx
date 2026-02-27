import { useI18n } from '../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function AckPage() {
  const { t } = useI18n();

  return (
    <section className="legal-page panel-card">
      <h1>{t('ack_title')}</h1>
      <p>{t('ack_intro')}</p>

      <div>
        <h2>{t('ack_section_community_title')}</h2>
        <p>{t('ack_section_community_body')}</p>
      </div>

      <div>
        <h2>{t('ack_section_tools_title')}</h2>
        <p>{t('ack_section_tools_body')}</p>
      </div>

      <div>
        <h2>{t('ack_section_sources_title')}</h2>
        <p>{t('ack_section_sources_body')}</p>
      </div>

      <div>
        <h2>{t('ack_special_mentions_title')}</h2>
        <ul>
          <li>{t('ack_special_yappapurin')}</li>
        </ul>
      </div>

      <div>
        <h2>{t('ack_security_ref_title')}</h2>
        <p>
          <a href="https://www.ipa.go.jp/security/vuln/websecurity/index.html" target="_blank" rel="noreferrer">
            {t('ack_security_ref_label')}
          </a>
        </p>
      </div>
    </section>
  );
}
