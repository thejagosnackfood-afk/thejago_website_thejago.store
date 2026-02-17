const express = require('express');
const { ivaQuery } = require('../services/assistant');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'missing_message' });
    const out = await ivaQuery({ message: String(message), channel: 'api' });
    if (out?.error) return res.status(out.error === 'missing_message' ? 400 : 501).json({ error: out.error });
    res.json({ reply: out.reply, products: out.products, docs: out.docs, threadId: out.threadId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

