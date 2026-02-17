import React from 'react';
import ProductCard from './ProductCard.jsx';

export default function SectionRow({ title, subtitle, products, tone = 'normal' }) {
  if (!products?.length) return null;
  return (
    <section className={`row row--${tone} reveal`} style={{ '--delay': '80ms' }}>
      <div className="row__head">
        <div className="row__title">{title}</div>
        {subtitle ? <div className="row__sub">{subtitle}</div> : null}
      </div>
      <div className="row__scroller" role="list">
        {products.slice(0, 12).map((p) => (
          <div key={p._id || p.slug} className="row__item" role="listitem">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

