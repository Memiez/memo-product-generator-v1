# MEMO Audio — AI Product Description Generator

Web app สำหรับ Generate Thai SEO Description สำหรับ WooCommerce โดยอัตโนมัติ

## วิธี Deploy บน Netlify (ฟรี)

### ขั้นตอนที่ 1: อัปโหลดไปยัง GitHub
1. สร้าง GitHub account (ถ้ายังไม่มี): https://github.com
2. สร้าง Repository ใหม่ (กด New → ตั้งชื่อ เช่น `memo-product-generator`)
3. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น Repository
   - ทางง่าย: ลาก Drop ไฟล์ทั้งหมดเข้า GitHub web interface

### ขั้นตอนที่ 2: Connect Netlify
1. ไปที่ https://netlify.com → Sign up (ฟรี)
2. กด "Add new site" → "Import an existing project"
3. เลือก GitHub → เลือก Repository ที่สร้างไว้
4. Build settings: ไม่ต้องแก้ไขอะไร (อ่านจาก netlify.toml อัตโนมัติ)
5. กด "Deploy site"

### ขั้นตอนที่ 3: ตั้งค่า API Key (สำคัญมาก)
1. ใน Netlify Dashboard → เลือก Site ของคุณ
2. ไปที่ **Site configuration → Environment variables**
3. กด "Add a variable"
4. Key: `ANTHROPIC_API_KEY`
5. Value: ใส่ API Key ของคุณจาก https://console.anthropic.com
6. กด Save → **Redeploy site**

### ขั้นตอนที่ 4: ใช้งาน
- เปิด URL ที่ Netlify ให้มา (เช่น `memo-generator.netlify.app`)
- ใส่ชื่อสินค้า เลือกแบรนด์ กด Generate
- รอประมาณ 15-25 วินาที
- Review → Approve → Export CSV

## โครงสร้างไฟล์
```
memo-generator/
├── index.html                    ← Frontend (UI ทั้งหมด)
├── netlify/
│   └── functions/
│       └── generate.js           ← Backend Proxy (เรียก Anthropic API)
├── netlify.toml                  ← Config (timeout 26s)
└── README.md                     ← ไฟล์นี้
```

## วิธีเพิ่มแบรนด์
เปิด `index.html` → หาบรรทัดนี้:
```html
<select id="pbrand">
  <option>Focusrite</option>
  ...
```
เพิ่ม `<option>ชื่อแบรนด์</option>` เข้าไปได้เลย

จากนั้นเปิด `netlify/functions/generate.js` → หา `BRAND_SITES` → เพิ่ม:
```js
'ชื่อแบรนด์': 'official-website.com',
```

## ค่าใช้จ่าย
- Netlify Free Tier: ฟรี (125,000 function calls/เดือน)
- Anthropic API: ประมาณ $0.003-0.01 ต่อสินค้า 1 ชิ้น
  (Claude Sonnet ~$3 ต่อ 1,000 ชิ้น)

## หมายเหตุ
- Timeout 26 วินาที (Netlify Free tier สูงสุด)
- ถ้า Timeout บ่อย: Upgrade เป็น Netlify Pro หรือลดการใช้ Web Search
- API Key ต้องเก็บเป็นความลับ ห้าม commit ลง GitHub
