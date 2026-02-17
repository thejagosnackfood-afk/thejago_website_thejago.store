import React, { useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    const text = msg.trim();
    if (!text) return;
    setMsg('');
    setLog((p) => [...p, { by: 'me', text }]);
    setBusy(true);
    try {
      const data = await apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: text }) });
      setLog((p) => [...p, { by: 'bot', text: data.reply || 'Maaf, saya belum bisa jawab.' }]);
    } catch (e2) {
      setLog((p) => [...p, { by: 'bot', text: `CS belum aktif: ${e2.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`chat ${open ? 'chat--open' : ''}`}>
      {open ? (
        <div className="chat__panel">
          <div className="chat__head">
            <div>
              <div className="chat__title">CS ChatGPT</div>
              <div className="chat__sub">Tanya stok, harga, promo, dan rekomendasi.</div>
            </div>
            <button className="iconBtn" onClick={() => setOpen(false)} aria-label="close chat">
              ✕
            </button>
          </div>
          <div className="chat__body">
            {log.length ? (
              log.map((m, idx) => (
                <div key={idx} className={`bubble ${m.by === 'me' ? 'bubble--me' : 'bubble--bot'}`}>
                  {m.text}
                </div>
              ))
            ) : (
              <div className="muted">Mulai chat: "Harga nugget ayam crispy?"</div>
            )}
          </div>
          <form className="chat__form" onSubmit={send}>
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Tulis pertanyaan..." />
            <button className="btn btn--mini" disabled={busy}>
              Kirim
            </button>
          </form>
        </div>
      ) : null}

      <button className="chat__fab" onClick={() => setOpen(true)} aria-label="open chat">
        CS
      </button>
    </div>
  );
}

