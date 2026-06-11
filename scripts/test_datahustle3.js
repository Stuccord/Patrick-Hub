// Look at the DataHustle JS bundles to find actual API endpoint paths used
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

async function tryEndpoint(method, path, body, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    if (res.status !== 404) {
      console.log(`\n✅ ${method} ${path} [${res.status}]`);
      console.log('Response:', JSON.stringify(json, null, 2));
    }
    return { status: res.status, data: json };
  } catch (err) {
    if (err.message.includes('fetch')) return null;
    console.log(`ERROR ${path}: ${err.message}`);
  }
}

// From site analysis, network slugs are: mtnup2u, at-ishare, TELECEL
// Try paths with these in them
async function main() {
  const authHeaders = { 'api-key': apiKey };
  
  const guessPaths = [
    // From site network slugs
    '/mtnup2u', '/at-ishare', '/telecel',
    // reseller API patterns
    '/reseller/data', '/reseller/order', '/reseller/bundle',
    '/api/reseller', '/api/reseller/data', '/api/reseller/order',
    // common patterns
    '/send-data', '/senddata',
    '/agent/data', '/agent/order',
    '/wholesale/order', '/wholesale/data',
    '/v2/order', '/v2/data',
    // From GigzHub-like APIs
    '/order/data', '/order/bundle',
    '/data/order', '/bundle/order',
    // Checking with network in path
    '/data/mtn', '/data/telecel', '/data/airteltigo',
    // USSD/ISP-style
    '/topup', '/topup/data',
    // With api prefix
    '/api/order/data', '/api/data/order', '/api/topup',
    '/api/buy', '/api/send',
    // Try with version
    '/v1/order', '/v1/data', '/v1/buy',
    '/v1/reseller/order',
  ];

  console.log('Testing GET endpoints...');
  for (const path of guessPaths) {
    const r = await tryEndpoint('GET', path, null, authHeaders);
    if (r && r.status !== 404) {
      console.log(`Found GET: ${path} -> ${r.status}`);
    }
  }

  // Now try POST with data payloads (MTN style)
  const payloads = [
    { network: 'MTNUP2U', phone: '0241234567', capacity: '1' },
    { network: 'mtnup2u', phone: '0241234567', volume: '1' },
    { network: 'MTN', phone: '0241234567', data_plan: '1' },
    { network: 'MTN', recipient: '0241234567', plan: '1GB' },
  ];
  
  const postPaths = ['/order/data', '/data/order', '/reseller/order', '/v1/order', '/api/order'];

  console.log('\nTesting POST endpoints...');
  for (const path of postPaths) {
    for (const payload of payloads.slice(0, 2)) {
      const r = await tryEndpoint('POST', path, payload, authHeaders);
      if (r && r.status !== 404) {
        console.log(`Found POST: ${path} -> ${r.status}`);
      }
    }
  }

  console.log('\nDone.');
}

main().catch(console.error);
