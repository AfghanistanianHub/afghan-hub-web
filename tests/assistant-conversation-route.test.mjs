import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { z } from "zod";
const compile = file => ts.transpileModule(fs.readFileSync(file,"utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness({signedIn=true, primary=[], peers=[], failPeers=false, failPrimary=false}={}) {
  const calls=[]; const cache={};
  class ScopeError extends Error {}
  function load(file) {
    if(cache[file])return cache[file];
    const exports={};cache[file]=exports;
    vm.runInNewContext(compile(file),{exports,URL,require(name){
      if(name==="zod")return {z};
      if(name==="next/server")return {NextResponse:{json:(data,options={})=>Response.json(data,options)}};
      if(name==="@/lib/supabase/server")return {createClient:async()=>({auth:{getUser:async()=>({data:{user:signedIn?{id:"qa-user"}:null}})}})};
      if(name==="@/lib/assistant/search")return {MentorshipSearchScopeError:ScopeError, searchAssistantCatalog:async(_db,query,options)=>{calls.push({query,options});if(options.memberSignal){if(failPrimary)throw new ScopeError("Browse people in Network.");return primary;}if(failPeers)throw new Error("private-provider-error");return peers;}};
      const files={"@/lib/assistant/conversation":"src/lib/assistant/conversation.ts","./intents":"src/lib/assistant/intents.ts","./query":"src/lib/assistant/query.ts","@/lib/http/request-origin":"src/lib/http/request-origin.ts"};
      assert.ok(files[name],name);return load(files[name]);
    }});
    return exports;
  }
  return {...load("src/app/api/assistant/search/route.ts"),calls};
}
const request = body => new Request("https://app.apnbc.ca/api/assistant/search",{method:"POST",headers:{origin:"https://app.apnbc.ca"},body:JSON.stringify(body)});
const person=(id)=>({entityType:"profile",entityId:id,title:"QA fixture member",subtitle:null,city:"Vancouver",country:"Canada",href:`/members/${id}`,rank:1});
test("conversation endpoint authenticates before retrieval and validates context",async()=>{
  const anonymous=harness({signedIn:false});assert.equal((await anonymous.POST(request({query:"Only Vancouver"}))).status,401);assert.equal(anonymous.calls.length,0);
  for(const context of [{topic:"film",memberSignal:"admin"},{topic:"film",city:"x".repeat(61)},{topic:"film",privateUserId:"other"}]){
    const h=harness();assert.equal((await h.POST(request({query:"Only Vancouver",context}))).status,400);assert.equal(h.calls.length,0);
  }
});
test("mentor refinements pass city before ranking and bound grouped results",async()=>{
  const h=harness({primary:[person("mentor")],peers:[person("mentor"),person("peer")]});
  const response=await h.POST(request({query:"Only Vancouver",context:{topic:"film",entityType:"profile",memberSignal:"open_to_mentoring"},limit:8}));
  assert.equal(response.status,200);const payload=await response.json();
  assert.deepEqual(payload.results.map(r=>r.entityId),["mentor","peer"]);
  assert.equal(payload.groups[0].memberSignal,"open_to_mentoring");assert.equal(payload.groups[1].memberSignal,null);
  assert.equal(h.calls[0].options.city,"Vancouver");assert.equal(h.calls[0].options.memberSignal,"open_to_mentoring");
  assert.equal(payload.context.topic,"film");assert.equal(payload.mode,"read-only");
});
test("switching to events clears mentorship while preserving topic and explicit city",async()=>{
  const h=harness();const payload=await (await h.POST(request({query:"Show me events too",context:{topic:"film",city:"Vancouver",entityType:"profile",memberSignal:"open_to_mentoring"}}))).json();
  assert.equal(payload.context.entityType,"event");assert.equal(payload.context.memberSignal,undefined);
  assert.equal(h.calls[0].options.entityType,"event");assert.equal(h.calls[0].options.memberSignal,undefined);
  assert.equal(h.calls[0].query,"film Vancouver");
});
test("related-member failure preserves primary grounded results without exposing provider errors",async()=>{
  const h=harness({primary:[person("mentor")],failPeers:true});const response=await h.POST(request({query:"mentor film"}));
  assert.equal(response.status,200);const payload=await response.json();assert.equal(payload.results.length,1);assert.equal(payload.relatedUnavailable,true);assert.doesNotMatch(JSON.stringify(payload),/private-provider-error/);
});
test("oversized primary mentor scope remains an explicit recoverable response",async()=>{
  const h=harness({failPrimary:true});const response=await h.POST(request({query:"mentor film"}));assert.equal(response.status,422);
});

test("empty-topic category follow-ups navigate the catalogue without searching filler",async()=>{
 for(const query of ["Show me events too","رویدادها را هم نشان بده","غونډې هم را وښیه"]){
  const h=harness(); const response=await h.POST(request({query,context:{topic:"",entityType:"profile",memberSignal:"open_to_mentoring"}}));
  const payload=await response.json();assert.equal(response.status,200);assert.equal(payload.browseOnly,true,query);assert.equal(payload.intent,"find_events");assert.equal(payload.context.entityType,"event");assert.equal(h.calls.length,0);
 }
});
test("category response intent preserves established analytics taxonomy",async()=>{
 for(const [query,intent] of [["film events","find_events"],["film businesses","find_businesses"],["film organizations","find_organizations"],["film opportunities","find_opportunities"],["film people","find_people"]]){
  const h=harness();const payload=await(await h.POST(request({query}))).json();assert.equal(payload.intent,intent,query);
 }
});
