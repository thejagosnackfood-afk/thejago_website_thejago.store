import React from 'react';

const items = [
  {
    title: 'Login & Sign Up',
    desc: 'Autentikasi aman untuk pengalaman personal.',
    icon: '👤',
  },
  {
    title: 'Product Categories',
    desc: 'Sayur, buah, susu, frozen, health care, dan lebih.',
    icon: '🗂️',
  },
  {
    title: 'Sound Effects',
    desc: 'SFX saat tambah keranjang & checkout (opsional).',
    icon: '🔊',
  },
  {
    title: 'Secure Payments',
    desc: 'Siap integrasi PayPal / Stripe untuk transaksi aman.',
    icon: '💳',
  },
  {
    title: 'Validation',
    desc: 'Form validation untuk interaksi mulus.',
    icon: '✅',
  },
];

export default function Features() {
  return (
    <section className="features reveal" style={{ '--delay': '25ms' }}>
      <div className="features__head">
        <div>
          <div className="features__kicker">🌟 Features</div>
          <div className="features__title">Semua highlight ala Grofers</div>
          <div className="features__sub">Ringkas dari repo shubham001official/grofers.</div>
        </div>
      </div>
      <div className="features__grid">
        {items.map((f) => (
          <div key={f.title} className="featureCard">
            <div className="featureCard__icon">{f.icon}</div>
            <div className="featureCard__title">{f.title}</div>
            <div className="featureCard__desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
