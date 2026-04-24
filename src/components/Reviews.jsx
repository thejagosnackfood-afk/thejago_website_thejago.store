import React, { useEffect, useMemo, useState } from 'react';
import ReviewList from './review/ReviewList.jsx';
import './review/ReviewList.css';
import { MARKETPLACE_SOURCES, REVIEW_POOL } from '../data/reviewData.js';
import {
  formatReviewDate,
  getDailyReviews,
  getDailySeed,
  getMsUntilNextMidnight,
} from '../utils/dailyRandom.js';

function useIsMobile(breakpoint = 820) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : true
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}

function useDailySeed() {
  const [seed, setSeed] = useState(() => getDailySeed());

  useEffect(() => {
    let timeoutId;

    const schedule = () => {
      const waitMs = getMsUntilNextMidnight(new Date()) + 1000;
      timeoutId = window.setTimeout(() => {
        setSeed(getDailySeed());
        schedule();
      }, waitMs);
    };

    schedule();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return seed;
}

export default function Reviews() {
  const isMobile = useIsMobile();
  const dailySeed = useDailySeed();
  const [activeSource, setActiveSource] = useState(MARKETPLACE_SOURCES[0].key);

  const reviewsBySource = useMemo(() => {
    const today = new Date();

    return MARKETPLACE_SOURCES.reduce((acc, source, index) => {
      const chosen = getDailyReviews(REVIEW_POOL, {
        count: 3,
        seed: dailySeed + index * 131,
        source: source.key,
      }).map((item) => ({
        ...item,
        sourceLabel: source.label,
        date: formatReviewDate(item.daysAgo, today),
      }));

      acc[source.key] = chosen;
      return acc;
    }, {});
  }, [dailySeed]);

  const totalPoolCount = REVIEW_POOL.length;
  const activeSourceMeta =
    MARKETPLACE_SOURCES.find((source) => source.key === activeSource) || MARKETPLACE_SOURCES[0];

  return (
    <section className="reviewsMarketplace" aria-labelledby="reviews-marketplace-title">
      <header className="reviewsMarketplace__header">
        <h2 id="reviews-marketplace-title" className="reviewsMarketplace__title">
          Ulasan Pembeli
        </h2>
        <p className="reviewsMarketplace__sub">
          {totalPoolCount}+ data dummy realistis. Rotasi otomatis harian menggunakan seed tanggal hari ini.
        </p>
        <div className="reviewsMarketplace__badges">
          <span className="badge badge--rec">Daily Rotation</span>
          <span className="badge badge--hot">Verified Mix</span>
        </div>
      </header>

      {isMobile ? (
        <div>
          <div className="reviewsMarketplace__tabs" role="tablist" aria-label="Sumber ulasan marketplace">
            {MARKETPLACE_SOURCES.map((source) => (
              <button
                key={source.key}
                className={`reviewsMarketplace__tab ${
                  activeSource === source.key ? 'reviewsMarketplace__tab--active' : ''
                }`}
                type="button"
                role="tab"
                aria-selected={activeSource === source.key}
                aria-controls={`reviews-panel-${source.key}`}
                id={`reviews-tab-${source.key}`}
                onClick={() => setActiveSource(source.key)}
              >
                {source.label} ({reviewsBySource[source.key]?.length || 0})
              </button>
            ))}
          </div>

          <div id={`reviews-panel-${activeSourceMeta.key}`} role="tabpanel" aria-labelledby={`reviews-tab-${activeSourceMeta.key}`}>
            <ReviewList title={activeSourceMeta.label} reviews={reviewsBySource[activeSourceMeta.key] || []} />
          </div>
        </div>
      ) : (
        <div className="reviewsMarketplace__grid">
          {MARKETPLACE_SOURCES.map((source) => (
            <ReviewList key={source.key} title={source.label} reviews={reviewsBySource[source.key] || []} />
          ))}
        </div>
      )}
    </section>
  );
}
