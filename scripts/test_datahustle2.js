const fs = require('fs');
const path = require('path');

function getApiKey() {
  if (process.env.DATAHUSTLE_API_KEY) return process.env.DATAHUSTLE_API_KEY;
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/DATAHUSTLE_API_KEY\s*=\s*(.*)/);
    if (match) return match[1].trim();
  } catch (e) {}
  return '';
}

const apiKey = getApiKey();
const BASE_URL = 'https://api.datahustle.shop';

async function testPOST(path, body, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  };
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    console.log(`\n=== POST ${path} [${res.status}] ===`);
    console.log('Headers used:', JSON.stringify(headers));
    console.log('Body:', JSON.stringify(body));
    console.log('Response:', JSON.stringify(json, null, 2));
    return { status: res.status, data: json };
  } catch (err) {
    console.log(`\n=== POST ${path} [ERROR] ===`);
    console.log(err.message);
  }
}

async function main() {
  const samplePayload = {
    network: 'MTN',
    phone: '0241234567',
    data_plan: '1',
    volume: '1',
  };

  // Try various order endpoints with different auth formats
  const paths = [
    '/order',
    '/orders',
    '/buy',
    '/purchase',
    '/data',
    '/data-bundle',
    '/bundle',
    '/top-up',
  ];

  const authVariants = [
    { 'api-key': apiKey },
    { 'x-api-key': apiKey },
    { 'Authorization': `Bearer ${apiKey}` },
    { 'apiKey': apiKey },
  ];

  for (const path of paths) {
    for (const headers of authVariants.slice(0, 2)) { // Test just first 2 auth variants for brevity
      await testPOST(path, samplePayload, headers);
    }
  }
}

main().catch(console.error);
