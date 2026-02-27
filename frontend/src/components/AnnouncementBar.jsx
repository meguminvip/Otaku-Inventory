import { HiSpeakerphone } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

const announcements = [
  {
    id: 'notice-1',
    active: true,
    text: 'お知らせ: 新カテゴリ「キーホルダー」を追加しました。'
  }
];

export default function AnnouncementBar() {
  const { t } = useI18n();
  const notice = announcements.find((item) => item.active);
  if (!notice) {
    return null;
  }

  return (
    <div className="announcement-bar" role="status" aria-live="polite">
      <div className="announcement-inner">
        <span className="announcement-icon" aria-hidden="true">
          <HiSpeakerphone />
        </span>
        <p>{t('announcement_text') || notice.text}</p>
        <NavLink to="/notices/cospa-update" className="announcement-cta">
          {t('announcement_link_text')}
        </NavLink>
      </div>
    </div>
  );
}
