const express = require('express');
const { getProducts, getProductByIdOrSlug, incrementViewCount } = require('../services/productService');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { category, tag, q } = req.query;
    const limitValue = Number(req.query.limit);
    const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined;
    const products = await getProducts({ category, tag, q, limit });
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const product = await getProductByIdOrSlug(idOrSlug);
    
    if (!product) {
      return res.status(404).json({ error: 'product_not_found' });
    }
    
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/view
router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params;
    await incrementViewCount(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
