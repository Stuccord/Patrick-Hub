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

async function testEndpoint(method, path, body) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(url);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    console.log(`\n=== ${method} ${path} [${res.status}] ===`);
    console.log(JSON.stringify(json, null, 2));
    return { status: res.status, data: json };
  } catch (err) {
    console.log(`\n=== ${method} ${path} [ERROR] ===`);
    console.log(err.message);
  }
}

async function testWithHeaders(method, path, headers, body) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    console.log(`\n=== ${method} ${path} [${res.status}] (headers: ${JSON.stringify(headers)}) ===`);
    console.log(JSON.stringify(json, null, 2));
    return { status: res.status, data: json };
  } catch (err) {
    console.log(`\n=== ${method} ${path} [ERROR] ===`);
    console.log(err.message);
  }
}

async function main() {
  console.log('Testing DataHustle API at:', BASE_URL);
  console.log('API Key:', apiKey.substring(0, 10) + '...');

  // 1. Try root
  await testEndpoint('GET', '/');

  // 2. Try common doc/info endpoints
  const paths = ['/api', '/docs', '/swagger', '/openapi.json', '/health', '/status', '/v1', '/api/v1'];
  for (const p of paths) {
    await testEndpoint('GET', p);
  }

  // 3. Try with different auth headers
  const authHeaders = [
    { 'api-key': apiKey },
    { 'x-api-key': apiKey },
    { 'Authorization': `Bearer ${apiKey}` },
    { 'Authorization': `Token ${apiKey}` },
  ];

  const authPaths = ['/api/balance', '/balance', '/api/wallet', '/wallet', '/api/profile', '/profile', '/api/user', '/user'];

  for (const headers of authHeaders) {
    for (const p of authPaths) {
      await testWithHeaders('GET', p, headers);
    }
  }
}

main().catch(console.error);
