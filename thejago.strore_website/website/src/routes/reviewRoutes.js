const express = require('express');
const { Review } = require('../models/Review');
const { requireAuth } = require('../middleware/auth');
const { maybeSyncGoogleReviews } = require('../services/googlePlaces');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5), 20);
    const reviews = await Review.find({ source: 'site' }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { rating, text } = req.body || {};
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) return res.status(400).json({ error: 'invalid_rating' });
    if (!text) return res.status(400).json({ error: 'missing_text' });

    const review = await Review.create({
      source: 'site',
      authorName: req.user.name,
      rating: r,
      text: String(text).trim(),
    });

    res.json({ review });
  } catch (err) {
    next(err);
  }
});

router.get('/google', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5), 20);
    const wantSync = ['1', 'true', 'yes', 'on'].includes(String(req.query.sync || '').toLowerCase());
    const forceSync = ['1', 'true', 'yes', 'on'].includes(String(req.query.forceSync || '').toLowerCase());
    let sync = null;

    if (wantSync || forceSync) {
      try {
        sync = await maybeSyncGoogleReviews({ force: forceSync });
      } catch (err) {
        sync = { ok: false, error: err.message || 'google_sync_failed' };
      }
    }

    const reviews = await Review.find({ source: 'google' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ reviews, sync });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
