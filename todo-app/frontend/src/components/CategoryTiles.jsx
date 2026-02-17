import React from 'react';
import { useStore } from '../state/store.jsx';

function iconFor(slug) {
  const s = String(slug || '');
  if (s.includes('baso')) return '🍲';
  if (s.includes('sosis')) return '🌭';
  if (s.includes('nugget')) return '🍗';
  if (s.includes('rempah')) return '🧄';
  if (s.includes('kaldu')) return '🧂';
  if (s.includes('santan')) return '🥥';
  if (s.includes('susu')) return '🥛';
  return '🧊';
}

export default function CategoryTiles() {
  const { categories, setActiveCategorySlug, setSearchQuery } = useStore();

  return (
    <section className="catTiles reveal" style={{ '--delay': '55ms' }}>
      <div className="catTiles__head">
        <div className="catTiles__title">Shop by Category</div>
        <div className="catTiles__sub">Pilih kategori untuk langsung lihat produk.</div>
      </div>
      <div className="catTiles__grid">
        {categories.slice(0, 12).map((c) => (
          <button
            key={c.slug}
            className="catTile"
            onClick={() => {
              setSearchQuery('');
              setActiveCategorySlug(c.slug);
            }}
          >
            <div className="catTile__icon" aria-hidden="true">
              {iconFor(c.slug)}
            </div>
            <div className="catTile__name">{c.name}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

