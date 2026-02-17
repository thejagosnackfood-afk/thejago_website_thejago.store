const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['site', 'google'], required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
    avatarUrl: { type: String, trim: true },
    externalId: { type: String, index: true },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = { Review };

