'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bolt, ChevronRight, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function FlashSaleSection() {
  const { addToCart, setIsCartOpen } = useCart()
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 59, s: 59 })

  const flashProducts = [
    { id: "2407036", name: "SUNCO POUCH 2L", discount: "-15%", price: "38.500", oldPrice: "45.000", sold: 152, img: "/sample-photo/banner (1).jpg" },
    { id: "2408247", name: "BERAS ANAK RAJA 5KG", discount: "-10%", price: "75.000", oldPrice: "82.000", sold: 89, img: "/sample-photo/banner (2).jpg" },
    { id: "301", name: "GULAKU KUNING 1 KG", discount: "-12%", price: "16.200", oldPrice: "18.500", sold: 194, img: "/sample-photo/banner (3).jpg" },
    { id: "401", name: "INDOMIE GORENG SPECIAL", discount: "-20%", price: "2.800", oldPrice: "3.500", sold: 450, img: "/sample-photo/banner (1).jpg" },
    { id: "2407037", name: "SUNCO BTL 5L", discount: "-18%", price: "125.000", oldPrice: "145.000", sold: 42, img: "/sample-photo/banner (2).jpg" },
  ]

  const displayProducts = [...flashProducts, ...flashProducts]

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev
        if (s > 0) s--
        else {
          s = 59
          if (m > 0) m--
          else { m = 59; if (h > 0) h-- }
        }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAddToCart = (product) => {
    addToCart({ ...product, price: product.price.replace('.', '') }, 1)
    setIsCartOpen(true)
  }

  return (
    <section className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-8">
      {/* Header Flash Sale */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-black italic text-xl uppercase tracking-tighter">
            <Bolt className="w-6 h-6 fill-current animate-pulse" /> Flash Sale
          </div>
          <div className="flex items-center gap-3 font-mono font-black text-lg">
            <span className="bg-black/20 px-2 py-1 rounded-lg w-10 text-center">{String(timeLeft.h).padStart(2, '0')}</span> : 
            <span className="bg-black/20 px-2 py-1 rounded-lg w-10 text-center">{String(timeLeft.m).padStart(2, '0')}</span> : 
            <span className="bg-black/20 px-2 py-1 rounded-lg w-10 text-center text-yellow-300">{String(timeLeft.s).padStart(2, '0')}</span>
          </div>
        </div>
        <Link href="/shop" className="text-xs font-black uppercase flex items-center gap-1 hover:bg-white/10 px-4 py-2 rounded-full transition-all">
          Lihat Semua <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Marquee Area with Universal Product Size */}
      <div className="p-8 overflow-hidden group">
        <div className="flex gap-4 animate-marquee pause-on-hover">
          {displayProducts.map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="w-[180px] md:w-[200px] flex flex-col group/item animate-in fade-in duration-500">
              <Link href={`/shop/${product.id}`} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 p-4 border border-gray-50 group-hover/item:border-primary/30 transition-all relative block">
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg z-10 italic shadow-lg">
                  {product.discount}
                </div>
                <img 
                  src={product.img} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover/item:scale-110 transition-transform duration-500" 
                />
              </Link>
              
              <div className="flex-1 space-y-1">
                <h3 className="text-xs font-bold text-secondary line-clamp-2 h-8 leading-relaxed uppercase">
                  <Link href={`/shop/${product.id}`} className="hover:text-red-600 transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-black italic text-red-600">Rp {product.price}</p>
                  <p className="text-[10px] text-gray-400 line-through">Rp {product.oldPrice}</p>
                </div>
                <p className="text-[10px] text-gray-400 font-bold italic pt-1">Segera Habis!</p>
                
                <div className="flex items-center gap-2 mt-4">
                  {/* Tombol keranjang minimalis seperti produk lain namun warna merah */}
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-800 text-white text-[10px] font-black py-2.5 rounded-xl transition-all shadow-md uppercase flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ShoppingCart className="w-3 h-3" /> Keranjang
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
