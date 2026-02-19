const express = require('express');
const { generateImage } = require('../services/imageGen');

const router = express.Router();

router.post('/', async (req, res) => {
  const { prompt, provider = 'openai' } = req.body || {};
  try {
    const result = await generateImage({ prompt, provider });
    res.json(result);
  } catch (err) {
    console.error('imageGen error', err.message || err);
    res.status(500).json({ error: err.message || 'image_generation_failed' });
  }
});

module.exports = router;
