
const XLSX = require("xlsx");
const fs = require("fs");

const fileBuf = fs.readFileSync("F:/Users/Jarvis/Downloads/ONLINE/shopeeseller.csv");
const workbook = XLSX.read(fileBuf, { type: "buffer" });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

// Find header
let nameIdx = -1, priceIdx = -1, headerRowIdx = -1;
for (let r = 0; r < Math.min(10, aoa.length); r++) {
    const row = aoa[r];
    for (let c = 0; c < row.length; c++) {
        const cell = String(row[c]).toLowerCase().trim();
        if (["nama produk", "product_name", "et_title_product_name", "nama menu", "*itemname", "product name", "nama"].includes(cell)) nameIdx = c;
        if (["harga", "price", "et_title_variation_price", "*price", "harga ritel (mata uang lokal)", "harga jual", "harga produk"].includes(cell)) priceIdx = c;
    }
    if (nameIdx !== -1 && priceIdx !== -1) {
        headerRowIdx = r;
        break;
    }
}

console.log("Header row:", headerRowIdx, "Name idx:", nameIdx, "Price idx:", priceIdx);
for (let r = 0; r < 5; r++) {
    console.log(aoa[r].slice(0, 4));
}

