import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';
const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/assistant/public-discovery-contract.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,Set,require:name=>{assert.equal(name,'zod');return {z};}});
test('incoming legacy Navigator locale normalizes before discovery and analytics',()=>{
 for(const [input,output] of [['fa-AF','fa'],['fa','fa'],['ps','ps'],['en','en']]){
  assert.equal(exports.navigatorLanguageSchema.parse(input),output);
  assert.equal(exports.discoveryRequestSchema.parse({query:'فرصت‌های فناوری',language:input}).language,output);
 }
 assert.equal(exports.discoveryRequestSchema.parse({query:'technology'}).language,'en');
 for(const language of ['dari','unknown','FA-AF',null,{}])assert.equal(exports.discoveryRequestSchema.safeParse({query:'technology',language}).success,false);
});
