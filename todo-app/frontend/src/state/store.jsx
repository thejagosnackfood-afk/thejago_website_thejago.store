import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, setAuthToken } from '../lib/api.js';

const StoreCtx = createContext(null);

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
        setCategories(data.categories || []);
        if (!activeCategorySlug && data.categories?.[0]?.slug) setActiveCategorySlug(data.categories[0].slug);
      } catch {
        const fallback = [
          { name: 'Baso', slug: 'baso' },
          { name: 'Sosis', slug: 'sosis' },
          { name: 'Nugget', slug: 'nugget' },
          { name: 'Bumbu Rempah', slug: 'bumbu-rempah' },
          { name: 'Bumbu Kaldu', slug: 'bumbu-kaldu' },
          { name: 'Santan', slug: 'santan' },
          { name: 'Susu', slug: 'susu' },
        ];
        setCategories(fallback);
        if (!activeCategorySlug) setActiveCategorySlug(fallback[0].slug);
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
      const data = await apiFetch(`/api/products?${qs.toString()}`);
      setProducts(data.products || []);
    })();
  }, [activeCategorySlug, searchQuery]);

  useEffect(() => {
    (async () => {
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
