# MEMO Audio — AI Product Generator (Vercel Version)

## วิธี Deploy บน Vercel

### ขั้นตอนที่ 1: อัปโหลดไฟล์ขึ้น GitHub Repository เดิม
เปิด Repository ที่สร้างไว้ → อัปโหลดไฟล์ทั้งหมดนี้แทนที่ของเดิม

### ขั้นตอนที่ 2: Deploy บน Vercel
1. ไป vercel.com → New Project → Import GitHub repo นั้น
2. Framework Preset: **Other**
3. กด Deploy

### ขั้นตอนที่ 3: ตั้งค่า API Key
1. Vercel Dashboard → Project → Settings → **Environment Variables**
2. Name: `ANTHROPIC_API_KEY`
3. Value: API Key จาก console.anthropic.com
4. กด Save → **Redeploy**

## โครงสร้างไฟล์
```
memo-vercel/
├── index.html        ← Frontend
├── api/
│   └── generate.js   ← Backend (Vercel Serverless Function)
├── vercel.json       ← Config timeout 30s
└── README.md
```
