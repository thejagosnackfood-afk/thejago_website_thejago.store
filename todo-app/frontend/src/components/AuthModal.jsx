import React, { useMemo, useState } from 'react';
import { apiFetch, setAuthToken } from '../lib/api.js';
import { useStore } from '../state/store.jsx';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, setUser } = useStore();
  const [mode, setMode] = useState('register'); // register | login
  const [step, setStep] = useState('auth'); // auth | otp

  const [name, setName] = useState('');
  const [phoneE164, setPhoneE164] = useState('+62');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [mockCode, setMockCode] = useState('');

  const title = useMemo(() => (mode === 'register' ? 'Daftar' : 'Masuk'), [mode]);

  if (!authModalOpen) return null;

  async function submitAuth(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const path = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'register' ? { name, phoneE164, password } : { phoneE164, password };
      const data = await apiFetch(path, { method: 'POST', body: JSON.stringify(payload) });
      setAuthToken(data.token);
      setUser(data.user);
      setStep('otp');
    } catch (e2) {
      setErr(e2.message || 'gagal');
    } finally {
      setBusy(false);
    }
  }

  async function requestOtp() {
    setErr('');
    setBusy(true);
    try {
      const data = await apiFetch('/api/auth/whatsapp/request', { method: 'POST', body: JSON.stringify({ phoneE164 }) });
      if (data.mockCode) setMockCode(String(data.mockCode));
    } catch (e2) {
      setErr(e2.message || 'gagal');
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await apiFetch('/api/auth/whatsapp/verify', { method: 'POST', body: JSON.stringify({ phoneE164, code: otp }) });
      setUser((u) => (u ? { ...u, whatsappVerified: true } : u));
      setAuthModalOpen(false);
    } catch (e2) {
      setErr(e2.message || 'gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__head">
          <div className="modal__title">
            {title} {step === 'otp' ? 'WhatsApp' : ''}
          </div>
          <button className="iconBtn" onClick={() => setAuthModalOpen(false)} aria-label="close">
            ✕
          </button>
        </div>

        {step === 'auth' ? (
          <form onSubmit={submitAuth} className="form">
            {mode === 'register' ? (
              <label className="field">
                <span>Nama</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pembeli" required />
              </label>
            ) : null}

            <label className="field">
              <span>No WhatsApp (E.164)</span>
              <input value={phoneE164} onChange={(e) => setPhoneE164(e.target.value)} placeholder="+62812..." required />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            {err ? <div className="error">{err}</div> : null}

            <button className="btn btn--primary" disabled={busy}>
              {mode === 'register' ? 'Daftar & Lanjut Verifikasi' : 'Masuk & Lanjut Verifikasi'}
            </button>

            <div className="form__row">
              <button type="button" className="link" onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>
                {mode === 'register' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="form">
            <div className="muted">
              Untuk checkout, akun perlu verifikasi WhatsApp. Klik kirim OTP, lalu masukkan kode.
              {mockCode ? <div className="mock">DEV mock OTP: {mockCode}</div> : null}
            </div>

            <button type="button" className="btn" onClick={requestOtp} disabled={busy}>
              Kirim OTP WhatsApp
            </button>

            <label className="field">
              <span>Kode OTP</span>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 digit" />
            </label>

            {err ? <div className="error">{err}</div> : null}

            <button className="btn btn--primary" disabled={busy}>
              Verifikasi
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
