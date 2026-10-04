import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";
const url = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString("base64")}`;
const intents = url(fs.readFileSync("src/lib/assistant/intents.ts","utf8"));
const query = url(fs.readFileSync("src/lib/assistant/query.ts","utf8"));
const source = fs.readFileSync("src/lib/assistant/conversation.ts","utf8").replace('"./intents"',JSON.stringify(intents)).replace('"./query"',JSON.stringify(query));
const { resolveNavigatorContext: resolve, navigatorSearchQuery: searchQuery } = await import(url(source));
test("explicit location refinement and category follow-up preserve topic", () => {
  const initial = resolve("Find mentors in Vancouver for film");
  const film = {topic:"film",entityType:"profile",memberSignal:"open_to_mentoring"};
  const local = resolve("Only Vancouver.",film);
  assert.equal(local.topic,"film"); assert.equal(local.city,"Vancouver");
  assert.equal(local.memberSignal,"open_to_mentoring");
  const events = resolve("Show me events too.",local);
  assert.equal(events.topic,"film"); assert.equal(events.city,"Vancouver");
  assert.equal(events.entityType,"event"); assert.equal(events.memberSignal,undefined);
  assert.equal(searchQuery(events),"film Vancouver");
  assert.equal(initial.memberSignal,"open_to_mentoring");
});
test("Dari and Pashto explicit city refinements retain conversation filters", () => {
  const previous={topic:"فیلم",entityType:"profile",memberSignal:"open_to_mentoring"};
  assert.equal(resolve("فقط ونکوور",previous).city,"ونکوور");
  assert.equal(resolve("یوازې ونکوور",previous).city,"ونکوور");
  assert.equal(resolve("هر ځای",{...previous,city:"ونکوور"}).city,undefined);
});
test("a new independent request replaces previous topic and mentorship scope", () => {
  const result=resolve("Find volunteer opportunities",{topic:"film",city:"Vancouver",memberSignal:"open_to_mentoring"});
  assert.equal(result.topic,"volunteer"); assert.equal(result.city,undefined);
  assert.equal(result.entityType,"opportunity"); assert.equal(result.memberSignal,undefined);
});
test("relocation and mentoring framing retain the explicit professional topic", () => {
  const result=resolve("I recently moved to Vancouver and I'm looking for people in filmmaking and maybe someone who could mentor me.");
  assert.equal(result.city,"Vancouver"); assert.equal(result.topic,"filmmaking");
  assert.equal(result.memberSignal,"open_to_mentoring");
});

test("mentor qualification survives context normalization and localized follow-ups", () => {
 for (const query of ["mentor A.", "mentor An", "mentor Me", "mentor skilled in R", "mentor J skilled in C"]){
  const context=resolve(query);
  assert.ok(context.topic,query);
  if(query.includes("skilled"))assert.ok(searchQuery(context).includes("skilled in"));
 }
 for(const query of ["Find a mentor","مربی را جست‌وجو کن","منتور را جستجو کن"]){assert.equal(resolve(query).topic,"",query);}
 const previous={topic:"film",city:"Vancouver",entityType:"profile",memberSignal:"open_to_mentoring"};
 for(const query of ["رویدادها را هم نشان بده","غونډې هم را وښیه"]){
  const context=resolve(query,previous);assert.equal(context.topic,"film",query);assert.equal(context.city,"Vancouver",query);assert.equal(context.entityType,"event",query);assert.equal(context.memberSignal,undefined);
 }
});

test("category-only refinements are not mistaken for cities", () => {
  const previous={topic:"film",city:"Vancouver",entityType:"profile",memberSignal:"open_to_mentoring"};
  for (const [query,type] of [["Only events","event"],["Just businesses","business"],["فقط رویدادها","event"],["یوازې غونډې","event"]]) {
    const context=resolve(query,previous);
    assert.equal(context.topic,"film",query);
    assert.equal(context.city,"Vancouver",query);
    assert.equal(context.entityType,type,query);
    if(type!=="profile") assert.equal(context.memberSignal,undefined,query);
  }
});
