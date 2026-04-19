import { NextResponse } from 'next/server';

// Konsep: Menggunakan Resend atau Nodemailer untuk pengiriman email
export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    console.log(`Mensimulasikan pengiriman email ke: ${to}`);
    console.log(`Subjek: ${subject}`);
    
    // Di sini Anda akan memanggil API Resend atau transport Nodemailer
    // const { data, error } = await resend.emails.send({ ... });

    return NextResponse.json({ 
      success: true, 
      message: 'Email berhasil dikirim (Simulasi)' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
