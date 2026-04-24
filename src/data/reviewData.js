import { hashToSeed } from '../utils/dailyRandom.js';

export const MARKETPLACE_SOURCES = [
  { key: 'shopee', label: 'Shopee' },
  { key: 'lazada', label: 'Lazada' },
  { key: 'tiktokshop', label: 'TikTok Shop' },
  { key: 'googlemaps', label: 'Google Maps' },
];

const NAME_POOL = [
  'Budi Santoso',
  'Siti Rahayu',
  'Ahmad Fauzi',
  'Dewi Lestari',
  'Rizky Pratama',
  'Nadia Azzahra',
  'Rina Kartika',
  'Fajar Nugroho',
  'Yuni Marlina',
  'Agus Setiawan',
  'Dian Permata',
  'Indra Gunawan',
  'Aulia Rahman',
  'Lina Handayani',
  'Reza Maulana',
  'Putri Ayu',
  'Hendra Saputra',
  'Maya Sari',
  'Naufal Hidayat',
  'Tiara Anjani',
  'Bagas Wibowo',
  'Nabila Safitri',
  'Yoga Prasetyo',
  'Vina Oktaviani',
  'Ardiansyah',
  'Mutia Ramadhani',
  'Dimas Kurniawan',
  'Salsa Putri',
  'Rifki Alfarizi',
  'Wulan Puspita',
  'Ari Kurnia',
  'Rani Maharani',
  'Zaki Mubarok',
  'Farah Nabila',
  'Arif Hidayat',
  'Bella Citra',
  'Galih Saptono',
  'Intan Nurhaliza',
  'Hafiz Ramdan',
  'Mira Anggraini',
  'Doni Saputra',
  'Citra Lestari',
  'Yusuf Maulana',
  'Mega Puspitasari',
  'Asep Kurnia',
  'Nina Larasati',
  'Iqbal Ramadhan',
  'Siska Wati',
  'Hani Nuraini',
  'Raka Pradana',
  'Novi Amelia',
  'Bayu Aditya',
  'Aisyah Zahra',
  'Reno Satria',
  'Luthfi Hakim',
  'Della Fitri',
  'Rizal Akbar',
  'Nisa Rahma',
  'Eka Setiani',
  'Dewangga Putra',
  'Yohana Sari',
  'Fikri Syahputra',
  'Syarifa Nabila',
  'Yuda Prakoso',
  'Riska Ayuningrum',
  'Ilham Maulana',
  'Ratna Dewi',
  'Vicky Saputra',
  'Mila Handayani',
  'Anwar Hidayat',
  'Kezia Natalia',
  'Naufal Firdaus',
  'Nadya Clarissa',
  'Ariq Fadillah',
  'Winda Khairani',
  'Roni Setiawan',
  'Niken Maharani',
  'Rendy Prabowo',
  'Suci Lestari',
  'Fahmi Ramadhan',
  'Laila Nuraini',
];

const PROVINCE_LOCALITIES = [
  { province: 'Aceh', cities: ['Banda Aceh', 'Lhokseumawe'] },
  { province: 'Sumatera Utara', cities: ['Medan', 'Pematangsiantar'] },
  { province: 'Sumatera Barat', cities: ['Padang', 'Bukittinggi'] },
  { province: 'Riau', cities: ['Pekanbaru', 'Dumai'] },
  { province: 'Kepulauan Riau', cities: ['Batam', 'Tanjungpinang'] },
  { province: 'Jambi', cities: ['Jambi', 'Sungai Penuh'] },
  { province: 'Sumatera Selatan', cities: ['Palembang', 'Lubuklinggau'] },
  { province: 'Bangka Belitung', cities: ['Pangkalpinang', 'Toboali'] },
  { province: 'Bengkulu', cities: ['Bengkulu', 'Argamakmur'] },
  { province: 'Lampung', cities: ['Bandar Lampung', 'Metro'] },
  { province: 'DKI Jakarta', cities: ['Jakarta Selatan', 'Jakarta Timur'] },
  { province: 'Jawa Barat', cities: ['Bandung', 'Bogor', 'Depok', 'Bekasi', 'Cirebon', 'Tasikmalaya'] },
  { province: 'Jawa Tengah', cities: ['Semarang', 'Solo', 'Purwokerto'] },
  { province: 'DI Yogyakarta', cities: ['Yogyakarta', 'Sleman'] },
  { province: 'Jawa Timur', cities: ['Surabaya', 'Malang', 'Kediri'] },
  { province: 'Banten', cities: ['Serang', 'Tangerang', 'Cilegon'] },
  { province: 'Bali', cities: ['Denpasar', 'Singaraja'] },
  { province: 'Nusa Tenggara Barat', cities: ['Mataram', 'Bima'] },
  { province: 'Nusa Tenggara Timur', cities: ['Kupang', 'Maumere'] },
  { province: 'Kalimantan Barat', cities: ['Pontianak', 'Singkawang'] },
  { province: 'Kalimantan Tengah', cities: ['Palangka Raya', 'Sampit'] },
  { province: 'Kalimantan Selatan', cities: ['Banjarmasin', 'Banjarbaru'] },
  { province: 'Kalimantan Timur', cities: ['Samarinda', 'Balikpapan'] },
  { province: 'Kalimantan Utara', cities: ['Tarakan', 'Tanjung Selor'] },
  { province: 'Sulawesi Utara', cities: ['Manado', 'Bitung'] },
  { province: 'Gorontalo', cities: ['Gorontalo', 'Limboto'] },
  { province: 'Sulawesi Tengah', cities: ['Palu', 'Luwuk'] },
  { province: 'Sulawesi Barat', cities: ['Mamuju', 'Majene'] },
  { province: 'Sulawesi Selatan', cities: ['Makassar', 'Parepare'] },
  { province: 'Sulawesi Tenggara', cities: ['Kendari', 'Baubau'] },
  { province: 'Maluku', cities: ['Ambon', 'Tual'] },
  { province: 'Maluku Utara', cities: ['Ternate', 'Tidore'] },
  { province: 'Papua', cities: ['Jayapura', 'Sentani'] },
  { province: 'Papua Barat', cities: ['Manokwari', 'Fakfak'] },
  { province: 'Papua Selatan', cities: ['Merauke', 'Tanah Miring'] },
  { province: 'Papua Tengah', cities: ['Nabire', 'Timika'] },
  { province: 'Papua Pegunungan', cities: ['Wamena', 'Dekai'] },
  { province: 'Papua Barat Daya', cities: ['Sorong', 'Aimas'] },
];

