const express = require('express');
const { ivaQuery } = require('../services/assistant');

const router = express.Router();

router.post('/query', async (req, res, next) => {
  try {
    const { message, threadId, channel, externalId } = req.body || {};
    const out = await ivaQuery({ message, threadId, channel, externalId });
    if (out?.error) return res.status(out.error === 'missing_message' ? 400 : 501).json({ error: out.error });
    res.json(out);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

