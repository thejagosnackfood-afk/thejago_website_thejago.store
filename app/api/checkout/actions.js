'use server'

import { snap } from '@/lib/midtrans';
import { getDb } from '@/lib/firebase-admin';

export async function createTransaction(orderData) {
  try {
    const { items, customerDetails } = orderData;
    
    // 1. Hitung total (validasi ulang di server)
    const itemDetails = items.map(item => ({
      id: item.id,
      price: parseInt(item.price.replace(/\./g, '')),
      quantity: item.quantity,
      name: item.name
    }));

    const totalAmount = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Generate Order ID unik
    const orderId = `TJS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Siapkan parameter Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName || '',
        email: customerDetails.email,
        phone: customerDetails.phone,
        billing_address: {
          first_name: customerDetails.firstName,
          last_name: customerDetails.lastName || '',
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          city: customerDetails.city,
          postal_code: customerDetails.postalCode,
          country_code: 'IDN'
        },
        shipping_address: {
          first_name: customerDetails.firstName,
          last_name: customerDetails.lastName || '',
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          city: customerDetails.city,
          postal_code: customerDetails.postalCode,
          country_code: 'IDN'
        }
      },
      // Optional: Enable specific payment methods
      enabled_payments: ["credit_card", "gopay", "shopeepay", "permata_va", "bca_va", "bni_va", "bri_va", "other_va"],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/finish`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/pending`
      }
    };

    // 4. Buat transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);

    // 5. Simpan order ke Database (Firebase) untuk tracking
    const db = getDb();
    if (db) {
      await db.collection('orders').doc(orderId).set({
        orderId,
        items: itemDetails,
        totalAmount,
        customerDetails,
        status: 'pending',
        token: transaction.token,
        createdAt: new Date().toISOString()
      });
    }

    return { token: transaction.token, orderId };
  } catch (error) {
    console.error('Midtrans Transaction Error:', error.message);
    throw new Error('Gagal membuat transaksi pembayaran');
  }
}
