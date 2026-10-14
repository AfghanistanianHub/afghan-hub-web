import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
function load(path) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, URL });
  return exports;
}
const {parseLocale, switchDestination, languageDirection} = load('src/lib/i18n/locale.ts');
const {translate} = load('src/lib/i18n/messages.ts');
test('interface languages accept legacy Persian and reject unsupported values',()=>{
  assert.equal(parseLocale('fa-AF'),'fa');
  for (const language of ['en','fa','ps']) assert.equal(parseLocale(language),language);
  for (const language of [null,'ar','fr','EN','',{},'fa<script>']) assert.equal(parseLocale(language),null);
});
test('switching keeps internal destination, filters, duplicate query values and fragment',()=>{
  for (const language of ['en','fa','ps']) {
    const result = new URL(switchDestination('/explore?type=events&q=film&tag=a&tag=b#results',language),'https://app.apnbc.ca');
    assert.equal(result.pathname,'/explore'); assert.equal(result.searchParams.get('lang'),language);
    assert.equal(result.searchParams.get('type'),'events'); assert.equal(result.searchParams.get('q'),'film');
    assert.deepEqual(result.searchParams.getAll('tag'),['a','b']); assert.equal(result.hash,'#results');
    assert.equal(switchDestination('/opportunities/community-role?from=saved',language),`/opportunities/community-role?from=saved&lang=${language}`);
  }
});
test('root and locale home switches replace locale instead of nesting or looping',()=>{
  for (const language of ['en','fa','ps']) for (const path of ['/','/en','/fa/','/ps?journey=film&lang=en#ai-navigator']) {
    const result = new URL(switchDestination(path,language),'https://app.apnbc.ca');
    assert.equal(result.pathname,`/${language}`); assert.equal(result.searchParams.has('lang'),false);
    if (path.includes('journey')) { assert.equal(result.searchParams.get('journey'),'film'); assert.equal(result.hash,'#ai-navigator'); }
  }
});
test('language selection cannot redirect externally or into API and callback handlers',()=>{
  for (const path of ['https://evil.example','//evil.example','/\\evil.example','/api/account/export','/auth/callback?code=fake','/language/select?locale=en','/_next/static/x','/\n/evil']) assert.equal(switchDestination(path,'ps'),'/ps');
});
test('essential public homepage interface has draft script-specific text and direction',()=>{
  const strings=['One network.','Many ways to ','belong.','Join the community','Explore the network','People','Businesses','Organizations','Opportunities','Events','How Afghan Hub works','Explore the community','View all','Your next step starts here.','Sign in','Get started','Contact & help','Privacy','Terms'];
  assert.equal(languageDirection('en'),'ltr');
  for (const locale of ['fa','ps']) {
    assert.equal(languageDirection(locale),'rtl');
    for (const text of strings) { const output=translate(locale,text); assert.notEqual(output,text,`${locale}: ${text}`); assert.match(output,/[\u0600-\u06ff]/); }
  }
});