const PROVINCE_WEIGHTS = {
  'Jawa Barat': 12,
  'Jawa Tengah': 4,
  'Jawa Timur': 4,
  'DKI Jakarta': 3,
  Banten: 3,
  'Sumatera Utara': 2,
  'Sulawesi Selatan': 2,
  Bali: 2,
};

const REVIEW_BASE_TEXTS = [
  'Produk datang sesuai deskripsi dan kualitasnya bagus.',
  'Packing rapi, tidak ada kebocoran, semua item aman.',
  'Pengiriman cepat, kurir juga informatif saat antar barang.',
  'Harga bersaing dibanding toko lain dan kualitas tetap oke.',
  'Stok lengkap untuk kebutuhan harian dan bulanan.',
  'Ukuran produk sesuai, tidak ada selisih dengan deskripsi.',
  'Admin fast response waktu saya tanya varian produk.',
  'Barang yang dikirim fresh dan tanggal kedaluwarsa masih panjang.',
  'Sudah beberapa kali order dan hasilnya selalu memuaskan.',
  'Promo diskonnya membantu banget buat belanja rutin.',
  'Kualitas tetap konsisten meski order dalam jumlah banyak.',
  'Proses checkout sampai kirim berjalan lancar tanpa kendala.',
  'Seller amanah, barang sesuai foto dan tidak mengecewakan.',
  'Harga hemat tapi kualitas tidak murahan.',
  'Saya suka karena pilihan produknya banyak dan jelas.',
  'Barang tiba dalam kondisi dingin untuk produk frozen.',
  'Label produk jelas dan mudah dicek saat diterima.',
  'Order malam, pagi diproses, sore sudah dikirim.',
  'Belanja di sini bikin hemat waktu karena serba lengkap.',
  'Sudah direkomendasikan ke keluarga karena pelayanannya bagus.',
  'Kualitas bumbu dan bahan masak terjaga, aromanya masih fresh.',
  'Setiap paket datang tepat dan jarang ada item kurang.',
  'Harga promo tetap masuk akal setelah ongkir.',
  'Seller kasih update status order dengan jelas.',
  'CS ramah dan sabar menjawab pertanyaan detail produk.',
  'Produk diterima dalam kondisi bersih dan higienis.',
  'Sangat membantu untuk stok dapur mingguan di rumah.',
  'Kualitas sesuai ekspektasi, tidak ada komplain berarti.',
  'Packaging tebal jadi aman walau perjalanan jauh.',
  'Baru coba pertama kali, ternyata hasilnya bagus.',
];

const PRODUCT_CONTEXT = [
  'Frozen food',
  'Bumbu dapur',
  'Sembako harian',
  'Snack keluarga',
  'Kebutuhan katering',
  'Perlengkapan masak',
  'Stok warung kecil',
  'Bahan masak mingguan',
  'Produk ready to cook',
  'Stok kulkas rumah',
  'Kebutuhan usaha kuliner',
  'Paket belanja bulanan',
];

const DELIVERY_NOTES = [
  'Estimasi pengiriman sesuai aplikasi.',
  'Barang sampai tanpa kerusakan.',
  'Kurir mengantar sesuai jadwal.',
  'Proses packing terlihat sangat rapi.',
  'Semua item masuk lengkap.',
  'Tidak ada kemasan penyok atau sobek.',
  'Pengiriman relatif cepat untuk area saya.',
  'Pesanan datang tepat waktu.',
  'Suhu produk frozen masih terjaga.',
  'Tidak ada item yang tertukar.',
];

