import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const url = (source) => `data:text/javascript;base64,${Buffer.from(compile(source)).toString("base64")}`;
const queryUrl = url(fs.readFileSync("src/lib/assistant/query.ts", "utf8"));
const source = fs.readFileSync("src/lib/assistant/search.ts", "utf8")
  .replace('import "server-only";', "")
  .replace('"@/lib/assistant/query"', JSON.stringify(queryUrl));
const { searchAssistantCatalog } = await import(url(source));

const profile = (id, extra = {}) => ({ id, display_name: `Person ${id}`,
  first_name: null, last_name: null, headline: null, profession: null,
  company: null, city: null, country: null, skills: [], mentorship_topics: [],
  is_public: true, onboarding_completed: true, open_to_mentoring: true,
  looking_for_mentor: false, ...extra });
function client(profiles, failPage = false) {
  const filters = [];
  const ranges = [];
  const ordering = [];
  const builder = {
    select() { return this; },
    eq(key, value) { filters.push([key, value]); return this; },
    order(key) { if (!ordering.includes(key)) ordering.push(key); return this; },
    async range(start, end) {
      ranges.push([start, end]);
      if (failPage && start > 0) return { data: null, error: new Error("page failed") };
      return { data: profiles.filter(p => filters.every(([k, v]) => p[k] === v)).sort((a,b) => { for (const key of ordering) { const delta = String(a[key] ?? "").localeCompare(String(b[key] ?? "")); if (delta) return delta; } return 0; }).slice(start, end + 1), error: null };
    },
  };
  return { from: () => builder, ranges };
}
const options = { memberSignal: "open_to_mentoring" };
test("framing-only mentor requests browse eligible opt-ins", async () => {
  for (const query of ["Find a mentor", "Show me mentors", "Find mentors", "Find mentors.", "Find a mentor for me", "mentor", "منتور پیدا کن", "لارښود پیدا کړه"]) {
    const results = await searchAssistantCatalog(client([profile("1")]), query, options);
    assert.equal(results.length, 1, query);
  }
});
test("names, topics and locations qualify mentors without admitting ineligible profiles", async () => {
  const data = [profile("1", { display_name: "Jane", city: "Vancouver" }),
    profile("2", { mentorship_topics: ["Film"] }),
    profile("3", { display_name: "Jane", is_public: false }),
    profile("4", { display_name: "Jane", onboarding_completed: false }),
    profile("5", { display_name: "Jane", open_to_mentoring: false })];
  assert.deepEqual((await searchAssistantCatalog(client(data), "mentor Jane", options)).map(r => r.entityId), ["1"]);
  assert.deepEqual((await searchAssistantCatalog(client(data), "Find a mentor for Film", options)).map(r => r.entityId), ["2"]);
  assert.equal((await searchAssistantCatalog(client(data), "mentor Vancouver", options))[0].entityId, "1");
});
test("ranking considers eligible mentors beyond the Data API row cap", async () => {
  const data = Array.from({ length: 1001 }, (_, i) => profile(String(i)));
  data.push(profile("match", { display_name: "Zoe Jane" }));
  const db = client(data);
  const results = await searchAssistantCatalog(db, "mentor Jane", options);
  assert.equal(results[0].entityId, "match");
  assert.equal(db.ranges.length, 3);
});
test("a later page error fails instead of returning misleading partial results", async () => {
  await assert.rejects(searchAssistantCatalog(client(Array.from({ length: 500 }, (_, i) => profile(String(i))), true), "mentor Jane", options), /page failed/);
});
test("email-like names remain redacted and mentee discovery uses the other opt-in", async () => {
  const results = await searchAssistantCatalog(client([profile("1", { display_name: "jane@example.com", looking_for_mentor: true })]), "mentee", { memberSignal: "looking_for_mentor" });
  assert.equal(results[0].title, "Afghan Hub member");
});

test("generic browse stays bounded and meaningful audience qualifications survive", async () => {
  const db = client(Array.from({ length: 1001 }, (_, i) => profile(String(i))));
  assert.equal((await searchAssistantCatalog(db, "Find mentors", options)).length, 12);
  assert.deepEqual(db.ranges, [[0, 11]]);
  const result = await searchAssistantCatalog(client([profile("1", { skills: ["professionals"] })]), "mentor who coaches professionals", options);
  assert.equal(result[0].entityId, "1");
});

