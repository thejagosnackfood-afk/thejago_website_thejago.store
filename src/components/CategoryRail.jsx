import React from 'react';
import { useStore } from '../state/store.jsx';
import { MARKETPLACE_LINKS } from '../lib/marketplaces.js';

export default function CategoryRail() {
  const { categories, activeCategorySlug, setActiveCategorySlug, searchQuery } = useStore();

  // Pisahkan kategori berdasarkan jenisnya
  // Asumsi: 10 kategori pertama adalah Sembako, sisanya Frozen Food (sesuai urutan di store.jsx)
  const retailCategories = categories.slice(0, 10);
  const frozenCategories = categories.slice(10);

  return (
    <aside className="categoryRail categoryRail--left reveal" style={{ '--delay': '120ms' }}>
      
      {/* Bagian Sembako */}
      <div className="categoryRail__section">
        <div className="categoryRail__title">Sembako (Retail)</div>
        {searchQuery ? <div className="categoryRail__hint">Menampilkan hasil pencarian.</div> : null}
        <div className="categoryRail__list">
          {retailCategories.map((c) => (
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
      </div>

      {/* Bagian Frozen Food */}
      <div className="categoryRail__section" style={{ marginTop: '24px' }}>
        <div className="categoryRail__title">Frozen Food</div>
        <div className="categoryRail__list">
          {frozenCategories.map((c) => (
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
      </div>

      <div className="categoryRail__hint">Klik kategori untuk tampilkan produknya.</div>

      <section className="categoryRail__marketplaces" aria-label="Marketplace">
        <div className="categoryRail__title">Marketplace</div>
        <div className="categoryRail__marketGrid">
          {MARKETPLACE_LINKS.map((marketplace) => (
            <a
              key={marketplace.key}
              className="categoryRail__marketLink"
              href={marketplace.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Buka ${marketplace.name}`}
            >
              <img
                className="categoryRail__marketLogo"
                src={marketplace.logo}
                alt={`Logo ${marketplace.name}`}
                loading="lazy"
              />
              <span className="categoryRail__marketName">{marketplace.name}</span>
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}
