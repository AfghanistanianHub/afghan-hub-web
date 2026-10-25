import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(path, dependencies, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, URL, URLSearchParams, ...globals, require: name => { assert.ok(name in dependencies, name); return dependencies[name]; },
  });
  return exports;
}
const navigation = load("../src/lib/auth-navigation.ts", {});

test("proxy preserves validated member destination and session cookie updates without gating auth callbacks", async () => {
  for (const signedIn of [false, true]) for (const path of ["/messages/conversation-id", "/auth/callback", "/login", "/forgot-password", "/api/assistant"]) {
    const response = () => {
      const values = [];
      return { headers: new Headers(), cookies: { getAll: () => values, set: (...args) => values.push(args.length === 1 ? args[0] : { name: args[0], value: args[1], ...args[2] }) } };
    };
    const app = load("../src/lib/supabase/proxy.ts", {
      "@/lib/auth-navigation": navigation,
      "next/server": { NextResponse: { next: response, redirect: url => ({ ...response(), location: String(url) }) } },
      "@supabase/ssr": { createServerClient: (url, key, options) => ({ auth: { getUser: async () => {
        options.cookies.setAll([{ name: "session", value: "synthetic", options: { secure: true } }]);
        return { data: { user: signedIn ? { id: "member" } : null } };
      } } }) },
    }, { process: { env: {} } });
    const url = new URL(path, "https://trusted-preview.test");
    const result = await app.updateSession({ nextUrl: Object.assign(url, { clone: () => new URL(url) }), cookies: { getAll: () => [], set() {} } });
    if (!signedIn && path.startsWith("/messages")) {
      assert.equal(new URL(result.location).pathname, "/login");
      assert.equal(new URL(result.location).searchParams.get("next"), path);
      assert.match(result.headers.get("Cache-Control"), /no-store/);
    } else assert.equal(result.location, undefined);
    assert.equal(result.cookies.getAll()[0].name, "session");
    assert.equal(result.cookies.getAll()[0].secure, true);
  }
});

test("callback locale survives a new browser origin and later explicit language selection", () => {
  const store = new Map();
  const document = { cookie: "", documentElement: {} };
  const window = {
    location: { pathname: "/login", search: "?lang=ps", protocol: "https:", href: "https://preview.test/login?lang=ps" },
    localStorage: { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) },
    history: { replaceState: (state, title, url) => { window.location.search = url.search; } }, dispatchEvent() {},
  };
  const language = load("../src/lib/i18n/site-language.ts", {}, { window, document, Event });
  assert.equal(language.readSiteLanguagePreference(), "ps");
  assert.equal(store.get("afghan-hub-site-language"), "ps");
  assert.match(document.cookie, /afghan-hub-auth-language=ps/);
  language.saveSiteLanguagePreference("fa");
  assert.equal(language.readSiteLanguagePreference(), "fa");
  assert.equal(window.location.search, "");
  assert.equal(document.documentElement.dir, "rtl");
});
