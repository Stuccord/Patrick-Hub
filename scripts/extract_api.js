const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const content = await fetchUrl('https://datahustle.shop/_next/static/chunks/4f2af414c2949ab4.js');
  
  // Find all api.datahustle.shop references
  const urlPattern = /https:\/\/api\.datahustle\.shop[^"'`\s,)]+/g;
  const urls = [...content.matchAll(urlPattern)].map(m => m[0]);
  const uniqueUrls = [...new Set(urls)];
  
  console.log('=== ALL api.datahustle.shop URLs FOUND ===');
  uniqueUrls.forEach(u => console.log(u));
  
  // Find all /api/v1/ paths with more context
  console.log('\n=== /api/v1/ ENDPOINT CONTEXTS ===');
  const v1Pattern = /[`"'](\/api\/v1\/[^`"'\s]*)[`"']/g;
  const v1Paths = [...content.matchAll(v1Pattern)].map(m => m[1]);
  const uniquePaths = [...new Set(v1Paths)];
  uniquePaths.forEach(p => console.log(p));
  
  // Also search for "data" and "order" near API paths
  console.log('\n=== LOOKING FOR ORDER/DATA PATTERNS ===');
  const orderPattern = /(?:order|bundle|data|send|buy|topup|reseller)(?:[A-Z][a-z]+)*/g;
  const orderTerms = [...content.matchAll(orderPattern)].map(m => m[0]);
  const uniqueTerms = [...new Set(orderTerms)].filter(t => t.length > 4);
  uniqueTerms.slice(0, 50).forEach(t => console.log(t));
  
  // Find fetch calls near "data" keyword
  console.log('\n=== FETCH PATTERNS ===');
  const fetchPattern = /fetch\([`"'][^`"']+[`"']/g;
  const fetchCalls = [...content.matchAll(fetchPattern)].map(m => m[0]);
  fetchCalls.slice(0, 30).forEach(f => console.log(f));
}

main().catch(console.error);
