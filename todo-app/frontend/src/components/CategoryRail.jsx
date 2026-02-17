import React from 'react';
import { useStore } from '../state/store.jsx';

export default function CategoryRail() {
  const { categories, activeCategorySlug, setActiveCategorySlug, searchQuery } = useStore();

  return (
    <aside className="categoryRail categoryRail--left reveal" style={{ '--delay': '120ms' }}>
      <div className="categoryRail__title">Kategori</div>
      {searchQuery ? <div className="categoryRail__hint">Menampilkan hasil pencarian.</div> : null}
      <div className="categoryRail__list">
        {categories.map((c) => (
          <button
            key={c.slug}
            className={`chip ${activeCategorySlug === c.slug ? 'chip--active' : ''}`}
            onClick={() => setActiveCategorySlug(c.slug)}
          >
            <span className="chip__dot" aria-hidden="true" />
            <span className="chip__text">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="categoryRail__hint">Klik kategori untuk tampilkan produknya.</div>
    </aside>
  );
}
