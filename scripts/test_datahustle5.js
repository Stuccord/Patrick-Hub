// Test DataHustle agent store API
// The proxy path in the frontend is /api/proxy/v1/agent-stores 
// The actual backend is https://api.datahustle.shop/api/v1/agent-stores
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

async function test(method, path, body, headers = {}) {
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
    if (res.status !== 404) {
      console.log(`\n✅ [${res.status}] ${method} ${path}`);
      console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
    } else {
      process.stdout.write('.');
    }
    return { status: res.status, data: json };
  } catch (err) {
    process.stdout.write('x');
  }
}

async function main() {
  const headers = {
    'api-key': apiKey,
    'Content-Type': 'application/json',
  };

  // The API key is likely for agent-store API
  const agentPaths = [
    '/api/v1/agent-stores',
    '/api/v1/agent-stores/me',
    '/api/v1/stores',
    '/api/v1/stores/me',
    '/api/v1/agent',
    '/api/v1/agent/me',
    '/api/v1/profile',
    '/api/v1/me',
  ];

  console.log('Testing agent store endpoints...');
  for (const path of agentPaths) {
    await test('GET', path, null, { 'api-key': apiKey });
    await test('GET', path, null, { 'x-api-key': apiKey });
    await test('GET', path, null, { 'Authorization': `Bearer ${apiKey}` });
  }

  // Try agent-store purchase via reseller API key (in body)
  console.log('\n\nTesting purchase with apiKey in body...');
  const purchasePayload = {
    phoneNumber: '0241234567',
    network: 'YELLO',
    capacity: '1',
    price: 4.20,
    apiKey: apiKey,
  };
  
  const purchasePaths = [
    '/api/v1/data/purchase-data',
    '/api/v1/reseller/purchase',
    '/api/v1/agent/purchase',
  ];

  for (const path of purchasePaths) {
    await test('POST', path, purchasePayload, {});
    await test('POST', path, purchasePayload, { 'api-key': apiKey });
  }
  
  console.log('\nDone.');
}

main().catch(console.error);
