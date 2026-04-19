import Link from 'next/link'
import { ShoppingBag, ShieldCheck, Zap, Star, ArrowRight, Store } from 'lucide-react'

const MARKETPLACE_ICONS = [
  { name: 'Shopee', href: '#', icon: '/marketplace-icons/shopee.png', accent: 'from-orange-400 to-red-500' },
  { name: 'Lazada', href: '#', icon: '/marketplace-icons/lazada.jpg', accent: 'from-violet-500 to-indigo-700' },
  { name: 'Tokopedia', href: '#', icon: '/marketplace-icons/tokopedia.png', accent: 'from-green-500 to-emerald-700' },
  { name: 'TikTok Shop', href: '#', icon: '/marketplace-icons/tiktok.jpg', accent: 'from-neutral-500 to-black' },
  { name: 'Go Food', href: 'https://gofood.co.id/bandung/restaurant/the-jago-snack-frozen-food-baleendah-3c78648c-162e-40eb-8e88-171168f42961?as=gmaps', icon: '/marketplace-icons/gofood.jpg', accent: 'from-orange-500 to-red-600' },
  { name: 'Grab Food', href: '#', icon: '/marketplace-icons/grabfood.png', accent: 'from-emerald-400 to-green-700' },
  { name: 'Shopee Food', href: '#', icon: '/marketplace-icons/shopeefood.png', accent: 'from-orange-400 to-red-500' },
  { name: 'WhatsApp', href: 'https://api.whatsapp.com/send/?phone=6282110202044&type=phone_number&app_absent=0', icon: '/marketplace-icons/whatsapp.webp', accent: 'from-lime-400 to-green-700' },
  { name: 'Google Maps', href: 'https://maps.app.goo.gl/DwCqxXqF8FufxY2r5', icon: '/marketplace-icons/googlemaps.png', accent: 'from-blue-500 to-emerald-500' },
]

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      {/* Header Kecil */}
      <nav className="bg-[#ffc107] py-3 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="font-black italic text-xl text-secondary">THE JAGO STORE</div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <Link href="/shop" className="hover:text-primary-dark">Produk</Link>
          <Link href="/shop" className="hover:text-primary-dark">Promo</Link>
          <Link href="/shop" className="text-secondary font-black border-b-2 border-primary">Toko Online</Link>
        </div>
      </nav>

      {/* Hero Section - Compact & Clean */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start gap-6">
          <span className="bg-primary/10 text-primary-dark px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            Official Store 2026
          </span>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-[0.95] max-w-2xl text-secondary">
            BELANJA JADI LEBIH <span className="text-primary block not-italic mt-2 text-6xl md:text-7xl">THE JAGO.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-md font-semibold leading-relaxed">
            The Jago Store menghadirkan pengalaman belanja kebutuhan rumah tangga dengan kecepatan tinggi dan harga terbaik di Cianjur.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="/shop" className="bg-primary hover:bg-primary-dark text-secondary px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest">
              MULAI BELANJA <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/shop" className="bg-gray-50 hover:bg-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-black text-sm transition-all uppercase tracking-widest border border-gray-100">
              PROMO HARI INI
            </Link>
          </div>
        </div>

        {/* Hero Visual - Compact */}
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] -rotate-2"></div>
          <div className="relative grid grid-cols-2 gap-4">
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
              <img src="/sample-photo/banner (1).jpg" alt="Prod" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden border-4 border-white shadow-xl mt-8">
              <img src="/sample-photo/banner (2).jpg" alt="Prod" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Rapat & Lebih Keatas */}
      <section className="py-8 bg-gray-50/50 border-y border-gray-100 -mt-12 relative z-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "PROSES INSTAN", desc: "Pesan sekarang, langsung antar" },
              { icon: ShieldCheck, title: "KUALITAS JAGO", desc: "Produk kualitas terbaik" },
              { icon: Store, title: "STOK LENGKAP", desc: "Ribuan produk selalu tersedia" }
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-white transition-colors rounded-2xl">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 shrink-0">
                  <feat.icon className="w-5 h-5 text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-xs font-black italic uppercase tracking-tighter leading-none mb-1">{feat.title}</h3>
                  <p className="text-gray-400 text-[10px] font-bold leading-tight">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Marketplace Links */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#ecf4ff] via-white to-[#fff8e8] p-4 md:p-6 shadow-[0_20px_50px_rgba(26,35,126,0.12)]">
            <div className="pointer-events-none absolute -top-24 -left-16 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-14 h-44 w-44 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {MARKETPLACE_ICONS.map((mall) => (
              <a
                key={mall.name}
                href={mall.href}
                target={mall.href.startsWith('http') ? '_blank' : undefined}
                rel={mall.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white/85 px-3 py-3 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${mall.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="mx-auto h-14 w-14 overflow-hidden rounded-xl bg-white p-1 shadow-sm">
                  <img src={mall.icon} alt={mall.name} className="h-full w-full object-contain" />
                </div>
                <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.08em] leading-tight text-secondary group-hover:text-primary-dark">
                  {mall.name}
                </span>
              </a>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured - Compact Grid */}
      <section className="py-20 max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Produk Unggulan</h2>
          <Link href="/shop" className="text-primary-dark font-black text-xs flex items-center gap-1 hover:underline uppercase tracking-widest">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 1].map((item, i) => (
            <div key={i} className="group bg-white rounded-3xl p-4 border border-gray-50 shadow-sm hover:shadow-xl transition-all">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 p-4">
                <img src={`/sample-photo/banner (${item}).jpg`} alt="Prod" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="font-black text-xs text-secondary mb-1 italic uppercase tracking-tighter">Premium Item #{i+1}</h4>
              <p className="text-sm font-black text-primary-dark">Rp 45.000</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-secondary py-12 px-6 text-center">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="font-black italic text-2xl text-white">THE JAGO STORE</div>
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Link href="#" className="hover:text-primary">WhatsApp</Link>
            <Link href="#" className="hover:text-primary">Instagram</Link>
            <Link href="#" className="hover:text-primary">Maps</Link>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">© 2026 THE JAGO STORE CIANJUR</p>
        </div>
      </footer>
    </div>
  )
}

function ChevronRight({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
}
