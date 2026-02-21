import React from 'react';
import './ProductCard.css';

export default function ProductCardSkeleton({ variant = 'default' }) {
  return (
    <div className={`productCard productCard--skeleton productCard--${variant}`}>
      <div className="productCard__media">
        <div className="productCard__skeleton productCard__skeleton--media" />
      </div>
      <div className="productCard__body">
        <div className="productCard__skeleton productCard__skeleton--line" />
        <div className="productCard__skeleton productCard__skeleton--line short" />
        <div className="productCard__skeleton productCard__skeleton--price" />
      </div>
    </div>
  );
}
