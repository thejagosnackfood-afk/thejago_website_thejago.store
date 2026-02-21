const { firestore } = require('../config/firestore');

const productsCollection = firestore.collection('products');
const categoriesCollection = firestore.collection('categories');

/**
 * Convert Firestore doc to standard object
 */
const toObject = (doc) => ({ id: doc.id, _id: doc.id, ...doc.data() });

/**
 * Get products with filtering and sorting
 * Note: Firestore has limitations on complex queries (e.g. OR, multiple range filters).
 * We will do basic filtering in DB and advanced filtering in memory if needed for small datasets.
 */
const getProducts = async ({ category, tag, q, limit }) => {
  let query = productsCollection;

  // 1. Filter by Category
  if (category) {
    // Check if category is a slug or ID
    // Optimally, we store categorySlug in product for easy querying
    // For now, let's assume we filter by categoryId or categorySlug if stored
    const catQuery = await categoriesCollection.where('slug', '==', category).limit(1).get();
    if (!catQuery.empty) {
      const catId = catQuery.docs[0].id;
      query = query.where('categoryId', '==', catId);
    }
  }

  // 2. Filter by Tags (Simple boolean flags)
  if (tag === 'recommended') {
    query = query.where('isRecommended', '==', true);
  } else if (tag === 'flashSale') {
    query = query.where('flashSale.isActive', '==', true);
  }

  // 3. Execute Query
  const snapshot = typeof limit === 'number' ? await query.limit(limit).get() : await query.get();
  let products = snapshot.docs.map(toObject);

  // Helper: Fetch all categories for population
  const categoriesSnap = await categoriesCollection.get();
  const categoryMap = {};
  categoriesSnap.forEach(doc => {
    categoryMap[doc.id] = { id: doc.id, ...doc.data() };
  });

  // Attach category details
  products = products.map(p => ({
    ...p,
    category: categoryMap[p.categoryId] || null
  }));

  // 4. In-Memory Filtering/Sorting (Firestore limitations workarounds)
  
  // Filter by Discount > 0
  if (tag === 'discount') {
    products = products.filter(p => p.discountPercent > 0);
    products.sort((a, b) => b.discountPercent - a.discountPercent);
  }
  
  // Sort by View Count
  if (tag === 'mostViewed') {
    products.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  } else if (!tag) {
    // Default sort by created date (simulated if not stored as timestamp compatible with sort)
    // Firestore default order is document ID if not specified
  }

  // Search by Name (Client-side search for small catalog, or use separate index)
  if (q) {
    const regex = new RegExp(q, 'i');
    products = products.filter(p => regex.test(p.name));
  }

  return products;
};

const getProductByIdOrSlug = async (idOrSlug) => {
  let product = null;

  // Try to get by ID first
  const doc = await productsCollection.doc(idOrSlug).get();
  if (doc.exists) {
    product = toObject(doc);
  } else {
    // Try to get by Slug
    const snapshot = await productsCollection.where('slug', '==', idOrSlug).limit(1).get();
    if (!snapshot.empty) {
      product = toObject(snapshot.docs[0]);
    }
  }

  if (product && product.categoryId) {
    const catDoc = await categoriesCollection.doc(product.categoryId).get();
    if (catDoc.exists) {
      product.category = { id: catDoc.id, ...catDoc.data() };
    }
  }

  return product;
};

const incrementViewCount = async (id) => {
  const docRef = productsCollection.doc(id);
  await docRef.update({
    viewCount: firestore.FieldValue.increment(1)
  });
};

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  incrementViewCount
};
