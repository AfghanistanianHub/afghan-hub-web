import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadOriginGuard() {
  const source = fs.readFileSync(
    new URL("../src/lib/http/request-origin.ts", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, URL });
  return exports.isSameOriginRequest;
}

const searchRoute = fs.readFileSync(
  new URL("../src/app/api/assistant/search/route.ts", import.meta.url),
  "utf8",
);
const analyticsRoute = fs.readFileSync(
  new URL("../src/app/api/assistant/analytics/route.ts", import.meta.url),
  "utf8",
);

test("same-origin guard accepts exact origin and rejects missing or foreign origins", () => {
  const isSameOriginRequest = loadOriginGuard();

  const same = new Request("https://app.apnbc.ca/api/assistant/search", {
    method: "POST",
    headers: { origin: "https://app.apnbc.ca" },
  });
  const foreign = new Request("https://app.apnbc.ca/api/assistant/search", {
    method: "POST",
    headers: { origin: "https://evil.example" },
  });
  const missing = new Request("https://app.apnbc.ca/api/assistant/search", {
    method: "POST",
  });

  assert.equal(isSameOriginRequest(same), true);
  assert.equal(isSameOriginRequest(foreign), false);
  assert.equal(isSameOriginRequest(missing), false);
});

test("Assistant POST routes reject origin before auth or catalogue work", () => {
  for (const source of [searchRoute, analyticsRoute]) {
    assert.match(source, /isSameOriginRequest\(request\)/);
    assert.match(source, /status:\s*403/);

    const originGuard = source.indexOf("isSameOriginRequest(request)");
    const authClient = source.indexOf("createClient()");
    assert.ok(originGuard >= 0);
    assert.ok(authClient > originGuard);
  }
});

test("origin rejection copy does not echo request details", () => {
  for (const source of [searchRoute, analyticsRoute]) {
    assert.match(source, /Request origin is not allowed\./);
    assert.doesNotMatch(source, /headers\.get\("origin"\).*console|console.*headers\.get\("origin"\)/s);
  }
});
