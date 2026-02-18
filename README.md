# The Jago Snack & Frozen Food (MVP)

Monorepo sederhana:
- Backend API: `todo-app/website` (Express + MongoDB + OpenAI + Midtrans)
- Frontend: `todo-app/frontend` (React + Vite)

## Backend (Express)

Lokasi: `todo-app/website`

Env:
- Copy `todo-app/website/.env.example` ke `.env`
- Isi minimal: `MONGO_URI`
- Jika ingin fitur CS chat: set `OPENAI_API_KEY` di `todo-app/website/.env` (jangan taruh API key di README)
- Jika ingin Midtrans: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`
- Jika ingin seed: `ADMIN_SEED_TOKEN`
- Untuk admin panel (ToolJet via API): set `ADMIN_API_TOKEN` (header `x-admin-token`)
- WhatsApp OTP:
  - Dev: `WHATSAPP_PROVIDER=mock` + `WHATSAPP_MOCK=true` (OTP akan dikembalikan sebagai `mockCode`)
  - Production: perlu integrasi provider WhatsApp sungguhan di `todo-app/website/src/services/whatsapp.js`

Run:
```bash
cd todo-app/website
npm install
npm start
```

Endpoint utama:
- `GET /api/health`
- `GET /api/categories`
- `GET /api/products?category=baso`
- `GET /api/products?tag=recommended|discount|flashSale|mostViewed`
- `POST /api/auth/register` / `POST /api/auth/login`
- `POST /api/auth/whatsapp/request` / `POST /api/auth/whatsapp/verify`
- `GET /api/cart` / `POST /api/cart/items`
- `POST /api/orders` (butuh `whatsappVerified=true`)
- `POST /api/payments/midtrans/snap-token`
- `POST /api/payments/midtrans/notification` (callback Midtrans)
- `POST /api/admin/seed` (header `x-admin-token`)
- `POST /api/admin/google-reviews` (header `x-admin-token`)

Admin CRUD (untuk ToolJet):
- `GET /api/admin/categories` (header `x-admin-token`)
- `POST /api/admin/categories` (header `x-admin-token`)
- `GET /api/admin/products` (header `x-admin-token`)
- `POST /api/admin/products` (header `x-admin-token`)
- `GET /api/admin/orders` (header `x-admin-token`)

Seed data contoh:
```bash
curl -X POST http://localhost:3000/api/admin/seed -H "x-admin-token: <ADMIN_API_TOKEN>"
```

Isi ulasan Google Maps (via admin endpoint):
```bash
curl -X POST http://localhost:3000/api/admin/google-reviews \
  -H "Content-Type: application/json" \
  -H "x-admin-token: <ADMIN_API_TOKEN>" \
  -d '{"reviews":[{"authorName":"Google User","rating":5,"text":"Enak dan cepat!"}]}'
```

## Frontend (React)

Lokasi: `todo-app/frontend`

Env:
- Copy `todo-app/frontend/.env.example` ke `.env`
- Isi:
  - `VITE_API_BASE=http://localhost:3000`
  - `VITE_MIDTRANS_CLIENT_KEY=...`
  - `VITE_MIDTRANS_IS_PRODUCTION=false|true`

Run:
```bash
cd todo-app/frontend
npm install
npm run dev
```

UI yang dibuat:
- Layout 3 kolom desktop: produk (tengah), sidebar rekomendasi/diskon/flash sale (kanan), kategori (paling kanan)
- Kategori klik untuk filter produk
- Produk menampilkan gambar + harga + badge discount/flash sale/rekomendasi
- “Sering Dilihat” di bawah (berdasarkan `viewCount`)
- 5 ulasan pembeli (website) + slot ulasan Google (dari DB)
- Popup daftar/masuk otomatis saat keranjang >= 2 produk (guest)
- Verifikasi WhatsApp via OTP sebelum checkout
- Chat CS (OpenAI) di pojok kanan bawah
