import { useState } from 'react';
import api from '../../api/api.js';
import { useI18n } from '../../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function ServiceStatusPage() {
  const { t } = useI18n();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const onSupportClick = async () => {
    if (sending) return;
    setStatus('');
    setSending(true);
    try {
      await api.post('/service-support', {});
      setStatus(t('service_status_support_success'));
    } catch (error) {
      if (error?.response?.status === 409) {
        setStatus(t('service_status_support_already'));
      } else if (error?.response?.status === 429) {
        setStatus(t('rate_limited_error'));
      } else {
        setStatus(t('service_status_support_error'));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="legal-page panel-card">
      <h1>{t('service_status_title')}</h1>
      <p>{t('service_status_intro')}</p>
      <p>{t('service_status_intro_2')}</p>

      <h2>{t('service_status_reason_title')}</h2>
      <ul>
        <li>{t('service_status_reason_1')}</li>
        <li>{t('service_status_reason_2')}</li>
        <li>{t('service_status_reason_3')}</li>
        <li>{t('service_status_reason_4')}</li>
      </ul>

      <h2>{t('service_status_policy_title')}</h2>
      <ul>
        <li>{t('service_status_policy_1')}</li>
        <li>{t('service_status_policy_2')}</li>
        <li>{t('service_status_policy_3')}</li>
        <li>{t('service_status_policy_4')}</li>
      </ul>

      <h2>{t('service_status_support_title')}</h2>
      <p>{t('service_status_support_desc')}</p>
      <button type="button" className="action-btn" onClick={onSupportClick} disabled={sending}>
        {sending ? t('service_status_support_sending') : t('service_status_support_button')}
      </button>
      {status ? <p className="contact-status">{status}</p> : null}

      <h2>{t('service_status_source_title')}</h2>
      <p>{t('service_status_source_desc')}</p>
      <p>
        <a href="https://github.com/meguminvip" target="_blank" rel="noreferrer">
          https://github.com/meguminvip
        </a>
      </p>

      <h2>{t('service_status_afterword_title')}</h2>
      <p>{t('service_status_afterword_1')}</p>
      <p>{t('service_status_afterword_2')}</p>
      <p>{t('service_status_afterword_3')}</p>
      <p>
        {t('service_status_afterword_4')}{' '}
        <a href="https://chuunibyou.org/" target="_blank" rel="noreferrer">
          https://chuunibyou.org/
        </a>
        {t('service_status_afterword_5')}
      </p>
      <p>{t('service_status_afterword_6')}</p>
    </section>
  );
}
