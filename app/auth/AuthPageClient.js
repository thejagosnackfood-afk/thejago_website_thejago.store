'use client'

import React, { useState, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { MessageSquare, ShieldCheck, ArrowRight, Loader2, AlertCircle, Smartphone } from 'lucide-react'
import { sendOTP, verifyOTP } from '@/app/api/auth/otp'

function AuthContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || (pathname === '/login' ? '/checkout' : '/shop')

  const { loginWithToken } = useAuth()

  const [step, setStep] = useState('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await sendOTP(phoneNumber)
      if (result.success) setStep('otp')
      else setError(result.message)
    } catch (err) {
      setError('Gagal mengirim pesan. Periksa nomor Anda.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await verifyOTP(phoneNumber, otpCode)
      if (result.success && result.customToken) {
        await loginWithToken(result.customToken)
        router.push(redirect)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Kode OTP salah atau kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-12">
          <div className="text-center mb-12">
            <Link href="/" className="font-black italic text-2xl text-secondary">THE JAGO STORE</Link>
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="bg-green-50 text-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Secure Login
              </div>
              <h2 className="text-xl font-black italic text-secondary uppercase tracking-tighter">
                {step === 'phone' ? 'Daftar / Masuk Akun' : 'Verifikasi Kode OTP'}
              </h2>
              <p className="text-xs text-gray-400 font-bold italic">
                {step === 'phone'
                  ? 'Gunakan nomor WhatsApp aktif Anda'
                  : `Kode telah dikirim ke ${phoneNumber}`}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 mb-8 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-[11px] font-black uppercase italic">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-gray-200">
                  <Smartphone className="w-5 h-5 text-gray-300" />
                  <span className="text-sm font-black text-secondary">+62</span>
                </div>
                <input required type="tel" placeholder="812xxxxxx" className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-24 pr-6 font-black text-lg text-secondary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-200" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
              <button disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-secondary font-black py-5 rounded-3xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm disabled:opacity-50">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <MessageSquare className="w-6 h-6" />}
                {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex justify-between gap-3">
                <input required autoFocus maxLength="6" type="text" placeholder="Enter 6-Digit OTP" className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-black text-3xl text-center tracking-[0.5em] text-secondary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-200 placeholder:text-sm placeholder:tracking-normal" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
              <button disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-white font-black py-5 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm disabled:opacity-50">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setStep('phone')} className="text-[10px] font-black uppercase text-gray-400 hover:text-secondary transition-colors tracking-widest">
                  Ganti Nomor WhatsApp?
                </button>
              </div>
            </form>
          )}
          <div className="mt-12 text-center">
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter leading-relaxed">
              Dengan masuk, Anda menyetujui <br /> Syarat & Ketentuan The Jago Store
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  )
}

