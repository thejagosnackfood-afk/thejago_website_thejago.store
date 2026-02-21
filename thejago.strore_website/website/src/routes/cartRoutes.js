const express = require('express');
const mongoose = require('mongoose');

const { requireAuth } = require('../middleware/auth');
const { Cart } = require('../models/Cart');
const { Product } = require('../models/Product');

const router = express.Router();

async function recalcAndSave(cart) {
  let totalItems = 0;
  let totalPriceIdr = 0;
  for (const item of cart.items) {
    totalItems += item.quantity;
    totalPriceIdr += item.quantity * item.unitPriceIdr;
  }
  cart.totalItems = totalItems;
  cart.totalPriceIdr = totalPriceIdr;
  await cart.save();
  return cart;
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).lean();
    if (!cart) cart = await Cart.create({ user: req.user._id }).then((c) => c.toObject());
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

router.post('/items', requireAuth, async (req, res, next) => {
  try {
    const { productId, quantityDelta } = req.body || {};
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ error: 'invalid_product' });
    const delta = Number(quantityDelta || 0);
    if (!Number.isFinite(delta) || delta === 0) return res.status(400).json({ error: 'invalid_quantity' });

    const product = await Product.findById(productId).lean();
    if (!product || !product.isActive) return res.status(404).json({ error: 'product_not_found' });

    const unitPriceIdr =
      product.flashSale?.isActive && product.flashSale?.priceIdr ? product.flashSale.priceIdr : product.priceIdr;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id });

    const existing = cart.items.find((i) => String(i.product) === String(productId));
    if (!existing) {
      if (delta < 0) return res.status(400).json({ error: 'invalid_quantity' });
      cart.items.push({
        product: product._id,
        quantity: delta,
        unitPriceIdr,
        nameSnapshot: product.name,
        imageUrlSnapshot: product.imageUrl,
      });
    } else {
      existing.quantity += delta;
      if (existing.quantity <= 0) {
        cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
      } else {
        existing.unitPriceIdr = unitPriceIdr;
        existing.nameSnapshot = product.name;
        existing.imageUrlSnapshot = product.imageUrl;
      }
    }

    cart = await recalcAndSave(cart);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

router.put('/items/:productId', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body || {};
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ error: 'invalid_product' });
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) return res.status(400).json({ error: 'invalid_quantity' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id });

    const existing = cart.items.find((i) => String(i.product) === String(productId));
    if (!existing) return res.status(404).json({ error: 'item_not_found' });

    if (qty === 0) {
      cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
    } else {
      existing.quantity = qty;
    }

    cart = await recalcAndSave(cart);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:productId', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ error: 'invalid_product' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id });

    cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
    cart = await recalcAndSave(cart);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

