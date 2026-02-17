import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

function Stars({ rating }) {
  const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <div className="stars" aria-label={`${r} stars`}>
      {'★★★★★'.slice(0, r)}
      <span className="stars__dim">{'★★★★★'.slice(r)}</span>
    </div>
  );
}

function ReviewCard({ r }) {
  return (
    <article className="reviewCard">
      <div className="reviewCard__top">
        <div className="avatar">{(r.authorName || '?').slice(0, 1).toUpperCase()}</div>
        <div className="reviewCard__meta">
          <div className="reviewCard__name">{r.authorName}</div>
          <Stars rating={r.rating} />
        </div>
      </div>
      <div className="reviewCard__text">{r.text}</div>
    </article>
  );
}

export default function Reviews() {
  const [site, setSite] = useState([]);
  const [google, setGoogle] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const a = await apiFetch('/api/reviews?limit=5');
        setSite(a.reviews || []);
      } catch {
        setSite([]);
      }
      try {
        const b = await apiFetch('/api/reviews/google?limit=5');
        setGoogle(b.reviews || []);
      } catch {
        setGoogle([]);
      }
    })();
  }, []);

  return (
    <section className="reviews reveal" style={{ '--delay': '160ms' }}>
      <div className="reviews__head">
        <div className="reviews__title">Ulasan Pembeli</div>
        <div className="reviews__sub">5 ulasan dari website dan Google Maps (jika tersedia di database).</div>
      </div>

      <div className="reviews__grid">
        <div className="reviews__col">
          <div className="reviews__label">Website</div>
          <div className="reviews__list">
            {site.length ? site.map((r) => <ReviewCard key={r._id} r={r} />) : <div className="muted">Belum ada ulasan.</div>}
          </div>
        </div>

        <div className="reviews__col">
          <div className="reviews__label">Google Maps</div>
          <div className="reviews__list">
            {google.length ? google.map((r) => <ReviewCard key={r._id} r={r} />) : <div className="muted">Belum ada ulasan Google di DB.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

