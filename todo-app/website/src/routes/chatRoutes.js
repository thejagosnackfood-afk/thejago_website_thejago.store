const express = require('express');
const OpenAI = require('openai');

const { findProductsForQuery } = require('../services/catalogSearch');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(501).json({ error: 'openai_not_configured' });

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'missing_message' });

    const products = await findProductsForQuery(message);
    const productContext = products
      .map((p) => {
        const flash = p.flashSale?.isActive ? `; flashSalePrice=${p.flashSale.priceIdr}; endsAt=${p.flashSale.endsAt}` : '';
        const disc = p.discountPercent ? `; discountPercent=${p.discountPercent}` : '';
        return `- ${p.name} (slug=${p.slug}; priceIdr=${p.priceIdr}${disc}${flash})`;
      })
      .join('\n');

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah CS toko "The Jago Snack & Frozen Food". Jawab singkat, ramah, dan relevan. ' +
            'Jika ditanya harga, jawab dalam format Rp dan sebutkan promo/flash sale jika ada. ' +
            'Jika produk tidak jelas, tanya klarifikasi (nama produk/kategori).',
        },
        {
          role: 'system',
          content: productContext ? `Katalog relevan:\n${productContext}` : 'Tidak ada katalog relevan ditemukan dari pesan user.',
        },
        { role: 'user', content: String(message) },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    res.json({ reply, products });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

