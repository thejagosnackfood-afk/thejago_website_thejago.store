import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../state/store.jsx';
import { apiFetch } from '../lib/api.js';
import { buildProductHref } from '../lib/productLink.js';
import './FlashSale.css';

// Timer untuk flash sale
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isExpired: false
        });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

function seededNumber(seed, min, max) {
  const s = String(seed || 'seed');
  let hash = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    hash ^= s.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  const span = Math.max(1, max - min + 1);
  return min + (hash % span);
}

function pickTargetDate(flashSales) {
  const endTimes = flashSales
    .map((p) => (p.flashSale?.endsAt ? new Date(p.flashSale.endsAt).getTime() : NaN))
    .filter((t) => Number.isFinite(t));

  if (endTimes.length) return new Date(Math.min(...endTimes));
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

function buildFeaturedProducts(flashSales) {
  let products = flashSales.slice(0, 5).map((p, index) => ({
    ...p,
    price: p.price || p.priceIdr || 0,
    salePrice: p.salePrice || p.flashSale?.priceIdr || p.price || p.priceIdr || 0,
    img: p.img || p.imageUrl,
    seed: `${p._id || p.slug || p.name || 'product'}-${index}`,
    renderKey: p._id || p.slug || `${p.name || 'product'}-${index}`,
  }));

  // Fill layout to 5 cards so UI tetap konsisten.
  if (products.length > 0 && products.length < 5) {
    const originalLength = products.length;
    while (products.length < 5) {
      const original = products[products.length % originalLength];
      const duplicateIndex = products.length;
      products.push({
        ...original,
        renderKey: `${original.renderKey}-duplicate-${duplicateIndex}`,
        seed: `${original.seed}-duplicate-${duplicateIndex}`,
      });
    }
  }

  return products.map((product, index) => ({
    ...product,
    soldCount: seededNumber(`${product.seed}-sold-${index}`, 50, 160),
    stockProgress: seededNumber(`${product.seed}-stock-${index}`, 60, 96),
  }));
}

export default function FlashSale() {
  const { flashSales = [], addToCart, setViewProductId, collectionsLoading } = useStore();
  const targetDate = useMemo(() => pickTargetDate(flashSales), [flashSales]);
  const timeLeft = useCountdown(targetDate);
  const featuredProducts = useMemo(() => buildFeaturedProducts(flashSales), [flashSales]);

  if (!collectionsLoading && featuredProducts.length === 0) {
    return null;
  }

  const formatTime = (time) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <section className="sass-root">
      <div className="sass-flash-sale-container">
        <div className="sass-sale-header">
          <div className="sass-sale-title">
            <span className="sass-sale-title-icon">⚡</span>
            Flash Sale
          </div>
          
          <div className="sass-countdown">
            <div className="sass-countdown-item">
              <span className="sass-countdown-number">{formatTime(timeLeft.hours)}</span>
              <span className="sass-countdown-label">JAM</span>
            </div>
            <div className="sass-countdown-separator">:</div>
            <div className="sass-countdown-item">
              <span className="sass-countdown-number">{formatTime(timeLeft.minutes)}</span>
              <span className="sass-countdown-label">MNT</span>
            </div>
            <div className="sass-countdown-separator">:</div>
            <div className="sass-countdown-item">
              <span className="sass-countdown-number">{formatTime(timeLeft.seconds)}</span>
              <span className="sass-countdown-label">DTK</span>
            </div>
          </div>

          <a href="#produk" className="sass-view-all">
            Lihat Semua &gt;
          </a>
        </div>

        <div className="sass-products-grid">
          {featuredProducts.map((product) => {
            const productId = product._id || product.id;
            const href = buildProductHref(productId);
            const onOpen = async (e) => {
              if (e.defaultPrevented) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              if (productId) {
                setViewProductId(productId);
                try {
                  await apiFetch(`/api/products/${productId}/view`, { method: 'POST' });
                } catch {}
              }
            };
            return (
            <a key={product.renderKey || product._id || product.slug} className="sass-product-card" href={href} onClick={onOpen}>
              <div className="sass-product-badge">
                {product.price && product.salePrice && product.price > product.salePrice 
                  ? `-${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`
                  : 'SALE'}
              </div>
              
              <div className="sass-product-image-container">
                <img 
                  src={product.img || '/sample-photo/product-placeholder.jpg'} 
                  alt={product.name}
                  className="sass-product-image"
                  loading="lazy"
                />
              </div>
              
              <div className="sass-product-details">
                <div className="sass-product-price">
                  <div className="sass-current-price">
                    Rp {product.salePrice?.toLocaleString('id-ID')}
                  </div>
                </div>
                
                <div className="sass-product-title">{product.name}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                  <div className="sass-original-price">
                    Rp {product.price?.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="sass-product-sales">
                  Terjual {product.soldCount}
                </div>
                
                <div className="sass-progress-container">
                  <div 
                    className="sass-progress-bar" 
                    style={{ width: `${product.stockProgress}%` }}
                  />
                </div>
                <div className="sass-stock-left">
                  Segera Habis
                </div>
                
                <button
                  className="sass-shop-now-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product, 1);
                  }}
                >
                  Beli Sekarang
                </button>
              </div>
            </a>
          )})}
        </div>
      </div>
    </section>
  );
}
