'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Smartphone, MapPin, Send, CheckCircle2, AlertCircle, Database, Upload, Layout, Smartphone as WAIcon } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Inisialisasi Supabase
const supabaseUrl = 'https://ueefwnfinpjvtcyieqoy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZWZ3bmZpbnBqdnRjeWllcW95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5NDc5NiwiZXhwIjoyMDg2MjcwNzk2fQ.XIRJY6wwODqAElrHcE5oNFSzZAZ6MuUz93GU3rhEZLQ'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function PendaftaranMemberPage() {
  const [currentStep, setCurrentStep] = useState(2) // Default ke Step 2 (Data)
  const [dataMode, setDataMode] = useState('manual') // 'manual' or 'file'
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: 'Baleendah, Bandung',
    memberId: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [waStatus, setWaStatus] = useState({ status: 'offline' })

  const DEFAULT_BASE = 'https://discerning-peace-production-15a6.up.railway.app'

  useEffect(() => {
    // Generate ID Member otomatis
    const date = new Date()
    const generatedId = `2026${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`
    setFormData(prev => ({ ...prev, memberId: prev.memberId || generatedId }))

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
    // Jika masih di step 2, pindahkan ke step 3 untuk review
    if (currentStep === 2) {
      setCurrentStep(3)
      return
    }

    setError('')
    setLoading(true)

    try {
      // 1. SINKRONISASI KE DATABASE
      const { error: dbError } = await supabase
        .from('members')
        .upsert({ 
          member_id: formData.memberId, 
          name: formData.fullName, 
          whatsapp: formData.phoneNumber,
          address: formData.address,
          created_at: new Date().toISOString()
        })

      if (dbError) console.warn('Database Sync Warning:', dbError.message)

      // 2. KIRIM PESAN WHATSAPP
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
      setTimeout(() => {
        setSuccess(false)
        setCurrentStep(2)
        setFormData({ fullName: '', phoneNumber: '', address: 'Baleendah, Bandung', memberId: '' })
      }, 5000)
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

          {/* STEPPER NAV - SEKARANG TERBUKA/CLICKABLE */}
          <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setCurrentStep(1)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentStep === 1 ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
            >
              1. Login WA
            </button>
            <button 
              onClick={() => setCurrentStep(2)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentStep === 2 ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
            >
              2. Data
            </button>
            <button 
              onClick={() => setCurrentStep(3)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentStep === 3 ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
            >
              3. Kirim
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full animate-pulse ${waStatus.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{waStatus.status}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-10 text-left">
        <div className="mb-4 flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 opacity-50">pendaftaran</p>
          <span className="text-[10px] text-gray-300">/</span>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Step {currentStep}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CONTENT AREA */}
          <div className="lg:col-span-7">
            {currentStep === 1 && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600"><WAIcon /></div>
                   <div>
                     <h2 className="text-xl font-black text-gray-900 uppercase italic">Status WhatsApp</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">API: {DEFAULT_BASE}</p>
                   </div>
                </div>
                <div className={`p-6 rounded-[2rem] border flex items-center justify-between ${waStatus.status === 'online' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                   <span className={`text-xs font-black uppercase tracking-widest ${waStatus.status === 'online' ? 'text-green-700' : 'text-red-700'}`}>WhatsApp {waStatus.status}</span>
                   <button onClick={() => window.open(DEFAULT_BASE + '/status')} className="text-[10px] font-black uppercase underline decoration-2 underline-offset-4">Refresh Link</button>
                </div>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed px-4">
                  Sesi login Anda sudah tersimpan di backend Railway. Jika status offline, pastikan service Railway tidak sedang sleep atau dalam masa redeploy.
                </p>
                <button onClick={() => setCurrentStep(2)} className="w-full h-14 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Lanjut ke Input Data</button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <button onClick={() => setDataMode('manual')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dataMode === 'manual' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Input Manual</button>
                  <button onClick={() => setDataMode('file')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dataMode === 'file' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Input File</button>
                </div>

                {dataMode === 'manual' ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nama Pelanggan</p>
                      <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all" placeholder="Nama sesuai KTP" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">ID Member</p>
                        <input name="memberId" required value={formData.memberId} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">WhatsApp</p>
                        <input name="phoneNumber" required type="tel" value={formData.phoneNumber} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all" placeholder="08xxxxxxxx" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Alamat Lengkap</p>
                      <textarea name="address" required value={formData.address} onChange={handleChange} className="w-full min-h-[100px] bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all resize-none" placeholder="Alamat pengiriman..." />
                    </div>
                    <button type="submit" className="w-full h-16 bg-red-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-gray-900 transition-all">Review & Kirim</button>
                  </form>
                ) : (
                  <div className="py-10 text-center space-y-6">
                    <div className="border-2 border-dashed border-gray-100 rounded-[3rem] p-12 hover:border-red-200 transition-all group cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pilih File Laporan (CSV/Excel)</p>
                    </div>
                    <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Parse & Kirim Bulk</button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-gray-900 uppercase italic">Konfirmasi Pengiriman</h2>
                  <div className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 text-green-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Database className="w-3 h-3" /> Auto-Sync</div>
                </div>
                <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                   <div className="flex justify-between border-b border-gray-200 pb-3">
                     <span className="text-[10px] font-black uppercase text-gray-400">Penerima</span>
                     <span className="text-xs font-black text-gray-900 uppercase italic">{formData.fullName}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-200 pb-3">
                     <span className="text-[10px] font-black uppercase text-gray-400">No. WhatsApp</span>
                     <span className="text-xs font-black text-gray-900">{formData.phoneNumber}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-[10px] font-black uppercase text-gray-400">ID Member</span>
                     <span className="text-xs font-black text-red-600">{formData.memberId}</span>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setCurrentStep(2)} className="flex-1 h-16 bg-white border border-gray-200 text-gray-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:text-gray-900 transition-all">Edit Data</button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-[2] h-16 bg-red-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-gray-900 transition-all flex items-center justify-center gap-3">
                    {loading ? 'Mengirim...' : <><Send className="w-4 h-4" /> Konfirmasi & Kirim</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE CARD PREVIEW (TETAP STICKY) */}
          <div className="lg:col-span-5 space-y-8 sticky top-32">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Live Card Preview</h3>
              <span className="px-2 py-1 bg-red-50 text-red-600 text-[8px] font-black rounded-md border border-red-100 uppercase">Premium</span>
            </div>

            {/* CARD FRONT */}
            <div className="w-full aspect-[1.6/1] bg-red-800 rounded-[24px] shadow-2xl relative overflow-hidden text-white group hover:scale-[1.03] transition-all duration-500">
               <img src="/icon/mbg.webp" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Background" />
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               <div className="relative z-10 p-7 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black tracking-tight leading-none uppercase drop-shadow-md">THE JAGO</h3>
                      <p className="text-[8px] font-bold tracking-[0.2em] opacity-80 uppercase mt-1">Snack & Frozen Food</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Kartu Member</p>
                      <h4 className="text-base font-black leading-tight truncate max-w-[150px] uppercase italic text-right">{formData.fullName || 'NAMA PELANGGAN'}</h4>
                      <p className="text-sm font-black tracking-tighter mt-1">{formData.memberId || '2026xxxx'}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-4 py-2">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2 shrink-0 overflow-hidden border-2 border-red-500/10">
                      <img src="/icon/logomember.png" className="w-full h-full object-contain" alt="Logo" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Shopee', 'TikTok', 'Lazada', 'GoFood'].map(mp => (
                        <div key={mp} className="bg-black/30 backdrop-blur-md px-2 py-1 rounded text-[6px] font-black uppercase border border-white/10 tracking-widest">{mp}</div>
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-2">
                    <div className="flex items-center gap-2">
                      <img src="/icon/parahyangan.jpg" className="w-4 h-4 rounded-full border border-white/50" alt="Partner" />
                      <p className="text-[7px] font-bold italic opacity-80 uppercase">Baleendah, Bandung • 0821-1020-2044</p>
                    </div>
                    <p className="text-[7px] font-black uppercase tracking-widest italic">thejago.store</p>
                  </div>
               </div>
            </div>

            {/* CARD BACK */}
            <div className="w-full aspect-[1.6/1] bg-white rounded-[24px] shadow-lg border border-gray-100 relative p-7 flex flex-col gap-5">
               <div className="flex gap-4">
                  <div className="w-1.5 h-auto bg-red-600 rounded-full"></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">Cara Penggunaan</p>
                    <p className="text-[10px] font-bold leading-tight text-gray-500">Tunjukkan kartu ini / sebutkan nomor saat transaksi untuk klaim poin.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-1.5 h-auto bg-red-600 rounded-full opacity-30"></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">Skema Poin</p>
                    <p className="text-[10px] font-bold leading-tight text-gray-500">Setiap Rp 10.000 = 10 Poin. Tukarkan poin dengan voucher belanja di toko.</p>
                  </div>
               </div>
               <div className="mt-auto flex justify-between items-center border-t border-gray-50 pt-4">
                  <p className="text-[8px] font-black text-red-600 italic">THE JAGO PREMIUM • 2026</p>
                  <p className="text-[8px] font-black text-gray-300 italic">thejago.store</p>
               </div>
            </div>
          </div>
        </div>
        
        {success && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5" /> Data Tersimpan & WhatsApp Terkirim!
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
