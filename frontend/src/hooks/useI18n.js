import { useContext } from 'react';
import { I18nContext } from '../i18n-context.js';

/**
 * Author: A.R.O.N.A
 */

export function useI18n() {
  return useContext(I18nContext);
}
