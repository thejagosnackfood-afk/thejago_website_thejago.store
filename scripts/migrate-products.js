const admin = require('firebase-admin');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

// 1. Inisialisasi Firebase Admin dengan Service Account yang Anda sediakan
const serviceAccount = require('../env/sample database/thejagosnackfood-420-92a6da0e0bf1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const productsCol = db.collection('products');

const SQL_FILE_PATH = path.join(__dirname, '../env/sample database/contoh_database.py');

async function migrate() {
  console.log('--- Memulai Migrasi Produk ke Firebase ---');
  
  const fileStream = fs.createReadStream(SQL_FILE_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = db.batch();
  let batchSize = 0;
  let isInBarangInsert = false;

  for await (const line of rl) {
    const trimmed = line.trim();
    
    // Abaikan baris kosong atau komentar
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) continue;

    // Deteksi blok barang
    if (trimmed.toLowerCase().includes('insert into `barang`') || trimmed.toLowerCase().includes('insert into barang')) {
      isInBarangInsert = true;
      continue;
    }

    // Jika kita sedang dalam blok barang, ambil baris yang diawali '('
    if (isInBarangInsert && trimmed.startsWith('(')) {
      try {
        const cleanLine = trimmed.replace(/^\(/, '').replace(/\),?$/, '').replace(/;/g, '');
        
        // Parsing values (handle quoted strings with commas)
        const values = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < cleanLine.length; i++) {
          const char = cleanLine[i];
          if ((char === '"' || char === "'") && cleanLine[i-1] !== '\\') {
            if (!inQuotes) {
              inQuotes = true;
              quoteChar = char;
            } else if (char === quoteChar) {
              inQuotes = false;
            }
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^["']|["']$/g, ''));

        if (values.length > 10) { // Validasi minimal kolom
          const product = {
            id: values[0],
            name: values[1],
            category: values[2] || 'Lain-lain',
            brand: values[3] || '',
            price: values[24] || '0', 
            stock: parseFloat(values[21]) || 0,
            unit: values[7] || 'PCS',
            img: `/sample-photo/banner (${Math.floor(Math.random() * 3) + 1}).jpg`,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          const docRef = productsCol.doc(product.id);
          batch.set(docRef, product);
          batchSize++;
          count++;

          if (batchSize >= 500) {
            await batch.commit();
            console.log(`Berhasil mengunggah ${count} produk...`);
            batch = db.batch();
            batchSize = 0;
          }
        }
      } catch (err) {
        // console.error('Error parsing line:', err.message);
      }
    }

    // Berhenti jika bertemu perintah SQL lain setelah blok barang
    if (isInBarangInsert && (trimmed.toLowerCase().includes('insert into') && !trimmed.toLowerCase().includes('barang'))) {
      // Kita tidak break agar bisa lanjut jika ada insert barang lain di bawahnya, 
      // tapi kita reset state
      isInBarangInsert = false;
    }
  }

  // Kirim sisa batch terakhir
  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`--- Migrasi Selesai! Total: ${count} produk diunggah ---`);
  process.exit(0);
}

migrate().catch(console.error);
