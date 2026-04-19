import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { getProductById } from '@/app/api/products/actions'
import AddToCartDetail from './AddToCartDetail'
import CartSidebar from '@/components/layout/CartSidebar'

// Ini adalah Server Component (Konsep standar Next.js)
export default async function ProductDetailPage({ params }) {
  const { slug } = await params
  
  // Mengambil data produk spesifik dari seluruh database lokal
  const product = await getProductById(slug)

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <h2 className="text-2xl font-black italic text-secondary uppercase">Produk Tidak Ditemukan</h2>
        <Link href="/shop" className="text-primary-dark font-bold hover:underline">Kembali ke Katalog</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <CartSidebar />
      <header className="bg-[#ffc107] py-3 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/shop" className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Katalog
        </Link>
        <ShoppingCart className="w-6 h-6 text-secondary/30" />
      </header>

      <main className="max-w-[1200px] mx-auto pt-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 p-12 relative group">
              <img src={product.img || '/sample-photo/banner (1).jpg'} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-24 h-24 bg-gray-50 rounded-2xl border border-gray-100 p-4">
                  <img src={product.img} alt="Thumb" className="w-full h-full object-contain opacity-50" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <span className="text-primary-dark font-black text-[10px] uppercase tracking-[0.3em]">Premium Collection</span>
              <h1 className="text-4xl md:text-5xl font-black italic text-secondary uppercase leading-none tracking-tighter">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                  <span className="text-xs font-bold text-gray-400 ml-2">1.2k+ Ulasan</span>
                </div>
                <div className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Tersedia</div>
              </div>
            </div>

            <div className="text-4xl font-black italic text-secondary">
              Rp {product.price}
            </div>

            {/* Pindahkan bagian interaktif ke Client Component */}
            <AddToCartDetail product={product} />

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, text: 'Kirim Instan' },
                { icon: ShieldCheck, text: 'Original 100%' },
                { icon: RotateCcw, text: 'Garansi Tukar' }
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-3xl border border-gray-50">
                  <badge.icon className="w-5 h-5 text-gray-300" />
                  <span className="text-[9px] font-black uppercase text-gray-400 text-center tracking-tighter">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-gray-100 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-xl font-black italic text-secondary uppercase tracking-tighter mb-8 flex items-center gap-3">
                Informasi Produk
                <div className="h-1 w-8 bg-primary rounded-full"></div>
              </h3>
              <table className="w-full text-sm font-semibold text-secondary">
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="py-4 text-gray-400 italic">Perusahaan</td>
                    <td className="py-4 font-black text-right">PT. THE JAGO RETAIL INDONESIA</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-gray-400 italic">Berat Bersih</td>
                    <td className="py-4 font-black text-right">{product.stock || '1000'} {product.unit || 'g'}</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-gray-400 italic">Kategori</td>
                    <td className="py-4 font-black uppercase text-right">{product.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative inline-block">
                <h3 className="text-3xl font-black italic text-secondary uppercase tracking-tighter">Deskripsi Lengkap</h3>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
              </div>
              <p className="text-gray-500 font-medium leading-loose text-lg italic max-w-lg">
                {product.name} diproses dengan standar mutu yang sangat ketat untuk memastikan kualitas dan rasa yang terjaga. 
                Produk pilihan terbaik dari The Jago Store untuk melengkapi kebutuhan dapur dan rumah tangga keluarga Anda di seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
