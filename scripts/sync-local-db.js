const fs = require('fs');
const readline = require('readline');
const path = require('path');

const SQL_FILE_PATH = path.join(__dirname, '../env/sample database/contoh_database.py');
const OUTPUT_FILE = path.join(__dirname, '../data/products.json');

const categoryMap = {
  'BERAS': 'beras', 'MINYAK GORENG': 'minyak', 'MINYAK': 'minyak', 'GULA': 'gula',
  'TERIGU': 'tepung', 'TEPUNG': 'tepung', 'TELUR': 'telur', 'TELOR': 'telur',
  'KACANG': 'kacang-jamur', 'JAMUR': 'kacang-jamur', 'SUSU': 'susu', 'MIE': 'mie',
  'SAUS': 'saus', 'SAOS': 'saus', 'KECAP': 'saus', 'CUKA': 'saus',
  'NUGGET': 'nugget', 'SOSIS': 'sosis', 'BAKSO': 'bakso', 'BASO': 'bakso',
  'KERUPUK': 'kerupuk', 'SNACK': 'kerupuk', 'PLASTIK': 'plastik-kemasan', 'KRESEK': 'plastik-kemasan',
  'BATAGOR': 'batagor-siomay', 'SIOMAY': 'batagor-siomay', 'MINUMAN': 'minuman',
  'KOPI': 'kopi-teh', 'TEH': 'kopi-teh', 'ROKOK': 'rokok', 'FROZEN': 'frozen-food',
  'BAHAN KUE': 'bahan-kue', 'AGAR-AGAR': 'puding-jelly', 'ROTI': 'roti-kue'
};

const keywordMap = [
  { keywords: ['BERAS'], target: 'beras' },
  { keywords: ['MINYAK', 'BIMOLI', 'SUNCO', 'TROPICAL', 'FILMA', 'FORTUNE', 'SOVIA', 'SANIA'], target: 'minyak' },
  { keywords: ['GULA', 'GULAKU'], target: 'gula' },
  { keywords: ['TEPUNG', 'TERIGU', 'SEGITIGA BIRU', 'CAKRA KEMBAR', 'KUNCI BIRU', 'ACI', 'MAIZENA', 'SAGU'], target: 'tepung' }, // Aci masuk Tepung
  { keywords: ['INDOMIE', 'MIE', 'SOUN', 'BIHUN', 'SPAGHETI', 'LA FONTE', 'SEDANI', 'MISOA', 'MAKARONI', 'WOW'], target: 'mie' },
  { keywords: ['KECAP', 'SAUS', 'SAOS', 'SAMBAL', 'CUKA', 'SAORI', 'MAMAYO', 'MAYO'], target: 'saus' },
  { keywords: ['TELUR', 'TELOR'], target: 'telur' },
  { keywords: ['SUSU', 'UHT', 'INDOMILK', 'ULTRA', 'CIMORY', 'YOGURT', 'YAKULT', 'MILO', 'CREAM', 'KARA'], target: 'susu' },
  { keywords: ['BATAGOR', 'SIOMAY', 'CILOK', 'CIMOL', 'CUANKI'], target: 'batagor-siomay' }, // Cuanki masuk Batagor/Siomay
  { keywords: ['NUGGET', 'NAGGET', 'NAGET'], target: 'nugget' },
  { keywords: ['SOSIS', 'SONICE', 'KIMBO', 'BASIS'], target: 'sosis' },
  { keywords: ['BAKSO', 'BASO', 'PENTOL', 'BACITUL'], target: 'bakso' },
  { keywords: ['FROZEN', 'BEKU', 'SLICE', 'DUMPLING', 'CEDEA', 'MITRAKU', 'CIRENG', 'KENTANG', 'FIESTA', 'SO GOOD', 'KANZLER', 'CHAMP', 'PEMPEK', 'DIMSUM', 'KEBAB', 'CHIKUWA', 'CUMI', 'ROLADE', 'PATTIES', 'BURGER', 'VEGETABLE MIX'], target: 'frozen-food' },
  { keywords: ['TEH', 'KOPI', 'KAPAL API', 'LUWAK', 'TORABIKA', 'SARIWANGI', 'SEKOTENG'], target: 'kopi-teh' },
  { keywords: ['AQUA', 'VIT', 'LE MINERALE', 'TEH KOTAK', 'MINUMAN', 'COCO'], target: 'minuman' },
  { keywords: ['PLASTIK', 'KRESEK', 'CUP', 'MIKA', 'KERESEK', 'GARPU', 'SENDOK', 'PIRING', 'SUMPIT', 'SEDOTAN', 'TUSUK', 'KERTAS NASI', 'TISU', 'TISSUE'], target: 'plastik-kemasan' }, // Digabung ke Plastik/Kemasan & Tools
  { keywords: ['KERUPUK', 'KRIPIK', 'CHIPS', 'STIK', 'OPAK', 'BABANGI', 'SNACK', 'RENGGINANG'], target: 'kerupuk' }, // Snack Tradisional Sunda
  { keywords: ['KACANG', 'JAMUR', 'PILUS', 'GARUDA', 'BEANS', 'PEAS'], target: 'kacang-jamur' },
  { keywords: ['ROKOK', 'GARRAN', 'SAMPOERNA', 'DJI SAM SOE', 'SURYA', 'MERAH', 'MAGNUM', 'DJARUM'], target: 'rokok' },
  { keywords: ['NUTRIJEL', 'AGAR', 'JELLY', 'PUDING', 'INACO', 'VLA'], target: 'puding-jelly' },
  { keywords: ['COKLAT', 'KEJU', 'KUPU', 'MESES', 'CERES', 'VANILLI', 'BAKING', 'PENGEMBANG', 'PASTA', 'MEG', 'PEWARNA'], target: 'bahan-kue' },
  { keywords: ['ROTI', 'KULIT LUMPIA', 'KULIT PANGSIT', 'AOKA', 'SARI ROTI', 'ULEN'], target: 'roti-kue' },
  { keywords: ['SARDEN', 'KORNET', 'ABON', 'KALENG', 'MAKANAN INSTAN', 'BOTAN', 'DEHO', 'MALING', 'WILMOND', 'TAHU', 'GEPUK'], target: 'makanan-instan' }
];

