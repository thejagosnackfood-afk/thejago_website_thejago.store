import React from 'react';

export default function Hero() {
  return (
    <section className="hero reveal" style={{ '--delay': '10ms' }}>
      <div className="container">
        <div className="hero-content">
          <div className="hero__copy">
            <div className="hero__kicker">Groceries • Fresh • Frozen</div>
            <h1 className="hero__title">Belanja lebih cepat, produk lengkap, harga ramah.</h1>
            <p className="hero__sub">
              Inspirasi UI ala Grofers/Blinkit dengan fokus ke snack & frozen food The Jago.
            </p>
            <div className="hero__actions">
              <button className="btn btn--primary">Mulai Belanja</button>
              <button className="btn">Lihat Promo</button>
            </div>
            <div className="hero__meta">
              <span>🔒 Checkout aman via Midtrans</span>
              <span>⚡ Pengiriman cepat area terjangkau</span>
            </div>
          </div>
          <div className="hero__art" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1100&q=80"
              alt="Fresh grocery"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
