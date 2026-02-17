const { KnowledgeDoc } = require('../models/KnowledgeDoc');

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (!denom) return -1;
  return dot / denom;
}

function toKeywords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 8);
}

async function retrieveDocs({ queryText, queryEmbedding, k = 4 }) {
  // Fallback keyword search if no embedding.
  if (!queryEmbedding) {
    const keywords = toKeywords(queryText);
    if (keywords.length === 0) return [];
    const regexes = keywords.map((w) => new RegExp(w, 'i'));
    return KnowledgeDoc.find({ isActive: true, $or: [{ title: { $in: regexes } }, { content: { $in: regexes } }] })
      .select('title slug content tags')
      .limit(k)
      .lean();
  }

  // Brute-force cosine similarity across active docs with embeddings.
  const docs = await KnowledgeDoc.find({ isActive: true, embedding: { $exists: true, $type: 'array' } })
    .select('title slug content tags embedding')
    .limit(500)
    .lean();

  const scored = docs
    .map((d) => ({ doc: d, score: cosineSimilarity(queryEmbedding, d.embedding) }))
    .filter((x) => Number.isFinite(x.score) && x.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => {
      const { embedding, ...rest } = x.doc;
      return { ...rest, score: x.score };
    });

  return scored;
}

function excerpt(text, max = 700) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function buildContext({ docs, products }) {
  const docBlock = docs.length
    ? docs
        .map((d) => `- ${d.title} (slug=${d.slug})\n  ${excerpt(d.content)}`)
        .join('\n')
    : 'Tidak ada dokumen knowledge base yang relevan.';

  const productBlock = products.length
    ? products
        .map((p) => {
          const flash = p.flashSale?.isActive ? `; flashSalePrice=${p.flashSale.priceIdr}; endsAt=${p.flashSale.endsAt}` : '';
          const disc = p.discountPercent ? `; discountPercent=${p.discountPercent}` : '';
          return `- ${p.name} (slug=${p.slug}; priceIdr=${p.priceIdr}${disc}${flash})`;
        })
        .join('\n')
    : 'Tidak ada produk relevan.';

  return { docBlock, productBlock };
}

module.exports = { retrieveDocs, buildContext };

