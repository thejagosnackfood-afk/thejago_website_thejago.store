import Link from 'next/link'
import { CheckCircle2, ShoppingBag } from 'lucide-react'

export default function FinishPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h1 className="text-3xl font-black italic text-secondary uppercase tracking-tighter mb-2">Pembayaran Berhasil!</h1>
      <p className="text-gray-500 font-medium max-w-md mb-10">
        Terima kasih! Pesanan Anda telah kami terima dan sedang diproses oleh tim The Jago Store.
      </p>
      <Link href="/shop" className="bg-secondary text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-secondary/90 transition-all flex items-center gap-3">
        <ShoppingBag className="w-5 h-5" /> Kembali Belanja
      </Link>
    </div>
  )
}
