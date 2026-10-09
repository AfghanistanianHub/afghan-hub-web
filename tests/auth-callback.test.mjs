import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function callback({ exchangeError = null, siteUrl = "https://app.apnbc.ca" } = {}) {
  const exports = {};
  const source = fs.readFileSync(new URL("../src/app/auth/callback/route.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    URL,
    Set,
    require(name) {
      if (name === "next/server") return { NextResponse: { redirect: url => ({ location: url.toString() }) } };
      if (name === "@/lib/supabase/server") return { createClient: async () => ({ auth: { exchangeCodeForSession: async () => ({ error: exchangeError }) } }) };
      if (name === "@/lib/site-url") return { getSiteUrl: () => siteUrl };
      throw new Error(name);
    },
  });
  return exports.GET;
}

function request(path, origin = "https://app.apnbc.ca") {
  const url = new URL(path, origin);
  return { nextUrl: { searchParams: url.searchParams, clone: () => new URL(url) } };
}

test("recovery callback accepts only the password update destination", async () => {
  const result = await callback()(request("/auth/callback?code=good&next=/update-password"));
  assert.equal(result.location, "https://app.apnbc.ca/update-password");
});

test("callback falls back to dashboard for unapproved next destinations", async () => {
  for (const next of ["/messages", "//evil.example", "https://evil.example"]) {
    const result = await callback()(request(`/auth/callback?code=good&next=${encodeURIComponent(next)}`));
    assert.equal(result.location, "https://app.apnbc.ca/dashboard");
  }
});

test("expired signup confirmation returns to join flow with a relevant error", async () => {
  const result = await callback({ exchangeError: { message: "expired" } })(request("/auth/callback?code=bad&flow=signup&next=/dashboard"));
  const location = new URL(result.location);
  assert.equal(location.pathname, "/login");
  assert.equal(location.searchParams.get("mode"), "join");
  assert.match(location.searchParams.get("error"), /confirmation link is invalid or has expired/i);
});

test("expired recovery link returns to reset request so the user can retry", async () => {
  const result = await callback({ exchangeError: { message: "expired" } })(request("/auth/callback?code=bad&next=/update-password"));
  const location = new URL(result.location);
  assert.equal(location.pathname, "/forgot-password");
  assert.match(location.searchParams.get("error"), /request a new link/i);
});


test("successful callbacks use the configured public origin when upstream origin differs", async () => {
  for (const [next, expected] of [["/dashboard", "/dashboard"], ["/update-password", "/update-password"], ["https://evil.example", "/dashboard"], ["//evil.example", "/dashboard"]]) {
    const result = await callback({ siteUrl: "https://preview.example/" })(request(`/auth/callback?code=good&next=${encodeURIComponent(next)}`, "http://localhost:3000"));
    assert.equal(result.location, `https://preview.example${expected}`);
  }
});

test("missing and expired callbacks use configured origin without leaking callback parameters", async () => {
  for (const flow of ["signup", "recovery"]) {
    for (const code of ["", "&code=expired"]) {
      const result = await callback({ siteUrl: "http://127.0.0.1:3000", exchangeError: { message: "expired" } })(request(`/auth/callback?flow=${flow}${code}&next=https://evil.example#private-fragment`, "http://localhost:3000"));
      const location = new URL(result.location);
      assert.equal(location.origin, "http://127.0.0.1:3000");
      assert.equal(location.pathname, flow === "signup" ? "/login" : "/forgot-password");
      assert.equal(location.searchParams.has("code"), false);
      assert.equal(location.searchParams.has("next"), false);
      assert.equal(location.hash, "");
    }
  }
});
