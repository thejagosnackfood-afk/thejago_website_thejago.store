import React, { useMemo, useState, useCallback } from 'react';
import { formatIdr } from '../lib/format.js';
import { apiFetch } from '../lib/api.js';
import { useStore } from '../state/store.jsx';

function sumGuest(items) {
  return items.reduce((acc, it) => acc + (it.quantity || 0) * (it.priceIdr || 0), 0);
}

const CartDock = React.memo(function CartDock() {
  const { user, cart, cartItems, setAuthModalOpen } = useStore();
  const [busy, setBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  const total = useMemo(() => (user ? cart?.totalPriceIdr || 0 : sumGuest(cartItems)), [cartItems, cart, user]);
  const count = useMemo(() => (user ? cart?.totalItems || 0 : cartItems.reduce((a, i) => a + (i.quantity || 0), 0)), [cartItems, cart, user]);

  const handleCheckout = useCallback(async () => {
    if (busy) return;
    if (!user) {
      setCheckoutError('Silakan login dulu untuk melanjutkan checkout.');
      setAuthModalOpen(true);
      return;
    }
    setCheckoutError('');
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
        setCheckoutError('Nomor WhatsApp belum terverifikasi. Mohon verifikasi dulu.');
        setAuthModalOpen(true);
        return;
      }
      setCheckoutError(e.message || 'Checkout gagal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }, [busy, user, setAuthModalOpen]);

  const isDisabled = busy || count === 0;

  return (
    <div className="cartDock reveal" style={{ '--delay': '170ms' }} role="complementary" aria-label="Keranjang Belanja">
      <div className="cartDock__left">
        <div className="cartDock__label">Keranjang</div>
        <div className="cartDock__meta">
          <span className="pill" aria-label={`${count} item di keranjang`}>
            {count} item
          </span>
          <span className="pill pill--sum" aria-label={`Total harga ${formatIdr(total)}`}>
            {formatIdr(total)}
          </span>
        </div>
      </div>
      <div className="cartDock__actions">
        <button
          className="btn btn--primary"
          onClick={handleCheckout}
          disabled={isDisabled}
          aria-busy={busy}
          aria-label={isDisabled ? 'Checkout tidak tersedia' : 'Proses checkout'}
        >
          {busy ? 'Memproses...' : 'Checkout'}
        </button>
        {checkoutError ? <div className="cartDock__error">{checkoutError}</div> : null}
      </div>
    </div>
  );
});

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

export default CartDock;
