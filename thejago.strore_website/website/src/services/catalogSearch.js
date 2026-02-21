const { getProducts } = require('./productService');

async function findProductsForQuery(message) {
  const text = String(message || '').trim();
  if (!text) return [];

  // Simple keyword match
  const keywords = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 6);

  if (keywords.length === 0) return [];

  // Fetch all products (limit 2000 for local search context)
  const allProducts = await getProducts({ limit: 2000 }); 
  
  const regexes = keywords.map((k) => new RegExp(k, 'i'));
  
  // Filter in memory with scoring
  const matches = allProducts
    .map(p => {
      let score = 0;
      const name = p.name.toLowerCase();
      // Exact match bonus
      if (name.includes(text.toLowerCase())) score += 10;
      
      // Keyword match score
      regexes.forEach(r => {
        if (r.test(name)) score += 3;
      });

      return { ...p, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);

  return matches
    .map(p => ({
      name: p.name,
      slug: p.slug,
      priceIdr: p.priceIdr,
      unit: p.unit || 'pcs',
      stock: p.stock || 0,
      discountPercent: p.discountPercent,
      flashSale: p.flashSale,
      category: p.category ? p.category.name : null
    }))
    .slice(0, 5); // Return top 5 matches only
}

module.exports = { findProductsForQuery };
