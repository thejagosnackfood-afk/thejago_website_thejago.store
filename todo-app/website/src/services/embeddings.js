const OpenAI = require('openai');

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function embedText(text) {
  const client = getClient();
  if (!client) return null;

  const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
  const input = String(text || '').slice(0, 4000);
  if (!input.trim()) return null;

  const res = await client.embeddings.create({ model, input });
  const vec = res?.data?.[0]?.embedding;
  if (!Array.isArray(vec)) return null;
  return { model, vector: vec };
}

module.exports = { embedText };

