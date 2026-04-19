'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function CategorySidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  const [isBumbuOpen, setIsBumbuOpen] = useState(true)

  const sembakoLinks = [
    { name: 'Beras', id: 'beras' },
    { name: 'Minyak', id: 'minyak' },
    { name: 'Gula', id: 'gula' },
    { name: 'Tepung', id: 'tepung' },
    { name: 'Telur', id: 'telur' },
    { name: 'Kacang & Jamur', id: 'kacang-jamur' },
    { name: 'Susu & Olahan', id: 'susu' },
    { name: 'Mie & Pasta', id: 'mie' },
    { name: 'Saus & Kecap', id: 'saus' },
    { name: 'Bahan Kue', id: 'bahan-kue' },
    { name: 'Puding', id: 'puding-jelly' },
    { name: 'Roti', id: 'roti-kue' },
    { name: 'Instan & Kaleng', id: 'makanan-instan' },
  ]

  const bumbuSubCategories = [
    { name: 'Dasar', id: 'bumbu-lain' },
    { name: 'Rasa Ayam', id: 'bumbu-ayam' },
    { name: 'Rasa Sapi', id: 'bumbu-sapi' },
    { name: 'Pedas', id: 'bumbu-cabai' },
    { name: 'Ayam Bawang', id: 'bumbu-ayam-bawang' },
    { name: 'Keju', id: 'bumbu-keju' },
    { name: 'Balado', id: 'bumbu-balado' },
    { name: 'Jagung', id: 'bumbu-jagung' },
  ]

  const otherLinks = [
    { name: 'Frozen food', id: 'frozen-food' }, // Rokok -> Frozen food (Paling Atas)
    { name: 'Nugget', id: 'nugget' },
    { name: 'Sosis', id: 'sosis' },
    { name: 'Bakso', id: 'bakso' },
    { name: 'Camilan', id: 'kerupuk' },
    { name: 'Batagor & Siomay', id: 'batagor-siomay' }, // Kudapan (Beku) -> Batagor & Siomay
    { name: 'Minuman', id: 'minuman' },
    { name: 'Kopi & Teh', id: 'kopi-teh' },
    { name: 'Plastik & Tisu', id: 'plastik-kemasan' },
  ]

  const handleCategoryClick = (id) => {
    if (activeCategory === id) router.push('/shop')
    else router.push(`/shop?category=${id}`)
  }

  const renderLink = (item, isSub = false) => {
    const isActive = activeCategory === item.id
    return (
      <div 
        key={item.id}
        onClick={() => handleCategoryClick(item.id)}
        className={`flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
          isSub ? 'ml-4 px-4 py-2' : 'px-4 py-2.5'
        } ${
          isActive 
            ? 'bg-green-50 text-green-700' 
            : 'hover:bg-gray-50 text-gray-500'
        }`}
      >
        <div className={`rounded-full transition-all shrink-0 ${
          isSub ? 'w-1.5 h-1.5' : 'w-2 h-2'
        } ${
          isActive ? 'bg-green-500 scale-125 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300 group-hover:bg-gray-400'
        }`} />
        <span className={`truncate ${isSub ? 'text-[13px]' : 'text-sm'} ${isActive ? 'font-bold' : 'font-semibold'}`}>
          {item.name}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Semua Produk */}
      <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
        <div 
          onClick={() => router.push('/shop')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
            !activeCategory ? 'bg-primary text-secondary font-black italic shadow-md' : 'hover:bg-gray-50 text-gray-500 font-bold'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${!activeCategory ? 'bg-secondary' : 'bg-gray-200'}`} />
          <span className="text-sm uppercase tracking-tighter">Semua Produk</span>
        </div>
      </div>

      {/* Bahan Pokok */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2 italic">Bahan Pokok</h3>
        <div className="space-y-0.5">
          {sembakoLinks.map(link => renderLink(link))}
          
          <div className="relative">
            <div 
              onClick={() => setIsBumbuOpen(!isBumbuOpen)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-gray-50 group ${
                activeCategory?.startsWith('bumbu') ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full transition-all ${activeCategory?.startsWith('bumbu') ? 'bg-green-500 scale-110' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
                <span className="text-sm font-bold">Bumbu Masak</span>
              </div>
              {isBumbuOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
            
            {isBumbuOpen && (
              <div className="relative mt-1 ml-5 border-l-2 border-gray-100 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                {bumbuSubCategories.map(sub => renderLink(sub, true))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lainnya */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2 italic">Lainnya</h3>
        <div className="space-y-0.5">
          {otherLinks.map(link => renderLink(link))}
          {renderLink({ name: 'Lain-lain', id: 'lain-lain' })}
        </div>
      </div>
    </div>
  )
}
