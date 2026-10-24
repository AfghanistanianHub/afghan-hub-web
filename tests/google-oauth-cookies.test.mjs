import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadServerClient() {
  const cookieWrites = [];
  const state = { throwOnSet: false };
  const cookieJar = new Map([["sb-verifier", "pkce-verifier-value"]]);
  let adapter;
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync(new URL("../src/lib/supabase/server.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }
  ).outputText;
  const requireMap = {
    "@supabase/ssr": {
      createServerClient: (_url, _key, options) => {
        adapter = options.cookies;
        return { adapter: options.cookies };
      },
    },
    "next/headers": {
      cookies: async () => ({
        getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
        set: (name, value, options) => {
          if (state.throwOnSet) throw new Error("Cookies can only be modified in a Server Action");
          cookieWrites.push({ name, value, options });
          cookieJar.set(name, value);
        },
      }),
    },
    "./bounded-fetch": { createBoundedDatabaseFetch: () => fetch },
  };
  vm.runInNewContext(source, {
    exports,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "k" } },
    require(name) {
      if (name in requireMap) return requireMap[name];
      throw new Error(`unexpected import ${name}`);
    },
  });
  return { createClient: exports.createClient, cookieWrites, cookieJar, state, getAdapter: () => adapter };
}

test("server client reads the PKCE verifier cookie for the callback exchange", async () => {
  const env = loadServerClient();
  await env.createClient();
  const names = env.getAdapter().getAll().map(c => c.name);
  assert.ok(names.includes("sb-verifier"));
});

test("server client writes cookies with their options so the OAuth redirect response carries them", async () => {
  const env = loadServerClient();
  await env.createClient();
  const options = { path: "/", httpOnly: true, sameSite: "lax", secure: true };
  env.getAdapter().setAll([{ name: "sb-code-verifier", value: "v2", options }]);
  assert.deepEqual(env.cookieWrites, [{ name: "sb-code-verifier", value: "v2", options }]);
});

test("cookie write failures inside Server Components are swallowed, not thrown", async () => {
  const env = loadServerClient();
  await env.createClient();
  env.state.throwOnSet = true;
  const adapter = env.getAdapter();
  assert.doesNotThrow(() => adapter.setAll([{ name: "x", value: "y", options: {} }]));
});
