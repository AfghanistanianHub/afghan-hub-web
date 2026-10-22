import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(path, dependencies, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, URL, URLSearchParams, AbortSignal, fetch: async () => ({ ok: true, json: async () => ({ external: { google: true } }) }), process: { env: { NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co" } }, ...globals,
    require(name) { assert.ok(name in dependencies, name); return dependencies[name]; },
  });
  return exports;
}
const navigation = load("../src/lib/auth-navigation.ts", {});

test("member destinations reject origin escapes, encodings, queries and auth loops", () => {
  for (const value of ["//evil.test", "https://evil.test", "/\\evil.test", "/%2f%2fevil.test", "/messages?next=https://evil.test", "/messages/../login", "/auth/callback", "/update-password", null]) {
    assert.equal(navigation.getAuthDestination(value), "/dashboard");
  }
  for (const value of ["/messages", "/organizations/example/edit", "/network/member-id"]) assert.equal(navigation.getAuthDestination(value), value);
});

function actions({ error = null, url = "https://project.supabase.co/auth/v1/authorize?provider=google", throws = false, enabled = true } = {}) {
  const calls = [], cookies = [];
  const exports = load("../src/app/login/actions.ts", {
    "next/navigation": { redirect: location => { throw Error(location); } },
    "next/headers": { cookies: async () => ({ set: (...args) => cookies.push(args) }) },
    "@/lib/auth-navigation": navigation,
    "@/lib/site-url": { getSiteUrl: () => "https://trusted-preview.vercel.app" },
    "@/lib/password-policy": { getPasswordPolicyError: () => null },
    "@/lib/supabase/server": { createClient: async () => ({ auth: { signInWithOAuth: async input => { calls.push(input); if (throws) throw Error("private detail"); return { data: { url }, error }; } } }) },
  }, { fetch: async () => ({ ok: true, json: async () => ({ external: { google: enabled } }) }) });
  return { ...exports, calls, cookies };
}
test("Google initiation uses SDK PKCE, trusted callback, locale and member destination", async () => {
  const app = actions();
  await assert.rejects(app.continueWithGoogle(new Map([["lang", "ps"], ["next", "/messages"]])), /https:\/\/project.supabase.co\/auth\/v1\/authorize/);
  assert.equal(app.calls[0].provider, "google");
  const callback = new URL(app.calls[0].options.redirectTo);
  assert.equal(callback.origin, "https://trusted-preview.vercel.app");
  assert.equal(callback.pathname, "/auth/callback");
  assert.equal(callback.searchParams.get("flow"), "google");
  assert.equal(callback.searchParams.get("lang"), "ps");
  assert.equal(callback.searchParams.get("next"), "/messages");
  assert.equal(app.cookies[0][1], "ps");
  assert.equal(app.cookies[0][2].sameSite, "lax");
});
test("Google initiation redacts provider failures and rejects foreign authorization URLs", async () => {
  for (const options of [{ enabled: false }, { error: { message: "private detail" } }, { throws: true }, { url: "https://evil.test/auth/v1/authorize" }, { url: "https://project.supabase.co/other" }]) {
    const app = actions(options);
    await assert.rejects(app.continueWithGoogle(new Map()), error => {
      const location = new URL(error.message, "https://trusted-preview.vercel.app");
      assert.equal(location.pathname, "/login");
      assert.match(location.searchParams.get("error"), /continue with email/);
      assert.ok(!error.message.includes("private detail"));
      return true;
    });
  }
});

function callback({ error = null, throws = false } = {}) {
  const calls = [], cookies = [];
  class NextResponse {
    constructor(body, init = {}) { this.status = init.status; this.headers = new Headers(init.headers); }
    static redirect(url, status) { const r = new NextResponse(null, { status }); r.headers.set("Location", String(url)); r.cookies = { set: (...args) => cookies.push(args) }; return r; }
  }
  const route = load("../src/app/auth/callback/route.ts", {
    "next/server": { NextResponse }, "@/lib/auth-navigation": navigation,
    "@/lib/site-url": { getSiteUrl: () => "https://trusted-preview.vercel.app" },
    "@/lib/supabase/server": { createClient: async () => ({ auth: { exchangeCodeForSession: async code => { calls.push(code); if (throws) throw Error("private detail"); return { error }; } } }) },
  });
  return { ...route, calls, cookies };
}
const request = query => ({ nextUrl: new URL(`https://untrusted.test/auth/callback?${query}`) });
test("Google callback exchanges code once, retains member destination and locale, and prevents caching", async () => {
  const route = callback();
  const response = await route.GET(request("flow=google&code=one-use&next=/messages&lang=fa"));
  assert.equal(response.headers.get("Location"), "https://trusted-preview.vercel.app/messages?lang=fa");
  assert.equal(response.status, 303);
  assert.match(response.headers.get("Cache-Control"), /private.*no-store/);
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.deepEqual(route.calls, ["one-use"]);
  assert.equal(route.cookies[0][1], "fa");
});
test("Google cancellation, missing or duplicate codes, provider errors and failed exchanges are safe", async () => {
  for (const [query, options] of [["error=access_denied&error_description=private-detail", {}], ["", {}], ["code=a&code=b", {}], ["code=a&error=server_error", {}], ["code=bad", { error: {} }], ["code=bad", { throws: true }]]) {
    const route = callback(options);
    const response = await route.GET(request(`flow=google&next=//evil.test&${query}`));
    const location = new URL(response.headers.get("Location"));
    assert.equal(location.origin, "https://trusted-preview.vercel.app");
    assert.equal(location.pathname, "/login");
    assert.match(location.searchParams.get("error"), /Google sign-in/);
    assert.equal(location.searchParams.get("next"), "/dashboard");
    assert.ok(!location.toString().includes("private-detail"));
    assert.equal(location.searchParams.has("code"), false);
  }
});
test("HEAD cannot consume OAuth codes", async () => {
  const route = callback();
  assert.equal((await route.HEAD()).status, 405);
  assert.equal(route.calls.length, 0);
});
