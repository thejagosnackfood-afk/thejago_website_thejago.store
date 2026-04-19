'use client'

import React, { useState } from 'react'
import { ShoppingCart, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function AddToCartDetail({ product }) {
  const [qty, setQty] = useState(1)
  const { addToCart, setIsCartOpen } = useCart()

  const handleAddToCart = () => {
    addToCart(product, qty)
    setIsCartOpen(true)
  }

  return (
    <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 space-y-8">
      <div className="flex items-center justify-between">
        <span className="font-bold italic text-gray-400 text-sm">Pilih Kuantitas:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-4 py-2 hover:bg-gray-50 text-gray-500 font-black text-lg transition-colors border-r border-gray-100"
            >-</button>
            <input 
              type="number" 
              value={qty} 
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center font-black text-secondary bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button 
              onClick={() => setQty(qty + 1)}
              className="px-4 py-2 hover:bg-gray-50 text-gray-500 font-black text-lg transition-colors border-l border-gray-100"
            >+</button>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.unit || 'Item'}</span>
        </div>
      </div>

      <button 
        onClick={handleAddToCart}
        className="w-full bg-primary hover:bg-primary-dark text-secondary font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98]"
      >
        <ShoppingCart className="w-6 h-6" />
        Tambah Ke Keranjang
      </button>
    </div>
  )
}
