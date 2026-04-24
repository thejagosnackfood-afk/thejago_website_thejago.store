import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, setAuthToken } from '../lib/api.js';

const StoreCtx = createContext(null);

// Demo fallback data so UI tetap terisi meski backend belum siap.
const demoCategories = [
  // Sembako (Groceries)
  { name: 'Beras', slug: 'beras' },
  { name: 'Minyak Goreng', slug: 'minyak-goreng' },
  { name: 'Gula', slug: 'gula' },
  { name: 'Tepung', slug: 'tepung' },
  { name: 'Telur', slug: 'telur' },
  { name: 'Bumbu Dapur', slug: 'bumbu-dapur' },
  { name: 'Kacang-kacangan', slug: 'kacang-kacangan' },
  { name: 'Susu & Olahan', slug: 'susu-olahan' },
  { name: 'Mie & Pasta', slug: 'mie-pasta' },
  { name: 'Saus & Kecap', slug: 'saus-kecap' },

  // Frozen Food
  { name: 'Daging Olahan', slug: 'daging-olahan' },
  { name: 'Daging Sapi Frozen', slug: 'daging-sapi-frozen' },
  { name: 'Ayam Frozen', slug: 'ayam-frozen' },
  { name: 'Seafood Frozen', slug: 'seafood-frozen' },
  { name: 'Sayuran Beku', slug: 'sayuran-beku' },
  { name: 'Kentang Goreng', slug: 'kentang-goreng' },
  { name: 'Camilan Beku', slug: 'camilan-beku' },
  { name: 'Buah Beku', slug: 'buah-beku' },
  { name: 'Es Krim & Dessert', slug: 'es-krim-dessert' },
  { name: 'Bumbu Beku', slug: 'bumbu-beku' },
];

const demoProducts = [
  // SEMBAKO SAMPLE
  {
    _id: 'demo-beras-1',
    name: 'Beras Premium 5kg',
    priceIdr: 72000,
    categorySlug: 'beras',
    imageUrl: '/demo-cauliflower.png', // placeholder
    discountPercent: 0,
    isRecommended: true,
    rating: 4.9,
    reviewCount: 128,
    soldCount: 540,
    description:
      'Beras premium kualitas super 5kg, pulen dan wangi, cocok untuk konsumsi harian keluarga. Dikemas rapi dan higienis langsung dari The Jago.',
  },
  {
    _id: 'demo-minyak-1',
    name: 'Minyak Goreng 2L',
    priceIdr: 35000,
    categorySlug: 'minyak-goreng',
    imageUrl: '/demo-maaza.png', // placeholder
    discountPercent: 10,
    flashSale: { isActive: true, priceIdr: 31500 },
    rating: 4.8,
    reviewCount: 96,
    soldCount: 420,
    description:
      'Minyak goreng 2 liter berkualitas dengan warna jernih, cocok untuk menggoreng dan menumis. Kemasan praktis dan ekonomis.',
  },
  {
    _id: 'demo-gula-1',
    name: 'Gula Pasir 1kg',
    priceIdr: 16000,
    categorySlug: 'gula',
    imageUrl: '/demo-bread.png', // placeholder
    discountPercent: 0,
    rating: 4.7,
    reviewCount: 74,
    soldCount: 310,
    description:
      'Gula pasir kristal putih 1kg yang mudah larut, cocok untuk minuman, kue, dan kebutuhan dapur lainnya. Dikemas bersih dan aman.',
  },
  {
    _id: 'demo-telur-1',
    name: 'Telur Ayam Negeri (1kg)',
    priceIdr: 28000,
    categorySlug: 'telur',
    imageUrl: '/demo-eggs.png',
    discountPercent: 0,
    isRecommended: true,
    rating: 4.85,
    reviewCount: 152,
    soldCount: 620,
    description:
      'Telur ayam negeri segar per kilo, ukuran seragam dan cangkang kuat. Cocok untuk stok harian dan usaha kuliner.',
  },

  // FROZEN FOOD SAMPLE
  {
    _id: 'demo-nugget-1',
    name: 'Chicken Nugget 500g',
    priceIdr: 45000,
    categorySlug: 'daging-olahan',
    imageUrl: '/demo-carrot.png', // placeholder
    discountPercent: 15,
    flashSale: { isActive: true, priceIdr: 38000 },
    rating: 4.9,
    reviewCount: 210,
    soldCount: 980,
    description:
      'Chicken nugget 500g dengan daging ayam pilihan, renyah di luar lembut di dalam. Praktis untuk camilan dan lauk anak.',
  },
  {
    _id: 'demo-sosis-1',
    name: 'Sosis Sapi Premium 12pcs',
    priceIdr: 55000,
    categorySlug: 'daging-olahan',
    imageUrl: '/demo-fresh-orange.png', // placeholder
    discountPercent: 5,
    rating: 4.8,
    reviewCount: 164,
    soldCount: 740,
    description:
      'Sosis sapi premium isi 12 pcs dengan rasa gurih dan tekstur padat. Cocok untuk digoreng, dipanggang, atau campuran masakan.',
  },
  {
    _id: 'demo-kentang-1',
    name: 'French Fries Shoestring 1kg',
    priceIdr: 32000,
    categorySlug: 'kentang-goreng',
    imageUrl: '/demo-cilantro.png', // placeholder
    discountPercent: 0,
    isRecommended: true,
    rating: 4.9,
    reviewCount: 132,
    soldCount: 860,
    description:
      'Kentang goreng shoestring 1kg siap goreng, renyah di luar lembut di dalam. Cocok untuk camilan dan pendamping menu utama.',
  },
  {
    _id: 'demo-mix-veggie',
    name: 'Mix Vegetables 500g',
    priceIdr: 25000,
    categorySlug: 'sayuran-beku',
    imageUrl: '/demo-capsicum.png', // placeholder
    discountPercent: 10,
    rating: 4.85,
    reviewCount: 118,
    soldCount: 530,
    description:
      'Mix vegetables 500g berisi campuran wortel, jagung, dan kacang polong beku. Praktis untuk sup, tumisan, dan nasi goreng.',
  },
];

