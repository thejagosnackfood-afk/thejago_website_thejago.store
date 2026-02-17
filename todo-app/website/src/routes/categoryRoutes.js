const express = require('express');
const { Category } = require('../models/Category');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

