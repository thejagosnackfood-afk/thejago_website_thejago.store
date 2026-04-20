'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// NOTE: We are using the legacy backend CSS classes for 100% visual match.
// The CSS is loaded via standard Next.js mechanism if global, 
// but here we rely on the precompiled /backend/_next/static/css/0a04a5953fa5bf7e.css 
// which is already linked in the public/backend/ index files.

export default function PendaftaranMemberPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    referralCode: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [waStatus, setWaStatus] = useState({ status: 'offline', qr: null, detail: '' })

  const DEFAULT_BASE = 'https://discerning-peace-production-15a6.up.railway.app'

  // Sync status with Railway API
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${DEFAULT_BASE}/status`, { cache: 'no-store' })
        const json = await res.json()
        setWaStatus({ status: json.status, qr: json.qr, detail: json.detail || 'OK' })
      } catch (e) {
        setWaStatus(prev => ({ ...prev, status: 'offline', detail: e.message }))
      }
    }
    poll()
    const itv = setInterval(poll, 5000)
    return () => clearInterval(itv)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const msg = `*KARTU MEMBER THE JAGO*\n\n*NAMA PELANGGAN:* ${formData.fullName}\n*ID MEMBER:* (Pending)\n\nHalo *${formData.fullName}*,\nTerima kasih telah mendaftar sebagai member.\n\n*ALAMAT TOKO:*\nGriya Prima Asri, Baleendah, Bandung\n📍 *Google Maps:* https://maps.app.goo.gl/CSGSYZ3JpCd279vf6\n\nAdmin kami akan segera memverifikasi data Anda.`

      const res = await fetch(`${DEFAULT_BASE}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.phoneNumber.startsWith('62') ? formData.phoneNumber : `62${formData.phoneNumber.replace(/^0/, '')}`, 
          message: msg 
        }),
      })
      
      if (!res.ok) throw new Error('Gagal mengirim konfirmasi WhatsApp')
      
      setSuccess(true)
      setTimeout(() => router.push('/shop'), 3000)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="__className_862193 min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans pb-20">
      {/* Import legacy CSS specifically for this page scope if possible, 
          but usually Next.js handles this via globals or layout. 
          For now, we assume the environment provides the 0a04a5953fa5bf7e.css styles. */}
      
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 text-white font-black">WA</div>
            <h1 className="text-lg font-black tracking-tight text-red-600 italic uppercase text-left">THE JAGO</h1>
          </Link>

          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full animate-pulse ${waStatus.status === 'online' ? 'bg-green-500' : waStatus.status === 'qr' ? 'bg-amber-400' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{waStatus.status}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 mt-10">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 opacity-50 text-left">pendaftaran</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Jadi Member Jago</h2>
            <p className="text-xs text-gray-400 font-bold italic">Dapatkan poin belanja dan promo eksklusif setiap hari.</p>
          </div>

          {success ? (
            <div className="text-center py-10 space-y-4">
               <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100 text-green-500 text-3xl font-black">✓</div>
               <h3 className="text-lg font-black text-gray-900">Pendaftaran Terkirim!</h3>
               <p className="text-xs text-gray-500 font-medium">Konfirmasi telah dikirim ke WhatsApp Anda. Mengalihkan ke toko...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nama Lengkap</p>
                <input 
                  name="fullName"
                  required
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all"
                  placeholder="Nama sesuai KTP"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">WhatsApp (08xxx)</p>
                <input 
                  name="phoneNumber"
                  required
                  type="tel"
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all"
                  placeholder="08123456789"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Alamat Lengkap</p>
                <textarea 
                  name="address"
                  required
                  className="w-full min-h-[100px] bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all resize-none"
                  placeholder="Alamat pengiriman..."
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="text-[10px] font-black text-red-500 uppercase text-center">{error}</p>}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-red-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-gray-900 transition-all disabled:bg-gray-100"
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic text-center">Premium Automation System • The Jago 2026</p>
      </main>
    </div>
  )
}
