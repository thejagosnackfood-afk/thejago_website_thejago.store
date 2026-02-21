import React, { useCallback, useMemo } from 'react';
import { formatIdr } from '../../lib/format.js';
import { buildProductHref } from '../../lib/productLink.js';
import { apiFetch } from '../../lib/api.js';
import { useStore } from '../../state/store.jsx';
import Badge from './Badge.jsx';
import './ProductCard.css';

function effectivePrice(product, basePrice, discountPercent) {
  if (product?.flashSale?.isActive && product?.flashSale?.priceIdr) return product.flashSale.priceIdr;
  if (discountPercent > 0) return Math.round(basePrice * (1 - discountPercent / 100));
  return basePrice;
}

export default function ProductCard({
  product,
  id,
  name,
  price,
  originalPrice,
  image,
  discount,
  category,
  rating,
  stock,
  variant = 'default',
  compact = false,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  showCompare = false,
  isCompared,
  onCompareChange,
}) {
  const { addToCart, setViewProductId, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useStore();
  const productId = id || product?._id || product?.id;
  const productName = name || product?.name || '';
  const productCategory = category || product?.category || product?.categoryName || product?.categorySlug;
  const discountPercent = Number.isFinite(discount) ? discount : Number(product?.discountPercent || 0);
  const basePrice = Number(price ?? product?.priceIdr ?? 0);
  const computedPrice = effectivePrice(product, basePrice, discountPercent);
  const oldPrice =
    Number.isFinite(originalPrice) && originalPrice > 0
      ? originalPrice
      : computedPrice !== basePrice
        ? basePrice
        : null;
  const imageSrc = image || product?.imageUrl || '/sample-photo/product-placeholder.jpg';
  const score = Number.isFinite(rating) ? rating : product?.rating;
  const stockCount = Number.isFinite(stock) ? stock : product?.stock;
  const isFlash = product?.flashSale?.isActive;
  const isNew = product?.isNew;
  const isBestSeller = product?.isRecommended;
  const cardVariant = compact ? 'compact' : variant;
  const wishActive = typeof isWishlisted === 'boolean' ? isWishlisted : isInWishlist(productId);
  const compareActive = typeof isCompared === 'boolean' ? isCompared : isInCompare(productId);

  const href = useMemo(() => buildProductHref(productId), [productId]);

  const onOpen = useCallback(async () => {
    if (productId) {
      setViewProductId(productId);
      try {
        await apiFetch(`/api/products/${productId}/view`, { method: 'POST' });
      } catch {}
    }
  }, [productId, setViewProductId]);

  const onLinkClick = useCallback(
    (e) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      onOpen();
    },
    [onOpen]
  );

  const handleAdd = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onAddToCart) {
        onAddToCart(product || { id: productId, name: productName, priceIdr: computedPrice });
        return;
      }
      if (product) addToCart(product, 1);
    },
    [addToCart, computedPrice, onAddToCart, product, productId, productName]
  );

  const handleWishlist = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onToggleWishlist) {
        onToggleWishlist(product || { id: productId, name: productName, priceIdr: computedPrice });
        return;
      }
      if (product) toggleWishlist(product);
    },
    [computedPrice, onToggleWishlist, product, productId, productName, toggleWishlist]
  );

  const handleCompare = useCallback(
    (e) => {
      e.stopPropagation();
      const checked = e.target.checked;
      if (onCompareChange) {
        onCompareChange(checked);
        return;
      }
      if (product) toggleCompare(product);
    },
    [onCompareChange, product, toggleCompare]
  );

  return (
    <a
      className={`productCard productCard--${cardVariant}`}
      href={href}
      onClick={onLinkClick}
      aria-label={`Lihat detail ${productName}`}
    >
      <div className="productCard__media">
        <img
          alt={productName}
          src={imageSrc}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/sample-photo/product-placeholder.jpg';
          }}
        />
        <div className="productCard__badges">
          {isFlash ? <Badge variant="flash">Flash</Badge> : null}
          {discountPercent > 0 ? <Badge variant="discount">-{discountPercent}%</Badge> : null}
          {stockCount === 0 ? <Badge variant="soldout">Stok Habis</Badge> : null}
          {isNew ? <Badge variant="new">Baru</Badge> : null}
          {isBestSeller ? <Badge variant="bestseller">Best Seller</Badge> : null}
        </div>
        <div className="productCard__actions">
          <button
            type="button"
            className={`productCard__wish ${wishActive ? 'is-active' : ''}`}
            onClick={handleWishlist}
            aria-label={wishActive ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
          >
            ♥
          </button>
        </div>
      </div>
      <div className="productCard__body">
        <div className="productCard__name">{productName}</div>
        {(productCategory || score || Number.isFinite(stockCount)) && (
          <div className="productCard__meta">
            {productCategory ? <span>{productCategory}</span> : null}
            {Number.isFinite(score) ? (
              <span className="productCard__rating">★ {Number(score).toFixed(1)}</span>
            ) : null}
            {Number.isFinite(stockCount) ? (
              <span className="productCard__stock">{stockCount > 0 ? `Stok ${stockCount}` : 'Stok Habis'}</span>
            ) : null}
          </div>
        )}
        <div className="productCard__priceRow">
          <div className="productCard__price">{formatIdr(computedPrice)}</div>
          {oldPrice ? <div className="productCard__old">{formatIdr(oldPrice)}</div> : null}
        </div>
        {showCompare ? (
          <label className="productCard__compare" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={compareActive} onChange={handleCompare} />
            Bandingkan
          </label>
        ) : null}
        <button className="btn btn--mini btn--add" onClick={handleAdd} disabled={stockCount === 0}>
          ADD
        </button>
      </div>
    </a>
  );
}
