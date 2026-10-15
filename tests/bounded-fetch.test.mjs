import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { createClient } from '@supabase/supabase-js';

const source = ts.transpileModule(readFileSync('src/lib/supabase/bounded-fetch.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { createBoundedDatabaseFetch: bounded } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const rest = 'https://isolated.example/rest/v1/items';
const hang = async (_, { signal }) => new Promise((_, reject) => {
  if (signal.aborted) reject(signal.reason);
  else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
});

test('successful and failed fetches remove caller listener and cancel timer', async () => {
  for (const fail of [false, true]) {
    const caller = new AbortController();
    let adds = 0, removes = 0, signal;
    const add = caller.signal.addEventListener.bind(caller.signal);
    const remove = caller.signal.removeEventListener.bind(caller.signal);
    caller.signal.addEventListener = (...args) => { adds++; return add(...args); };
    caller.signal.removeEventListener = (...args) => { removes++; return remove(...args); };
    const run = bounded(async (_, init) => { signal = init.signal; if (fail) throw new Error('offline'); return new Response('ok'); }, 15);
    if (fail) await assert.rejects(run(rest, { signal: caller.signal }), /offline/);
    else assert.equal(await (await run(rest, { signal: caller.signal })).text(), 'ok');
    assert.equal(adds, 1); assert.equal(removes, 1);
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(signal.aborted, false, 'completed request must not abort later');
  }
});
test('timeout remains bounded with a caller signal and rejects as AbortError', async () => {
  for (const init of [undefined, { signal: new AbortController().signal }])
    await assert.rejects(bounded(hang, 10)(rest, init), error => error.name === 'AbortError');
});
test('URL and Request callers retain cancellation, including already aborted signals', async () => {
  for (const requestInput of [false, true]) for (const aborted of [false, true]) {
    const caller = new AbortController();
    const reason = new DOMException('Caller cancelled', 'AbortError');
    if (aborted) caller.abort(reason);
    const request = requestInput ? new Request(rest, { signal: caller.signal }) : new URL(rest);
    const promise = bounded(hang, 200)(request, requestInput ? undefined : { signal: caller.signal });
    if (!aborted) caller.abort(reason);
    await assert.rejects(promise, error => error === reason);
  }
});
test('init signal overrides Request signal as native fetch does', async () => {
  const ignored = new AbortController(); ignored.abort();
  const active = new AbortController();
  const run = bounded(hang, 200)(new Request(rest, { signal: ignored.signal }), { signal: active.signal });
  active.abort(); await assert.rejects(run, error => error === active.signal.reason);
});
test('Auth and Storage preserve native fetch inputs without database deadline', async () => {
  for (const path of ['/auth/v1/user', '/storage/v1/object/large']) {
    const request = new Request(`https://isolated.example${path}`);
    const init = { method: 'GET' };
    await bounded(async (actual, options) => { assert.equal(actual, request); assert.equal(options, init); return new Response('ok'); }, 1)(request, init);
  }
});
test('installed PostgREST does not retry database deadline abort', async () => {
  let attempts = 0;
  const fetch = bounded(async (...args) => { attempts++; return hang(...args); }, 10);
  const client = createClient('https://isolated.example', 'synthetic-key', { global: { fetch }, auth: { persistSession: false, autoRefreshToken: false } });
  const result = await client.from('items').select('id');
  assert.ok(result.error); assert.match(result.error.message, /AbortError/);
  assert.equal(attempts, 1);
});
test('headers without a completed database body do not end the deadline', async () => {
  const fetch = bounded(async (_, { signal }) => new Response(new ReadableStream({
    start(stream) { signal.addEventListener('abort', () => stream.error(signal.reason), { once: true }); },
  })), 10);
  await assert.rejects(fetch(rest), error => error.name === 'AbortError');
});
