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
  ["/forgot-password", 200, /Reset your password/],
  ["/robots.txt", 200, /Sitemap: https:\/\/app\.apnbc\.ca\/sitemap\.xml/],
  ["/sitemap.xml", 200, /https:\/\/app\.apnbc\.ca\/about/],
  ["/explore/profiles/smoke-check", [200, 404], /This listing isn’t available/],
  ["/definitely-not-a-real-page", 404, /This page isn’t available/],
  ["/dashboard", 307],
  ["/messages", 307],
  ["/update-password", 307],
];
let failed = 0;
for (const [path, expectedStatus, pattern] of checks) {
  try {
    const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(15000) });
    const allowedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    assert.ok(
      allowedStatuses.includes(response.status),
      `Expected HTTP ${allowedStatuses.join(" or ")}, received ${response.status}`,
    );
    if (allowedStatuses.length === 1 && allowedStatuses[0] === 307) {
      const location = new URL(response.headers.get("location"), base);
      assert.equal(location.origin, base.origin);
      assert.equal(location.pathname, "/login");
    } else {
      const body = await response.text();
      assert.match(body, pattern, "Expected page content was missing");

      if (path === "/") {
        const metaTags = body.match(/<meta\b[^>]*>/gi) ?? [];
        const ogImageTag = metaTags.find((tag) => /property=["']og:image["']/i.test(tag));
        const twitterImageTag = metaTags.find((tag) => /name=["']twitter:image["']/i.test(tag));
        assert.ok(ogImageTag, "Expected an Open Graph image meta tag");
        assert.ok(twitterImageTag, "Expected a Twitter image meta tag");
        assert.match(
          ogImageTag,
          /content=["']https:\/\/app\.apnbc\.ca\//i,
          "Expected the Open Graph image to resolve against the production origin",
        );
        assert.match(
          twitterImageTag,
          /content=["']https:\/\/app\.apnbc\.ca\//i,
          "Expected the Twitter image to resolve against the production origin",
        );
        assert.ok(
          !metaTags.some((tag) =>
            /(?:property=["']og:image["']|name=["']twitter:image["'])/i.test(tag) &&
            /content=["']http:\/\/localhost(?::3000)?\//i.test(tag),
          ),
          "Social image metadata must not resolve to localhost",
        );
      }

      if (path.startsWith("/login") || path === "/forgot-password") {
        assert.match(
          body,
          /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i,
          "Expected auth/recovery page to be noindex",
        );
      }

      if (path === "/explore/profiles/smoke-check") {
        assert.match(
          body,
          /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i,
          "Expected an invalid public listing kind to remain noindex",
        );
      }

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
