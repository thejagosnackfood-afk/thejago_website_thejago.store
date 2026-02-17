const express = require('express');

const { Category } = require('../models/Category');
const { Product } = require('../models/Product');
const { Order } = require('../models/Order');
const { Review } = require('../models/Review');
const { KnowledgeDoc } = require('../models/KnowledgeDoc');
const { requireAdmin } = require('../middleware/admin');
const { embedText } = require('../services/embeddings');

const router = express.Router();

function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.post('/seed', requireAdmin, async (req, res, next) => {
  try {
    const categoryNames = [
      'Baso',
      'Sosis',
      'Nugget',
      'Bumbu Rempah',
      'Bumbu Kaldu',
      'Santan',
      'Susu',
      'Frozen Food Lainnya',
    ];

    const categories = [];
    for (let i = 0; i < categoryNames.length; i++) {
      const name = categoryNames[i];
      const slug = slugify(name);
      const cat = await Category.findOneAndUpdate(
        { slug },
        { name, slug, sortOrder: i },
        { upsert: true, new: true }
      );
      categories.push(cat);
    }

    const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

    const products = [
      { name: 'Baso Sapi Premium 500g', categorySlug: 'baso', priceIdr: 35000, isRecommended: true },
      { name: 'Sosis Ayam 500g', categorySlug: 'sosis', priceIdr: 28000, discountPercent: 10 },
      { name: 'Nugget Ayam Crispy 500g', categorySlug: 'nugget', priceIdr: 32000, flashSale: { isActive: true, priceIdr: 27000, endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000) } },
      { name: 'Bumbu Rempah Rendang 100g', categorySlug: 'bumbu-rempah', priceIdr: 15000 },
      { name: 'Kaldu Jamur 200g', categorySlug: 'bumbu-kaldu', priceIdr: 18000, isRecommended: true },
      { name: 'Santan Instan 200ml', categorySlug: 'santan', priceIdr: 9000, discountPercent: 15 },
      { name: 'Susu UHT 1L', categorySlug: 'susu', priceIdr: 19000 },
    ];

    for (const p of products) {
      const slug = slugify(p.name);
      const category = bySlug[p.categorySlug]?._id;
      await Product.findOneAndUpdate(
        { slug },
        {
          ...p,
          slug,
          category,
          imageUrl: p.imageUrl || '',
          flashSale: p.flashSale || { isActive: false },
        },
        { upsert: true, new: true }
      );
    }

    await Review.deleteMany({ source: 'site' });
    const siteReviews = [
      { authorName: 'Rina', rating: 5, text: 'Frozen food-nya fresh, packing rapi, pengiriman cepat.' },
      { authorName: 'Andi', rating: 5, text: 'Baso enak, bumbu rempahnya wangi, repeat order.' },
      { authorName: 'Sari', rating: 4, text: 'Harga masuk akal, ada diskon, CS responsif.' },
      { authorName: 'Dewi', rating: 5, text: 'Flash sale-nya mantap, nugget anak-anak suka.' },
      { authorName: 'Budi', rating: 4, text: 'Sosisnya enak, stok selalu update.' },
    ];

    for (const r of siteReviews) {
      await Review.create({ source: 'site', ...r });
    }

    res.json({ ok: true, categories: categories.length, products: products.length, reviews: siteReviews.length });
  } catch (err) {
    next(err);
  }
});

router.post('/google-reviews', requireAdmin, async (req, res, next) => {
  try {
    const { reviews } = req.body || {};
    if (!Array.isArray(reviews)) return res.status(400).json({ error: 'invalid_reviews' });

    await Review.deleteMany({ source: 'google' });
    const toInsert = reviews
      .slice(0, 20)
      .map((r) => ({
        source: 'google',
        authorName: String(r.authorName || 'Google User'),
        rating: Number(r.rating || 5),
        text: String(r.text || '').trim(),
        externalId: r.externalId ? String(r.externalId) : undefined,
      }))
      .filter((r) => r.text);

    if (toInsert.length) await Review.insertMany(toInsert);
    res.json({ ok: true, inserted: toInsert.length });
  } catch (err) {
    next(err);
  }
});

// Admin CRUD (for ToolJet UI)
router.get('/categories', requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const skip = Math.max(0, Number(req.query.skip || 0));
    const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limit).lean();
    const total = await Category.countDocuments({});
    res.json({ categories, total });
  } catch (err) {
    next(err);
  }
});

