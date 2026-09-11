import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function callback({ exchangeError = null } = {}) {
  const exports = {};
  const source = fs.readFileSync(new URL("../src/app/auth/callback/route.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    URL,
    Set,
    require(name) {
      if (name === "next/server") return { NextResponse: { redirect: url => ({ location: url.toString() }) } };
      if (name === "@/lib/supabase/server") return { createClient: async () => ({ auth: { exchangeCodeForSession: async () => ({ error: exchangeError }) } }) };
      throw new Error(name);
    },
  });
  return exports.GET;
}

function request(path) {
  const url = new URL(path, "https://app.apnbc.ca");
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
