import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:name=>{assert.equal(name,'./member-navigator-copy-dari');return load('src/lib/assistant/member-navigator-copy-dari.ts');}});return exports;}
test('member Navigator distinguishes four locales with complete separate Dari resources',()=>{
 const {memberNavigatorCopy:copy,memberNavigatorDialogue:dialogue,memberNavigatorPrompts:prompts,memberNavigatorLocales:locales,memberNavigatorUtility:utility}=load('src/lib/assistant/member-navigator-copy.ts');
 assert.deepEqual(Array.from(locales,x=>x.label),['English','دری','فارسی','پښتو']);
 for(const locale of ['fa-AF','fa','ps']){assert.deepEqual(Object.keys(copy[locale]).sort(),Object.keys(copy.en).sort());assert.deepEqual(Object.keys(dialogue[locale]).sort(),Object.keys(dialogue.en).sort());assert.deepEqual(Object.keys(dialogue[locale].types).sort(),Object.keys(dialogue.en.types).sort());assert.equal(prompts[locale].length,4);assert.ok(utility[locale].close);}
 assert.notEqual(copy['fa-AF'].search,copy.fa.search);assert.notEqual(dialogue['fa-AF'].types.event,dialogue.fa.types.event);assert.match(prompts['fa-AF'][3],/هنرمندان و فعالان خلاق/);
});
