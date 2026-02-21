import React from 'react';
import ReviewCard from './ReviewCard.jsx';
import './ReviewList.css';

function slugify(text) {
  return String(text || 'review-list')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ReviewList({ title, reviews = [], emptyText = 'Belum ada ulasan.' }) {
  const titleId = `review-list-${slugify(title)}`;

  return (
    <section className="reviewList" aria-labelledby={titleId}>
      <h3 id={titleId} className="reviewList__title">
        {title}
      </h3>

      {reviews.length ? (
        <div className="reviewList__items" role="list">
          {reviews.map((item) => (
            <div key={item.id} role="listitem">
              <ReviewCard
                id={item.id}
                avatar={item.avatar}
                name={item.name}
                location={item.location}
                rating={item.rating}
                review={item.review}
                date={item.date}
                verified={item.verified}
                helpful={item.helpful}
                source={item.sourceLabel}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="reviewList__empty">{emptyText}</div>
      )}
    </section>
  );
}
