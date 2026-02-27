import { useMemo, useState } from 'react';
import en from './locales/en.json';
import { I18nContext } from './i18n-context.js';
import ja from './locales/ja.json';

/**
 * Author: A.R.O.N.A
 */

const I18N_KEY = 'otaku_inventory_lang';

const messages = { ja, en };

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(I18N_KEY);
    return stored && messages[stored] ? stored : 'ja';
  });

  const setLang = (next) => {
    const safe = messages[next] ? next : 'ja';
    setLangState(safe);
    localStorage.setItem(I18N_KEY, safe);
  };

  const value = useMemo(() => {
    const table = messages[lang] || messages.ja;
    return {
      lang,
      setLang,
      t: (key) => table[key] ?? messages.ja[key] ?? key
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
