import React from 'react';
import ProductCard from './ProductCard.jsx';
import ProductCardSkeleton from './product/ProductCardSkeleton.jsx';

export default function SectionRow({ title, subtitle, products, tone = 'normal', loading = false }) {
  if (!loading && !products?.length) return null;
  return (
    <section className={`row row--${tone} reveal`} style={{ '--delay': '80ms' }}>
      <div className="row__head">
        <div>
          <div className="row__title">{title}</div>
          {subtitle ? <div className="row__sub">{subtitle}</div> : null}
        </div>
        <a href="#produk" className="row__seeAll">
          Lihat Semua &gt;
        </a>
      </div>
      <div className="row__grid" role="list">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div key={`row-sk-${idx}`} className="row__item" role="listitem">
                <ProductCardSkeleton />
              </div>
            ))
          : products.slice(0, 12).map((p) => (
              <div key={p._id || p.slug} className="row__item" role="listitem">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}
