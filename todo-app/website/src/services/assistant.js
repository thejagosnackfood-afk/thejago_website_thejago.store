const OpenAI = require('openai');

const { ChatThread } = require('../models/ChatThread');
const { ChatMessage } = require('../models/ChatMessage');
const { findProductsForQuery } = require('./catalogSearch');
const { embedText } = require('./embeddings');
const { retrieveDocs, buildContext } = require('./rag');

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function getOrCreateThread({ threadId, channel = 'web', externalId }) {
  if (threadId) {
    const existing = await ChatThread.findById(threadId).lean();
    if (existing) return existing;
  }
  const thread = await ChatThread.create({ channel, externalId });
  return thread.toObject();
}

async function loadHistory(threadId, limit = 10) {
  const msgs = await ChatMessage.find({ thread: threadId }).sort({ createdAt: -1 }).limit(limit).lean();
  return msgs.reverse().map((m) => ({ role: m.role, content: m.content }));
}

async function ivaQuery({ message, threadId, channel = 'web', externalId }) {
  const client = getClient();
  if (!client) {
    return { error: 'openai_not_configured' };
  }

  const thread = await getOrCreateThread({ threadId, channel, externalId });
  const text = String(message || '').trim();
  if (!text) return { error: 'missing_message' };

  const products = await findProductsForQuery(text);

  const emb = await embedText(text);
  const docs = await retrieveDocs({
    queryText: text,
    queryEmbedding: emb?.vector || null,
    k: Number(process.env.ASSISTANT_DOC_K || 4),
  });

  const { docBlock, productBlock } = buildContext({ docs, products });

  const history = await loadHistory(thread._id, Number(process.env.ASSISTANT_HISTORY_LIMIT || 10));

  const system = [
    'Kamu adalah Intelligent Virtual Assistant untuk toko "The Jago Snack & Frozen Food".',
    'Jawab dalam Bahasa Indonesia, singkat, jelas, ramah, dan berbasis data yang diberikan.',
    'Jika ditanya harga: jawab dalam format Rp (IDR) dan sebutkan diskon/flash sale jika ada.',
    'Jika pertanyaan tidak cukup jelas: tanya 1 pertanyaan klarifikasi.',
    'Jika user minta hal di luar data: jelaskan batasan dan tawarkan alternatif (mis. tanya kategori/nama produk).',
  ].join(' ');

  const context = `Knowledge Base:\n${docBlock}\n\nKatalog Produk Relevan:\n${productBlock}`;

  await ChatMessage.create({ thread: thread._id, role: 'user', content: text });

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      { role: 'system', content: system },
      { role: 'system', content: context },
      ...history.filter((m) => m.role !== 'system'),
      { role: 'user', content: text },
    ],
  });

  const reply = completion.choices?.[0]?.message?.content || '';
  await ChatMessage.create({ thread: thread._id, role: 'assistant', content: reply });

  return {
    threadId: String(thread._id),
    reply,
    products,
    docs: docs.map((d) => ({ title: d.title, slug: d.slug, score: d.score })),
  };
}

module.exports = { ivaQuery };

