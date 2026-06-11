// Test DataHustle reseller API with the api-key
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
const BASE = 'https://api.datahustle.shop';

async function test(method, path, body, headers) {
  const url = `${BASE}${path}`;
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
    console.log(`\n[${res.status}] ${method} ${path}`);
    console.log('Headers:', JSON.stringify(headers));
    if (body) console.log('Body:', JSON.stringify(body));
    console.log('Response:', JSON.stringify(json, null, 2));
    return { status: res.status, data: json };
  } catch (err) {
    console.log(`ERROR ${path}: ${err.message}`);
  }
}

async function main() {
  // Test 1: Check wallet/balance with reseller API key
  const authHeaders = [
    { 'api-key': apiKey },
    { 'x-api-key': apiKey },
    { 'Authorization': `Bearer ${apiKey}` },
    { 'x-auth-token': apiKey },
    { 'apikey': apiKey },
  ];

  console.log('=== Testing balance endpoints with reseller API key ===');
  const balanceEndpoints = [
    '/api/v1/deposit',
    '/api/v1/referrals/me',
    '/api/v1/data/today-summary/test',
    '/api/payments/claim',
    '/api/v1/user/balance',
    '/api/v1/reseller/balance',
    '/api/v1/reseller',
    '/api/v1/agent/balance',
    '/api/v1/balance',
  ];

  for (const h of authHeaders.slice(0, 3)) {
    for (const ep of balanceEndpoints.slice(0, 3)) {
      await test('GET', ep, null, h);
    }
  }

  // Test 2: Try the purchase-data endpoint with api-key (not user token)
  console.log('\n\n=== Testing purchase-data with API key ===');
  const purchasePayload = {
    phoneNumber: '0241234567',
    network: 'YELLO',
    capacity: '1',
    price: 4.20,
  };

  for (const h of authHeaders) {
    await test('POST', '/api/v1/data/purchase-data', purchasePayload, h);
  }

  // Test 3: Maybe it needs a reseller-specific endpoint
  console.log('\n\n=== Testing reseller purchase endpoints ===');
  const resellerPaths = [
    '/api/v1/reseller/data/purchase',
    '/api/v1/reseller/purchase',
    '/api/v1/reseller/order',
    '/api/v1/agent/purchase',
    '/api/v1/agent/data',
  ];

  for (const path of resellerPaths) {
    await test('POST', path, { ...purchasePayload, apiKey }, { 'api-key': apiKey });
  }
}

main().catch(console.error);
