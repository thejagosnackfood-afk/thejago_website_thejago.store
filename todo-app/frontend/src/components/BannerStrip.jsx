import React from 'react';

export default function BannerStrip() {
  return (
    <section className="banners reveal" style={{ '--delay': '40ms' }}>
      <div className="banner banner--a">
        <div className="banner__kicker">Grocery TK</div>
        <div className="banner__title">Belanja frozen, bumbu, harian</div>
        <div className="banner__sub">Cepat, ringan, modern.</div>
      </div>
      <div className="banner banner--b">
        <div className="banner__kicker">Diskon</div>
        <div className="banner__title">Promo pilihan hari ini</div>
        <div className="banner__sub">Cek sebelum habis.</div>
      </div>
      <div className="banner banner--c">
        <div className="banner__kicker">Flash Sale</div>
        <div className="banner__title">Harga kilat terbatas</div>
        <div className="banner__sub">Kejar timer.</div>
      </div>
    </section>
  );
}

