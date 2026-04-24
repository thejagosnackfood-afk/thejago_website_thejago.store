import React from 'react';
import StarRating from './StarRating.jsx';
import './ReviewCard.css';

function fallbackAvatar(name) {
  const encodedName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=E5E7EB&color=111827&size=128`;
}

export default function ReviewCard({
  id,
  avatar,
  name,
  location,
  rating,
  review,
  date,
  verified = false,
  helpful,
  source,
}) {
  return (
    <article className="reviewCard" data-review-id={id} tabIndex={0}>
      <header className="reviewCard__header">
        <img
          className="reviewCard__avatar"
          src={avatar}
          alt={`Foto profil ${name}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackAvatar(name);
          }}
        />

        <div className="reviewCard__identity">
          <div className="reviewCard__name" title={name}>
            {name}
          </div>
          {location ? (
            <div className="reviewCard__location" title={location}>
              {location}
            </div>
          ) : null}
          <StarRating rating={rating} />
          <time className="reviewCard__date">{date}</time>
        </div>

        {source ? <span className="reviewCard__source">{source}</span> : null}
      </header>

      <p className="reviewCard__text">{review}</p>

      <footer className="reviewCard__footer">
        {verified ? <span className="reviewCard__verified">Verified Purchase</span> : <span />}
        {Number.isFinite(helpful) ? (
          <span className="reviewCard__helpful">👍 {helpful} terbantu</span>
        ) : null}
      </footer>
    </article>
  );
}
