import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function fixture(present, reduced=false) {
 const events=[],scrolls=[],exports={};
 const code=ts.transpileModule(readFileSync('src/components/assistant/navigator-journey-link.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(code,{exports,document:{getElementById:()=>present?{scrollIntoView:options=>scrolls.push(options)}:null},window:{dispatchEvent:event=>events.push(event),matchMedia:()=>({matches:reduced})},CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}},require(name){if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};if(name==='next/link')return {default:'link'};if(name==='lucide-react')return {ArrowRight:'icon'};throw Error(name);}});
 return {link:exports.NavigatorJourneyLink({query:'Artists & Creatives',title:'Arts'}),events,scrolls};
}
test('cross-page journey keeps native homepage navigation and modified clicks',()=>{
 for(const present of [false,true])for(const modifiers of present?[{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true}]:[{}]){
  const {link,events}=fixture(present);link.props.onClick({...modifiers,preventDefault:()=>assert.fail('Native navigation must continue')});assert.equal(events.length,0);assert.equal(link.props.href,'/?journey=Artists%20%26%20Creatives#ai-navigator');
 }
});
test('mounted journey dispatches context once and respects reduced motion',()=>{
 for(const reduced of [false,true]){const {link,events,scrolls}=fixture(true,reduced);let prevented=0;link.props.onClick({preventDefault:()=>prevented++});assert.equal(prevented,1);assert.equal(events.length,1);assert.equal(events[0].detail,'Artists & Creatives');assert.equal(scrolls[0].behavior,reduced?'auto':'smooth');}
});
