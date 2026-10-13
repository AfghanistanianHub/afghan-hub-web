import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';

function harness({ signedIn=true, accessError=null, onboarded=true }={}) {
  const exports = {};
  const Recovery = () => null;
  let accessReads=0;
  const result = { data:[], error:null, count:0 };
  const chain = new Proxy({}, { get(_, key) { return key==='then' ? Promise.resolve(result).then.bind(Promise.resolve(result)) : () => chain; } });
  const client = { auth:{getUser:async()=>({data:{user:signedIn?{id:'synthetic',email:'synthetic@example.invalid'}:null}})},from:()=>chain,rpc:()=>chain };
  const modules = {
    'react/jsx-runtime':jsx,
    'next/navigation':{redirect:target=>{throw new Error(`redirect:${target}`);}},
    '@/components/dashboard/header':{Header:'header'},
    '@/components/dashboard/sidebar':{Sidebar:'aside'},
    '@/components/messages/realtime-message-refresh':{RealtimeMessageRefresh:'realtime'},
    '@/components/feedback/page-recovery':{WorkspaceRecovery:Recovery},
    '@/lib/messages':{getTotalUnreadMessageCount:()=>0},
    '@/lib/profile-access':{getMyAccessContext:async()=>{accessReads++;return {data:accessError?null:{role:'member',onboarding_completed:onboarded},error:accessError};}},
    '@/lib/supabase/server':{createClient:async()=>client},
  };
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/(dashboard)/layout.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,Map,require:name=>{assert.ok(modules[name],name);return modules[name];}});
  return { layout:exports.default, Recovery, reads:()=>accessReads };
}

test('access lookup outage fails closed without redirecting to an empty editable profile',async()=>{
  const h=harness({accessError:{message:'private upstream error'}});
  const children={type:'private-workspace',props:{children:'sensitive member content'}};
  const result=await h.layout({children});
  assert.equal(result.type,h.Recovery);
  assert.deepEqual(Object.keys(result.props),[]);
  assert.doesNotMatch(JSON.stringify(result),/private upstream|sensitive member/);
});
test('confirmed incomplete onboarding still redirects to profile',async()=>{
  const h=harness({onboarded:false});
  await assert.rejects(h.layout({children:'private'}),/redirect:\/profile/);
});
test('anonymous users cannot read access context or workspace data',async()=>{
  const h=harness({signedIn:false});
  await assert.rejects(h.layout({children:'private'}),/redirect:\/login/);
  assert.equal(h.reads(),0);
});
test('healthy confirmed member retains the requested workspace',async()=>{
  const h=harness();const children={type:'member-page',props:{}};
  const result=await h.layout({children});assert.notEqual(result.type,h.Recovery);
  const contains=node=>node===children || (Array.isArray(node)?node.some(contains):!!node?.props && contains(node.props.children));
  assert.equal(contains(result),true);
});
