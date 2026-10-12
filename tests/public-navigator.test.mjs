import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';

function harness({ unavailable = [], rows = {}, planner } = {}) {
  const calls = [];
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {}; modules.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
      exports, Request, Response, TextDecoder, Date, URL, AbortSignal, Set, console: { info() {}, error() {} },
      require(name) {
        if (name === 'server-only') return {};
        if (name === '@/lib/assistant/discovery-provider') return {discoveryPlanner: () => planner};
        if (name === 'zod') return { z };
        if (name === 'next/server') return { NextResponse: { json: Response.json } };
        if (name === '@/lib/public-content') return { getPublicListings: async (kind, options) => { calls.push({kind,options}); return {items:rows[kind] ?? [],unavailable:unavailable.includes(kind)}; } };
        const files = {
          '@/lib/public-catalog': 'src/lib/public-catalog.ts',
          '@/lib/http/request-origin': 'src/lib/http/request-origin.ts',
          '@/lib/assistant/public-discovery': 'src/lib/assistant/public-discovery.ts',
          '@/lib/assistant/public-discovery-contract': 'src/lib/assistant/public-discovery-contract.ts',
          '@/lib/assistant/discovery-orchestrator':'src/lib/assistant/discovery-orchestrator.ts',
          '@/lib/assistant/discovery-tools':'src/lib/assistant/discovery-tools.ts',
          './public-discovery-contract':'src/lib/assistant/public-discovery-contract.ts',
          './public-discovery':'src/lib/assistant/public-discovery.ts',
          './discovery-location':'src/lib/assistant/discovery-location.ts',
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
  assert.equal((await h.POST(request('x'.repeat(4097)))).status,413);
  for (const body of [{query:'x'},{query:'x'.repeat(121)},{query:'art',userId:'private'},{query:'art',filters:{topic:'art',role:'admin'}}]) assert.equal((await h.POST(request(body))).status,400);
  assert.equal(h.calls.length,0);
});
test('public Navigator spans explicit areas, returns real safe links and caps results', async () => {
  const rows = Object.fromEntries(['businesses','organizations','opportunities','events'].map(kind=>[kind,Array.from({length:12},(_,i)=>listing(`${kind}-${i}`))]));
  const h=harness({rows}); const response=await h.POST(request({query:'businesses and opportunities',filters:{topic:'arts',location:'Vancouver'}}));
  assert.equal(response.status,200); const data=await response.json();
  assert.deepEqual(data.plan.kinds,['businesses','opportunities']); assert.equal(data.results.length,8); assert.equal(data.engine,'structured-search'); assert.equal(data.fallback,'disabled');
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

const decision = {plan:{kinds:['organizations'],people:false,topic:'arts',location:'Vancouver',thisMonth:false},understanding:'Find arts organizations in Vancouver.',clarification:null};
test('model planning is validated before the same permission-aware tool runs', async () => {
  const h=harness({planner:async input=>{assert.equal(input.language,'fa');return decision;},rows:{organizations:[listing('actual-organization')]}});
  const data=await(await h.POST(request({query:'help me find my path',language:'fa-AF'}))).json();
  assert.equal(data.engine,'model-assisted');assert.equal(data.fallback,null);assert.equal(data.results[0].href,'/explore/organizations/actual-organization');assert.equal(h.calls.length,1);
});
test('invalid or failed model output falls back without executing arbitrary tools', async () => {
  for (const planner of [async()=>({...decision,plan:{...decision.plan,kinds:['profiles']}}),async()=>({...decision,results:[{href:'https://evil.example'}]}),async()=>{throw new Error('provider failure with sensitive details');}]) {
    const h=harness({planner});const data=await(await h.POST(request({query:'art businesses'}))).json();
    assert.equal(data.engine,'structured-search');assert.equal(data.fallback,'unavailable');assert.deepEqual(data.plan.kinds,['businesses']);assert.equal(h.calls.length,1);assert.ok(!JSON.stringify(data).includes('sensitive'));
  }
});
test('essential clarifications do not fabricate results or query public data prematurely', async () => {
  const h=harness({planner:async()=>({...decision,clarification:'Which city would you like to connect in?'})});
  const data=await(await h.POST(request({query:'help me connect'}))).json();
  assert.equal(data.clarification,'Which city would you like to connect in?');assert.deepEqual(data.results,[]);assert.equal(h.calls.length,0);
  const follow=harness({planner:async input=>{assert.equal(input.clarification,data.clarification);assert.deepEqual(input.context,data.plan);return {...decision,plan:{...decision.plan,location:input.query}};},rows:{organizations:[listing('actual-organization')]}});
  const answer=await(await follow.POST(request({query:'Vancouver',context:data.plan,clarification:data.clarification}))).json();
  assert.equal(answer.engine,'model-assisted');assert.equal(answer.results[0].href,'/explore/organizations/actual-organization');
});
test('guided answers override inferred model filters and avoid needless clarification', async () => {
  const h=harness({planner:async()=>({...decision,clarification:'Which city?'})});const data=await(await h.POST(request({query:'Find opportunities',filters:{goal:'Find opportunities',topic:'technology',location:'Toronto'}}))).json();
  assert.deepEqual(data.plan.kinds,['opportunities']);assert.equal(data.plan.location,'Toronto');assert.equal(data.clarification,null);
});
test('bounded context preserves date, interest and location for explicit follow-ups', async () => {
  const h=harness();const context={kinds:['events'],people:false,topic:'arts',location:'Vancouver',thisMonth:true};
  for (const query of ['Only opportunities','فقط فرصت‌ها','یوازې فرصتونه']) {
    const data=await(await h.POST(request({query,context}))).json();
    assert.deepEqual(data.plan.kinds,['opportunities']);assert.equal(data.plan.topic,'arts');assert.equal(data.plan.location,'Vancouver');assert.equal(data.plan.thisMonth,true);
  }
  const data=await(await h.POST(request({query:'Anywhere',context}))).json();assert.equal(data.plan.location,'');assert.equal(data.plan.topic,'arts');
  const only=await(await h.POST(request({query:'Only businesses',context:{...context,people:true}}))).json();assert.equal(only.plan.people,false);
  assert.equal((await h.POST(request({query:'art',context:{...context,kinds:['profiles']}}))).status,400);
});
test('province aliases match the actual province field without treating BC as a substring', () => {
  const h=harness();const row={...listing('bc'),region:'BC'};
  assert.ok(h.rankDiscoveryListing(row,'arts','British Columbia',false,'businesses')>0);
  assert.equal(h.rankDiscoveryListing({...row,region:'Quebec'},'arts','BC',false,'businesses'),0);
});
test('English, Persian/Dari and Pashto example searches share canonical public filters', () => {
  const h=harness();for(const query of ['Technology opportunities in British Columbia','فرصت‌های فناوری در بریتیش کلمبیا','په بریټش کولمبیا کې د ټکنالوژۍ فرصتونه']) {
    const plan=h.planPublicDiscovery(query);assert.equal(plan.location,'British Columbia');assert.equal(plan.topic,'technology');assert.deepEqual(Array.from(plan.kinds),['opportunities']);
  }
});

test('public follow-up evaluation preserves and updates only the requested dimensions',()=>{
  const h=harness();let plan={kinds:['opportunities'],people:false,topic:'technology',location:'Toronto',thisMonth:false};
  for(const [query,expected] of [
    ['Only in Vancouver.',{location:'Vancouver',topic:'technology',kinds:['opportunities']}],
    ['What about artists?',{location:'Vancouver',topic:'arts',people:true}],
    ['Show organizations instead.',{location:'Vancouver',topic:'arts',kinds:['organizations'],people:false}],
    ['Are there any events this month?',{location:'Vancouver',topic:'arts',kinds:['events'],thisMonth:true}],
    ['Expand the search to British Columbia.',{location:'British Columbia',topic:'arts',kinds:['events'],thisMonth:true}],
  ]) {
    plan=h.planPublicDiscovery(query,{},plan);
    for(const [key,value] of Object.entries(expected))assert.deepEqual(JSON.parse(JSON.stringify(plan[key])),value,query+' '+key);
  }
  const independent=h.planPublicDiscovery('Find software businesses in Toronto',{},plan);assert.deepEqual(Array.from(independent.kinds),['businesses']);assert.equal(independent.location,'Toronto');assert.equal(independent.thisMonth,false);
});

test('multilingual location follow-ups preserve prior topic and category', () => {
  const h=harness();
  const previous={kinds:['opportunities'],people:false,topic:'technology',location:'Toronto',thisMonth:false};
  for (const query of ['Only in vancouver', 'فقط در ونکوور', 'تنها در ونکوور', 'یوازې په ونکوور']) {
    const plan=h.planPublicDiscovery(query,{},previous);
    assert.equal(plan.location.toLowerCase(),'vancouver',query);
    assert.equal(plan.topic,'technology',query);
    assert.deepEqual(Array.from(plan.kinds),['opportunities'],query);
  }
});

test('all-location follow-ups in Persian retain the current search', () => {
  const h=harness();
  const previous={kinds:['events'],people:true,topic:'arts',location:'Vancouver',thisMonth:true};
  for(const query of ['Anywhere','All locations','هر جا','همه جا','هر ځای']) {
    const plan=h.planPublicDiscovery(query,{},previous);
    assert.equal(plan.location,'',query);
    assert.equal(plan.topic,'arts',query);
    assert.equal(plan.people,true,query);
    assert.equal(plan.thisMonth,true,query);
    assert.deepEqual(Array.from(plan.kinds),['events'],query);
  }
});
