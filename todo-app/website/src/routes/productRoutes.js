const express = require('express');
const mongoose = require('mongoose');
const { Product } = require('../models/Product');
const { Category } = require('../models/Category');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, tag, q } = req.query || {};

    const filter = { isActive: true };
    if (category) {
      const cat = await Category.findOne({ slug: String(category) }).select('_id').lean();
      if (cat) filter.category = cat._id;
    }

    if (tag === 'recommended') filter.isRecommended = true;
    if (tag === 'discount') filter.discountPercent = { $gt: 0 };
    if (tag === 'flashSale') filter['flashSale.isActive'] = true;

    if (q) filter.name = new RegExp(String(q), 'i');

    let sort = { createdAt: -1 };
    if (tag === 'mostViewed') sort = { viewCount: -1 };
    if (tag === 'discount') sort = { discountPercent: -1, createdAt: -1 };

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(60)
      .lean();

    res.json({ products });
  } catch (err) {
    next(err);
  }
});

router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = mongoose.isValidObjectId(idOrSlug);
    const product = await Product.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug })
      .populate('category', 'name slug')
      .lean();
    if (!product) return res.status(404).json({ error: 'product_not_found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'invalid_id' });
    await Product.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

