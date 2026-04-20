'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Smartphone, MapPin, Upload, Send, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PendaftaranMemberPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('manual') // 'manual' or 'file'
  const [formData, setFormData] = useState({
    fullName: 'NAMA PELANGGAN',
    phoneNumber: '',
    address: 'Baleendah, Bandung',
    memberId: '20260001'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [waStatus, setWaStatus] = useState({ status: 'offline' })

  const DEFAULT_BASE = 'https://discerning-peace-production-15a6.up.railway.app'

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${DEFAULT_BASE}/status`, { cache: 'no-store' })
        const json = await res.json()
        setWaStatus({ status: json.status })
      } catch (e) {
        setWaStatus({ status: 'offline' })
      }
    }
    poll()
    const itv = setInterval(poll, 10000)
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
      const msg = `*KARTU MEMBER THE JAGO*\n\n*NAMA PELANGGAN:* ${formData.fullName}\n*NOMOR MEMBER:* ${formData.memberId}\n\nHalo *${formData.fullName}*,\nIni adalah kartu member digital Anda.\n\n*ALAMAT TOKO:*\nGriya Prima Asri, Baleendah, Bandung\n📍 *Google Maps:* https://maps.app.goo.gl/CSGSYZ3JpCd279vf6\n\n*WA TOKO:*\n0821-1020-2044\n🌐 *Website:* https://thejago-calculator.web.app/\n\n*CARA PENGGUNAAN:*\nTunjukkan pesan ini saat berkunjung atau sebutkan Nomor Member saat memesan via WA.\n\n*SKEMA POIN:*\nSetiap belanja Rp 10.000 mendapatkan 10 Poin (Berlaku kelipatan).`

      const res = await fetch(`${DEFAULT_BASE}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.phoneNumber.startsWith('62') ? formData.phoneNumber : `62${formData.phoneNumber.replace(/^0/, '')}`, 
          message: msg 
        }),
      })
      
      if (!res.ok) throw new Error('Gagal mengirim WhatsApp')
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="__className_862193 min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans pb-20">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 text-white font-black text-xs">JAGO</div>
            <h1 className="text-lg font-black tracking-tight text-red-600 italic uppercase">THE JAGO</h1>
          </Link>
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full animate-pulse ${waStatus.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{waStatus.status}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: INPUT PANEL */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button 
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Input Manual
                </button>
                <button 
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'file' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Input File
                </button>
              </div>

              {activeTab === 'manual' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nama Pelanggan</p>
                    <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200" placeholder="Contoh: Budi Santoso" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">ID Member</p>
                      <input name="memberId" required value={formData.memberId} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200" placeholder="2026xxxx" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">WhatsApp</p>
                      <input name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200" placeholder="08xxxxxxxx" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-16 bg-red-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-gray-900 transition-all flex items-center justify-center gap-3">
                    {loading ? 'Memproses...' : <><Send className="w-4 h-4" /> Kirim Member Sekarang</>}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 py-4 text-center">
                  <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-10 hover:border-red-200 transition-colors cursor-pointer group">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4 group-hover:text-red-400 transition-colors" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Pilih File CSV / Excel</p>
                    <p className="text-[10px] text-gray-300 mt-2 font-bold uppercase">format: memberId, name, whatsapp</p>
                  </div>
                  <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Mulai Bulk Import</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CARD PREVIEW */}
          <div className="lg:col-span-5 space-y-8 sticky top-32">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-left">Live Card Preview</h3>
              <span className="px-2 py-1 bg-red-50 text-red-600 text-[8px] font-black rounded-md border border-red-100 uppercase">Premium</span>
            </div>

            {/* CARD FRONT */}
            <div className="w-full aspect-[1.6/1] bg-gradient-to-br from-red-600 to-red-800 rounded-[20px] shadow-2xl relative overflow-hidden text-white p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-500">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black tracking-tight leading-none uppercase drop-shadow-sm">THE JAGO</h3>
                    <p className="text-[8px] font-bold tracking-[0.2em] opacity-80 uppercase mt-1 text-left">Snack & Frozen Food</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Kartu Member</p>
                    <h4 className="text-base font-black leading-tight truncate max-w-[150px] uppercase italic text-right">{formData.fullName}</h4>
                    <p className="text-sm font-black tracking-tighter mt-1">{formData.memberId}</p>
                  </div>
               </div>
               <div className="flex-1 flex items-center justify-center gap-4 py-2">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <img src="/backend/icon/logomember.png" className="w-full h-full object-contain" alt="Logo" />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Shopee', 'TikTok', 'Lazada', 'GoFood'].map(mp => (
                      <div key={mp} className="bg-white/10 backdrop-blur-md px-2 py-1 rounded text-[6px] font-black uppercase border border-white/10">{mp}</div>
                    ))}
                  </div>
               </div>
               <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-2">
                  <p className="text-[7px] font-bold italic opacity-80 text-left uppercase">Baleendah, Bandung • 0821-1020-2044</p>
                  <p className="text-[7px] font-black uppercase tracking-widest italic">thejago.store</p>
               </div>
            </div>

            {/* CARD BACK */}
            <div className="w-full aspect-[1.6/1] bg-white rounded-[20px] shadow-lg border border-gray-100 relative p-6 flex flex-col gap-4 group hover:scale-[1.02] transition-transform duration-500">
               <div className="flex gap-3">
                  <div className="w-1 h-auto bg-red-600 rounded-full"></div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-red-600 mb-0.5 text-left">Cara Penggunaan</p>
                    <p className="text-[9px] font-bold leading-tight text-gray-500 text-left">Tunjukkan kartu ini / sebutkan nomor saat transaksi untuk klaim poin.</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <div className="w-1 h-auto bg-red-600 rounded-full opacity-30"></div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-red-600 mb-0.5 text-left">Skema Poin</p>
                    <p className="text-[9px] font-bold leading-tight text-gray-500 text-left">Setiap Rp 10.000 = 10 Poin. Tukarkan poin dengan voucher belanja di toko.</p>
                  </div>
               </div>
               <div className="mt-auto flex justify-between items-center border-t border-gray-50 pt-3">
                  <p className="text-[8px] font-black text-red-600 italic">THE JAGO PREMIUM</p>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 text-[8px] font-black">QR</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
        
        {success && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5" /> Pendaftaran Berhasil Terkirim!
          </div>
        )}

        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
      </main>
    </div>
  )
}
