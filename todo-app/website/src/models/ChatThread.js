const mongoose = require('mongoose');

const chatThreadSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ['web', 'whatsapp', 'api'], default: 'web', index: true },
    externalId: { type: String, index: true }, // e.g. phoneE164 for WhatsApp
  },
  { timestamps: true }
);

const ChatThread = mongoose.model('ChatThread', chatThreadSchema);
module.exports = { ChatThread };

