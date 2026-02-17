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

function Header() {
  const { user, setAuthModalOpen, logout } = useStore();
  return (
    <header className="topbar reveal" style={{ '--delay': '20ms' }}>
      <div className="brand">
        <div className="brand__mark" aria-hidden="true" />
        <div>
          <div className="brand__name">The Jago</div>
          <div className="brand__sub">Snack & Frozen Food</div>
        </div>
      </div>
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
  const { products, activeCategorySlug, categories, mostViewed, recommended, discounts, flashSales, searchQuery } =
    useStore();
  const activeName = categories.find((c) => c.slug === activeCategorySlug)?.name || 'Produk';

  return (
    <main className="shell">
      <BannerStrip />

      <div className="layout">
        <CategoryRail />
        <section className="main">
          <SectionRow title="Rekomendasi" subtitle="Sering dibeli pelanggan." products={recommended} />
          <SectionRow title="Diskon" subtitle="Harga lebih hemat hari ini." products={discounts} />
          <SectionRow title="Flash Sale" subtitle="Waktu terbatas." products={flashSales} tone="hot" />

          <ProductGrid
            title={searchQuery ? `Hasil: "${searchQuery}"` : activeName}
            subtitle={searchQuery ? 'Hasil pencarian produk.' : 'Pilih kategori di sisi kiri untuk ganti daftar.'}
            products={products}
          />

          <section className="panel reveal" style={{ '--delay': '150ms' }}>
            <div className="panel__head">
              <div className="panel__title">Sering Dilihat</div>
              <div className="panel__sub">Produk yang paling sering dibuka di website.</div>
            </div>
            <div className="grid grid--mini">
              {mostViewed.slice(0, 8).map((p) => (
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

      <CartDock />
      <ChatWidget />
      <AuthModal />
    </main>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="bg">
        <Header />
        <Home />
      </div>
    </StoreProvider>
  );
}
