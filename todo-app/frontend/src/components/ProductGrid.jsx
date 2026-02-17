import React from 'react';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ title, products, subtitle }) {
  return (
    <section className="panel reveal" style={{ '--delay': '60ms' }}>
      <div className="panel__head">
        <div>
          <div className="panel__title">{title}</div>
          {subtitle ? <div className="panel__sub">{subtitle}</div> : null}
        </div>
      </div>
      <div className="grid">
        {products.length ? (
          products.map((p) => <ProductCard key={p._id || p.slug} product={p} />)
        ) : (
          <div className="muted" style={{ padding: '10px 2px' }}>
            Belum ada produk. Pastikan backend nyala dan sudah seed data.
          </div>
        )}
      </div>
    </section>
  );
}
