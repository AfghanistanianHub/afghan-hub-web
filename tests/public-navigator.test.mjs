import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';

function harness({ unavailable = [], rows = {} } = {}) {
  const calls = [];
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {}; modules.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
      exports, Request, Response, TextDecoder, Date, URL, console: { info() {}, error() {} },
      require(name) {
        if (name === 'zod') return { z };
        if (name === 'next/server') return { NextResponse: { json: Response.json } };
        if (name === '@/lib/public-content') return { getPublicListings: async (kind, options) => { calls.push({kind,options}); return {items:rows[kind] ?? [],unavailable:unavailable.includes(kind)}; } };
        const files = {
          '@/lib/public-catalog': 'src/lib/public-catalog.ts',
          '@/lib/http/request-origin': 'src/lib/http/request-origin.ts',
          '@/lib/assistant/public-discovery': 'src/lib/assistant/public-discovery.ts',
          '@/lib/assistant/public-discovery-contract': 'src/lib/assistant/public-discovery-contract.ts',
          './intents':'src/lib/assistant/intents.ts', './conversation':'src/lib/assistant/conversation.ts', './query':'src/lib/assistant/query.ts',
        };
        assert.ok(files[name], `Unexpected dependency ${name}`); return load(files[name]);
      },
    });
    return exports;
  }
  return {...load('src/app/api/assistant/public-search/route.ts'), ...load('src/lib/assistant/public-discovery.ts'), calls};
}
const request = (body, origin = 'https://preview.example') => new Request('https://preview.example/api/assistant/public-search', {method:'POST',headers:{origin},body:typeof body === 'string' ? body : JSON.stringify(body)});
const listing = (slug, title='Community art programme') => ({slug,title,summary:'Public summary',description:'Artists, music and creative work',location:'Vancouver, Canada',category:'Community',date:null,endDate:null});

test('public Navigator rejects cross-origin, malformed, oversized and extra-field input before reads', async () => {
  const h = harness();
  assert.equal((await h.POST(request({query:'art'},'https://evil.example'))).status,403);
  assert.equal((await h.POST(request('broken'))).status,400);
  assert.equal((await h.POST(request('x'.repeat(2049)))).status,413);
  for (const body of [{query:'x'},{query:'x'.repeat(121)},{query:'art',userId:'private'},{query:'art',filters:{topic:'art',role:'admin'}}]) assert.equal((await h.POST(request(body))).status,400);
  assert.equal(h.calls.length,0);
});
test('public Navigator spans explicit areas, returns real safe links and caps results', async () => {
  const rows = Object.fromEntries(['businesses','organizations','opportunities','events'].map(kind=>[kind,Array.from({length:12},(_,i)=>listing(`${kind}-${i}`))]));
  const h=harness({rows}); const response=await h.POST(request({query:'businesses and opportunities',filters:{topic:'arts',location:'Vancouver'}}));
  assert.equal(response.status,200); const data=await response.json();
  assert.deepEqual(data.plan.kinds,['businesses','opportunities']); assert.equal(data.results.length,8);
  assert.ok(data.results.some(r=>r.kind==='businesses') && data.results.some(r=>r.kind==='opportunities'));
  assert.ok(data.results.every(r=>r.href.startsWith('/explore/') && !('description' in r) && !('entityId' in r)));
  assert.ok(h.calls.every(c=>c.options.limit===24 && c.options.discoveryLocation==='Vancouver'));
});
test('member requests retain a sign-in next step without requesting profiles', async () => {
  const h=harness();const data=await(await h.POST(request({query:'I want to meet artists in Vancouver'}))).json();
  assert.equal(data.plan.people,true);assert.equal(data.plan.location,'Vancouver'); assert.ok(h.calls.every(c=>c.kind!=='profiles'));
});
test('partial outages preserve results and full outages return retryable errors', async () => {
  const h=harness({unavailable:['organizations'],rows:{businesses:[listing('real-public-business')]}});
  const data=await(await h.POST(request({query:'art'}))).json();assert.deepEqual(data.unavailable,['organizations']);assert.equal(data.results[0].href,'/explore/businesses/real-public-business');
  const failed=harness({unavailable:['businesses','organizations','opportunities','events']});assert.equal((await failed.POST(request({query:'art'}))).status,503);
});
test('empty results and safe URL encoding never fabricate a listing', async () => {
  const h=harness();const data=await(await h.POST(request({query:'unmatched topic'}))).json();assert.deepEqual(data.results,[]);
  const encoded=harness({rows:{businesses:[listing('a/b?redirect=bad')]}});const safe=await(await encoded.POST(request({query:'art businesses'}))).json();assert.equal(safe.results[0].href,'/explore/businesses/a%2Fb%3Fredirect%3Dbad');
});
test('public limiter bounds catalogue load and exposes Retry-After', async () => {
  const h=harness();for(let i=0;i<60;i++)assert.equal((await h.POST(request({query:'art'}))).status,200);
  const response=await h.POST(request({query:'art'}));assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'60');assert.equal(h.calls.length,240);
});
test('date and location ranking excludes unrelated data and allows remote participation', () => {
  const h=harness();const now=new Date('2026-10-08T00:00:00Z');
  assert.equal(h.rankDiscoveryListing({...listing('event'),date:'2026-11-02'},'', '',true,'events',now),0);
  assert.equal(h.rankDiscoveryListing({...listing('event'),date:'2026-10-22'},'', '',true,'events',now),1);
  assert.equal(h.rankDiscoveryListing(listing('local'),'arts','Toronto',false,'organizations'),0);
  assert.ok(h.rankDiscoveryListing({...listing('remote'),location:'Remote'},'arts','Toronto',false,'opportunities')>0);
  assert.ok(h.rankDiscoveryListing({...listing('creative'),title:'Design studio'},'Artists & Creatives','',false,'businesses')>0);
});
