import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const googleError = "Google sign-in could not be completed. Please try again or use your email and password.";

function loadModule(path, requireMap) {
  const exports = {};
  let oauthInput;
  const source = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    URL,
    URLSearchParams,
    Headers,
    AbortSignal,
    process: { env: { NODE_ENV: "test" } },
    require(name) {
      if (name in requireMap) return requireMap[name]({ setOAuthInput: input => { oauthInput = input; } });
      throw new Error(`unexpected import ${name}`);
    },
  });
  exports.getOAuthInput = () => oauthInput;
  return exports;
}

function loginActions({ oauthResult }) {
  return loadModule("../src/app/login/actions.ts", {
    "next/navigation": () => ({ redirect: path => { throw new Error(path); } }),
    "@/lib/site-url": () => ({ getSiteUrl: () => "https://app.apnbc.ca" }),
    "@/lib/password-policy": () => ({ getPasswordPolicyError: () => null }),
    "next/headers": () => ({ cookies: async () => ({ set() {} }) }),
    "@/lib/auth-navigation": () => ({ authLanguageCookie: "afghan-hub-auth-language", getAuthLanguage: value => value === "fa" || value === "ps" ? value : "en", getAuthDestination: value => typeof value === "string" && /^\\/(dashboard|messages|network)$/.test(value) ? value : "/dashboard" }),
    "@/lib/supabase/server": ({ setOAuthInput }) => ({
      createClient: async () => ({
        auth: {
          signInWithOAuth: async input => {
            setOAuthInput(input);
            return oauthResult;
          },
        },
      }),
    }),
  });
}

const formWith = (flow) => new Map([["flow", flow]]);

test("Google sign-in requests the Google provider with a same-origin callback", async () => {
  const app = loginActions({ oauthResult: { data: { url: "https://accounts.google.com/o/oauth2/auth?x=1" }, error: null } });
  await assert.rejects(app.signInWithGoogle(formWith("login")), { message: "https://accounts.google.com/o/oauth2/auth?x=1" });
  const input = app.getOAuthInput();
  assert.equal(input.provider, "google");
  assert.equal(input.options.redirectTo, "https://app.apnbc.ca/auth/callback?next=/dashboard&flow=oauth");
  assert.equal(input.options.skipBrowserRedirect, true);
});

test("Google sign-in failure returns to the same sign-in mode with an error", async () => {
  const app = loginActions({ oauthResult: { data: { url: null }, error: new Error("provider down") } });
  await assert.rejects(app.signInWithGoogle(formWith("join")), { message: `/login?mode=join&error=${encodeURIComponent(googleError)}` });
});

test("Google sign-in failure on the sign-in form keeps the login path", async () => {
  const app = loginActions({ oauthResult: { data: { url: null }, error: new Error("provider down") } });
  await assert.rejects(app.signInWithGoogle(formWith("login")), { message: `/login?error=${encodeURIComponent(googleError)}` });
});

function callbackRoute({ exchangeError = null } = {}) {
  let exchanged = [];
  const loaded = loadModule("../src/app/auth/callback/route.ts", {
    "next/server": () => ({
      NextResponse: class {
        constructor(_body, init = {}) { this.status = init.status; this.headers = new Headers(init.headers); }
        static redirect(url, status) { const response = new this(null, { status }); response.location = url.toString(); response.cookies = { set() {} }; return response; }
      },
    }),
    "@/lib/supabase/server": () => ({
      createClient: async () => ({
        auth: {
          exchangeCodeForSession: async code => {
            exchanged.push(code);
            return { error: exchangeError };
          },
        },
      }),
    }),
    "@/lib/site-url": () => ({ getSiteUrl: () => "https://app.apnbc.ca" }),
    "@/lib/auth-navigation": () => ({ authLanguageCookie: "afghan-hub-auth-language", getAuthLanguage: value => value === "fa" || value === "ps" ? value : "en", getAuthDestination: value => typeof value === "string" && /^\\/(dashboard|messages|network)$/.test(value) ? value : "/dashboard" }),
  });
  return { GET: loaded.GET, exchanged };
}

const request = query => ({ nextUrl: new URL(`https://app.apnbc.ca/auth/callback${query}`) });

test("OAuth callback exchanges the code and returns to dashboard", async () => {
  const route = callbackRoute();
  const response = await route.GET(request("?code=abc&flow=oauth&next=/dashboard"));
  assert.equal(response.location, "https://app.apnbc.ca/dashboard");
  assert.deepEqual(route.exchanged, ["abc"]);
});

test("OAuth callback with a provider error returns to login without exchanging a code", async () => {
  const route = callbackRoute();
  const response = await route.GET(request("?error=access_denied&flow=oauth"));
  assert.equal(new URL(response.location).pathname, "/login");
  assert.equal(new URL(response.location).searchParams.get("error"), googleError);
  assert.deepEqual(route.exchanged, []);
});

test("OAuth callback without a code returns to login", async () => {
  const route = callbackRoute();
  const response = await route.GET(request("?flow=oauth"));
  assert.equal(new URL(response.location).pathname, "/login");
  assert.equal(new URL(response.location).searchParams.get("error"), googleError);
});

test("OAuth callback with a failed code exchange returns to login", async () => {
  const route = callbackRoute({ exchangeError: new Error("invalid code") });
  const response = await route.GET(request("?code=bad&flow=oauth"));
  assert.equal(new URL(response.location).pathname, "/login");
  assert.equal(new URL(response.location).searchParams.get("error"), googleError);
});

test("OAuth callback ignores unsafe next destinations", async () => {
  const route = callbackRoute();
  const response = await route.GET(request("?code=abc&flow=oauth&next=https://evil.example/steal"));
  assert.equal(response.location, "https://app.apnbc.ca/dashboard");
});
