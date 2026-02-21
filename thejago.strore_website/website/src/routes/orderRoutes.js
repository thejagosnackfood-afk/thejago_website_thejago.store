const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { Cart } = require('../models/Cart');
const { Order } = require('../models/Order');
const { randomToken } = require('../utils/crypto');

const router = express.Router();

function newOrderCode() {
  return `JAGO-${Date.now()}-${randomToken(6)}`;
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    if (!req.user.whatsappVerified) return res.status(403).json({ error: 'whatsapp_not_verified' });
    const cart = await Cart.findOne({ user: req.user._id }).lean();
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'cart_empty' });

    const order = await Order.create({
      user: req.user._id,
      orderCode: newOrderCode(),
      items: cart.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        unitPriceIdr: i.unitPriceIdr,
        nameSnapshot: i.nameSnapshot,
        imageUrlSnapshot: i.imageUrlSnapshot,
      })),
      amountIdr: cart.totalPriceIdr,
      status: 'pending',
      paymentProvider: 'midtrans',
    });

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.get('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }).lean();
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
