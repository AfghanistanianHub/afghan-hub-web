import assert from "node:assert/strict";

// Read-only, anonymous release checks. Never send credentials or mutate records.
const base = new URL(process.env.SMOKE_BASE_URL || "http://localhost:3000");
assert.ok(["http:", "https:"].includes(base.protocol), "Use an HTTP(S) base URL");
assert.ok(!base.username && !base.password, "Do not put credentials in the base URL");
const checks = [
  ["/", 200, /Rooted in community/],
  ["/about", 200, /<h1[ >]/],
  ["/explore?type=events", 200, /Find your next connection/],
  ["/login?mode=join", 200, /Join Afghan Hub/],
  ["/robots.txt", 200, /Sitemap: https:\/\/app\.apnbc\.ca\/sitemap\.xml/],
  ["/sitemap.xml", 200, /https:\/\/app\.apnbc\.ca\/about/],
  ["/explore/profiles/smoke-check", 404, /noindex/],
  ["/definitely-not-a-real-page", 404, /This page isn’t available/],
  ["/dashboard", 307],
  ["/messages", 307],
];
let failed = 0;
for (const [path, status, pattern] of checks) {
  try {
    const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, status, `Expected HTTP ${status}, received ${response.status}`);
    if (status === 307) {
      const location = new URL(response.headers.get("location"), base);
      assert.equal(location.origin, base.origin);
      assert.equal(location.pathname, "/login");
    } else {
      const body = await response.text();
      assert.match(body, pattern, "Expected page content was missing");
      if (path === "/sitemap.xml") {
        assert.ok((body.match(/<loc>/g) || []).length >= 6, "Expected the six static sitemap entries");
        assert.ok(!/<loc>[^<]*(?:\/members|\/dashboard|\/login|\/forgot-password|\/update-password|[?&]q=)/.test(body));
      }
    }
    console.log(`PASS ${path}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}
console.log(`${checks.length - failed}/${checks.length} anonymous release checks passed`);
process.exitCode = failed ? 1 : 0;
