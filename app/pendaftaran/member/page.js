'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  User, Smartphone, Send, CheckCircle2, AlertCircle, 
  Database, Upload, Smartphone as WAIcon, 
  Eye, FileText, Trash2, RefreshCcw, Download,
  Check, Info, X
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// --- CONSTANTS & HELPERS ---
const DEFAULT_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://discerning-peace-production-15a6.up.railway.app').replace(/\/+$/, '')
const STORE_WHATSAPP_FALLBACK = '082110202044'

// Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Fuzzy Match Similarity
function getLevenshteinDistance(a, b) {
  const matrix = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1))
    }
  }
  return matrix[b.length][a.length]
}

function getSimilarity(s1, s2) {
  let longer = s1; let shorter = s2
  if (s1.length < s2.length) { longer = s2; shorter = s1 }
  if (longer.length === 0) return 1.0
  return (longer.length - getLevenshteinDistance(longer, shorter)) / parseFloat(longer.length)
}

export default function PendaftaranMemberPage() {
  // --- STATES ---
  const [currentStep, setCurrentStep] = useState(2)
  const [dataMode, setDataMode] = useState('manual') // 'manual' or 'bulk'
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: 'JLN. TERUSAN BOJONG SOANG NO.150',
    memberId: '',
    barcode: '',
    storeWa: '082110202044',
    regType: '1. Toko'
  })
  
  const [parsedRows, setParsedRows] = useState([])
  const [bulkStatus, setBulkStatus] = useState({ ok: 0, fail: 0, total: 0, active: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [waStatus, setWaStatus] = useState({ status: 'offline', qr: null })
  const [livePreviewUrl, setLivePreviewUrl] = useState('/backend/member-card-template.jpg')
  const [messageTemplate, setMessageTemplate] = useState(`*KARTU MEMBER THE JAGO*\n\n*NAMA PELANGGAN:* {name}\n*NOMOR MEMBER:* {memberId}\n\nHalo *{name}*,\nIni adalah kartu member digital Anda.\n\n*ALAMAT TOKO:*\nGriya Prima Asri, Baleendah, Bandung\n📍 *Google Maps:* https://maps.app.goo.gl/CSGSYZ3JpCd279vf6\n\n*WA TOKO:*\n0821-1020-2044\n🌐 *Website:* https://thejago.store/\n\n*CARA PENGGUNAAN:*\nTunjukkan pesan ini saat berkunjung atau sebutkan Nomor Member saat memesan via WA.\n\n*SKEMA POIN:*\nSetiap belanja Rp 10.000 mendapatkan 10 Poin (Berlaku kelipatan).`)

  const canvasRef = useRef(null)
  const templateImgRef = useRef(null)

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load Script dependencies
    if (!window.XLSX) {
      const s1 = document.createElement('script')
      s1.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"
      document.head.appendChild(s1)
    }
    if (!window.JsBarcode) {
      const s2 = document.createElement('script')
      s2.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"
      document.head.appendChild(s2)
    }
    if (!window.html2canvas) {
      const s3 = document.createElement('script')
      s3.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
      document.head.appendChild(s3)
    }

    // Generate Default ID
    const date = new Date()
    const generatedId = `2026${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`
    setFormData(prev => ({ ...prev, memberId: prev.memberId || generatedId }))

    // Poll WA Status
    const poll = async () => {
      try {
        const res = await fetch(`${DEFAULT_BASE}/status`, { cache: 'no-store' })
        const json = await res.json()
        setWaStatus({ status: json.status, qr: json.qr })
      } catch (e) {
        setWaStatus({ status: 'offline', qr: null })
      }
    }
    poll()
    const itv = setInterval(poll, 10000)
    return () => clearInterval(itv)
  }, [])

  // Update Live Preview whenever form or mode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataMode === 'manual') updateLivePreview()
    }, 500)
    return () => clearTimeout(timer)
  }, [formData, dataMode])

  // --- LOGIC: RENDER CARD ---
  const generateCardBase64 = async (data) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    // Load template image
    const img = new Image()
    img.src = '/backend/member-card-template.jpg'
    await new Promise(r => { img.onload = r; img.onerror = r; })

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)

    // Text: NAME (Center Y: 280)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#1A1A1A'
    ctx.font = 'bold 20px Arial'
    ctx.fillText((data.name || data.fullName || '').toUpperCase(), w / 2, 280)

    // Text: ID (Center Y: 340)
    ctx.fillStyle = '#DC2626'
    ctx.font = '900 32px Courier New'
    ctx.fillText(data.memberId, w / 2, 340)

    // Barcode (Center Y: 480)
    try {
      const bCanvas = document.createElement('canvas')
      window.JsBarcode(bCanvas, data.barcode || data.memberId, {
        format: "CODE128", width: 2, height: 60, displayValue: true, fontSize: 14, margin: 0
      })
      const bImg = new Image()
      bImg.src = bCanvas.toDataURL('image/png')
      await new Promise(r => { bImg.onload = r; bImg.onerror = r; })
      ctx.drawImage(bImg, (w - 300) / 2, 480, 300, 100)
    } catch(e) { console.warn('Barcode error', e) }

    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const updateLivePreview = async (row = null) => {
    const data = row || formData
    const url = await generateCardBase64(data)
    if (url) setLivePreviewUrl(url)
  }

  const handleDownloadHighRes = async () => {
    const element = document.getElementById('card-capture-area');
    if (!element || !window.html2canvas) return;
    
    setLoading(true);
    try {
      const canvas = await window.html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `member-card-highres-${formData.memberId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast('Gambar High-Res berhasil diunduh!');
    } catch (err) {
      setError('Gagal mengunduh gambar High-Res');
    } finally {
      setLoading(false);
    }
  }

  // --- LOGIC: BULK ACTIONS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      let text = ''
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        const wb = window.XLSX.read(await file.arrayBuffer())
        text = window.XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])
      } else {
        text = await file.text()
      }
      
      const lines = text.split(/\r\n|\n|\r/).filter(Boolean)
      if (!lines.length) return
      
      // Basic parser logic
      const rows = lines.slice(1).map(line => {
        const cols = line.split(/[;,]/).map(v => v.trim())
        return {
          memberId: cols[0],
          name: cols[1],
          whatsapp: cols[2] || STORE_WHATSAPP_FALLBACK,
          barcode: cols[3] || cols[0]
        }
      }).filter(r => r.memberId && r.name)

      setParsedRows(rows)
      if (rows[0]) updateLivePreview(rows[0])
      toast('File berhasil di-parse: ' + rows.length + ' data')
    } catch (err) {
      setError('Gagal membaca file: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkPdfMatch = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !parsedRows.length) return
    
    let matches = 0
    const newRows = [...parsedRows]
    files.forEach(f => {
      const fileName = f.name.toLowerCase().replace('.pdf', '').replace(/[^a-z0-9]/g, ' ')
      let best = null; let max = 0
      newRows.forEach(row => {
        const score = getSimilarity(fileName, row.name.toLowerCase().replace(/[^a-z0-9]/g, ' '))
        if (score > max && score > 0.6) { max = score; best = row }
      })
      if (best) {
        // Logika extra jika barcode ada di nama file
        matches++
      }
    })
    setParsedRows(newRows)
    toast(`Fuzzy Match: ${matches} file cocok!`)
  }

  const sendOne = async (row, useCard = true) => {
    const phone = row.whatsapp || row.phoneNumber
    const msisdn = phone.startsWith('62') ? phone : `62${phone.replace(/^0/, '')}`
    const msg = messageTemplate
      .replaceAll('{name}', row.name || row.fullName)
      .replaceAll('{memberId}', row.memberId)
      .replaceAll('{whatsapp}', phone)

    const payload = { phone: msisdn, message: msg }
    if (useCard) payload.image = await generateCardBase64(row)

    const res = await fetch(`${DEFAULT_BASE}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Send fail')
    return true
  }

  const runBulkSend = async (useCard = true) => {
    if (!parsedRows.length) return
    setBulkStatus({ ok: 0, fail: 0, total: parsedRows.length, active: true })
    
    for (let i = 0; i < parsedRows.length; i++) {
      try {
        await sendOne(parsedRows[i], useCard)
        setBulkStatus(prev => ({ ...prev, ok: prev.ok + 1 }))
      } catch (e) {
        setBulkStatus(prev => ({ ...prev, fail: prev.fail + 1 }))
      }
      await new Promise(r => setTimeout(r, useCard ? 2000 : 500))
    }
    setBulkStatus(prev => ({ ...prev, active: false }))
    toast('Pengiriman massal selesai!')
  }

  const toast = (m) => {
    setSuccess(true)
    setError(m) // Reuse error/success logic for simple feedback
    setTimeout(() => { setSuccess(false); setError('') }, 4000)
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans pb-20">
      {/* Hidden Canvas Engine */}
      <canvas ref={canvasRef} width="464" height="668" className="hidden"></canvas>
      
      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 text-white font-black text-xs uppercase tracking-tighter leading-none px-1 text-center italic">THE<br/>JAGO</div>
            <h1 className="text-lg font-black tracking-tight text-red-600 italic uppercase">THE JAGO</h1>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            {[1, 2, 3].map(step => (
              <button 
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === step ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
              >
                {step}. {step === 1 ? 'WhatsApp' : step === 2 ? 'Data' : 'Kirim'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
            <div className={`h-2 w-2 rounded-full animate-pulse ${waStatus.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{waStatus.status}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Member Card Generator</h1>
            <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Premium Automation System • v4.9.0</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Step {currentStep} of 3</p>
            <div className="mt-2 h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-red-600 transition-all duration-700" style={{ width: `${(currentStep/3)*100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: FORM AREA */}
          <div className="lg:col-span-7 space-y-8">
            
            {currentStep === 1 && (
              <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-6">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 shadow-inner"><WAIcon size={32} /></div>
                   <div>
                     <h2 className="text-2xl font-black text-gray-900 uppercase italic leading-none">WhatsApp Gateway</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Server: Railway Cloud</p>
                   </div>
                </div>
                
                <div className="space-y-4">
                  <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center justify-between ${waStatus.status === 'online' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current State</p>
                      <span className={`text-xl font-black uppercase italic ${waStatus.status === 'online' ? 'text-green-700' : 'text-red-700'}`}>
                        {waStatus.status === 'online' ? 'AUTHENTICATED' : 'DISCONNECTED'}
                      </span>
                    </div>
                    {waStatus.status !== 'online' && waStatus.qr ? (
                       <img src={waStatus.qr} className="w-24 h-24 bg-white p-2 rounded-2xl shadow-sm border" alt="QR" />
                    ) : (
                       <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <Check className={waStatus.status === 'online' ? 'text-green-500' : 'text-gray-300'} />
                       </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-start gap-4">
                    <Info className="text-gray-400 shrink-0 mt-1" size={16} />
                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                      Sesi login Anda sudah terenkripsi di backend. Jika status <b>OFFLINE</b>, silakan klik tombol Refresh Link atau cek dashboard Railway untuk memastikan service tetap terjaga (Volume Auth).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => window.open(DEFAULT_BASE + '/status')} className="h-14 bg-white border border-gray-200 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-200 transition-all flex items-center justify-center gap-2">
                    <RefreshCcw size={14} /> Refresh Link
                  </button>
                  <button onClick={() => setCurrentStep(2)} className="h-14 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
                    Lanjut Input Data <Send size={14} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-6">
                <div className="flex bg-gray-50 p-2 rounded-[2rem] border border-gray-100 shadow-inner">
                  <button onClick={() => setDataMode('manual')} className={`flex-1 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${dataMode === 'manual' ? 'bg-white text-red-600 shadow-xl' : 'text-gray-400'}`}>1. Input Manual</button>
                  <button onClick={() => setDataMode('bulk')} className={`flex-1 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${dataMode === 'bulk' ? 'bg-white text-red-600 shadow-xl' : 'text-gray-400'}`}>2. Bulk Import</button>
                </div>

                {dataMode === 'manual' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2"><User size={12} /> Nama Member</label>
                        <input name="fullName" value={formData.fullName} onChange={(e) => setFormData(p=>({...p, fullName: e.target.value}))} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all" placeholder="Misal: Budi Santoso" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2"><Smartphone size={12} /> No. WhatsApp</label>
                        <input name="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData(p=>({...p, phoneNumber: e.target.value}))} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all" placeholder="08xxxxxxxx" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">ID Member (Generated)</label>
                        <input name="memberId" value={formData.memberId} onChange={(e) => setFormData(p=>({...p, memberId: e.target.value}))} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Tipe Pendaftaran</label>
                        <select value={formData.regType} onChange={(e) => setFormData(p=>({...p, regType: e.target.value}))} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all appearance-none cursor-pointer">
                           <option>1. Toko</option>
                           <option>2. Online</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Alamat Toko / Pelanggan</label>
                      <input name="address" value={formData.address} onChange={(e) => setFormData(p=>({...p, address: e.target.value}))} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black outline-none focus:bg-white focus:border-red-200 transition-all" />
                    </div>

                    <button onClick={() => setCurrentStep(3)} className="w-full h-16 bg-red-600 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-red-100 hover:bg-gray-900 transition-all transform hover:-translate-y-1 active:translate-y-0">Review Identity Card</button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-dashed border-gray-100 p-8 flex flex-col items-center justify-center hover:border-red-200 transition-all cursor-pointer bg-gray-50/50">
                          <input type="file" accept=".csv,.tsv,.xls,.xlsx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <Upload className="w-10 h-10 text-gray-300 group-hover:text-red-500 transition-colors mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Excel / CSV File</p>
                       </div>
                       <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-dashed border-gray-100 p-8 flex flex-col items-center justify-center hover:border-red-200 transition-all cursor-pointer bg-gray-50/50">
                          <input type="file" multiple accept=".pdf" onChange={handleBulkPdfMatch} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <FileText className="w-10 h-10 text-gray-300 group-hover:text-red-500 transition-colors mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">PDF Barcodes (Fuzzy)</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-center px-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Parsed Data ({parsedRows.length})</p>
                          <button onClick={() => setParsedRows([])} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                       </div>
                       <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden max-h-[300px] overflow-y-auto shadow-inner">
                          <table className="min-w-full text-left">
                             <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-100">
                                <tr>
                                   <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 tracking-widest">#</th>
                                   <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 tracking-widest">Name</th>
                                   <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 tracking-widest">WhatsApp</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {parsedRows.length > 0 ? parsedRows.map((r, idx) => (
                                   <tr key={idx} className="hover:bg-red-50/30 transition-colors group cursor-pointer" onClick={() => updateLivePreview(r)}>
                                      <td className="px-5 py-3 text-[10px] font-black text-gray-300">{idx+1}</td>
                                      <td className="px-5 py-3 text-[11px] font-black text-gray-900 group-hover:text-red-600">{r.name}</td>
                                      <td className="px-5 py-3 text-[11px] font-bold text-gray-500">{r.whatsapp}</td>
                                   </tr>
                                )) : (
                                   <tr><td colSpan="3" className="px-5 py-10 text-center text-[10px] font-black uppercase text-gray-300 italic tracking-[0.3em]">No data loaded</td></tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    {parsedRows.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => runBulkSend(false)} className="h-14 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Kirim Teks Saja</button>
                        <button onClick={() => runBulkSend(true)} className="h-14 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200">Kirim Kartu Gambar</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 uppercase italic leading-none">Review Output</h2>
                  <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><Database size={12} /> Database Synced</div>
                </div>

                <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 space-y-6 shadow-inner">
                   <div className="flex justify-between border-b border-gray-200/60 pb-4">
                     <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recipient</span>
                     <span className="text-sm font-black text-gray-900 uppercase italic tracking-tight">{formData.fullName}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-200/60 pb-4">
                     <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mobile Network</span>
                     <span className="text-sm font-black text-gray-900 tracking-tight">{formData.phoneNumber}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-200/60 pb-4">
                     <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Type / Method</span>
                     <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">{formData.regType}</span>
                   </div>
                   <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Address Record</span>
                     <span className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase">{formData.address}</span>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setCurrentStep(2)} className="flex-1 h-16 bg-white border border-gray-200 text-gray-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:text-gray-900 hover:border-gray-900 transition-all flex items-center justify-center gap-2"><X size={16} /> Edit Data</button>
                  <button onClick={(e) => { e.preventDefault(); setLoading(true); sendOne(formData, true).then(()=>setLoading(false)).catch(err=>{setError(err.message); setLoading(false)}) }} disabled={loading} className="flex-[2] h-16 bg-red-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-red-100 hover:bg-gray-900 transition-all flex items-center justify-center gap-3">
                    {loading ? 'Processing Media...' : <><Send size={16} /> Approve & Send via WA</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: PREMIUM LIVE PREVIEW (EXACT ENGINE) */}
          <div className="lg:col-span-5 space-y-10 sticky top-32">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Premium Engine Preview</h3>
              <div className="flex gap-2">
                <span id="preview_mode_badge" className={`px-2.5 py-1 text-[8px] font-black rounded-lg border uppercase tracking-widest ${dataMode === 'bulk' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>{dataMode}</span>
              </div>
            </div>

            <div className="relative group" id="card-capture-area">
              {/* Outer Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-amber-400 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white p-3 rounded-[48px] border border-gray-100 shadow-2xl shadow-red-950/10 transition-all duration-700 hover:scale-[1.02]">
                <img 
                  id="live_card_img" 
                  className="w-full rounded-[38px] shadow-inner border border-gray-50" 
                  src={livePreviewUrl} 
                  alt="Digital Card Preview" 
                />
                
                {/* Floating Meta Tag */}
                <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                   <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">1:1 Final Render</div>
                </div>

                {/* Engine Feedback Overlay */}
                <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-white/50 flex items-center justify-between shadow-2xl">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Engine Synced</p>
                    <p className="text-[11px] font-black text-green-600 uppercase tracking-tighter leading-none italic">Ready to Broadcast</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Database size={16} className="text-red-600" />
                <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Card Control</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => updateLivePreview()} className="h-12 bg-gray-50 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-white transition-all flex items-center justify-center gap-2">
                    <RefreshCcw size={14} /> Refresh
                  </button>
                  <a href={livePreviewUrl} download={`member-card-${formData.memberId}.jpg`} className="h-12 bg-gray-50 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-white transition-all flex items-center justify-center gap-2">
                    <Download size={14} /> Save JPG
                  </a>
                </div>
                <button onClick={handleDownloadHighRes} className="w-full h-12 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
                  <Download size={14} /> Save High-Res (PNG)
                </button>
              </div>
              <div className="bg-amber-50/50 p-6 rounded-[2.5rem] border border-amber-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-2"><Info size={12} /> Sync Information</p>
                <p className="mt-3 text-[11px] font-bold text-amber-800/60 leading-relaxed">
                  Pratinjau di atas dihasilkan langsung oleh <b>Jago Digital Card Engine</b>. Gambar ini identik 100% dengan dokumen yang dikirim ke pelanggan.
                </p>
              </div>
            </div>

            {bulkStatus.active && (
               <div className="bg-gray-900 text-white p-8 rounded-[3rem] shadow-2xl animate-in slide-in-from-right-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 italic">Broadcast Progress</p>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-2xl font-black italic tracking-tighter">{Math.round((bulkStatus.ok / bulkStatus.total)*100)}%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{bulkStatus.ok} / {bulkStatus.total} Sent</span>
                     </div>
                     <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(bulkStatus.ok/bulkStatus.total)*100}%` }}></div>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        {success && !error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 z-[100] border border-white/10 italic">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center"><Check size={18} /></div> System Process Completed
          </div>
        )}
      </main>
    </div>
  )
}
