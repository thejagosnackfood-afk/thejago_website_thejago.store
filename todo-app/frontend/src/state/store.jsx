import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, setAuthToken } from '../lib/api.js';

const StoreCtx = createContext(null);

// Demo fallback data so UI tetap terisi meski backend belum siap.
const demoCategories = [
  { name: 'Milk & Juice', slug: 'milk-juice' },
  { name: 'Personal Care', slug: 'personal-care' },
  { name: 'Vegetables', slug: 'vegetables' },
  { name: 'Bakery', slug: 'bakery' },
  { name: 'Grains', slug: 'grains' },
  { name: 'Chicken & Egg', slug: 'chicken-egg' },
  { name: 'Fruits', slug: 'fruits' },
  { name: 'Snacks', slug: 'snacks' },
  { name: 'Frozen', slug: 'frozen' },
];

const demoProducts = [
  {
    _id: 'demo-cauliflower',
    name: 'Cauliflower',
    priceIdr: 32000,
    categorySlug: 'vegetables',
    imageUrl: '/demo-cauliflower.png',
    discountPercent: 18,
    isRecommended: true,
  },
  {
    _id: 'demo-orange',
    name: 'Fresh Orange 6 pcs',
    priceIdr: 45000,
    categorySlug: 'fruits',
    imageUrl: '/demo-fresh-orange.png',
    discountPercent: 0,
    isRecommended: true,
  },
  {
    _id: 'demo-cilantro',
    name: 'Cilantro (2 Pcs)',
    priceIdr: 14000,
    categorySlug: 'vegetables',
    imageUrl: '/demo-cilantro.png',
    discountPercent: 0,
  },
  {
    _id: 'demo-carrot',
    name: 'Orange Carrot Vegetables',
    priceIdr: 22000,
    categorySlug: 'vegetables',
    imageUrl: '/demo-carrot.png',
    discountPercent: 12,
  },
  {
    _id: 'demo-pineapple',
    name: 'Pineapple Queen',
    priceIdr: 38000,
    categorySlug: 'fruits',
    imageUrl: '/demo-pineapple.png',
    discountPercent: 0,
    isRecommended: true,
  },
  {
    _id: 'demo-capsicum',
    name: 'Green Capsicum (500g)',
    priceIdr: 26000,
    categorySlug: 'vegetables',
    imageUrl: '/demo-capsicum.png',
    discountPercent: 15,
  },
  {
    _id: 'demo-maaza',
    name: 'Mango Maaza Juice',
    priceIdr: 19000,
    categorySlug: 'milk-juice',
    imageUrl: '/demo-maaza.png',
    discountPercent: 5,
    flashSale: { isActive: true, priceIdr: 16000 },
  },
  {
    _id: 'demo-mango',
    name: 'Fresh Mango From Mexico',
    priceIdr: 48000,
    categorySlug: 'fruits',
    imageUrl: '/demo-mango.png',
    discountPercent: 0,
  },
  {
    _id: 'demo-bread',
    name: 'Soft Bread Loaf',
    priceIdr: 18000,
    categorySlug: 'bakery',
    imageUrl: '/demo-bread.png',
    discountPercent: 10,
  },
  {
    _id: 'demo-egg',
    name: 'Free-range Eggs (10s)',
    priceIdr: 30000,
    categorySlug: 'chicken-egg',
    imageUrl: '/demo-eggs.png',
    discountPercent: 0,
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

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [recommended, setRecommended] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);

  const [guestCart, setGuestCart] = useState(loadGuestCart);
  const [cart, setCart] = useState(null); // server cart
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const cartItems = user ? cart?.items || [] : guestCart;
  const cartDistinctCount = user ? new Set(cartItems.map((i) => String(i.product))).size : distinctProducts(cartItems);

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
    (async () => {
      try {
        const data = await apiFetch('/api/categories');
        const cats = data.categories?.length ? data.categories : demoCategories;
        setCategories(cats);
        if (!activeCategorySlug && cats[0]?.slug) setActiveCategorySlug(cats[0].slug);
      } catch {
        setCategories(demoCategories);
        if (!activeCategorySlug) setActiveCategorySlug(demoCategories[0].slug);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeCategorySlug && !searchQuery) return;
    (async () => {
      const qs = new URLSearchParams();
      if (activeCategorySlug && !searchQuery) qs.set('category', activeCategorySlug);
      if (searchQuery) qs.set('q', searchQuery);
      try {
        const data = await apiFetch(`/api/products?${qs.toString()}`);
        const list = data.products || [];
        if (list.length) {
          setProducts(list);
          return;
        }
      } catch {
        // ignore fetch error, fallback below
      }

      const filtered = demoProducts.filter((p) => {
        const matchesCat = searchQuery ? true : !activeCategorySlug || p.categorySlug === activeCategorySlug;
        const matchesSearch = searchQuery
          ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return matchesCat && matchesSearch;
      });
      setProducts(filtered);
    })();
  }, [activeCategorySlug, searchQuery]);

  useEffect(() => {
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
        if (r.products?.length || d.products?.length || f.products?.length || mv.products?.length) return;
      } catch {
        // ignore
      }

      setRecommended(demoProducts.filter((p) => p.isRecommended));
      setDiscounts(demoProducts.filter((p) => p.discountPercent > 0));
      setFlashSales(demoProducts.filter((p) => p.flashSale?.isActive));
      setMostViewed(demoProducts.slice(0, 6));
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await apiFetch('/api/cart');
      setCart(data.cart);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) saveGuestCart(guestCart);
  }, [guestCart, user]);

  useEffect(() => {
    if (user) return;
    if (cartDistinctCount >= 2) setAuthModalOpen(true);
  }, [cartDistinctCount, user]);

  async function addToCart(product, qty = 1) {
    if (!product) return;
    if (user) {
      const data = await apiFetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product._id, quantityDelta: qty }),
      });
      setCart(data.cart);
      return;
    }
    setGuestCart((prev) => {
      const idx = prev.findIndex((i) => i.id === product._id);
      const next = [...prev];
      if (idx === -1) next.push({ id: product._id, name: product.name, priceIdr: product.priceIdr, quantity: qty, imageUrl: product.imageUrl });
      else next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      return next;
    });
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
      searchQuery,
      setSearchQuery,
      recommended,
      discounts,
      flashSales,
      mostViewed,
      cart,
      setCart,
      cartItems,
      addToCart,
      authModalOpen,
      setAuthModalOpen,
    }),
    [
      user,
      categories,
      activeCategorySlug,
      products,
      searchQuery,
      recommended,
      discounts,
      flashSales,
      mostViewed,
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
