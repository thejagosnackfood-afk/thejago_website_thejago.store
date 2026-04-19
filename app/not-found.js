import Link from 'next/link'
import { Search, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Icon Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative bg-white border-4 border-secondary p-8 rounded-[3rem] shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
          <Search className="w-24 h-24 text-secondary stroke-[3]" />
          <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black italic px-4 py-2 rounded-2xl shadow-lg animate-bounce">
            404
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-md">
        <h1 className="text-4xl md:text-6xl font-black italic text-secondary mb-4 uppercase tracking-tighter leading-none">
          WADUH, BARANGNYA <span className="text-primary italic">GAIB!</span>
        </h1>
        <p className="text-gray-500 font-medium mb-12 italic">
          Sepertinya halaman atau produk yang Anda cari sedang bersembunyi atau sudah laku terjual. Jangan panik, belanja jago tetap lanjut!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="bg-secondary hover:bg-black text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-secondary/20"
          >
            <Home className="w-5 h-5" /> KE BERANDA
          </Link>
          <Link 
            href="/shop" 
            className="bg-primary hover:bg-primary-dark text-secondary px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20"
          >
            <ArrowLeft className="w-5 h-5" /> LANJUT BELANJA
          </Link>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="mt-24 text-[10px] font-black text-gray-200 uppercase tracking-[0.5em] select-none">
        The Jago Store Error System v1.0
      </div>
    </div>
  )
}
