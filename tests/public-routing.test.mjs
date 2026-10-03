import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/lib/public-catalog.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
test("public route matching does not include member routes or similar prefixes", () => {
  for (const path of ["/robots.txt", "/sitemap.xml", "/", "/about", "/privacy", "/terms", "/support", "/explore", "/explore/events/test"]) assert.equal(exports.isPublicPath(path), true);
  for (const path of ["/robots.txt/private", "/sitemap.xml/private", "/dashboard", "/members/member", "/messages", "/events/test", "/explorer", "/about-private", "/privacy/private", "/privacy-settings", "/terms/private", "/terms-private", "/support/private", "/support-admin", "/moderation"]) assert.equal(exports.isPublicPath(path), false);
});
test("category and pagination inputs reject prototype names and malformed pages", () => {
  assert.equal(exports.isPublicKind("events"), true);
  for (const kind of ["toString", "__proto__", "profiles", "unknown"]) assert.equal(exports.isPublicKind(kind), false);
  for (const page of ["0", "-1", "NaN", "1.5", "10000", ["2"], undefined]) assert.equal(exports.publicPageNumber(page), 1);
  assert.equal(exports.publicPageNumber("2"), 2);
  assert.equal(exports.publicHref("events", "a/b?next=bad"), "/explore/events/a%2Fb%3Fnext%3Dbad");
});

test("sitemap source excludes published records with placeholder titles or names", async () => {
  const sitemapSourceExports = {};
  const rows = {
    opportunities: [
      { slug: "placeholder-opportunity", title: "Test" },
      { slug: "real-opportunity", title: "Community coordinator" },
    ],
    events: [
      { slug: "placeholder-event", title: " Testing " },
      { slug: "real-event", title: "Community night" },
    ],
    businesses: [
      { slug: "placeholder-business", name: "N/A" },
      { slug: "real-business", name: "Kabul Bakery" },
    ],
    organizations: [
      { slug: "placeholder-organization", name: "NA" },
      { slug: "real-organization", name: "Afghan Community Network" },
    ],
  };
  const source = fs.readFileSync(new URL("../src/lib/public-sitemap.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports: sitemapSourceExports,
    AbortSignal,
    fetch: () => {},
    Set,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://public.example", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key" } },
    require(name) {
      if (name === "server-only") return {};
      if (name === "@/lib/opportunities") return { getUtcDateKey: () => "2026-10-03" };
      if (name === "@/lib/public-listing-eligibility") return {
        currentOpportunityFilter: dateKey => `deadline.is.null,deadline.gte.${dateKey}`,
        currentEventFilter: nowIso => `ends_at.gte.${nowIso},and(ends_at.is.null,starts_at.gte.${nowIso})`,
        hasPublicListingTitle: value => {
          if (!value) return false;
          const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
          return Boolean(normalized) && !new Set(["n/a", "na", "test", "testing"]).has(normalized);
        },
      };
      if (name === "@supabase/supabase-js") return {
        createClient: () => ({
          from(table) {
            const query = new Proxy({}, {
              get(_target, method) {
                if (method === "then") return resolve => resolve({ data: rows[table], error: null });
                return () => query;
              },
            });
            return query;
          },
        }),
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  const items = await sitemapSourceExports.getPublicSitemapItems();
  assert.deepEqual(
    Array.from(items, item => `${item.kind}/${item.slug}`).sort(),
    [
      "businesses/real-business",
      "events/real-event",
      "opportunities/real-opportunity",
      "organizations/real-organization",
    ],
  );
});

test("sitemap contains canonical public categories and published detail URLs without private/search URLs", async () => {
  const sitemapExports = {};
  const source = fs.readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
  const published = [
    { kind: "events", slug: "community-night" },
    { kind: "businesses", slug: "kabul-bakery" },
  ];
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports: sitemapExports,
    require: (name) => {
      if (name === "@/lib/public-catalog") return exports;
      if (name === "@/lib/public-sitemap") return { getPublicSitemapItems: async () => published };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  const urls = Array.from(await sitemapExports.default(), entry => entry.url);
  assert.equal(new Set(urls).size, 11);
  for (const page of ["privacy", "terms", "support"]) {
    assert.ok(urls.includes(`https://app.apnbc.ca/${page}`));
  }
  assert.ok(urls.includes("https://app.apnbc.ca/explore/events/community-night"));
  assert.ok(urls.includes("https://app.apnbc.ca/explore/businesses/kabul-bakery"));
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, "https://app.apnbc.ca");
    assert.equal(parsed.searchParams.has("q"), false);
    assert.equal(parsed.pathname.startsWith("/members"), false);
    assert.equal(parsed.pathname.startsWith("/dashboard"), false);
    assert.equal(parsed.pathname.startsWith("/login"), false);
    if (parsed.pathname === "/explore") assert.ok(exports.isPublicKind(parsed.searchParams.get("type")));
  }
});
