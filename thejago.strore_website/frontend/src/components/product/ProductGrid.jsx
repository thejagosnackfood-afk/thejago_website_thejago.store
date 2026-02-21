import React, { useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import ProductCardSkeleton from './ProductCardSkeleton.jsx';
import './ProductGrid.css';

export default function ProductGrid({
  title,
  subtitle,
  products = [],
  columns = 4,
  gap = 12,
  loading = false,
  emptyMessage = 'Belum ada produk.',
  emptyActionLabel,
  onEmptyAction,
  variant = 'default',
  skeletonCount,
}) {
  const count = useMemo(() => skeletonCount || Math.max(4, columns * 2), [skeletonCount, columns]);
  const gridStyle = { '--grid-columns': columns, '--grid-gap': `${gap}px` };
  const hasProducts = products?.length > 0;

  return (
    <section id="produk" className="panel reveal" style={{ '--delay': '60ms' }}>
      {(title || subtitle) && (
        <div className="panel__head">
          <div>
            {title ? <div className="panel__title">{title}</div> : null}
            {subtitle ? <div className="panel__sub">{subtitle}</div> : null}
          </div>
        </div>
      )}
      <div className="productGrid" style={gridStyle} role="list">
        {loading
          ? Array.from({ length: count }).map((_, idx) => (
              <div key={`sk-${idx}`} role="listitem">
                <ProductCardSkeleton variant={variant} />
              </div>
            ))
          : hasProducts
            ? products.map((p) => (
                <div key={p.id || p._id || p.slug || p.name} role="listitem">
                  <ProductCard product={p} variant={variant} />
                </div>
              ))
            : (
              <div className="productGrid__empty">
                <div className="productGrid__emptyTitle">Produk tidak ditemukan</div>
                <div className="productGrid__emptySub">{emptyMessage}</div>
                {emptyActionLabel && onEmptyAction ? (
                  <button className="btn btn--primary" onClick={onEmptyAction}>
                    {emptyActionLabel}
                  </button>
                ) : null}
              </div>
            )}
      </div>
    </section>
  );
}
