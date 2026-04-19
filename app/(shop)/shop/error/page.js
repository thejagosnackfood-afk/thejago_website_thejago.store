import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-3xl font-black italic text-secondary uppercase tracking-tighter mb-2">Pembayaran Gagal</h1>
      <p className="text-gray-500 font-medium max-w-md mb-10">
        Mohon maaf, terjadi kendala saat memproses pembayaran Anda. Silakan coba beberapa saat lagi atau gunakan metode lain.
      </p>
      <Link href="/checkout" className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-3 shadow-xl shadow-red-200">
        <RefreshCw className="w-5 h-5" /> Coba Lagi
      </Link>
    </div>
  )
}
