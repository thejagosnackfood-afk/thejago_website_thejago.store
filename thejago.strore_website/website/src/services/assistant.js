const { findProductsForQuery } = require('./catalogSearch');
const { getOrCreateThread, saveMessage, loadHistory } = require('./chatService');

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

// Simple rule-based chatbot (No OpenAI required)
async function ivaQuery({ message, threadId, channel = 'web', externalId }) {
  const text = String(message || '').trim().toLowerCase();
  if (!text) return { error: 'missing_message' };

  const thread = await getOrCreateThread({ threadId, channel, externalId });
  await saveMessage(thread.id, 'user', text);

  // 1. Search Products First
  const products = await findProductsForQuery(text);
  
  let reply = '';

  // 2. Determine Intent & Response
  if (products.length > 0) {
    // Found products - construct a helpful response
    const topProduct = products[0];
    const otherCount = products.length - 1;
    
    reply = `Saya menemukan ${topProduct.name} dengan harga ${formatPrice(topProduct.priceIdr)}/${topProduct.unit}. Stok tersedia: ${topProduct.stock}.`;
    
    if (otherCount > 0) {
      reply += `\nSelain itu ada juga: ${products.slice(1).map(p => p.name).join(', ')}.`;
    }
  } else {
    // No products found - Fallback responses
    if (text.includes('halo') || text.includes('hai') || text.includes('pagi') || text.includes('siang')) {
      reply = 'Halo! Ada yang bisa saya bantu cari hari ini? Ketik nama produk yang Anda cari.';
    } else if (text.includes('buka') || text.includes('jam')) {
      reply = 'Toko kami buka setiap hari dari jam 07.00 - 21.00 WIB.';
    } else if (text.includes('alamat') || text.includes('lokasi')) {
      reply = 'Kami berlokasi di Jl. Raya Ciwastra No. 123, Bandung.';
    } else {
      reply = 'Maaf, saya tidak menemukan produk tersebut. Coba kata kunci lain atau cek ejaan nama produknya.';
    }
  }

  await saveMessage(thread.id, 'assistant', reply);

  return {
    threadId: String(thread.id),
    reply,
    products, // Frontend can render product cards
    docs: [] 
  };
}

module.exports = { ivaQuery };

