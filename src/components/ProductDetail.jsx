import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { formatIdr } from '../lib/format';
import { useStore } from '../state/store';
import Reviews from './Reviews';
import ProductDetailSkeleton from './ProductDetailSkeleton';

function findFromLists(id, lists) {
  if (!id) return null;
  const key = String(id);
  for (const list of lists) {
    if (!list) continue;
    const found = list.find((p) => String(p._id || p.id) === key);
    if (found) return found;
  }
  return null;
}

export default function ProductDetail() {
  const {
    viewProductId,
    addToCart,
    setViewProductId,
    products,
    recommended,
    discounts,
    flashSales,
    mostViewed,
    wishlist,
    compare,
    productsLoading,
    collectionsLoading,
  } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (!viewProductId) return;
    setLoading(true);
    const lists = [products, recommended, discounts, flashSales, mostViewed, wishlist, compare];
    const cached = findFromLists(viewProductId, lists);
    if (cached) {
      setProduct(cached);
      setActiveImage(cached.imageUrl || '/sample-photo/product-placeholder.jpg');
      setLoading(false);
    }
    apiFetch(`/api/products/${viewProductId}`)
      .then((data) => {
        if (!data?.product) return;
        setProduct(data.product);
        setActiveImage(data.product.imageUrl || '/sample-photo/product-placeholder.jpg');
        setLoading(false);
      })
      .catch(() => {
        if (!cached) setLoading(false);
      });
  }, [viewProductId, products, recommended, discounts, flashSales, mostViewed, wishlist, compare]);

  if (!viewProductId) return null;

  const anyLoading = loading || productsLoading || collectionsLoading;

  if (anyLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="productDetail panel">
        <div className="p-4 text-center">
          Produk tidak ditemukan di kategori ini.
          <br />
          <button className="btn btn--primary mt-2 mr-2" onClick={() => setViewProductId(null)}>
            Lihat semua produk
          </button>
          <button className="btn btn--text mt-2" onClick={() => setViewProductId(null)}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const effectivePrice = product.flashSale?.isActive ? product.flashSale.priceIdr : product.priceIdr;
  const hasDiscount = product.discountPercent > 0;
  const stock = product.stock || 0;

  const ratingValue =
    typeof product.rating === 'number' && product.rating > 0 ? Number(product.rating.toFixed(1)) : null;
  const reviewCount =
    typeof product.reviewCount === 'number' && product.reviewCount > 0 ? product.reviewCount : null;
  const soldCountRaw =
    typeof product.soldCount === 'number' && product.soldCount > 0
      ? product.soldCount
      : typeof product.viewCount === 'number' && product.viewCount > 0
      ? product.viewCount
      : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert('Produk berhasil masuk keranjang!');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    // Open cart or checkout modal logic here if needed
    // For now just alert
    alert('Lanjut ke pembayaran...');
  };

  return (
    <div className="productDetail animate-fade-in">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-primary" onClick={() => setViewProductId(null)}>Beranda</span>
          <span className="mx-2">/</span>
          <span>{product.category?.name || 'Produk'}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800 truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Images */}
            <div className="md:col-span-5">
              <div className="aspect-square rounded-md overflow-hidden border border-gray-200 mb-4 relative group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.flashSale?.isActive && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1">
                    FLASH SALE
                  </div>
                )}
              </div>
              {/* Thumbnails (Mock for now, using same image) */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[product.imageUrl, '/sample-photo/product-placeholder.jpg'].filter(Boolean).map((img, idx) => (
                  <div
                    key={idx}
                    className={`w-20 h-20 flex-shrink-0 border rounded cursor-pointer ${
                      activeImage === img ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onMouseEnter={() => setActiveImage(img)}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="md:col-span-7 flex flex-col">
              <h1 className="text-xl md:text-2xl font-medium text-gray-800 mb-2 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center text-sm text-gray-500 mb-4 divide-x divide-gray-300">
                {ratingValue !== null ? (
                  <div className="pr-4 flex items-center gap-1">
                    <span className="text-primary border-b border-primary pb-0.5">
                      {ratingValue.toFixed(1)}
                    </span>
                    <span className="text-yellow-400">★★★★★</span>
                  </div>
                ) : (
                  <div className="pr-4 text-gray-400">Belum ada rating</div>
                )}
                {reviewCount !== null && (
                  <div className="px-4">
                    <span className="font-medium text-gray-800">
                      {reviewCount.toLocaleString('id-ID')}
                    </span>{' '}
                    Penilaian
                  </div>
                )}
                {soldCountRaw !== null && (
                  <div className="pl-4">
                    <span className="font-medium text-gray-800">
                      {soldCountRaw.toLocaleString('id-ID')}
                    </span>{' '}
                    Terjual
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded mb-6">
                <div className="flex items-end gap-2 flex-wrap">
                  {hasDiscount && (
                    <span className="text-gray-400 line-through text-sm mb-1">
                      {formatIdr(product.priceIdr)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary">
                    {formatIdr(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-1 py-0.5 rounded">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Variants (Mock) */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className="w-24 text-gray-500">Pengiriman</span>
                  <div className="flex-1 text-sm text-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-600 font-medium">Gratis Ongkir</span>
                      <span className="text-gray-400 text-xs">min. belanja Rp30rb</span>
                    </div>
                    <div>Pengiriman dari <span className="font-medium">Kota Bandung</span></div>
                  </div>
                </div>
                
                {/* Quantity */}
                <div className="flex items-center mt-6">
                  <span className="w-24 text-gray-500">Kuantitas</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="w-14 text-center text-sm focus:outline-none"
                      value={quantity}
                      readOnly
                    />
                    <button
                      className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                      disabled={quantity >= stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="ml-4 text-sm text-gray-500">Tersisa {stock} buah</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-red-50 border border-red-500 text-red-500 py-3 rounded hover:bg-red-100 font-medium flex justify-center items-center gap-2 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7-4h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Masukkan Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-red-500 text-white py-3 rounded hover:bg-red-600 font-medium shadow-sm transition-colors"
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
            🏪
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-lg">The Jago Snack & Frozen Food</h3>
            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              <span>Online 1 menit lalu</span>
              <span>•</span>
              <span>Bandung, Jawa Barat</span>
            </div>
          </div>
          <button className="border border-red-500 text-red-500 px-4 py-2 rounded text-sm hover:bg-red-50 transition-colors">
            Kunjungi Toko
          </button>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h3 className="bg-gray-50 p-3 font-medium text-gray-800 mb-4 rounded">Spesifikasi Produk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8 px-2">
            <div className="flex"><span className="w-32 text-gray-500">Kategori</span><span>{product.category?.name || 'Umum'}</span></div>
            <div className="flex"><span className="w-32 text-gray-500">Stok</span><span>{stock}</span></div>
            <div className="flex"><span className="w-32 text-gray-500">Dikirim Dari</span><span>KOTA BANDUNG</span></div>
          </div>

          <h3 className="bg-gray-50 p-3 font-medium text-gray-800 mb-4 rounded">Deskripsi Produk</h3>
          <div className="text-gray-700 text-sm leading-relaxed px-2 whitespace-pre-line">
            {product.description || `Nikmati ${product.name} kualitas terbaik dari The Jago Snack & Frozen Food. 
            
            ✅ Kualitas Terjamin
            ✅ Halal & Higienis
            ✅ Pengiriman Cepat
            ✅ Stok Selalu Baru
            
            Segera pesan sebelum kehabisan!`}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Penilaian Produk</h3>
          <Reviews />
        </div>
      </div>
    </div>
  );
}
