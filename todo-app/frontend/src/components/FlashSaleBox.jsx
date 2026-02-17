import React, { useEffect, useMemo, useState } from 'react';
import { msToParts, pad2 } from '../lib/time.js';
import ProductCard from './ProductCard.jsx';

function soonestEnd(products) {
  const ends = products
    .map((p) => (p.flashSale?.endsAt ? new Date(p.flashSale.endsAt).getTime() : null))
    .filter((t) => Number.isFinite(t));
  if (ends.length === 0) return null;
  return Math.min(...ends);
}

export default function FlashSaleBox({ products }) {
  const endAt = useMemo(() => soonestEnd(products), [products]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = endAt ? Math.max(0, endAt - now) : 0;
  const { h, m, s } = msToParts(left);

  return (
    <section className="panel panel--hot reveal" style={{ '--delay': '140ms' }}>
      <div className="panel__head">
        <div className="panel__titleRow">
          <div className="panel__title">Flash Sale</div>
          <div className="timer" aria-label="flash sale timer">
            {pad2(h)}:{pad2(m)}:{pad2(s)}
          </div>
        </div>
        <div className="panel__sub">Timer diset dari data `flashSale.endsAt`.</div>
      </div>
      <div className="stack">
        {products.slice(0, 3).map((p) => (
          <ProductCard key={p._id || p.slug} product={p} compact />
        ))}
      </div>
    </section>
  );
}

