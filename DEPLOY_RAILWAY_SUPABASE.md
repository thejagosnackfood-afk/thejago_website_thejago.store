# Deploy Railway + WhatsApp + Supabase (Agar Stabil Online)

Dokumen ini khusus untuk project ini (`server.js` + static `public/backend`).

## 1) Persiapan

- Pastikan project sudah di-push ke GitHub.
- Siapkan 2 set kredensial:
  - WhatsApp gateway (URL endpoint + token)
  - Supabase (URL + key)

## 2) Deploy ke Railway

1. Buat project baru di Railway.
2. Pilih `Deploy from GitHub Repo` lalu pilih repo ini.
3. Railway akan baca `railway.toml` otomatis.
4. Pastikan setting service:
- Start command: `node server.js`
- Health check path: `/health`

## 3) Environment Variables yang wajib

Set di Railway Variables:

- `SERVICE_NAME=thejago-whatsapp`
- `WHATSAPP_GATEWAY_URL=https://...` (endpoint gateway WA milik kamu)
- `WHATSAPP_GATEWAY_TOKEN=...`
- `WHATSAPP_GATEWAY_AUTH_HEADER=Authorization`
- `WHATSAPP_GATEWAY_TOKEN_PREFIX=Bearer`
- `WHATSAPP_DRY_RUN=false`
- `SUPABASE_URL=https://xxxx.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=...` (server-only, jangan dipublish)
- `NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

Catatan:
- Jika gateway WA belum siap, set `WHATSAPP_DRY_RUN=true` agar API tetap hidup tanpa kirim pesan nyata.
- `PORT` tidak perlu diisi manual, Railway inject otomatis.

## 4) Endpoint penting setelah deploy

- `GET /health` -> cek service hidup
- `GET /health/deps` -> cek dependency (termasuk Supabase)
- `POST /api/whatsapp/send` -> kirim pesan ke gateway WA

Contoh body request:

```json
{
  "to": "62812xxxxxxx",
  "message": "Tes dari Railway"
}
```

## 5) Agar tetap online

- Gunakan plan Railway yang tidak menidurkan service.
- Tambahkan uptime monitor eksternal (mis. UptimeRobot) untuk ping `GET /health` tiap 5 menit.
- Aktifkan alert bila status non-200.

## 6) Validasi cepat setelah live

1. Buka `/health`, pastikan `ok: true`.
2. Buka `/health/deps`, pastikan `supabase.ok: true`.
3. Tes `POST /api/whatsapp/send` dengan nomor kamu.
4. Cek log Railway untuk memastikan tidak ada `Gateway error`.

## 7) Keamanan penting

- Jangan commit `.env.local` ke repo.
- Simpan `SUPABASE_SERVICE_ROLE_KEY` hanya di server env Railway.
- Jika token pernah terbuka di chat/log, lakukan rotate token di dashboard provider.
