const express = require('express');
const { generateImage } = require('../services/imageGen');
const { upload, uploadToGCS } = require('../services/storageService');

const router = express.Router();

// Upload Image to Cloud Storage
router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'no_file_uploaded' });
    }
    
    const publicUrl = await uploadToGCS(req.file);
    res.json({ 
      url: publicUrl,
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    next(err);
  }
});

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
