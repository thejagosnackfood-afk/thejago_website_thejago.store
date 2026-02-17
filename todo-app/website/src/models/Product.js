const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    priceIdr: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    isRecommended: { type: Boolean, default: false, index: true },
    discountPercent: { type: Number, min: 0, max: 100, default: 0, index: true },
    flashSale: {
      isActive: { type: Boolean, default: false, index: true },
      priceIdr: { type: Number, min: 0 },
      endsAt: { type: Date, index: true },
    },
    viewCount: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = { Product };

