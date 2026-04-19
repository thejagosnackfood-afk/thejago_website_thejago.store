import Link from 'next/link'
import { Clock, ShoppingBag } from 'lucide-react'

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
        <Clock className="w-12 h-12 text-blue-500 animate-pulse" />
      </div>
      <h1 className="text-3xl font-black italic text-secondary uppercase tracking-tighter mb-2">Menunggu Pembayaran</h1>
      <p className="text-gray-500 font-medium max-w-md mb-10">
        Segera selesaikan pembayaran Anda sebelum batas waktu berakhir agar pesanan tidak dibatalkan otomatis.
      </p>
      <Link href="/shop" className="bg-secondary text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-secondary/90 transition-all">
        Lihat Pesanan Saya
      </Link>
    </div>
  )
}
