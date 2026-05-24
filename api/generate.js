const SYS = `You are a product content specialist for MEMO Audio (memoaudio.co.th), a Thai professional audio equipment retailer.

TASK: Search for accurate product specifications and generate SEO-optimized Thai product descriptions for WooCommerce.

STRICT RULES:
1. Search the official brand website FIRST. Then cross-check sweetwater.com or bhphotovideo.com.
2. ONLY include specs you verify from official/reliable sources. NEVER invent specifications.
3. If a spec cannot be verified, omit it or write "ตรวจสอบกับผู้ขาย".
4. Use correct Thai audio terminology.
5. HTML formatting: <h2> main heading, <h3> sub-sections, <ul><li> features, <strong> key specs.
6. SEO: include product name + brand + Thai keywords naturally.

RESPOND WITH ONLY VALID JSON — no markdown, no backticks, no text before or after:
{"product_name_th":"ชื่อสินค้า","meta_title":"SEO title max 60 chars","focus_keyword":"คีย์เวิร์ด","alt_keywords":["kw2","kw3"],"short_desc_th":"150-200 chars Thai excerpt","desc_th":"full HTML Thai description","key_specs":{"label":"value"},"category_suggestion":"Brand > Type","confidence":"high|medium|low","sources":["url1"],"warnings":["issue if any"]}`;

const BRAND_SITES = {
  'Focusrite':'focusrite.com','Universal Audio':'uaudio.com',
  'ADAM Audio':'adam-audio.com','AKG':'akg.com','Warm Audio':'warmaudio.com',
  'sE Electronics':'seelectronics.com','IK Multimedia':'ikmultimedia.com',
  'KRK':'krksys.com','Lewitt':'lewitt-audio.com','Moog':'moogmusic.com',
  'Sequential':'sequential.com','Novation':'novationmusic.com',
  'TASCAM':'tascam.com','Apogee':'apogeedigital.com','EAW':'eaw.com',
  'Numark':'numark.com','Denon DJ':'denondj.com','Rane DJ':'rane.com',
  'Alesis':'alesis.com','V-MODA':'v-moda.com',
};

async function callAnthropic(apiKey, messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: SYS,
      messages
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error ${res.status}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY ยังไม่ได้ตั้งค่า — ไปที่ Vercel → Project Settings → Environment Variables'
    });
  }

  const { productName, brand, sku, srp } = req.body || {};
  if (!productName || !brand) {
    return res.status(400).json({ error: 'productName and brand are required' });
  }

  const brandSite = BRAND_SITES[brand] || `${brand.toLowerCase().replace(/\s+/g,'')}.com`;
  const prompt = [
    `Generate accurate Thai WooCommerce product description for:`,
    `Product: ${productName}`,
    `Brand: ${brand} (official site: ${brandSite})`,
    sku ? `SKU: ${sku}` : '',
    srp ? `SRP: ฿${srp}` : '',
    ``,
    `Search ${brandSite} first, then verify with sweetwater.com or bhphotovideo.com. Return ONLY valid JSON.`
  ].filter(Boolean).join('\n');

  try {
    let messages = [{ role: 'user', content: prompt }];
    let data = await callAnthropic(apiKey, messages);

    let maxTurns = 4;
    while (data.stop_reason === 'tool_use' && maxTurns-- > 0) {
      const toolResults = (data.content || [])
        .filter(b => b.type === 'tool_use')
        .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: 'Search executed.' }));
      messages = [
        ...messages,
        { role: 'assistant', content: data.content },
        { role: 'user', content: toolResults }
      ];
      data = await callAnthropic(apiKey, messages);
    }

    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    if (!text) throw new Error('ไม่ได้รับ response จาก AI');

    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('ไม่พบ JSON ใน response: ' + text.slice(0, 200));

    const result = JSON.parse(m[0]);
    return res.status(200).json({ success: true, result });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
