import React from 'react';
import { StoreProvider, useStore } from './state/store.jsx';
import CategoryRail from './components/CategoryRail.jsx';
import Sidebar from './components/Sidebar.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import Reviews from './components/Reviews.jsx';
import AuthModal from './components/AuthModal.jsx';
import CartDock from './components/CartDock.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import SearchBar from './components/SearchBar.jsx';
import BannerStrip from './components/BannerStrip.jsx';
import SectionRow from './components/SectionRow.jsx';
import FlashSale from './components/FlashSale.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import ClosingFooter from './components/ClosingFooter.jsx';
import { MARKETPLACE_LINKS } from './lib/marketplaces.js';

import ProductDetail from './components/ProductDetail.jsx';

function Header() {
  const { user, setAuthModalOpen, logout, viewProductId, setViewProductId } = useStore();
  return (
    <header className="topbar reveal" style={{ '--delay': '20ms' }}>
      <div className="brand cursor-pointer" onClick={() => setViewProductId(null)}>
        <div className="brand__mark" aria-hidden="true" />
        <div>
          <div className="brand__name">The Jago</div>
          <div className="brand__sub">Snack & Frozen Food</div>
        </div>
      </div>
      <nav className="topbar__marketplaces" aria-label="Marketplace links">
        {MARKETPLACE_LINKS.map((marketplace) => (
          <a
            key={marketplace.key}
            className="marketLink"
            href={marketplace.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Buka ${marketplace.name}`}
          >
            <img
              className="marketLink__logo"
              src={marketplace.logo}
              alt={`Logo ${marketplace.name}`}
              loading="lazy"
            />
            <span className="marketLink__text">{marketplace.name}</span>
          </a>
        ))}
      </nav>
      <div className="topbar__search">
        <SearchBar />
      </div>
      <div className="topbar__actions">
        {user ? (
          <>
            <span className="pill">Hi, {user.name}</span>
            <button className="btn" onClick={logout}>
              Keluar
            </button>
          </>
        ) : (
          <button className="btn btn--primary" onClick={() => setAuthModalOpen(true)}>
            Daftar / Masuk
          </button>
        )}
      </div>
    </header>
  );
}

function Home() {
  const {
    products,
    activeCategorySlug,
    categories,
    mostViewed,
    recommended,
    discounts,
    flashSales,
    searchQuery,
    setSearchQuery,
    productsLoading,
    collectionsLoading,
    wishlist,
    compare,
  } = useStore();
  const activeName = categories.find((c) => c.slug === activeCategorySlug)?.name || 'Produk';
  const emptyMessage = searchQuery
    ? 'Coba kata kunci lain atau hapus filter pencarian.'
    : 'Belum ada produk di kategori ini.';

  return (
    <main>
      <Hero />
      
      <div className="container">
        <BannerStrip />
        <Features />

        <div className="main-layout">
          <CategoryRail />
          <section className="main">
            <FlashSale />
            <SectionRow
              title="Rekomendasi"
              subtitle="Sering dibeli pelanggan."
              products={recommended}
              loading={collectionsLoading}
            />
            <SectionRow
              title="Diskon"
              subtitle="Harga lebih hemat hari ini."
              products={discounts}
              tone="hot"
              loading={collectionsLoading}
            />

            <ProductGrid
              title={searchQuery ? `Hasil: "${searchQuery}"` : activeName}
              subtitle={searchQuery ? 'Hasil pencarian produk.' : 'Pilih kategori di sisi kiri untuk ganti daftar.'}
              products={products}
              loading={productsLoading}
              emptyMessage={emptyMessage}
              emptyActionLabel={searchQuery ? 'Hapus pencarian' : undefined}
              onEmptyAction={searchQuery ? () => setSearchQuery('') : undefined}
            />

            {wishlist.length ? (
              <ProductGrid
                title="Wishlist Saya"
                subtitle="Produk yang kamu tandai favorit."
                products={wishlist}
                columns={4}
              />
            ) : null}

            {compare.length ? (
              <ProductGrid
                title="Bandingkan Produk"
                subtitle="Bandingkan hingga 4 produk sekaligus."
                products={compare}
                columns={Math.min(compare.length, 4)}
                variant="horizontal"
              />
            ) : null}

            <section className="panel reveal" style={{ '--delay': '150ms' }}>
              <div className="panel__head">
                <div className="panel__title">Sering Dilihat</div>
                <div className="panel__sub">Produk yang paling sering dibuka di website.</div>
              </div>
              <div className="grid grid--mini">
                {collectionsLoading
                  ? Array.from({ length: 8 }).map((_, idx) => (
                      <div key={`mv-sk-${idx}`} className="miniCard">
                        <div className="miniCard__name">Memuat...</div>
                      </div>
                    ))
                  : mostViewed.slice(0, 8).map((p) => (
                      <div key={p._id || p.slug} className="miniCard">
                        <div className="miniCard__name">{p.name}</div>
                      </div>
                    ))}
              </div>
            </section>

            <Reviews />
          </section>

          <Sidebar />
        </div>

        <ClosingFooter />

        <CartDock />
        <ChatWidget />
        <AuthModal />
      </div>
    </main>
  );
}

function Layout() {
  const { viewProductId } = useStore();
  return (
    <div className="bg">
      <Header />
      {viewProductId ? <ProductDetail /> : <Home />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Layout />
    </StoreProvider>
  );
}
