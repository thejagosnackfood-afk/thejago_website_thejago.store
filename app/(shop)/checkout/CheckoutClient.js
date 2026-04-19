'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createTransaction } from '@/app/api/checkout/actions'
import { Loader2, ShieldCheck, Truck, ArrowLeft, CreditCard, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const CHECKOUT_DRAFT_KEY = 'tjs_checkout_draft'

export default function CheckoutClient() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const draft = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY)
    if (!draft) return

    try {
      const parsed = JSON.parse(draft)
      setFormData(prev => ({ ...prev, ...parsed }))
    } catch {
      // Ignore invalid draft payload.
    }
  }, [])

  useEffect(() => {
    if (!user) return
    setFormData(prev => ({
      ...prev,
      email: user.email || prev.email,
      firstName: prev.firstName || user.displayName || '',
    }))
  }, [user])

  // Load Midtrans Snap Script
  useEffect(() => {
    const midtransScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js'
    const myMidtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

    let script = document.createElement('script')
    script.src = midtransScriptUrl
    script.setAttribute('data-client-key', myMidtransClientKey)
    script.async = true

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(formData))
      }
      return router.push('/login')
    }
    if (cartItems.length === 0) return alert('Keranjang kosong')

    setLoading(true)
    try {
      const result = await createTransaction({
        items: cartItems,
        customerDetails: formData
      })

      if (result.token) {
        window.snap.pay(result.token, {
          onSuccess: (result) => {
            if (typeof window !== 'undefined') window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY)
            clearCart()
            router.push('/shop/finish')
          },
          onPending: (result) => {
            if (typeof window !== 'undefined') window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY)
            clearCart()
            router.push('/shop/pending')
          },
          onError: (result) => {
            alert('Pembayaran gagal')
          },
          onClose: () => {
            console.log('customer closed the popup')
          }
        })
      }
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  const isEmailLocked = !!user

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-gray-200" />
        </div>
        <h2 className="text-xl font-black text-secondary italic uppercase">KERANJANG KAMU KOSONG</h2>
        <Link href="/shop" className="bg-primary px-10 py-4 rounded-2xl text-secondary font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
      {/* Left: Shipping Form */}
      <div className="lg:col-span-7 space-y-8">
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black italic text-secondary uppercase tracking-tighter mb-8 flex items-center gap-3">
            Data Pengiriman
            <div className="h-1 w-8 bg-primary rounded-full"></div>
          </h2>

          <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nama Depan</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold text-secondary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Budi" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nama Belakang</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold text-secondary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Opsional" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border-none rounded-xl px-5 py-3.5 font-bold outline-none ${isEmailLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 text-secondary focus:ring-2 focus:ring-primary/20'}`}
                readOnly={isEmailLocked}
                placeholder="email@contoh.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">No. WhatsApp</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold text-secondary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0812xxxx" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Alamat Lengkap</label>
              <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold text-secondary focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Jl. Raya No. 123..."></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kota</label>
              <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold text-secondary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Cianjur" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kode Pos</label>
              <input required name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold text-secondary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="432xx" />
            </div>
          </form>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-2xl"><Truck className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Pengiriman</p>
              <p className="text-sm font-black text-secondary italic">Kurir Jago Express</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl"><ShieldCheck className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Pembayaran</p>
              <p className="text-sm font-black text-secondary italic">Midtrans Secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-5">
        <div className="bg-secondary rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-24">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
            Ringkasan Belanja
            <div className="h-1 w-8 bg-primary rounded-full"></div>
          </h3>

          <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold leading-tight line-clamp-2 uppercase">{item.name}</p>
                  <p className="text-[10px] font-black text-primary mt-1 italic">{item.quantity}x Rp {item.price}</p>
                </div>
                <p className="text-sm font-black italic">Rp {(parseInt(item.price.replace(/\./g, '')) * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 space-y-4">
            <div className="flex justify-between text-gray-400 font-bold italic">
              <span className="text-sm">Subtotal Produk</span>
              <span className="text-sm">Rp {cartTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-bold italic">
              <span className="text-sm">Biaya Layanan</span>
              <span className="text-sm">Rp 1.000</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-black italic uppercase">Total Bayar</span>
              <span className="text-2xl font-black text-primary italic">Rp {(cartTotal + 1000).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button 
            type="submit" 
            form="checkout-form"
            disabled={loading}
            className="w-full bg-primary hover:bg-white text-secondary font-black py-5 rounded-2xl mt-10 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
            {loading ? 'Memproses...' : 'BAYAR SEKARANG'}
          </button>
        </div>
      </div>
    </div>
  )
}
