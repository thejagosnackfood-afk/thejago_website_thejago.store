'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-red-50 max-w-lg w-full">
        <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h2 className="text-3xl font-black italic text-secondary uppercase tracking-tighter mb-4 leading-none">
          SISTEM LAGI <span className="text-red-600">REWEL...</span>
        </h2>
        <p className="text-gray-500 font-medium mb-10 italic">
          Terjadi kesalahan teknis yang tidak terduga. Tim teknisi Jago sedang berusaha menjinakkan sistem kami.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-primary hover:bg-primary-dark text-secondary font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <RefreshCcw className="w-5 h-5" /> COBA LAGI
          </button>
          <Link 
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-5 h-5" /> KEMBALI KE BERANDA
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-relaxed">
        Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} | The Jago Store
      </p>
    </div>
  )
}
