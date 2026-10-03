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
  for (const query of ["Find a mentor", "Show me mentors", "Find mentors", "Find a mentor for me", "mentor", "منتور پیدا کن", "لارښود پیدا کړه"]) {
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
