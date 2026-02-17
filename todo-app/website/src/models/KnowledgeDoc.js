const mongoose = require('mongoose');

const knowledgeDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    source: { type: String, default: 'admin' }, // admin | import | etc.
    isActive: { type: Boolean, default: true, index: true },
    embeddingModel: { type: String },
    embedding: { type: [Number], default: undefined }, // optional
  },
  { timestamps: true }
);

const KnowledgeDoc = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
module.exports = { KnowledgeDoc };

