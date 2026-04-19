'use server'

import admin, { getDb } from '@/lib/firebase-admin';

const FONTE_TOKEN = process.env.FONTE_TOKEN;

// Fungsi mengirim pesan via Fonnte
async function sendWhatsApp(target, message) {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONTE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: target,
        message: message,
        countryCode: '62' // Default Indonesia
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Fonnte Error:', error);
    return { status: false, message: 'Gagal mengirim WhatsApp' };
  }
}

export async function sendOTP(phoneNumber) {
  if (!phoneNumber) throw new Error('Nomor HP wajib diisi');
  
  // Format nomor (pastikan mulai dengan 62)
  let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (formattedNumber.startsWith('0')) formattedNumber = '62' + formattedNumber.slice(1);
  if (!formattedNumber.startsWith('62')) formattedNumber = '62' + formattedNumber;

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + (5 * 60 * 1000); // Expire dalam 5 menit

  try {
    const db = getDb();
    // Simpan OTP ke koleksi sementara di Firestore
    await db.collection('otp_requests').doc(formattedNumber).set({
      otp,
      expiresAt,
      attempts: 0
    });

    // Kirim via Fonnte
    const message = `Halo Jagoan! Kode OTP pendaftaran The Jago Store Anda adalah: *${otp}*. Kode ini rahasia, jangan berikan kepada siapapun.`;
    const result = await sendWhatsApp(formattedNumber, message);

    return { success: result.status, message: result.status ? 'OTP berhasil dikirim' : 'Gagal mengirim OTP' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function verifyOTP(phoneNumber, userOtp) {
  let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (formattedNumber.startsWith('0')) formattedNumber = '62' + formattedNumber.slice(1);
  if (!formattedNumber.startsWith('62')) formattedNumber = '62' + formattedNumber;

  try {
    const db = getDb();
    const otpDoc = await db.collection('otp_requests').doc(formattedNumber).get();

    if (!otpDoc.exists) return { success: false, message: 'Minta kode OTP baru' };

    const data = otpDoc.data();
    if (Date.now() > data.expiresAt) return { success: false, message: 'OTP sudah kedaluwarsa' };
    if (data.otp !== userOtp) return { success: false, message: 'Kode OTP salah' };

    // OTP Benar - Hapus request
    await db.collection('otp_requests').doc(formattedNumber).delete();

    // Buat/Ambil User di Firebase Auth
    // Kita gunakan nomor telepon sebagai identitas unik (virtual email)
    const email = `${formattedNumber}@thejago.store`;
    let userRecord;
    
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (err) {
      // User belum ada, buat baru
      userRecord = await admin.auth().createUser({
        email: email,
        password: Math.random().toString(36).slice(-12), // Password random rahasia
        displayName: `Jagoan ${formattedNumber.slice(-4)}`
      });
    }

    // Generate Custom Token untuk Login di Client
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    return { success: true, customToken };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
