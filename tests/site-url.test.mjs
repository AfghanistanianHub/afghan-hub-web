import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../src/lib/site-url.ts", import.meta.url), "utf8");

function getSiteUrl(env) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, process: { env } },
  );
  return exports.getSiteUrl();
}

test("production without configuration uses the production origin", () => {
  assert.equal(getSiteUrl({ NODE_ENV: "production", VERCEL_ENV: "production" }), "https://app.apnbc.ca");
});

test("Vercel Preview without configuration uses its own deployment host", () => {
  assert.equal(
    getSiteUrl({ NODE_ENV: "production", VERCEL_ENV: "preview", VERCEL_URL: "afghan-hub-preview.vercel.app" }),
    "https://afghan-hub-preview.vercel.app",
  );
});

test("explicit NEXT_PUBLIC_SITE_URL wins over platform hosts", () => {
  assert.equal(
    getSiteUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_URL: "afghan-hub-preview.vercel.app",
      NEXT_PUBLIC_SITE_URL: " https://app.apnbc.ca/ ",
    }),
    "https://app.apnbc.ca",
  );
});

test("local development keeps the localhost origin", () => {
  assert.equal(getSiteUrl({ NODE_ENV: "development" }), "http://localhost:3000");
});
