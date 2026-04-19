'use client'

import React from 'react'
import Link from 'next/link'
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CartSidebar() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeItem, cartTotal } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary-dark" />
            <h2 className="text-lg font-black italic text-secondary uppercase tracking-tighter">Keranjang Belanja</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
              </div>
              <div>
                <p className="font-bold text-gray-400 italic">Keranjang kamu masih kosong</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 text-primary-dark font-black text-sm uppercase hover:underline"
                >
                  Mulai Belanja Sekarang
                </button>
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group">
                <div className="w-20 h-20 bg-white rounded-xl border border-gray-100 p-2 shrink-0">
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-secondary line-clamp-2 mb-1">{item.name}</h4>
                  <p className="text-sm font-black italic text-secondary mb-3">Rp {item.price}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-1 hover:bg-gray-50 text-gray-500 font-black"
                      >-</button>
                      <span className="px-3 text-[11px] font-black text-secondary min-w-[25px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2 py-1 hover:bg-gray-50 text-gray-500 font-black"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 font-bold italic">Total Pembayaran:</span>
              <span className="text-xl font-black italic text-secondary">Rp {cartTotal.toLocaleString('id-ID')}</span>
            </div>
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
            >
              Lanjut Pembayaran <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-[10px] text-center text-gray-400 font-bold italic">Harga sudah termasuk PPN 11%</p>
          </div>
        )}
      </div>
    </div>
  )
}
