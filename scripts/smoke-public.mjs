import assert from "node:assert/strict";

// Read-only, anonymous release checks. Never send credentials or mutate records.
const base = new URL(process.env.SMOKE_BASE_URL || "http://localhost:3000");
assert.ok(["http:", "https:"].includes(base.protocol), "Use an HTTP(S) base URL");
assert.ok(!base.username && !base.password, "Do not put credentials in the base URL");
const checks = [
  // PR checks still target the existing production homepage until approval.
  ["/", 200, /One network|Rooted in community/],
  ["/about", 200, /<h1[ >]/],
  ["/privacy", 200, /info@apnbc\.ca/],
  ["/terms", 200, /info@apnbc\.ca/],
  ["/support", 200, /info@apnbc\.ca/],
  ["/explore?type=events", 200, /Find your next connection/],
  ["/login?mode=join", 200, /Create your Afghan Hub account/],
  ["/forgot-password", 200, /Reset your password/],
  ["/robots.txt", 200, /Sitemap: https:\/\/app\.apnbc\.ca\/sitemap\.xml/],
  ["/sitemap.xml", 200, /https:\/\/app\.apnbc\.ca\/about/],
  ["/explore/profiles/smoke-check", [200, 404], /This listing isn’t available/],
  ["/definitely-not-a-real-page", 404, /This page isn’t available/],
  ["/dashboard", 307],
  ["/messages", 307],
  ["/update-password", 307],
  ["/api/account/export", 401, /Sign in again to download your data/, "POST"],
];
const expectNoPoweredBy = process.env.EXPECT_NO_POWERED_BY === "1";
const deploymentRetryAttempts = Math.min(
  Math.max(Number.parseInt(process.env.DEPLOYMENT_HEADER_RETRY_ATTEMPTS || "1", 10) || 1, 1),
  18,
);
const deploymentRetryDelayMs = 10_000;

async function fetchOnce(path, method) {
  return fetch(new URL(path, base), {
    method,
    headers: method === "POST" ? { Origin: base.origin } : undefined,
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
}

async function fetchCheck(path, method) {
  let response = await fetchOnce(path, method);

  if (path === "/" && expectNoPoweredBy) {
    for (
      let attempt = 1;
      attempt < deploymentRetryAttempts &&
      response.headers.get("x-powered-by") !== null;
      attempt++
    ) {
      await new Promise((resolve) => setTimeout(resolve, deploymentRetryDelayMs));
      response = await fetchOnce(path, method);
    }
  }

  return response;
}

let failed = 0;
for (const [path, expectedStatus, pattern, method = "GET"] of checks) {
  try {
    const response = await fetchCheck(path, method);
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

      if (path === "/api/account/export") {
        assert.match(response.headers.get("cache-control") || "", /private.*no-store/);
        assert.equal(response.headers.get("content-disposition"), null);
        const foreign = await fetch(new URL(path, base), {
          method: "POST",
          headers: { Origin: "https://foreign.example.test" },
          redirect: "manual",
          signal: AbortSignal.timeout(15000),
        });
        assert.equal(foreign.status, 403, "Expected cross-origin download rejection");
        assert.match(foreign.headers.get("cache-control") || "", /no-store/);
      }

      if (["/privacy", "/terms", "/support"].includes(path)) {
        assert.match(body, /SAM Azad/, "Expected the confirmed responsible operator");
        assert.match(body, /href=["\']mailto:info@apnbc\.ca["\']/, "Expected the confirmed support email link");
        assert.match(body, /id=["\']main-content["\']/, "Expected the public skip-link target");
      }

      if (path === "/") {
        if (expectNoPoweredBy) {
          assert.equal(response.headers.get("x-powered-by"), null, "Framework powered-by header must stay disabled");
        }
        assert.equal(response.headers.get("x-content-type-options"), "nosniff");
        assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
        assert.equal(response.headers.get("x-frame-options"), "DENY");

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
        for (const page of ["privacy", "terms", "support"]) {
          assert.ok(body.includes(`https://app.apnbc.ca/${page}</loc>`), `Missing ${page} sitemap entry`);
        }
        assert.ok((body.match(/<loc>/g) || []).length >= 9, "Expected the nine static sitemap entries");
        assert.ok(!/<loc>[^<]*(?:\/api|\/members|\/dashboard|\/login|\/forgot-password|\/update-password|[?&]q=)/.test(body));
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
