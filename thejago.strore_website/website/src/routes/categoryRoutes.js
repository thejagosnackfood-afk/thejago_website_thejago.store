const express = require('express');
const { getCategories } = require('../services/categoryService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

