const { Product } = require('../models/Product');

async function findProductsForQuery(message) {
  const text = String(message || '').trim();
  if (!text) return [];

  // Simple keyword match; later you can replace with full-text index.
  const keywords = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 6);

  if (keywords.length === 0) return [];

  const regexes = keywords.map((k) => new RegExp(k, 'i'));
  return Product.find({ isActive: true, $or: regexes.map((r) => ({ name: r })) })
    .select('name slug priceIdr discountPercent flashSale category')
    .limit(8)
    .lean();
}

module.exports = { findProductsForQuery };
