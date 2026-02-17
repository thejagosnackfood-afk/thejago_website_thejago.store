const express = require('express');

const { Category } = require('../models/Category');
const { Product } = require('../models/Product');
const { Review } = require('../models/Review');

const router = express.Router();

function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.post('/seed', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-seed-token'];
    if (!process.env.ADMIN_SEED_TOKEN || token !== process.env.ADMIN_SEED_TOKEN) {
      return res.status(401).json({ error: 'unauthorized' });
    }

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

router.post('/google-reviews', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-seed-token'];
    if (!process.env.ADMIN_SEED_TOKEN || token !== process.env.ADMIN_SEED_TOKEN) {
      return res.status(401).json({ error: 'unauthorized' });
    }

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

module.exports = router;
