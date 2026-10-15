import assert from 'node:assert/strict';
import http from 'node:http';

const listingPaths = new Set(['businesses', 'organizations', 'opportunities', 'events'].map(table => `/rest/v1/${table}`));

// The app uses this real HTTP boundary only in disposable acceptance. Auth, RPC,
// profiles and all writes always reach Supabase; no browser session is injected.
export async function listingRequestProxy(targetUrl) {
  const target = new URL(targetUrl);
  assert.ok(['127.0.0.1', 'localhost'].includes(target.hostname));
  assert.equal(target.protocol, 'http:');
  const state = { outage: false, requests: [] };
  const server = http.createServer((request, response) => {
    const path = new URL(request.url, target).pathname;
    const listing = listingPaths.has(path) && request.method === 'GET';
    const started = Date.now();
    const record = status => {
      if (listing && state.requests.length < 5000) state.requests.push({ table: path.split('/').at(-1), http: status, outage: state.outage, ms: Date.now() - started });
    };
    if (listing && state.outage) {
      record(503);
      response.writeHead(503, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      response.end(JSON.stringify({ message: 'Disposable listing transport unavailable' }));
      return;
    }
    const upstream = http.request({ hostname: target.hostname, port: target.port, method: request.method, path: request.url, headers: { ...request.headers, host: target.host } }, result => {
      record(result.statusCode);
      response.writeHead(result.statusCode, result.headers);
      result.pipe(response);
    });
    upstream.on('error', () => {
      record(502);
      if (!response.headersSent) response.writeHead(502);
      response.end();
    });
    request.pipe(upstream);
  });
  server.on('upgrade', (request, socket, head) => {
    const upstream = http.request({ hostname: target.hostname, port: target.port, path: request.url, headers: { ...request.headers, host: target.host } });
    upstream.on('upgrade', (response, transport, upstreamHead) => {
      socket.write(`HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\n` + Object.entries(response.headers).map(([key, value]) => `${key}: ${value}`).join('\r\n') + '\r\n\r\n');
      if (head.length) transport.write(head);
      if (upstreamHead.length) socket.write(upstreamHead);
      socket.pipe(transport); transport.pipe(socket);
      socket.on('close', () => transport.destroy());
      transport.on('close', () => socket.destroy());
      socket.on('error', () => transport.destroy());
      transport.on('error', () => socket.destroy());
    });
    upstream.on('error', () => socket.destroy());
    upstream.end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { state, url: `http://127.0.0.1:${server.address().port}`, close: () => { server.closeAllConnections(); server.close(); } };
}
