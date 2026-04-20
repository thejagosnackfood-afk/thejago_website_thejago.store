---
name: thejago-calculator
description: Logika perhitungan profit marketplace (Shopee, Lazada, TikTok, Food) untuk The Jago Store. Digunakan untuk menghitung estimasi profit bersih dan biaya admin secara otomatis.
---

# The Jago Calculator Logic

Gunakan logika ini untuk menghitung profit bersih dan biaya admin berdasarkan platform marketplace.

## 1. Konfigurasi Biaya Admin (MASTER_CONFIG)

| Platform | Fee Dasar (%) | Biaya Tetap (Rp) | Program Tambahan (Default Aktif) |
|----------|---------------|------------------|-----------------------------------|
| **Shopee** | 5.75% | 1.250 | Non-Star Admin (4.5%), Gratis Ongkir XTRA (4%) |
| **Lazada** | 3.93% | 250 | Biaya Transaksi (1.82%), Free Ship Max (4.49%) |
| **TikTok** | 5.75% | 1.250 | Layanan Teknis (9.5%) |
| **GoFood** | 20.0% | 0 | - |
| **GrabFood**| 8.0% | 0 | Layanan Grab (0.7928%) |
| **ShopeeFood**| 24.8% | 0 | - |

## 2. Rumus Perhitungan

1. **Total Admin Fee**:
   `Fee Dasar % + (Program Tambahan % yang aktif)` dari Harga Jual + Biaya Tetap.
   
2. **Biaya Operasional**:
   `Biaya Kemasan + Iklan + Biaya Lain-lain`.

3. **Uang Masuk Rekening (Net Income)**:
   `Harga Jual - Total Admin Fee`.

4. **Profit Bersih**:
   `Net Income - HPP (Modal) - Biaya Operasional`.

## 3. Instruksi Penggunaan Agen
- Jika user bertanya: "Hitung profit Shopee harga 100rb modal 50rb", gunakan data di atas.
- Selalu rincikan potongan admin agar transparan.
- Jika platform tidak disebutkan, tanyakan atau asumsikan Shopee sebagai default.
