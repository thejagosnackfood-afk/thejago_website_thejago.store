import React from 'react';

const BannerStrip = React.memo(function BannerStrip() {
  return (
    <section 
      className="banners reveal" 
      style={{ '--delay': '40ms' }}
      aria-labelledby="banner-strip-title"
    >
      <h2 id="banner-strip-title" className="visually-hidden">
        Penawaran Spesial
      </h2>
      
      <a
        className="banner banner--a banner--link"
        href="https://cookpad.com/id/cari/masakan%20online"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Topik Resep Masakan di Cookpad"
      >
        <div className="banner__kicker">Topik Resep</div>
        <div className="banner__title">Topik Resep Masakan</div>
        <div className="banner__sub">Lihat ide menu online di Cookpad.</div>
      </a>
      
      <a
        className="banner banner--b banner--link"
        href="https://www.youtube.com/results?search_query=konten+jajanan+viral"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Konten Jajanan Viral di YouTube"
      >
        <div className="banner__kicker">Konten Viral</div>
        <div className="banner__title">Konten Jajanan Viral</div>
        <div className="banner__sub">Buka rekomendasi video terbaru di YouTube.</div>
      </a>
      
      <div className="banner banner--c" role="article" aria-label="Flash Sale Banner">
        <div className="banner__kicker">Flash Sale</div>
        <div className="banner__title">Harga kilat terbatas</div>
        <div className="banner__sub">Kejar timer.</div>
      </div>
    </section>
  );
});

export default BannerStrip;