function distinctProducts(items) {
  return new Set(items.map((i) => i.id)).size;
}

function loadGuestCart() {
  try {
    return JSON.parse(localStorage.getItem('guestCart') || '[]');
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem('guestCart', JSON.stringify(items));
}

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem('wishlist', JSON.stringify(items));
}

function loadCompare() {
  try {
    return JSON.parse(localStorage.getItem('compare') || '[]');
  } catch {
    return [];
  }
}

function saveCompare(items) {
  localStorage.setItem('compare', JSON.stringify(items));
}

function getInitialBrowseState() {
  if (typeof window === 'undefined') return { categorySlug: '', query: '', productId: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    categorySlug: params.get('category') || '',
    query: String(params.get('q') || '').trim(),
    productId: params.get('product') || '',
  };
}

function normalizeQuery(value) {
  return String(value || '').trim();
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState(() => getInitialBrowseState().categorySlug);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => getInitialBrowseState().query);
  const [viewProductId, setViewProductId] = useState(() => getInitialBrowseState().productId);

  const [recommended, setRecommended] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  const [guestCart, setGuestCart] = useState(loadGuestCart);
  const [cart, setCart] = useState(null); // server cart
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [wishlist, setWishlist] = useState(loadWishlist);
  const [compare, setCompare] = useState(loadCompare);

  const cartItems = user ? cart?.items || [] : guestCart;
  const cartDistinctCount = user
    ? new Set(cartItems.map((i) => String(i.product?._id || i.product?.id || i.product || i.id))).size
    : distinctProducts(cartItems);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/categories');
        const cats = data.categories?.length ? data.categories : demoCategories;
        setCategories(cats);
        if (!activeCategorySlug) {
            setActiveCategorySlug((current) => {
            const hasActiveCategory = cats.some((c) => c.slug === current);
            if (current && hasActiveCategory) return current;
            return cats[0]?.slug || '';
            });
        }
      } catch {
        setCategories(demoCategories);
        if (!activeCategorySlug) {
            setActiveCategorySlug((current) => {
            const hasActiveCategory = demoCategories.some((c) => c.slug === current);
            if (current && hasActiveCategory) return current;
            return demoCategories[0]?.slug || '';
            });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch('/api/auth/me');
        setUser(me.user);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const normalizedQuery = normalizeQuery(searchQuery);

    if (activeCategorySlug) params.set('category', activeCategorySlug);
    else params.delete('category');

    if (normalizedQuery) params.set('q', normalizedQuery);
    else params.delete('q');

    if (viewProductId) params.set('product', viewProductId);
    else params.delete('product');

    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [activeCategorySlug, searchQuery, viewProductId]);

  useEffect(() => {
    const normalizedQuery = normalizeQuery(searchQuery);
    if (!activeCategorySlug && !normalizedQuery) return;

    const controller = new AbortController();
    let cancelled = false;

    setProductsLoading(true);
    (async () => {
      const qs = new URLSearchParams();
      if (activeCategorySlug && !normalizedQuery) qs.set('category', activeCategorySlug);
      if (normalizedQuery) qs.set('q', normalizedQuery);
      try {
        const data = await apiFetch(`/api/products?${qs.toString()}`, { signal: controller.signal });
        if (cancelled) return;
        const list = data.products || [];
        if (list.length) {
          setProducts(list);
          setProductsLoading(false);
          return;
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        // ignore fetch error, fallback below
      }

      if (cancelled) return;
      const filtered = demoProducts.filter((p) => {
        const matchesCat = normalizedQuery ? true : !activeCategorySlug || p.categorySlug === activeCategorySlug;
        const matchesSearch = normalizedQuery
          ? p.name.toLowerCase().includes(normalizedQuery.toLowerCase())
          : true;
        return matchesCat && matchesSearch;
      });
      setProducts(filtered);
      setProductsLoading(false);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeCategorySlug, searchQuery]);

  useEffect(() => {
    setCollectionsLoading(true);
    (async () => {
      try {
        const [r, d, f, mv] = await Promise.all([
          apiFetch('/api/products?tag=recommended'),
          apiFetch('/api/products?tag=discount'),
          apiFetch('/api/products?tag=flashSale'),
          apiFetch('/api/products?tag=mostViewed'),
        ]);
        setRecommended(r.products || []);
        setDiscounts(d.products || []);
        setFlashSales(f.products || []);
        setMostViewed(mv.products || []);
        setCollectionsLoading(false);
        if (r.products?.length || d.products?.length || f.products?.length || mv.products?.length) return;
      } catch {
        // ignore
      }

      setRecommended(demoProducts.filter((p) => p.isRecommended));
      setDiscounts(demoProducts.filter((p) => p.discountPercent > 0));
      setFlashSales(demoProducts.filter((p) => p.flashSale?.isActive));
      setMostViewed(demoProducts.slice(0, 6));
      setCollectionsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch('/api/cart');
        if (!cancelled) setCart(data.cart);
      } catch {
        if (!cancelled) setCart(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) saveGuestCart(guestCart);
  }, [guestCart, user]);

  useEffect(() => {
    if (user) return;
    if (cartDistinctCount >= 2) setAuthModalOpen(true);
  }, [cartDistinctCount, user]);

  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  useEffect(() => {
    saveCompare(compare);
  }, [compare]);

  async function addToCart(product, qty = 1) {
    if (!product) return;
    const quantity = Number.isFinite(Number(qty)) ? Math.max(1, Math.floor(Number(qty))) : 1;
    if (user) {
      const data = await apiFetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product._id || product.id, quantityDelta: quantity }),
      });
      setCart(data.cart);
      return;
    }
    setGuestCart((prev) => {
      const productId = product._id || product.id;
      const idx = prev.findIndex((i) => i.id === productId);
      const next = [...prev];
      if (idx === -1)
        next.push({ id: productId, name: product.name, priceIdr: product.priceIdr, quantity, imageUrl: product.imageUrl });
      else next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      return next;
    });
  }

  function normalizeProductForList(product) {
    if (!product) return null;
    const id = product._id || product.id;
    if (!id) return null;
    return {
      id,
      name: product.name,
      priceIdr: product.priceIdr,
      imageUrl: product.imageUrl,
      category: product.categorySlug || product.category || '',
      rating: product.rating || 0,
      stock: typeof product.stock === 'number' ? product.stock : undefined,
      discountPercent: product.discountPercent || 0,
      flashSale: product.flashSale || null,
      isRecommended: product.isRecommended || false,
      isNew: product.isNew || false,
    };
  }

  function toggleWishlist(product) {
    const item = normalizeProductForList(product);
    if (!item) return;
    setWishlist((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  }

  function isInWishlist(id) {
    if (!id) return false;
    return wishlist.some((p) => String(p.id) === String(id));
  }

  function clearWishlist() {
    setWishlist([]);
  }

  function toggleCompare(product) {
    const item = normalizeProductForList(product);
    if (!item) return;
    setCompare((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx === -1) {
        if (prev.length >= 4) return prev;
        return [...prev, item];
      }
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  }

  function isInCompare(id) {
    if (!id) return false;
    return compare.some((p) => String(p.id) === String(id));
  }

  function clearCompare() {
    setCompare([]);
  }

  function logout() {
    setAuthToken('');
    setUser(null);
    setCart(null);
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout,
      categories,
      activeCategorySlug,
      setActiveCategorySlug,
      products,
      productsLoading,
      searchQuery,
      setSearchQuery,
      viewProductId,
      setViewProductId,
      recommended,
      discounts,
      flashSales,
      mostViewed,
      collectionsLoading,
      wishlist,
      compare,
      cart,
      setCart,
      cartItems,
      addToCart,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      toggleCompare,
      isInCompare,
      clearCompare,
      authModalOpen,
      setAuthModalOpen,
    }),
    [
      user,
      categories,
      activeCategorySlug,
      products,
      productsLoading,
      searchQuery,
      viewProductId,
      recommended,
      discounts,
      flashSales,
      mostViewed,
      collectionsLoading,
      wishlist,
      compare,
      cart,
      cartItems,
      authModalOpen,
    ]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