test("mentor names and topics ignore ordinary punctuation", async () => {
  const data = [profile("1", { display_name: "Jane", mentorship_topics: ["Film"] })];
  for (const query of ["mentor Jane?", "Find a mentor for Film!", "منتور Film؟"]) {
    assert.equal((await searchAssistantCatalog(client(data), query, options))[0].entityId, "1", query);
  }
});

test("exact scan boundary completes while overflow fails explicitly", async () => {
  const data = Array.from({ length: 10000 }, (_, i) => profile(String(i)));
  data[9999].display_name = "Zoe Jane";
  assert.equal((await searchAssistantCatalog(client(data), "mentor Jane", options))[0].entityId, "9999");
  await assert.rejects(searchAssistantCatalog(client([...data, profile("overflow")]), "mentor Jane", options), /too large/);
});
test("single-letter name qualifiers still rank matching profiles", async () => {
  const result = await searchAssistantCatalog(client([profile("1", { display_name: "Zoe" }), profile("2", { display_name: "C." })]), "mentor C.", options);
  assert.deepEqual(result.map(r=>r.entityId), ["2"]);
});

test("framing words cannot displace qualified mentors", async () => {
  const distractors = Array.from({ length: 12 }, (_, i) => profile(String(i), { headline: "Working together" }));
  const target = profile("target", { display_name: "Zoe", skills: ["technology"] });
  assert.equal((await searchAssistantCatalog(client([...distractors, target]), "Find mentors working in technology", options))[0].entityId, "target");
});
test("single initials do not score company, location or incidental letters", async () => {
  const distractors = Array.from({ length: 12 }, (_, i) => profile(String(i), { company: "Connect", city: "Vancouver", skills: ["coaching", "technology"] }));
  const target = profile("target", { display_name: "Zoe C." });
  assert.deepEqual((await searchAssistantCatalog(client([...distractors, target]), "mentor C.", options)).map(r=>r.entityId), ["target"]);
});

test("Persian object markers in browse commands do not qualify mentors", async () => {
  assert.equal((await searchAssistantCatalog(client([profile("1")]), "منتور را نشان بده", options)).length, 1);
});
test("standalone names that resemble framing and exact single-letter skills survive", async () => {
  const fillers = Array.from({length:12},(_,i)=>profile(String(i)));
  for (const name of ["A.", "An", "Me"]) {
    const result = await searchAssistantCatalog(client([...fillers, profile("target", {display_name:name})]), `mentor ${name}`, options);
    assert.deepEqual(result.map(r=>r.entityId),["target"], name);
  }
  const result = await searchAssistantCatalog(client([profile("1",{skills:["R"]}), profile("2",{skills:["Research"]})]), "mentor skilled in R", options);
  assert.deepEqual(result.map(r=>r.entityId),["1"]);
});

test("generic professional framing cannot displace the topic match", async () => {
  const fillers=Array.from({length:12},(_,i)=>profile(String(i),{headline:"Professional member"}));
  assert.equal((await searchAssistantCatalog(client([...fillers,profile("target",{skills:["technology"]})]),"Find professional mentors in technology",options))[0].entityId,"target");
  assert.equal((await searchAssistantCatalog(client([profile("1")]),"Find a professional mentor",options)).length,1);
});
test("first initials match names without searching incidental letters", async () => {
  assert.deepEqual((await searchAssistantCatalog(client([profile("1",{display_name:"John Smith"}),profile("2",{display_name:"Zoe",company:"Junior"})]),"mentor J",options)).map(r=>r.entityId),["1"]);
});

test("single-letter skill searches distinguish C from C++ and C#", async () => {
  const fillers=Array.from({length:12},(_,i)=>profile(String(i),{skills:[i%2?"C++":"C#"]}));
  const target=profile("target",{skills:["C"]});
  assert.deepEqual((await searchAssistantCatalog(client([...fillers,target]),"mentor skilled in C",options)).map(r=>r.entityId),["target"]);
});
test("name initials outrank incidental non-name tokens and skill wording disambiguates", async () => {
  const fillers=Array.from({length:12},(_,i)=>profile(String(i),{company:"J & J"}));
  assert.deepEqual((await searchAssistantCatalog(client([...fillers,profile("target",{display_name:"John Smith"})]),"mentor J",options)).map(r=>r.entityId),["target"]);
  assert.deepEqual((await searchAssistantCatalog(client([profile("1",{display_name:"Robert"}),profile("2",{skills:["R"]})]),"mentor skilled in R",options)).map(r=>r.entityId),["2"]);
});

