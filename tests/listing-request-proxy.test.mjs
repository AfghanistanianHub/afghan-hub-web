import assert from 'node:assert/strict';
import http from 'node:http';
import { listingRequestProxy } from '../scripts/qa/listing-request-proxy.mjs';

async function startTarget(handler) {
  const server = http.createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  return { url: `http://127.0.0.1:${port}`, close: () => server.close() };
}

async function test() {
  const target = await startTarget((request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true }));
  });
  const proxy = await listingRequestProxy(target.url);
  try {
    const before = await fetch(proxy.url + '/rest/v1/businesses?select=id&limit=1', { signal: AbortSignal.timeout(2000) });
    assert.equal(before.status, 200);
    proxy.state.outage = true;
    const during = await fetch(proxy.url + '/rest/v1/businesses?select=id', { signal: AbortSignal.timeout(2000) });
    assert.equal(during.status, 503);
    const body = await during.json();
    assert.equal(body.message, 'Disposable listing transport unavailable');
    proxy.state.outage = false;
    const after = await fetch(proxy.url + '/rest/v1/businesses', { signal: AbortSignal.timeout(2000) });
    assert.equal(after.status, 200);
    const other = await fetch(proxy.url + '/rest/v1/profiles?select=id&limit=0', { signal: AbortSignal.timeout(2000) });
    assert.equal(other.status, 200);
  } finally {
    proxy.close();
    target.close();
  }
  console.log('PASS listing-request-proxy');
}

test().catch(error => { console.error('FAIL listing-request-proxy', error); process.exit(1); });