const SERVICE_NOTES = [
  'Seller juga cepat kasih solusi saat saya revisi pesanan.',
  'Akan saya order lagi minggu depan.',
  'Semoga varian promo terus ditambah.',
  'Recommended untuk yang cari toko langganan.',
  'Respon chat cepat, jadi enak untuk repeat order.',
  'Sangat cocok untuk kebutuhan rumah tangga.',
  'Kualitas layanan tetap bagus meski order saat jam ramai.',
  'Secara keseluruhan pengalaman belanja sangat memuaskan.',
];

function buildWeightedProvinceIndices() {
  const indices = [];

  PROVINCE_LOCALITIES.forEach((entry, index) => {
    const weight = PROVINCE_WEIGHTS[entry.province] || 1;
    for (let i = 0; i < weight; i += 1) {
      indices.push(index);
    }
  });

  return indices;
}

const WEIGHTED_PROVINCE_INDICES = buildWeightedProvinceIndices();

function pickProvinceRecord(globalIndex) {
  if (globalIndex < PROVINCE_LOCALITIES.length) {
    return PROVINCE_LOCALITIES[globalIndex];
  }

  const weightedIndex = (globalIndex * 13 + 17) % WEIGHTED_PROVINCE_INDICES.length;
  return PROVINCE_LOCALITIES[WEIGHTED_PROVINCE_INDICES[weightedIndex]];
}

function buildLocation(globalIndex) {
  const provinceRecord = pickProvinceRecord(globalIndex);
  const cityIndex = (globalIndex * 5 + 3) % provinceRecord.cities.length;

  return {
    city: provinceRecord.cities[cityIndex],
    province: provinceRecord.province,
    text: `${provinceRecord.cities[cityIndex]}, ${provinceRecord.province}`,
  };
}

function avatarFromSource(name, locationText, index) {
  const encodedName = encodeURIComponent(name);
  const encodedSeed = encodeURIComponent(`${name}-${locationText}`);
  const pravatarId = (index % 70) + 1;
  const randomUserId = (index % 99) + 1;
  const gender = index % 2 === 0 ? 'men' : 'women';

  switch (index % 4) {
    case 0:
      return `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=128`;
    case 1:
      return `https://i.pravatar.cc/128?img=${pravatarId}`;
    case 2:
      return `https://api.dicebear.com/7.x/personas/svg?seed=${encodedSeed}`;
    default:
      return `https://randomuser.me/api/portraits/${gender}/${randomUserId}.jpg`;
  }
}

function ratingFromIndex(index) {
  const pattern = [5, 4, 5, 4, 3, 5, 4, 2, 5, 4, 5, 3];
  return pattern[index % pattern.length];
}

function buildReviewText(index, location) {
  const base = REVIEW_BASE_TEXTS[index % REVIEW_BASE_TEXTS.length];
  const context = PRODUCT_CONTEXT[(index * 3 + 7) % PRODUCT_CONTEXT.length];
  const delivery = DELIVERY_NOTES[(index * 5 + 11) % DELIVERY_NOTES.length];
  const service = SERVICE_NOTES[(index * 7 + 13) % SERVICE_NOTES.length];

  let text = `${base} ${context}. ${delivery}`;

  if (index % 2 === 0) {
    text += ` ${service}`;
  }

  if (index % 3 === 0) {
    text += ` Saya order dari ${location.city}.`;
  }

  if (index % 5 === 0) {
    text += ' Cocok untuk langganan bulanan.';
  }

  return text;
}

function buildName(globalIndex, sourceKey, province) {
  const seedValue = hashToSeed(`${sourceKey}-${province}-${globalIndex}`);
  const nameIndex = (seedValue + globalIndex * 3) % NAME_POOL.length;
  return NAME_POOL[nameIndex];
}

function buildReviewPool() {
  const reviewsPerSource = 24;

  return MARKETPLACE_SOURCES.flatMap((source, sourceIndex) => {
    return Array.from({ length: reviewsPerSource }, (_, idx) => {
      const globalIndex = sourceIndex * reviewsPerSource + idx;
      const location = buildLocation(globalIndex);
      const name = buildName(globalIndex, source.key, location.province);
      const helpfulBase = 2 + (hashToSeed(`${source.key}-${name}-${globalIndex}`) % 230);

      return {
        id: `${source.key}-${String(idx + 1).padStart(2, '0')}`,
        source: source.key,
        name,
        location: location.text,
        rating: ratingFromIndex(globalIndex),
        review: buildReviewText(globalIndex, location),
        daysAgo: ((globalIndex * 9) % 30) + 1,
        verified: globalIndex % 7 !== 0,
        helpful: globalIndex % 6 === 0 ? undefined : helpfulBase,
        avatar: avatarFromSource(name, location.text, globalIndex),
      };
    });
  });
}

export const REVIEW_POOL = buildReviewPool();