function getBumbuCategory(name, currentCat) {
  const n = name.toUpperCase();
  const c = currentCat.toUpperCase();
  const brands = ['ROYCO', 'MASAKO', 'SASA', 'AIDA', 'MDL', 'BUMAMI', 'MAMA SUKA', 'SINTI', 'DESAKU', 'RACIK', 'BANGO'];
  const commonBumbu = ['BAWANG', 'LADA', 'KETUMBAR', 'KUNYIT', 'JAHE', 'PALA', 'KEMIRI', 'KENCUR', 'CABE', 'CABAI', 'GARAM', 'TERASI', 'MERICA'];
  const isBumbu = c.includes('BUMBU') || c.includes('REMPAH') || brands.some(b => n.includes(b)) || commonBumbu.some(b => n.includes(b));
  if (!isBumbu) return null;
  if (n.includes('AYAM BAWANG')) return 'bumbu-ayam-bawang';
  if (n.includes('AYAM')) return 'bumbu-ayam';
  if (n.includes('SAPI')) return 'bumbu-sapi';
  if (n.includes('CABAI') || n.includes('CABE') || n.includes('AIDA') || n.includes('BONCABE') || n.includes('CHILI')) return 'bumbu-cabai';
  if (n.includes('KEJU')) return 'bumbu-keju';
  if (n.includes('BALADO')) return 'bumbu-balado';
  if (n.includes('JAGUNG')) return 'bumbu-jagung';
  return 'bumbu-lain';
}

async function sync() {
  console.log('--- Sinkronisasi Database Lokal (Deep Indo-Sunda Map) Dimulai ---');
  const fileStream = fs.createReadStream(SQL_FILE_PATH);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  const allProducts = [];
  let isInBarangInsert = false;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('(')) {
      if (trimmed.toLowerCase().includes('insert into') && trimmed.toLowerCase().includes('barang')) isInBarangInsert = true;
      else if (trimmed.includes(';')) isInBarangInsert = false;
      continue;
    }

    if (isInBarangInsert) {
      try {
        const cleanLine = trimmed.replace(/^\(/, '').replace(/\),?$/, '').replace(/;/g, '');
        const values = [];
        let current = '', inQuotes = false, quoteChar = '';
        for (let i = 0; i < cleanLine.length; i++) {
          const char = cleanLine[i];
          if ((char === '"' || char === "'") && cleanLine[i-1] !== '\\') {
            if (!inQuotes) { inQuotes = true; quoteChar = char; } 
            else if (char === quoteChar) inQuotes = false;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else current += char;
        }
        values.push(current.trim().replace(/^["']|["']$/g, ''));

        if (values.length > 24) {
          const name = values[1] || '';
          const cat = values[2] || '';
          const nameUpper = name.toUpperCase();
          let finalCategory = getBumbuCategory(name, cat);
          if (!finalCategory) {
            for (const item of keywordMap) {
              if (item.keywords.some(k => nameUpper.includes(k))) {
                finalCategory = item.target;
                break;
              }
            }
            if (!finalCategory) {
              finalCategory = categoryMap[cat.toUpperCase()] || 'lain-lain';
            }
          }
          allProducts.push({
            id: values[0], name, category: finalCategory,
            price: values[24] || '0', stock: values[21] || '0', unit: values[7] || 'PCS',
            img: `/sample-photo/banner (${Math.floor(Math.random() * 3) + 1}).jpg`
          });
        }
      } catch (e) {}
    }
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
  const stats = allProducts.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  console.log('Statistik Plotting Akhir:', stats);
}

sync();
