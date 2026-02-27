import { useState } from 'react';
import { HiOutlineRefresh, HiSearch } from 'react-icons/hi';
import { useI18n } from '../hooks/useI18n.js';

/**
 * Author: A.R.O.N.A
 */

export default function SearchBar({ onSearch, onReset }) {
  const { t } = useI18n();
  const [value, setValue] = useState('');

  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
    >
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t('search_placeholder')} />
      <button type="submit" className="action-btn">
        <HiSearch />
        {t('search_button')}
      </button>
      <button
        type="button"
        className="action-btn ghost-btn"
        onClick={() => {
          setValue('');
          onReset();
        }}
      >
        <HiOutlineRefresh />
        {t('clear_button')}
      </button>
    </form>
  );
}
