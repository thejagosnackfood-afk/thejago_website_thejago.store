import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store.jsx';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useStore();
  const [local, setLocal] = useState(searchQuery);

  useEffect(() => setLocal(searchQuery), [searchQuery]);
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(local), 250);
    return () => clearTimeout(t);
  }, [local, setSearchQuery]);

  return (
    <div className="search">
      <span className="search__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="search__input"
        placeholder="Cari baso, sosis, nugget, bumbu..."
        aria-label="Cari produk"
      />
      {local ? (
        <button className="search__clear" onClick={() => setLocal('')} aria-label="hapus pencarian">
          ✕
        </button>
      ) : null}
    </div>
  );
}

