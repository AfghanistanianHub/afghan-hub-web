import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/lib/public-catalog.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
test("public route matching does not include member routes or similar prefixes", () => {
  for (const path of ["/robots.txt", "/sitemap.xml", "/", "/about", "/explore", "/explore/events/test"]) assert.equal(exports.isPublicPath(path), true);
  for (const path of ["/robots.txt/private", "/sitemap.xml/private", "/dashboard", "/members/member", "/messages", "/events/test", "/explorer", "/about-private", "/moderation"]) assert.equal(exports.isPublicPath(path), false);
});
test("category and pagination inputs reject prototype names and malformed pages", () => {
  assert.equal(exports.isPublicKind("events"), true);
  for (const kind of ["toString", "__proto__", "profiles", "unknown"]) assert.equal(exports.isPublicKind(kind), false);
  for (const page of ["0", "-1", "NaN", "1.5", "10000", ["2"], undefined]) assert.equal(exports.publicPageNumber(page), 1);
  assert.equal(exports.publicPageNumber("2"), 2);
  assert.equal(exports.publicHref("events", "a/b?next=bad"), "/explore/events/a%2Fb%3Fnext%3Dbad");
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
  assert.equal(new Set(urls).size, 8);
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
