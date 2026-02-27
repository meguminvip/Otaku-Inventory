import { useRef, useState } from 'react';
import api from '../api/api.js';
import { useI18n } from '../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function ContactPage() {
  const { t } = useI18n();
  const [kind, setKind] = useState('request');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const openedAtRef = useRef(Date.now());

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setSending(true);
    try {
      await api.post('/feedback', {
        kind,
        message,
        page: window.location.href,
        website,
        elapsed_ms: Date.now() - openedAtRef.current
      });
      setMessage('');
      setWebsite('');
      openedAtRef.current = Date.now();
      setStatus(t('contact_success'));
    } catch (error) {
      if (error?.response?.status === 429) {
        setStatus(t('rate_limited_error'));
      } else {
        setStatus(`${t('contact_error_prefix')} ${error?.response?.data?.error || error.message}`);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="legal-page panel-card">
      <h1>{t('contact_title')}</h1>
      <p>{t('contact_desc')}</p>
      <p>{t('contact_privacy_note')}</p>

      <h2>{t('contact_include_title')}</h2>
      <p>{t('contact_include_desc')}</p>

      <h2>{t('contact_channels_title')}</h2>
      <ul>
        <li>
          <strong>{t('contact_general')}</strong>: <a href="mailto:contact@megumin.vip">contact@megumin.vip</a>
        </li>
        <li>
          <strong>{t('contact_support')}</strong>: <a href="mailto:support@megumin.vip">support@megumin.vip</a>
        </li>
        <li>
          <strong>{t('contact_emergency')}</strong>: <a href="mailto:koumazuiitimegumin@gmail.com">koumazuiitimegumin@gmail.com</a>
        </li>
      </ul>

      <h2>{t('contact_form_title')}</h2>
      <form className="contact-form" onSubmit={onSubmit}>
        <label>
          {t('contact_type')}
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="request">{t('contact_type_request')}</option>
            <option value="bug">{t('contact_type_bug')}</option>
            <option value="other">{t('contact_type_other')}</option>
          </select>
        </label>
        <label>
          {t('contact_message')}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minLength={8}
            maxLength={4000}
            required
            placeholder={t('contact_message_placeholder')}
          />
        </label>
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, width: 1, height: 1 }}
        />
        <button className="action-btn" type="submit" disabled={sending}>
          {sending ? t('contact_sending') : t('contact_submit')}
        </button>
        {status ? <p className="contact-status">{status}</p> : null}
      </form>
    </section>
  );
}
