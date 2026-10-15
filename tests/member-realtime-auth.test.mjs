import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/supabase/member-realtime.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
const subscribe = exports.subscribeMemberChannel;
const flush = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return {promise,resolve}; };
function fixture(sessionResult = {data:{session:{access_token:'synthetic-token'}},error:null}) {
 const calls=[];const auth=deferred();
 const client={auth:{async getSession(){calls.push('session');return sessionResult;}},realtime:{setAuth(token){assert.equal(token,'synthetic-token');calls.push('auth');return auth.promise;}},removeChannel(value){assert.equal(value,channel);calls.push('remove');}};
 const channel={subscribe(){calls.push('subscribe');}};
 return {calls,client,channel,auth};
}
test('member channel waits for session and completed realtime authentication before joining',async()=>{
 const f=fixture();const cleanup=subscribe(f.client,f.channel);await flush();assert.deepEqual(f.calls,['session','auth']);
 f.auth.resolve();await flush();assert.deepEqual(f.calls,['session','auth','subscribe']);cleanup();assert.equal(f.calls.at(-1),'remove');
});
test('unmount while authentication is pending never joins the abandoned channel',async()=>{
 const f=fixture();const cleanup=subscribe(f.client,f.channel);await flush();cleanup();f.auth.resolve();await flush();assert.deepEqual(f.calls,['session','auth','remove']);
});
test('absent or failed session never falls back to an anonymous member subscription',async()=>{
 for(const result of [{data:{session:null},error:null},{data:{session:{access_token:'synthetic-token'}},error:new Error('session unavailable')}]){
  const f=fixture(result);const cleanup=subscribe(f.client,f.channel);await flush();assert.deepEqual(f.calls,['session']);cleanup();
 }
});
test('rejected authentication never joins and can still be cleaned up',async()=>{
 const f=fixture();f.client.realtime.setAuth=async()=>{throw new Error('auth unavailable');};const cleanup=subscribe(f.client,f.channel);await flush();assert.deepEqual(f.calls,['session']);cleanup();assert.equal(f.calls.at(-1),'remove');
});
