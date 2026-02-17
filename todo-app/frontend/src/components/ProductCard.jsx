import React, { useMemo } from 'react';
import { apiFetch } from '../lib/api.js';
import { formatIdr } from '../lib/format.js';
import { useStore } from '../state/store.jsx';

function effectivePrice(product) {
  if (product?.flashSale?.isActive && product?.flashSale?.priceIdr) return product.flashSale.priceIdr;
  if (product?.discountPercent > 0) return Math.round(product.priceIdr * (1 - product.discountPercent / 100));
  return product.priceIdr;
}

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useStore();
  const price = useMemo(() => effectivePrice(product), [product]);
  const hasDiscount = product.discountPercent > 0;
  const hasFlash = product.flashSale?.isActive;

  async function onOpen() {
    if (product?._id) {
      try {
        await apiFetch(`/api/products/${product._id}/view`, { method: 'POST' });
      } catch {
        // ignore
      }
    }
  }

  return (
    <article className={`productCard ${compact ? 'productCard--compact' : ''}`} onClick={onOpen} role="button" tabIndex={0}>
      <div className="productCard__media">
        {product.imageUrl ? <img alt={product.name} src={product.imageUrl} loading="lazy" /> : <div className="productCard__ph" />}
        <div className="productCard__badges">
          {hasFlash ? <span className="badge badge--hot">Flash</span> : null}
          {hasDiscount ? <span className="badge badge--disc">-{product.discountPercent}%</span> : null}
          {product.isRecommended ? <span className="badge badge--rec">Sering Dibeli</span> : null}
        </div>
      </div>
      <div className="productCard__body">
        <div className="productCard__name">{product.name}</div>
        <div className="productCard__priceRow">
          <div className="productCard__price">{formatIdr(price)}</div>
          {hasDiscount ? <div className="productCard__old">{formatIdr(product.priceIdr)}</div> : null}
        </div>
        <button className="btn btn--mini btn--add" onClick={(e) => (e.stopPropagation(), addToCart(product, 1))}>
          ADD
        </button>
      </div>
    </article>
  );
}