test("mixed name and skill qualifiers retain their field scopes", async () => {
 const fillers=Array.from({length:12},(_,i)=>profile(`f${i}`,{display_name:`Aaron ${i}`,skills:["C"]}));
 const target=profile("target",{display_name:"John",skills:["C"]});
 assert.equal((await searchAssistantCatalog(client([...fillers,target]),"mentor J skilled in C",options))[0].entityId,"target");
 assert.equal((await searchAssistantCatalog(client([profile("r",{skills:["R/Python"]})]),"mentor skilled in R",options))[0].entityId,"r");
 for(const query of ["منتور را جستجو کن","مربی را جست‌وجو کن"]){assert.equal((await searchAssistantCatalog(client([profile("1")]),query,options)).length,1,query);}
});

test("skill framing has an explicit boundary and preserves compound terminology", async () => {
 const fillers=Array.from({length:12},(_,i)=>profile(`f${i}`,{display_name:`Aaron ${i}`,skills:["C"]}));
 const target=profile("target",{display_name:"John",skills:["C"]});
 assert.equal((await searchAssistantCatalog(client([...fillers,target]),"mentor skilled in C for J",options))[0].entityId,"target");
 assert.deepEqual((await searchAssistantCatalog(client([profile("rd",{skills:["R&D"]}),profile("r",{skills:["R"]})]),"mentor skilled in R",options)).map(r=>r.entityId),["r"]);
 const generic=Array.from({length:12},(_,i)=>profile(`g${i}`,{headline:"مرتبط با زمینه"}));
 for(const query of ["منتور مرتبط با تکنولوژی","منتور در زمینه تکنولوژی"]){assert.equal((await searchAssistantCatalog(client([...generic,profile("tech",{skills:["تکنولوژی"]})]),query,options))[0].entityId,"tech");}
});

test("exact names outrank incidental multi-field substrings", async () => {
 const fillers=Array.from({length:12},(_,i)=>profile(`f${i}`,{display_name:`Aaron ${i}`,headline:"annual planning",profession:"annual planner",skills:["annual planning"]}));
 assert.equal((await searchAssistantCatalog(client([...fillers,profile("ann",{display_name:"Ann"})]),"mentor Ann",options))[0].entityId,"ann");
});

test("explicit multi-letter skill scope excludes unrelated names", async () => {
 for(const skill of ["Ruby","Python","Java"]){
  const fillers=Array.from({length:12},(_,i)=>profile(`f${i}`,{display_name:skill}));
  const target=profile("skill",{display_name:"Zoe",skills:[skill]});
  assert.deepEqual((await searchAssistantCatalog(client([...fillers,target]),`mentor skilled in ${skill}`,options)).map(r=>r.entityId),["skill"]);
 }
});

test("explicit skill scope stops before a location qualifier", async () => {
 const other=profile("other",{display_name:"Aaron",skills:["Vancouver"]});
 const target=profile("target",{display_name:"Zoe",skills:["Ruby"],city:"Vancouver"});
 assert.equal((await searchAssistantCatalog(client([other,target]),"mentor skilled in Ruby in Vancouver",options))[0].entityId,"target");
});

test("explicit skills cannot be displaced by location or compound-topic names", async () => {
 const names=Array.from({length:12},(_,i)=>profile(`n${i}`,{display_name:"Vancouver"}));
 const ruby=profile("ruby",{display_name:"Zoe",skills:["Ruby"],city:"Vancouver"});
 for(const query of ["mentor skilled in Ruby in Vancouver","mentor skilled in Ruby (in Vancouver)"]){assert.deepEqual((await searchAssistantCatalog(client([...names,ruby]),query,options)).map(r=>r.entityId),["ruby"]);}
 const other=Array.from({length:12},(_,i)=>profile(`h${i}`,{display_name:"Healthcare"}));
 assert.deepEqual((await searchAssistantCatalog(client([...other,profile("ai",{skills:["AI in healthcare"]})]),"mentor skilled in AI in healthcare",options)).map(r=>r.entityId),["ai"]);
});
