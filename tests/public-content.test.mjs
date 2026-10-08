import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadContent({ data = [], error = null, configured = true } = {}) {
  const calls = [];
  let config;
  const query = new Proxy({}, { get(_target, method) {
    if (method === "then") return (resolve) => resolve({ data, error });
    return (...args) => { calls.push([method, ...args]); return query; };
  } });
  const exports = {};
  const source = fs.readFileSync(new URL("../src/lib/public-content.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, AbortSignal, Date, fetch: () => {}, Set,
    process: { env: configured ? { NEXT_PUBLIC_SUPABASE_URL: "https://public.example", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key" } : {} },
    require(name) {
      if (name === "@/lib/assistant/discovery-location") return { discoveryLocationTerms: value => value === "British Columbia" ? ["British Columbia", "BC"] : value ? [value] : [] };
      if (name === "server-only") return {};
      if (name === "react") return { cache: fn => fn };
      if (name === "@/lib/opportunities") return { getUtcDateKey: () => "2026-09-10" };
      if (name === "@/lib/public-listing-eligibility") return {
        currentOpportunityFilter: dateKey => `deadline.is.null,deadline.gte.${dateKey}`,
        currentEventFilter: nowIso => `ends_at.gte.${nowIso},and(ends_at.is.null,starts_at.gte.${nowIso})`,
      };
      if (name === "@supabase/supabase-js") return { createClient: (url, key, options) => { config = { url, key, options }; return { from: table => { calls.push(["from", table]); return query; } }; } };
      throw new Error(`Unexpected dependency (public reads must not import a session client): ${name}`);
    },
  });
  return { load: exports.getPublicListings, clean: exports.cleanPublicText, calls, config: () => config };
}

for (const kind of ["opportunities", "events", "businesses", "organizations"]) {
  test(`${kind}: public reads use publication filter, anonymous configuration, and explicit safe fields`, async () => {
    const app = loadContent();
    await app.load(kind);
    assert.ok(app.calls.some(call => call[0] === "eq" && call[1] === "status" && call[2] === "published"));
    const selection = app.calls.find(call => call[0] === "select")[1];
    assert.doesNotMatch(selection, /\*|owner_id|author_id|creator_id|moderation|contact_email|phone|email|online_url|profiles/);
    assert.equal(app.config().key, "publishable-test-key");
    assert.equal(app.config().options.auth.persistSession, false);
    assert.equal(app.config().options.auth.autoRefreshToken, false);
    assert.equal(app.config().options.auth.detectSessionInUrl, false);
    assert.equal(app.config().options.cookies, undefined);
  });
}

test("public copy hides exact placeholder values without mutating real content", () => {
  const app = loadContent();
  for (const value of [null, "", "   ", "N/A", " n/a ", "NA", "Test", " testing "]) assert.equal(app.clean(value), null);
  assert.equal(app.clean(" Testing community workshop "), "Testing community workshop");
  assert.equal(app.clean("Test-driven mentoring program"), "Test-driven mentoring program");
});

test("public listings with placeholder titles or names are omitted entirely", async () => {
  const fixtures = [
    ["opportunities", { slug: "test-opportunity", title: " Test ", summary: "Useful summary", description: "Useful description", type: "job", city: null, country: null, is_remote: true, deadline: null }],
    ["events", { slug: "test-event", title: "Testing", summary: "Useful summary", description: "Useful description", city: null, country: null, is_online: true, starts_at: "2026-10-01T00:00:00Z", ends_at: null }],
    ["businesses", { slug: "test-business", name: "N/A", short_description: "Useful summary", description: "Useful description", category: "Services", city: null, country: null }],
    ["organizations", { slug: "test-organization", name: "NA", short_description: "Useful summary", description: "Useful description", organization_type: "nonprofit", city: null, country: null }],
  ];

  for (const [kind, row] of fixtures) {
    const result = await loadContent({ data: [row] }).load(kind);
    assert.equal(result.unavailable, false);
    assert.equal(result.items.length, 0);
  }
});

test("discovery excludes expired opportunities and keeps only upcoming or ongoing events", async () => {
  const app = loadContent();
  await app.load("opportunities");
  assert.ok(app.calls.some(call => call[0] === "or" && call[1] === "deadline.is.null,deadline.gte.2026-09-10"));
  await app.load("events");
  const eventFilter = app.calls.find(call => call[0] === "or" && typeof call[1] === "string" && call[1].includes("ends_at.gte."));
  assert.ok(eventFilter);
  assert.match(eventFilter[1], /and\(ends_at\.is\.null,starts_at\.gte\./);
});

test("detail lookup still filters publication without hiding historical public listings", async () => {
  const app = loadContent();
  await app.load("opportunities", { slug: "old-listing" });
  assert.ok(app.calls.some(call => call[0] === "eq" && call[1] === "slug" && call[2] === "old-listing"));
  assert.ok(app.calls.some(call => call[0] === "eq" && call[1] === "status" && call[2] === "published"));
  assert.ok(!app.calls.some(call => call[0] === "or"));
});

test("pagination fetches one extra row and maps only public fields", async () => {
  const row = { slug: "one", name: "Business", short_description: "Summary", description: "Details", category: "Services", city: "City", country: "Country", owner_id: "private", email: "private@example.com" };
  const app = loadContent({ data: [row, { ...row, slug: "two" }] });
  const result = await app.load("businesses", { limit: 1, page: 2, search: "50%_" });
  assert.equal(result.items.length, 1);
  assert.equal(result.hasMore, true);
  assert.equal(result.items[0].owner_id, undefined);
  assert.equal(result.items[0].email, undefined);
  assert.ok(app.calls.some(call => call[0] === "range" && call[1] === 1 && call[2] === 2));
  assert.ok(app.calls.some(call => call[0] === "ilike" && call[2] === "%50\\%\\_%"));
});

test("query failures and missing configuration remain distinguishable from empty results", async () => {
  assert.equal((await loadContent({ error: { message: "internal details" } }).load("events")).unavailable, true);
  assert.equal((await loadContent({ configured: false }).load("events")).unavailable, true);
  const result = await loadContent().load("events");
  assert.equal(result.unavailable, false);
  assert.equal(result.items.length, 0);
});

test('Navigator field filters bound and sanitize user input while preserving public eligibility', async () => {
  const app = loadContent();
  await app.load('opportunities', {discoveryTerms:['technology', 'a,b).or(status.eq.draft'],discoveryLocation:'Vancouver',limit:24});
  const filter=app.calls.find(call=>call[0]==='or')[1];
  assert.match(filter,/deadline\.is\.null/);
  assert.match(filter,/summary\.ilike\.%technology%/);
  assert.doesNotMatch(filter,/\btype\.ilike/); // opportunity_type is a PostgreSQL enum.
  assert.match(filter,/city\.ilike\.%Vancouver%/);
  assert.doesNotMatch(filter,/a,b\)\.or\(status\.eq\.draft/);
  assert.ok(app.calls.some(call=>call[0]==='eq'&&call[1]==='status'&&call[2]==='published'));
});

test('province discovery uses fixed safe fields and exact short regional aliases', async () => {
  const app=loadContent();await app.load('organizations',{discoveryLocation:'British Columbia'});
  const filter=app.calls.find(call=>call[0]==='or')[1];assert.match(filter,/province_state\.ilike\.%British Columbia%/);assert.match(filter,/province_state\.ilike\.BC/);assert.doesNotMatch(filter,/ilike\.%BC%/);
});
