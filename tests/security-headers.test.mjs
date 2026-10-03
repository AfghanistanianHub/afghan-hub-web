import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadNextConfig() {
  const source = fs.readFileSync(
    new URL("../next.config.ts", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};

  vm.runInNewContext(compiled, {
    exports,
    module: { exports },
    require(name) {
      throw new Error(`Unexpected runtime dependency in next.config.ts: ${name}`);
    },
    process: { cwd: () => "/workspace/afghan-hub-web" },
  });

  return exports.default;
}

test("baseline security headers are returned for every route", async () => {
  const config = loadNextConfig();
  assert.equal(typeof config.headers, "function");

  const routes = await config.headers();
  assert.equal(routes.length, 1);
  assert.equal(routes[0].source, "/:path*");

  const headers = Object.fromEntries(
    routes[0].headers.map(({ key, value }) => [key, value]),
  );

  assert.deepEqual(headers, {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
  });
});

test("security hardening does not add a CSP without a nonce strategy", async () => {
  const config = loadNextConfig();
  const routes = await config.headers();
  assert.equal(
    routes.some((route) =>
      route.headers.some(({ key }) => key === "Content-Security-Policy"),
    ),
    false,
  );
});
