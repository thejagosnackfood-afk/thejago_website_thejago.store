'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { 
  User, 
  Smartphone, 
  MapPin, 
  Tag, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

export default function PendaftaranMemberPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    referralCode: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Pre-fill phone number if user is logged in
  useEffect(() => {
    if (user && user.phoneNumber) {
      // Firebase phone numbers usually include +62, we strip it for the input
      const phone = user.phoneNumber.replace('+62', '')
      setFormData(prev => ({ ...prev, phoneNumber: phone }))
    }
    if (user && user.displayName) {
      setFormData(prev => ({ ...prev, fullName: user.displayName }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // Logic for registration would go here
    // For now, we simulate a successful registration
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Registering member:', formData)
      setSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/shop')
      }, 3000)
    } catch (err) {
      setError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 py-12">
      <main className="w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-500">
        <div className="p-8 md:p-16">
          <div className="text-center mb-12">
            <Link href="/" className="font-black italic text-3xl text-secondary inline-block hover:scale-105 transition-transform">
              THE JAGO STORE
            </Link>
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="bg-primary/10 text-primary-dark px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Program Membership Jagoan
              </div>
              <h1 className="text-3xl font-black italic text-secondary uppercase tracking-tighter leading-none">
                Gabung Jadi <span className="text-primary italic">Member Jago!</span>
              </h1>
              <p className="text-xs text-gray-400 font-bold italic max-w-sm mx-auto">
                Dapatkan diskon khusus, poin belanja, dan layanan prioritas dari The Jago Store.
              </p>
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-50 text-red-600 p-5 rounded-3xl flex items-center gap-4 mb-8 border border-red-100">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-xs font-black uppercase italic tracking-tight">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center py-12 space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-2 border-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-secondary uppercase italic tracking-tighter">Pendaftaran Berhasil!</h2>
                <p className="text-sm text-gray-400 font-bold italic mt-2">Selamat Datang Jagoan! Anda akan diarahkan ke toko dalam sekejap...</p>
              </div>
              <Link href="/shop" className="inline-block bg-secondary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary/90 transition-all">
                Mulai Belanja Sekarang
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Nama Lengkap Sesuai KTP
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    required
                    aria-required="true"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-5 pl-14 pr-6 font-bold text-secondary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-200"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Nomor WhatsApp */}
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Nomor WhatsApp Aktif
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-gray-200">
                    <Smartphone className="w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <span className="text-sm font-black text-secondary">+62</span>
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    aria-required="true"
                    type="tel"
                    placeholder="812xxxxxx"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-5 pl-24 pr-6 font-black text-lg text-secondary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-200"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/[^0-9]/g, '') }))}
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-2">
                <label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Alamat Lengkap (Untuk Pengiriman)
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-6">
                    <MapPin className="w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    required
                    aria-required="true"
                    placeholder="Nama Jalan, No. Rumah, RT/RW, Desa/Kelurahan..."
                    rows="3"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-5 pl-14 pr-6 font-bold text-secondary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-200 resize-none"
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* Kode Referral (Optional) */}
              <div className="space-y-2">
                <label htmlFor="referralCode" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Kode Referral (Opsional)
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <Tag className="w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    placeholder="Masukkan kode jika ada"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-5 pl-14 pr-6 font-bold text-secondary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-200 uppercase"
                    value={formData.referralCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                disabled={loading} 
                className="w-full bg-primary hover:bg-primary-dark text-secondary font-black py-6 rounded-[2rem] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-sm disabled:opacity-50 active:scale-95 group"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}

          <div className="mt-16 text-center border-t border-gray-50 pt-8">
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.1em] leading-relaxed">
              Dengan mendaftar, Anda menyetujui seluruh <br /> 
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30">
                Syarat & Ketentuan Membership
              </Link> The Jago Store
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
