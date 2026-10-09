import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const paths={'./navigator-copy':'src/lib/assistant/navigator-copy.ts','./public-discovery':'src/lib/assistant/public-discovery.ts','./intents':'src/lib/assistant/intents.ts','./conversation':'src/lib/assistant/conversation.ts','./query':'src/lib/assistant/query.ts','./discovery-location':'src/lib/assistant/discovery-location.ts'};
function load(file) {
  const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,Set,require(name){assert.ok(paths[name],name);return load(paths[name]);}});return exports;
}
const guide=load('src/lib/assistant/guided-discovery.ts');
test('guided free text reuses known topic and location instead of repeating questions',()=>{
  const answers=guide.understandGuidedGoal('I want to meet artists in Vancouver');
  assert.equal(answers.topic,'arts');assert.equal(answers.location,'Vancouver');assert.equal(guide.nextGuidedQuestion(answers,'goal'),null);
  const partial=guide.understandGuidedGoal('Find opportunities in Vancouver');assert.equal(guide.nextGuidedQuestion(partial,'goal'),1);assert.equal(guide.nextGuidedQuestion({...partial,topic:'technology'},'topic'),null);
});
test('typical journeys ask only for missing interests and an optional location',()=>{
  for(const goal of ['Meet people','Find opportunities','Grow my work or business','Connect with organizations','Explore events',"I'm still exploring"]) {
    const answers=guide.understandGuidedGoal(goal);assert.equal(guide.nextGuidedQuestion(answers,'goal'),1,goal);assert.equal(guide.nextGuidedQuestion({...answers,topic:'arts'},'topic'),2);
  }
});
test('skips keep broad filters and guided queries remain bounded',()=>{
  const result=guide.guidedSearch({goal:'',topic:'',location:''});assert.equal(result.query,'Explore the community');assert.equal(result.filters.topic,'');
  assert.equal(guide.guidedSearch({goal:'a'.repeat(80),topic:'b'.repeat(80),location:'c'.repeat(60)}).query.length,120);
  assert.deepEqual(Object.keys(guide.guidedSearch({goal:'Explore events',topic:'',location:'',step:2,history:[]}).filters),['goal','topic','location']);
});

test('Persian and Pashto have complete draft resources and inclusive creative terminology',()=>{
 const {navigatorCopy,navigatorLocaleReview}=load('src/lib/assistant/navigator-copy.ts');
 for(const language of ['fa','ps']){assert.deepEqual(Object.keys(navigatorCopy[language]).sort(),Object.keys(navigatorCopy.en).sort());assert.equal(navigatorCopy[language].goals.length,6);assert.equal(navigatorCopy[language].topics.length,5);assert.equal(navigatorLocaleReview[language],'awaiting-native-review');}
 assert.deepEqual(Object.keys(navigatorCopy).sort(),['en','fa','ps']);
 assert.equal(navigatorCopy.fa.prompts[3],'هنرمندان و فعالان خلاق');
 const planner=load('src/lib/assistant/public-discovery.ts');
 assert.deepEqual(Array.from(planner.planPublicDiscovery(navigatorCopy.fa.prompts[1]).kinds),['organizations']);
});
