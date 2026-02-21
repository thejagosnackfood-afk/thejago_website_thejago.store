const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceIdr: { type: Number, required: true, min: 0 },
    nameSnapshot: { type: String, required: true },
    imageUrlSnapshot: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderCode: { type: String, required: true, unique: true, index: true },
    items: { type: [orderItemSchema], default: [] },
    amountIdr: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'canceled'], default: 'pending', index: true },
    paymentProvider: { type: String, enum: ['midtrans'], default: 'midtrans' },
    midtrans: {
      orderId: { type: String },
      transactionStatus: { type: String },
      fraudStatus: { type: String },
      rawNotification: { type: Object },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order };

