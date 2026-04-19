'use server'

import fs from 'fs';
import path from 'path';

// Load Local Database
const DB_PATH = path.join(process.cwd(), 'data/products.json');

export async function getProducts(category = null, lastId = null, limit = 20, search = "") {
  try {
    if (!fs.existsSync(DB_PATH)) return { products: [], hasMore: false, error: "Database lokal tidak ditemukan" };
    
    const fileData = fs.readFileSync(DB_PATH, 'utf8');
    let allProducts = JSON.parse(fileData);

    // 1. Filter Pencarian (Search)
    if (search) {
      const q = search.toLowerCase();
      allProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }

    // 2. Filter Kategori (jika ada)
    if (category && category !== 'all') {
      allProducts = allProducts.filter(p => p.category === category);
    }

    // 3. Cari index terakhir untuk Pagination
    let startIndex = 0;
    if (lastId) {
      const idx = allProducts.findIndex(p => p.id === lastId);
      if (idx !== -1) startIndex = idx + 1;
    }

    const paginatedProducts = allProducts.slice(startIndex, startIndex + limit);

    return { 
      products: paginatedProducts,
      hasMore: (startIndex + limit) < allProducts.length,
      error: null
    };
  } catch (error) {
    console.error('Error fetching local products:', error.message);
    return { products: [], hasMore: false, error: error.message };
  }
}

export async function getProductById(id) {
  try {
    if (!fs.existsSync(DB_PATH)) return null;
    const fileData = fs.readFileSync(DB_PATH, 'utf8');
    const allProducts = JSON.parse(fileData);
    return allProducts.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    return null;
  }
}
