import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
function load(file, localStorage) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,localStorage,require:name=>{assert.equal(name,'./navigator-language');return load('src/lib/assistant/navigator-language.ts',localStorage);}});
 return exports;
}
test('member Navigator exposes exactly three complete canonical resources',()=>{
 const {memberNavigatorCopy:copy,memberNavigatorDialogue:dialogue,memberNavigatorPrompts:prompts,memberNavigatorLocales:locales,memberNavigatorUtility:utility}=load('src/lib/assistant/member-navigator-copy.ts');
 assert.deepEqual(Array.from(locales,x=>x.value),['en','fa','ps']);
 assert.deepEqual(Array.from(locales,x=>x.label),['English','فارسی / Persian','پښتو / Pashto']);
 for(const resource of [copy,dialogue,prompts,utility])assert.deepEqual(Object.keys(resource).sort(),['en','fa','ps']);
 for(const locale of ['fa','ps']){assert.deepEqual(Object.keys(copy[locale]).sort(),Object.keys(copy.en).sort());assert.deepEqual(Object.keys(dialogue[locale]).sort(),Object.keys(dialogue.en).sort());assert.deepEqual(Object.keys(dialogue[locale].types).sort(),Object.keys(dialogue.en.types).sort());assert.equal(prompts[locale].length,4);assert.ok(utility[locale].close);}
});
test('legacy Navigator preference migrates to Persian without touching profile information',()=>{
 const values=new Map([['afghan-hub-navigator-language','fa-AF'],['profile-languages','Dari, English']]);
 const language=load('src/lib/assistant/navigator-language.ts',{getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)});
 assert.equal(language.readNavigatorLanguagePreference(),'fa');
 assert.equal(values.get(language.navigatorLanguagePreferenceKey),'fa');
 assert.equal(values.get('profile-languages'),'Dari, English');
 assert.equal(language.saveNavigatorLanguagePreference('fa-AF'),'fa');
 assert.equal(language.saveNavigatorLanguagePreference('ps'),'ps');
 assert.equal(language.readNavigatorLanguagePreference(),'ps');
 for(const value of [null,undefined,'invalid',{},'en'])assert.equal(language.normalizeNavigatorLanguage(value),'en');
});
test('Navigator preference works when browser storage is unavailable',()=>{
 const language=load('src/lib/assistant/navigator-language.ts',{getItem(){throw new Error('denied');},setItem(){throw new Error('denied');}});
 assert.equal(language.readNavigatorLanguagePreference(),'en');
 assert.equal(language.saveNavigatorLanguagePreference('fa-AF'),'fa');
});
