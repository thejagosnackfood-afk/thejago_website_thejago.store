import React, { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state/store.jsx';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useStore();
  const [local, setLocal] = useState(searchQuery);

  useEffect(() => setLocal(searchQuery), [searchQuery]);

  useEffect(() => {
    const normalized = local.trim();
    if (normalized === searchQuery) return;
    const t = setTimeout(() => setSearchQuery(normalized), 250);
    return () => clearTimeout(t);
  }, [local, searchQuery, setSearchQuery]);

  const clearSearch = useCallback(() => {
    setLocal('');
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <div className="search">
      <span className="search__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="search__input"
        placeholder="Cari baso, sosis, nugget, bumbu..."
        aria-label="Cari produk"
        autoComplete="off"
      />
      {local ? (
        <button className="search__clear" onClick={clearSearch} aria-label="hapus pencarian">
          ✕
        </button>
      ) : null}
    </div>
  );
}
