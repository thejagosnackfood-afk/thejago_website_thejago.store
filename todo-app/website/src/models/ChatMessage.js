const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true, index: true },
    role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = { ChatMessage };

