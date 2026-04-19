'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ShoppingCart, Search, Menu, Star, Heart, Loader2, AlertCircle, X, User, LogOut } from 'lucide-react'
import CategorySidebar from '@/components/layout/CategorySidebar'
import FlashSaleSection from '@/components/layout/FlashSaleSection'
import CartSidebar from '@/components/layout/CartSidebar'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { getProducts } from '@/app/api/products/actions'

function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-2xl mb-4"></div>
      <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
      </div>
    </div>
  )
}

function ShopContent() {
  const router = useRouter()
  const { addToCart, cartCount, setIsCartOpen } = useCart()
  const { user, logout } = useAuth()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  const initialSearch = searchParams.get('q') || ""
  
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)
  
  const [searchInput, setSearchInput] = useState(initialSearch)

  useEffect(() => {
    async function initFetch() {
      setLoading(true)
      setError(null)
      const result = await getProducts(activeCategory, null, 20, initialSearch)
      if (result.error) {
        setError("Gagal terhubung ke database.")
      } else {
        setProducts(result.products)
        setHasMore(result.hasMore)
      }
      setLoading(false)
    }
    initFetch()
  }, [activeCategory, initialSearch])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const lastProduct = products[products.length - 1]
    const result = await getProducts(activeCategory, lastProduct?.id, 20, initialSearch)
    if (!result.error) {
      setProducts(prev => [...prev, ...result.products])
      setHasMore(result.hasMore)
    }
    setLoadingMore(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchInput) params.set('q', searchInput)
    else params.delete('q')
    router.push(`/shop?${params.toString()}`)
  }

  const handleQtyChange = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 1
      const next = Math.max(1, current + delta)
      return { ...prev, [productId]: next }
    })
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <CartSidebar />
      
      <header className="bg-[#ffc107] py-3 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/shop" className="font-black italic text-xl text-secondary shrink-0">THE JAGO STORE</Link>
        
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari produk di The Jago Store..." 
            className="w-full py-2.5 px-5 rounded-lg border-none focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-medium"
          />
          {searchInput && (
            <button 
              type="button"
              onClick={() => { setSearchInput(""); router.push('/shop') }}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="submit" className="absolute right-0 top-0 h-full bg-secondary text-white px-4 rounded-r-lg hover:bg-secondary/90 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center gap-6 text-secondary font-black text-xs uppercase tracking-widest">
          {user ? (
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-secondary/60 lowercase font-bold tracking-normal">Halo, Jagoan!</span>
                <span className="text-xs font-black truncate max-w-[100px]">{user.displayName || 'User'}</span>
              </div>
              <button 
                onClick={() => logout()}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="hidden lg:flex items-center gap-2 hover:text-white transition-colors">
              <User className="w-5 h-5" />
              <span>Masuk / Daftar</span>
            </Link>
          )}

          <div 
            className="relative cursor-pointer group"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-6 h-6 relative" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </div>
          <Menu className="w-6 h-6 md:hidden" />
        </div>
      </header>

      <div className="max-w-[1300px] mx-auto py-8 px-4 md:px-8 flex gap-8">
        <div className="hidden lg:block w-[260px] shrink-0">
          <CategorySidebar />
        </div>

        <div className="flex-1 min-w-0 space-y-12">
          {!activeCategory && !initialSearch && <FlashSaleSection />}

          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
              <h2 className="text-xl font-black italic text-secondary uppercase tracking-tighter">
                {initialSearch ? `HASIL CARI: "${initialSearch}"` : (activeCategory ? activeCategory.toUpperCase() : 'BELANJA PRODUK')}
              </h2>
              {!loading && <span className="text-[10px] font-bold text-gray-400 italic">Menampilkan {products.length} produk</span>}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 mb-8">
                <AlertCircle className="w-6 h-6" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {loading ? (
                Array(10).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : products.length > 0 ? (
                products.map((product) => {
                  const currentQty = quantities[product.id] || 1
                  return (
                    <div key={product.id} className="flex flex-col group animate-in fade-in duration-500">
                      <Link href={`/shop/${product.id}`} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 p-4 border border-gray-50 group-hover:border-primary/30 transition-all relative block">
                        <img 
                          src={product.img || '/sample-photo/banner (1).jpg'} 
                          alt={product.name} 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </Link>
                      <div className="flex-1 space-y-1">
                        <h3 className="text-xs font-bold text-secondary line-clamp-2 h-8 leading-relaxed uppercase text-left">
                          <Link href={`/shop/${product.id}`} className="hover:text-primary-dark transition-colors">
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-sm font-black italic text-secondary">Rp {product.price}</p>
                        <p className="text-[10px] text-gray-400 font-bold italic">stok: {product.stock} {product.unit}</p>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shrink-0">
                            <button onClick={() => handleQtyChange(product.id, -1)} className="px-2.5 py-1.5 hover:bg-gray-200 text-gray-500 font-black">-</button>
                            <span className="px-2 text-[10px] font-black text-secondary min-w-[24px] text-center">{currentQty}</span>
                            <button onClick={() => handleQtyChange(product.id, 1)} className="px-2.5 py-1.5 hover:bg-gray-200 text-gray-500 font-black">+</button>
                          </div>
                          <button 
                            onClick={() => addToCart(product, currentQty)}
                            className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-[10px] font-black py-2.5 rounded-xl transition-all shadow-md uppercase flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-20 space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-10 h-10 text-gray-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-secondary uppercase italic">Produk Tidak Ditemukan</h3>
                    <p className="text-sm text-gray-400 font-bold italic">Maaf, pencarian "{initialSearch}" tidak membuahkan hasil.</p>
                    <button 
                      onClick={() => { setSearchInput(""); router.push('/shop') }}
                      className="mt-6 bg-primary text-secondary font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-primary-dark transition-all"
                    >
                      Reset Pencarian
                    </button>
                  </div>
                </div>
              )}
            </div>

            {hasMore && !loading && (
              <div className="mt-12 text-center">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="py-4 px-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-black uppercase tracking-[0.3em] hover:bg-gray-50 hover:border-primary/50 hover:text-primary-dark transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak Produk'}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
