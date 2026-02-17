import React from 'react';
import { useStore } from '../state/store.jsx';

export default function CategoryRail() {
  const { categories, activeCategorySlug, setActiveCategorySlug } = useStore();

  return (
    <aside className="categoryRail reveal" style={{ '--delay': '120ms' }}>
      <div className="categoryRail__title">Kategori</div>
      <div className="categoryRail__list">
        {categories.map((c) => (
          <button
            key={c.slug}
            className={`chip ${activeCategorySlug === c.slug ? 'chip--active' : ''}`}
            onClick={() => setActiveCategorySlug(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="categoryRail__hint">Klik kategori untuk tampilkan produknya.</div>
    </aside>
  );
}
