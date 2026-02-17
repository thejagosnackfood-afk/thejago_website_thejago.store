import React, { useMemo, useState } from 'react';
import { formatIdr } from '../lib/format.js';
import { apiFetch } from '../lib/api.js';
import { useStore } from '../state/store.jsx';

function sumGuest(items) {
  return items.reduce((acc, it) => acc + (it.quantity || 0) * (it.priceIdr || 0), 0);
}

export default function CartDock() {
  const { user, cart, cartItems, setAuthModalOpen } = useStore();
  const [busy, setBusy] = useState(false);
  const total = useMemo(() => (user ? cart?.totalPriceIdr || 0 : sumGuest(cartItems)), [cartItems, cart, user]);
  const count = useMemo(() => (user ? cart?.totalItems || 0 : cartItems.reduce((a, i) => a + (i.quantity || 0), 0)), [cartItems, cart, user]);

  async function checkout() {
    if (!user) return setAuthModalOpen(true);
    setBusy(true);
    try {
      const orderRes = await apiFetch('/api/orders', { method: 'POST' });
      const snapRes = await apiFetch('/api/payments/midtrans/snap-token', {
        method: 'POST',
        body: JSON.stringify({ orderId: orderRes.order._id }),
      });
      await payMidtrans(snapRes.token);
    } catch (e) {
      if (String(e.message) === 'whatsapp_not_verified') {
        setAuthModalOpen(true);
        return;
      }
      alert(e.message || 'Checkout gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cartDock reveal" style={{ '--delay': '170ms' }}>
      <div className="cartDock__left">
        <div className="cartDock__label">Keranjang</div>
        <div className="cartDock__meta">
          <span className="pill">{count} item</span>
          <span className="pill pill--sum">{formatIdr(total)}</span>
        </div>
      </div>
      <button className="btn btn--primary" onClick={checkout} disabled={busy || count === 0}>
        Checkout
      </button>
    </div>
  );
}

async function payMidtrans(token) {
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  if (!clientKey) throw new Error('VITE_MIDTRANS_CLIENT_KEY belum diisi');

  await loadSnap(clientKey);
  if (!window.snap) throw new Error('Midtrans Snap gagal dimuat');

  return new Promise((resolve, reject) => {
    window.snap.pay(token, {
      onSuccess: resolve,
      onPending: resolve,
      onError: reject,
      onClose: () => resolve(),
    });
  });
}

function loadSnap(clientKey) {
  return new Promise((resolve, reject) => {
    if (document.getElementById('midtrans-snap')) return resolve();
    const s = document.createElement('script');
    s.id = 'midtrans-snap';
    const isProd = String(import.meta.env.VITE_MIDTRANS_IS_PRODUCTION || 'false') === 'true';
    s.src = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', clientKey);
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}
