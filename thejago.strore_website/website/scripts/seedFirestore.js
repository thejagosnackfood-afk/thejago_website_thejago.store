const { firestore } = require('../src/config/firestore');
const { v4: uuidv4 } = require('uuid');

const categories = [
  { id: 'snack-kiloan', name: 'Snack Kiloan', slug: 'snack-kiloan', description: 'Aneka snack kiloan murah meriah' },
  { id: 'frozen-food', name: 'Frozen Food', slug: 'frozen-food', description: 'Makanan beku praktis dan lezat' },
  { id: 'minuman', name: 'Minuman Segar', slug: 'minuman', description: 'Minuman dingin pelepas dahaga' },
];

const products = [
  {
    name: 'Basreng Pedas Jeruk 1kg',
    slug: 'basreng-pedas-jeruk-1kg',
    categoryId: 'snack-kiloan',
    priceIdr: 45000,
    imageUrl: 'https://placehold.co/400x400?text=Basreng+Pedas',
    description: 'Basreng super pedas dengan aroma daun jeruk yang khas.',
    isRecommended: true,
    isActive: true,
    stock: 50,
    viewCount: 120,
    discountPercent: 0,
    createdAt: new Date(),
  },
  {
    name: 'Keripik Kaca Original 500g',
    slug: 'keripik-kaca-original-500g',
    categoryId: 'snack-kiloan',
    priceIdr: 25000,
    imageUrl: 'https://placehold.co/400x400?text=Keripik+Kaca',
    description: 'Keripik singkong super tipis, renyah dan gurih.',
    isRecommended: false,
    isActive: true,
    stock: 30,
    viewCount: 85,
    discountPercent: 10,
    createdAt: new Date(),
  },
  {
    name: 'Nugget Ayam Premium 500g',
    slug: 'nugget-ayam-premium-500g',
    categoryId: 'frozen-food',
    priceIdr: 38000,
    imageUrl: 'https://placehold.co/400x400?text=Nugget+Ayam',
    description: 'Nugget ayam daging pilihan, tanpa pengawet.',
    isRecommended: true,
    isActive: true,
    stock: 20,
    viewCount: 200,
    discountPercent: 5,
    createdAt: new Date(),
  },
  {
    name: 'Es Teh Jumbo',
    slug: 'es-teh-jumbo',
    categoryId: 'minuman',
    priceIdr: 5000,
    imageUrl: 'https://placehold.co/400x400?text=Es+Teh',
    description: 'Es teh manis ukuran jumbo, segar!',
    isRecommended: false,
    isActive: true,
    stock: 100,
    viewCount: 45,
    discountPercent: 0,
    createdAt: new Date(),
  },
];

async function seed() {
  console.log('🌱 Seeding Firestore...');

  // 1. Seed Categories
  const batch = firestore.batch();
  
  for (const cat of categories) {
    const docRef = firestore.collection('categories').doc(cat.id);
    batch.set(docRef, cat);
  }

  // 2. Seed Products
  for (const prod of products) {
    // Generate ID automatically or use slug as ID
    const docRef = firestore.collection('products').doc(); 
    batch.set(docRef, prod);
  }

  await batch.commit();
  console.log('✅ Seeding complete!');
}

seed().catch(console.error);
