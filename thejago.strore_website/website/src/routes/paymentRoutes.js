const express = require('express');
const midtransClient = require('midtrans-client');

const { requireAuth } = require('../middleware/auth');
const { Order } = require('../models/Order');

const router = express.Router();

function getSnap() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  if (!serverKey || !clientKey) {
    throw new Error('Midtrans not configured (MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY)');
  }
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey,
    clientKey,
  });
}

router.post('/midtrans/snap-token', requireAuth, async (req, res, next) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'missing_orderId' });

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'order_not_found' });

    const snap = getSnap();
    const order_id = order.orderCode;

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: order.amountIdr,
      },
      customer_details: {
        first_name: req.user.name,
        phone: req.user.phoneE164,
      },
      item_details: order.items.map((i) => ({
        id: String(i.product || ''),
        price: i.unitPriceIdr,
        quantity: i.quantity,
        name: i.nameSnapshot,
      })),
      currency: 'IDR',
    };

    const token = await snap.createTransactionToken(parameter);

    order.midtrans.orderId = order_id;
    await order.save();

    res.json({ token, orderId: order._id, orderCode: order.orderCode });
  } catch (err) {
    next(err);
  }
});

// Midtrans server-to-server notification
router.post('/midtrans/notification', async (req, res, next) => {
  try {
    const notification = req.body || {};
    const orderCode = notification.order_id;
    if (!orderCode) return res.status(400).json({ error: 'missing_order_id' });

    const order = await Order.findOne({ orderCode });
    if (!order) return res.status(404).json({ error: 'order_not_found' });

    order.midtrans.transactionStatus = notification.transaction_status;
    order.midtrans.fraudStatus = notification.fraud_status;
    order.midtrans.rawNotification = notification;

    if (notification.transaction_status === 'settlement' || notification.transaction_status === 'capture') {
      order.status = 'paid';
    } else if (notification.transaction_status === 'deny' || notification.transaction_status === 'expire' || notification.transaction_status === 'cancel') {
      order.status = 'failed';
    }

    await order.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

