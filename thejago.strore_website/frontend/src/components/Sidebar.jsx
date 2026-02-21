import React from 'react';
import { useStore } from '../state/store.jsx';
import ProductCard from './ProductCard.jsx';
import ProductCardSkeleton from './product/ProductCardSkeleton.jsx';
import FlashSaleBox from './FlashSaleBox.jsx';

export default function Sidebar() {
  const { recommended, discounts, flashSales, collectionsLoading } = useStore();

  return (
    <aside className="sidebar">
      <section className="panel reveal" style={{ '--delay': '80ms' }}>
        <div className="panel__head">
          <div className="panel__title">Rekomendasi Sering Dibeli</div>
          <div className="panel__sub">Pilihan cepat untuk stok keluarga.</div>
        </div>
        <div className="stack">
          {collectionsLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <ProductCardSkeleton key={`rec-sk-${idx}`} variant="compact" />
              ))
            : recommended.slice(0, 3).map((p) => (
                <ProductCard key={p._id || p.slug} product={p} compact />
              ))}
        </div>
      </section>

      <section className="panel reveal" style={{ '--delay': '110ms' }}>
        <div className="panel__head">
          <div className="panel__title">Diskon Hari Ini</div>
          <div className="panel__sub">Harga lebih ringan, konsep modern tetap rapi.</div>
        </div>
        <div className="stack">
          {collectionsLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <ProductCardSkeleton key={`disc-sk-${idx}`} variant="compact" />
              ))
            : discounts.slice(0, 3).map((p) => (
                <ProductCard key={p._id || p.slug} product={p} compact />
              ))}
        </div>
      </section>

      <FlashSaleBox products={flashSales} loading={collectionsLoading} />
    </aside>
  );
}
