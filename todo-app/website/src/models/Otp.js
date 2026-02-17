const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    phoneE164: { type: String, required: true, index: true, trim: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);
module.exports = { Otp };

