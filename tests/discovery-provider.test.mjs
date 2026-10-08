import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

class PlannerUnavailable extends Error { constructor(reason) { super(reason); this.reason=reason; } }
function provider(env) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/assistant/discovery-provider.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {
    exports,process:{env},Date,AbortSignal,console:{info(){}},
    require(name) {
      if(name==='server-only')return {};
      if(name==='./discovery-budget')return {claimDiscoveryBudget:async()=>{throw new PlannerUnavailable('not-configured');}};
      if(name==='./public-discovery-contract')return {};
      if(name==='./discovery-orchestrator')return {PlannerUnavailable};
      throw new Error(`Unexpected SDK load: ${name}`);
    },
  });
  return exports;
}
test('default provider performs structured discovery without loading a model SDK or reading credentials',()=>{
  const env=new Proxy({}, {get(_target,name){if(/KEY/.test(name))throw new Error('Credential must stay untouched');return undefined;}});
  assert.equal(provider(env).discoveryPlanner(),undefined);
});
test('explicit providers require enable flag and model ID before consulting credentials',async()=>{
  for(const config of [{NAVIGATOR_MODEL_PROVIDER:'openai'},{NAVIGATOR_MODEL_PROVIDER:'gateway',NAVIGATOR_MODEL_ENABLED:'true'},{NAVIGATOR_MODEL_PROVIDER:'unknown',NAVIGATOR_MODEL_ENABLED:'true',NAVIGATOR_MODEL_ID:'test-model'}]) {
    const env=new Proxy(config,{get(target,name){if(/KEY/.test(name))throw new Error('Credential must stay untouched');return target[name];}});
    await assert.rejects(provider(env).configuredDiscoveryPlanner({},new AbortController().signal),error=>error.reason==='not-configured');
  }
});
test('missing credentials keep an enabled provider in an explicit fallback state',async()=>{
  for(const name of ['openai','gateway']) await assert.rejects(provider({NAVIGATOR_MODEL_PROVIDER:name,NAVIGATOR_MODEL_ENABLED:'true',NAVIGATOR_MODEL_ID:'test-model'}).configuredDiscoveryPlanner({},new AbortController().signal),error=>error.reason==='not-configured');
});

test('enabled provider fails closed without a shared budget before loading SDKs',async()=>{
 await assert.rejects(provider({NAVIGATOR_MODEL_PROVIDER:'openai',NAVIGATOR_MODEL_ENABLED:'true',NAVIGATOR_MODEL_ID:'test-model',OPENAI_API_KEY:'offline-fixture-never-sent'}).configuredDiscoveryPlanner({},new AbortController().signal),e=>e.reason==='not-configured');
});
