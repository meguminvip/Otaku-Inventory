import { createContext } from 'react';

/**
 * Author: A.R.O.N.A
 */

export const I18nContext = createContext({
  lang: 'ja',
  setLang: () => {},
  t: (key) => key
});
