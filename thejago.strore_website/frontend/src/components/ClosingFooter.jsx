import React from 'react';

const MENU_LINKS = ['About', 'Careers', 'History', 'Services', 'Projects', 'Blog'];
const SOCIAL_LINKS = ['f', 'ig', 'x', 'gh', 'o'];

export default function ClosingFooter() {
  return (
    <section className="closing reveal" style={{ '--delay': '180ms' }} aria-label="Penutup website">
      <div className="closing__cta">
        <div className="closing__copy">
          <h2 className="closing__ctaTitle">We Deliver your Grocery in 24 Hours</h2>
          <button className="closing__ctaBtn" type="button">
            Order Now
          </button>
        </div>

        <div className="closing__mascot" aria-hidden="true">
          <svg className="closing__illustration" viewBox="0 0 420 270" role="presentation">
            <circle cx="122" cy="222" r="35" fill="#242424" />
            <circle cx="122" cy="222" r="17" fill="#d1d5db" />
            <circle cx="265" cy="222" r="35" fill="#242424" />
            <circle cx="265" cy="222" r="17" fill="#d1d5db" />

            <path
              d="M72 177c4-31 27-53 56-53h62c24 0 45 17 49 40l12 83h-45l-9-47h-78l-10 47H64l8-70Z"
              fill="#ef4444"
            />
            <rect x="145" y="118" width="73" height="18" rx="9" fill="#ef4444" />
            <rect x="193" y="86" width="67" height="47" rx="10" fill="#16a34a" />
            <rect x="197" y="90" width="59" height="39" rx="8" fill="#22c55e" />
            <text x="227" y="114" textAnchor="middle" fontSize="12" fontWeight="900" fill="#f0fdf4">
              24H
            </text>

            <circle cx="179" cy="91" r="24" fill="#fdba74" />
            <path d="M157 87c4-20 41-23 46 0v8h-46Z" fill="#f97316" />
            <path d="M170 98h31l7 27h-43Z" fill="#16a34a" />
            <rect x="154" y="128" width="68" height="16" rx="8" fill="#15803d" />
            <path d="M214 140h16l17 20-11 9-13-16h-9Z" fill="#fdba74" />
            <circle cx="255" cy="161" r="9" fill="#111827" />
            <circle cx="253" cy="159" r="4" fill="#f3f4f6" />

            <path d="M104 142h97c8 0 14 6 14 14v8H97v-8c0-8 7-14 14-14Z" fill="#dc2626" />
            <rect x="94" y="153" width="130" height="13" rx="6" fill="#b91c1c" />
          </svg>
        </div>
      </div>

      <footer className="closing__footer">
        <div className="closing__brand">
          <div className="closing__brandIcon" aria-hidden="true">
            <svg className="closing__brandSvg" viewBox="0 0 64 64" role="presentation">
              <rect x="14" y="20" width="36" height="34" rx="6" fill="#f7c86e" />
              <path d="M22 22c0-7 4-12 10-12s10 5 10 12" fill="none" stroke="#8a5a1f" strokeWidth="3" />
              <circle cx="22" cy="34" r="3" fill="#6bbf59" />
              <circle cx="30" cy="30" r="3" fill="#38a169" />
              <circle cx="37" cy="34" r="3" fill="#eab308" />
              <circle cx="43" cy="30" r="3" fill="#16a34a" />
            </svg>
          </div>
          <div className="closing__brandText">
            <span className="closing__brandLineA">Grocery</span>
            <span className="closing__brandLineB">Store</span>
          </div>
        </div>

        <p className="closing__desc">
          Belanja snack, frozen food, dan kebutuhan harian jadi lebih cepat. Pesanan diproses setiap hari dengan
          pengiriman yang aman.
        </p>

        <nav className="closing__menu" aria-label="Footer links">
          {MENU_LINKS.map((item) => (
            <a key={item} href="#" className="closing__menuLink">
              {item}
            </a>
          ))}
        </nav>

        <div className="closing__socials" aria-label="Social media">
          {SOCIAL_LINKS.map((item, idx) => (
            <a key={`${item}-${idx}`} href="#" className="closing__socialLink" aria-label={`social-${item}`}>
              {item}
            </a>
          ))}
        </div>
      </footer>
    </section>
  );
}