router.post('/categories', requireAdmin, async (req, res, next) => {
  try {
    const { name, slug, sortOrder } = req.body || {};
    if (!name) return res.status(400).json({ error: 'missing_name' });
    const finalSlug = slug ? slugify(slug) : slugify(name);
    const cat = await Category.create({
      name: String(name).trim(),
      slug: finalSlug,
      sortOrder: Number(sortOrder || 0),
    });
    res.json({ category: cat });
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, slug, sortOrder } = req.body || {};
    const update = {};
    if (name) update.name = String(name).trim();
    if (slug) update.slug = slugify(slug);
    if (sortOrder !== undefined) update.sortOrder = Number(sortOrder);
    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cat) return res.status(404).json({ error: 'category_not_found' });
    res.json({ category: cat });
  } catch (err) {
    next(err);
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res, next) => {
  try {
    const used = await Product.exists({ category: req.params.id });
    if (used) return res.status(409).json({ error: 'category_in_use' });
    const r = await Category.deleteOne({ _id: req.params.id });
    if (!r.deletedCount) return res.status(404).json({ error: 'category_not_found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/products', requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const skip = Math.max(0, Number(req.query.skip || 0));
    const { q, categorySlug, isActive } = req.query || {};

    const filter = {};
    if (q) filter.name = new RegExp(String(q), 'i');
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;
    if (categorySlug) {
      const cat = await Category.findOne({ slug: String(categorySlug) }).select('_id').lean();
      if (cat) filter.category = cat._id;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Product.countDocuments(filter);
    res.json({ products, total });
  } catch (err) {
    next(err);
  }
});

router.post('/products', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.name) return res.status(400).json({ error: 'missing_name' });
    if (body.priceIdr === undefined) return res.status(400).json({ error: 'missing_price' });

    const finalSlug = body.slug ? slugify(body.slug) : slugify(body.name);
    const category = body.categorySlug
      ? await Category.findOne({ slug: String(body.categorySlug) }).select('_id').lean()
      : null;

    const product = await Product.create({
      name: String(body.name).trim(),
      slug: finalSlug,
      category: category?._id,
      priceIdr: Number(body.priceIdr),
      imageUrl: body.imageUrl ? String(body.imageUrl).trim() : '',
      isRecommended: Boolean(body.isRecommended),
      discountPercent: Number(body.discountPercent || 0),
      flashSale: {
        isActive: Boolean(body.flashSale?.isActive),
        priceIdr: body.flashSale?.priceIdr !== undefined ? Number(body.flashSale.priceIdr) : undefined,
        endsAt: body.flashSale?.endsAt ? new Date(body.flashSale.endsAt) : undefined,
      },
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const update = {};
    if (body.name) update.name = String(body.name).trim();
    if (body.slug) update.slug = slugify(body.slug);
    if (body.priceIdr !== undefined) update.priceIdr = Number(body.priceIdr);
    if (body.imageUrl !== undefined) update.imageUrl = String(body.imageUrl || '').trim();
    if (body.isRecommended !== undefined) update.isRecommended = Boolean(body.isRecommended);
    if (body.discountPercent !== undefined) update.discountPercent = Number(body.discountPercent || 0);
    if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);

    if (body.categorySlug !== undefined) {
      if (!body.categorySlug) update.category = null;
      else {
        const cat = await Category.findOne({ slug: String(body.categorySlug) }).select('_id').lean();
        update.category = cat?._id || null;
      }
    }

    if (body.flashSale !== undefined) {
      update.flashSale = {
        isActive: Boolean(body.flashSale?.isActive),
        priceIdr: body.flashSale?.priceIdr !== undefined ? Number(body.flashSale.priceIdr) : undefined,
        endsAt: body.flashSale?.endsAt ? new Date(body.flashSale.endsAt) : undefined,
      };
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ error: 'product_not_found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// Soft delete: keep record but disable in storefront
router.delete('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'product_not_found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const skip = Math.max(0, Number(req.query.skip || 0));
    const { status } = req.query || {};
    const filter = {};
    if (status) filter.status = String(status);

    const orders = await Order.find(filter)
      .populate('user', 'name phoneE164')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Order.countDocuments(filter);
    res.json({ orders, total });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:id', requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name phoneE164').lean();
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.put('/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const allowed = new Set(['pending', 'paid', 'failed', 'canceled']);
    if (!allowed.has(String(status))) return res.status(400).json({ error: 'invalid_status' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: String(status) }, { new: true });
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

function ensureSlug(input) {
  return slugify(input || '');
}

// Knowledge base docs for IVA (ToolJet can manage these via HTTP resource)
router.get('/kb/docs', requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const skip = Math.max(0, Number(req.query.skip || 0));
    const docs = await KnowledgeDoc.find({}).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
    const total = await KnowledgeDoc.countDocuments({});
    res.json({ docs, total });
  } catch (err) {
    next(err);
  }
});

router.post('/kb/docs', requireAdmin, async (req, res, next) => {
  try {
    const { title, slug, content, tags, isActive } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: 'missing_fields' });
    const finalSlug = slug ? ensureSlug(slug) : ensureSlug(title);

    const doc = await KnowledgeDoc.create({
      title: String(title).trim(),
      slug: finalSlug,
      content: String(content),
      tags: Array.isArray(tags) ? tags.map(String) : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.json({ doc });
  } catch (err) {
    next(err);
  }
});

router.put('/kb/docs/:id', requireAdmin, async (req, res, next) => {
  try {
    const { title, slug, content, tags, isActive } = req.body || {};
    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (slug !== undefined) update.slug = ensureSlug(slug);
    if (content !== undefined) update.content = String(content);
    if (tags !== undefined) update.tags = Array.isArray(tags) ? tags.map(String) : [];
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const doc = await KnowledgeDoc.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'doc_not_found' });
    res.json({ doc });
  } catch (err) {
    next(err);
  }
});

router.post('/kb/reindex', requireAdmin, async (req, res, next) => {
  try {
    const docs = await KnowledgeDoc.find({ isActive: true }).select('_id content').lean();
    let updated = 0;
    for (const d of docs) {
      const emb = await embedText(d.content);
      if (!emb) continue;
      await KnowledgeDoc.updateOne(
        { _id: d._id },
        { embeddingModel: emb.model, embedding: emb.vector }
      );
      updated++;
    }
    res.json({ ok: true, updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
