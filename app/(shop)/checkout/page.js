import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CheckoutClient from './CheckoutClient'

export const metadata = {
  title: 'Checkout | The Jago Store',
  description: 'Selesaikan pembayaran pesanan Anda dengan aman di The Jago Store.',
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Navigation Header */}
      <header className="bg-[#ffc107] py-3 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/shop" className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Toko
        </Link>
        <div className="font-black italic text-xl text-secondary">THE JAGO STORE</div>
      </header>

      <main className="max-w-[1200px] mx-auto pt-12 px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-black italic text-secondary uppercase tracking-tighter">Checkout</h1>
          <p className="text-gray-400 font-bold italic mt-2 uppercase tracking-widest text-[10px]">Selesaikan Pembayaran Anda</p>
        </div>

        <CheckoutClient />
      </main>
    </div>
  )
}
