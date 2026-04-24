import React from 'react';

export default function StarRating({ rating = 0, max = 5 }) {
  const safeRating = Math.max(0, Math.min(max, Math.round(rating)));

  return (
    <div className="reviewCard__stars" aria-label={`${safeRating} dari ${max} bintang`} role="img">
      {Array.from({ length: max }, (_, index) => {
        const filled = index < safeRating;
        return (
          <span
            key={`star-${index + 1}`}
            aria-hidden="true"
            className={`reviewCard__star ${filled ? 'reviewCard__star--filled' : 'reviewCard__star--empty'}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
