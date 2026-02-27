import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { animate } from 'animejs';
import gsap from 'gsap';
import { HiExclamation, HiHeart, HiHome, HiMail, HiOutlineDocumentText, HiOutlineShieldCheck, HiSparkles } from 'react-icons/hi';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import ContactPage from './pages/ContactPage.jsx';
import Home from './pages/Home.jsx';
import { I18nProvider } from './i18n.jsx';
import { useI18n } from './hooks/useI18n.js';
import CospaUpdateNoticePage from './pages/notices/CospaUpdateNoticePage.jsx';
import NoticesPage from './pages/notices/NoticesPage.jsx';
import NoticePage from './pages/notices/NoticePolicyPage.jsx';
import ScrapingSpecPage from './pages/notices/ScrapingSpecPage.jsx';
import SitePolicyPage from './pages/notices/SitePolicyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import SourcesPage from './pages/SourcesPage.jsx';
import AckPage from './pages/AckPage.jsx';
import './styles/app.css';

/**
 * Authors: h_ypi and A.R.O.N.A
 */

const LAST_UPDATED_KEY = 'otaku_inventory_last_updated';

function AppShell() {
  const { lang, setLang, t } = useI18n();
  const [lastUpdated, setLastUpdated] = useState(() => localStorage.getItem(LAST_UPDATED_KEY) || '');

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return '--';
    const parsed = new Date(`${lastUpdated}`.replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) return '--';
    return new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(parsed);
  }, [lastUpdated, lang]);

  useEffect(() => {
    const onCustomUpdate = (event) => {
      const next = event?.detail ? `${event.detail}` : '';
      if (next) setLastUpdated(next);
    };

    const onStorage = (event) => {
      if (event.key === LAST_UPDATED_KEY) {
        setLastUpdated(event.newValue || '');
      }
    };

    window.addEventListener('otaku:last-updated', onCustomUpdate);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('otaku:last-updated', onCustomUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let wasOpen = false;
    const threshold = 160;

    const checkDevtools = () => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      const isOpen = widthGap > threshold || heightGap > threshold;

      if (isOpen && !wasOpen) {
        console.log('Why Watching Me!');
      }

      wasOpen = isOpen;
    };

    const timerId = window.setInterval(checkDevtools, 1000);
    window.addEventListener('resize', checkDevtools);
    checkDevtools();

    return () => {
      window.clearInterval(timerId);
      window.removeEventListener('resize', checkDevtools);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.navbar, .home-shortcut, .brand, .nav-links a', { autoAlpha: 1 });
      gsap.fromTo(
        '.navbar',
        { y: -14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.38, ease: 'power2.out', clearProps: 'opacity,visibility,transform' }
      );
    });

    const orbA = animate('.bg-orb-a', {
      translateX: [{ to: 24 }, { to: 0 }],
      translateY: [{ to: -14 }, { to: 0 }],
      duration: 5000,
      alternate: true,
      loop: true,
      easing: 'easeInOutSine'
    });
    const orbB = animate('.bg-orb-b', {
      translateX: [{ to: -26 }, { to: 0 }],
      translateY: [{ to: 14 }, { to: 0 }],
      duration: 5600,
      alternate: true,
      loop: true,
      easing: 'easeInOutSine'
    });

    const navPulse = animate('.nav-links a', {
      translateY: [{ to: -1 }, { to: 0 }],
      delay: (el, i) => i * 120,
      duration: 2200,
      loop: true,
      alternate: true,
      easing: 'easeInOutSine'
    });

    return () => {
      ctx.revert();
      orbA.cancel();
      orbB.cancel();
      navPulse.cancel();
    };
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <div className="bg-orb bg-orb-a" />
        <div className="bg-orb bg-orb-b" />
        <AnnouncementBar />
        <nav className="navbar">
          <div className="container nav-inner nav-inner-balanced">
            <div className="nav-links nav-links-primary">
              <NavLink to="/">
                <HiHome />
                {t('nav_list')}
              </NavLink>
              <NavLink to="/favorites">
                <HiHeart />
                {t('nav_favorites')}
              </NavLink>
            </div>
            <NavLink className="brand" to="/">
              Otaku Inventory
            </NavLink>
            <div className="nav-right nav-toolbar nav-right-meta">
              <div className="nav-meta">
                <div className="lang-switch" aria-label={t('language_label')}>
                  <select id="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="last-updated-inline" aria-live="polite">
                  <span>{t('last_updated_label')}</span>
                  <strong>{formattedLastUpdated}</strong>
                </div>
              </div>
              <div className="nav-links nav-links-mobile">
                <NavLink to="/">
                  <HiHome />
                  {t('nav_list')}
                </NavLink>
                <NavLink to="/favorites">
                  <HiHeart />
                  {t('nav_favorites')}
                </NavLink>
              </div>
            </div>
          </div>
        </nav>
        <main className="container main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Home initialFavoritesOnly />} />
            <Route path="/calendar" element={<Navigate to="/" replace />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/notices/site-policy" element={<SitePolicyPage />} />
            <Route path="/notices/policy" element={<NoticePage />} />
            <Route path="/notices/cospa-update" element={<CospaUpdateNoticePage />} />
            <Route path="/notices/scraping-spec" element={<ScrapingSpecPage />} />
            <Route path="/notice" element={<Navigate to="/notices/policy" replace />} />
            <Route path="/notice/cospa-update" element={<Navigate to="/notices/cospa-update" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/acknowledgement" element={<AckPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container footer-inner">
            <div>© 2026 h_ypi / A.R.O.N.A Coding Assistant</div>
            <div className="footer-links">
              <NavLink to="/notices">
                <HiExclamation />
                {t('footer_notice')}
              </NavLink>
              <NavLink to="/terms">
                <HiOutlineDocumentText />
                {t('footer_terms')}
              </NavLink>
              <NavLink to="/privacy">
                <HiOutlineShieldCheck />
                {t('footer_privacy')}
              </NavLink>
              <NavLink to="/contact">
                <HiMail />
                {t('footer_contact')}
              </NavLink>
              <NavLink to="/acknowledgement">
                <HiSparkles />
                {t('footer_ack')}
              </NavLink>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}
