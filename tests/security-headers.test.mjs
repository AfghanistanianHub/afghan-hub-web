import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);

test("baseline security headers apply to every route", () => {
  assert.match(source, /source:\s*"\/:path\*"/);
  assert.match(source, /X-Content-Type-Options/);
  assert.match(source, /nosniff/);
  assert.match(source, /Referrer-Policy/);
  assert.match(source, /strict-origin-when-cross-origin/);
  assert.match(source, /X-Frame-Options/);
  assert.match(source, /DENY/);
});

test("security hardening does not add a CSP without a nonce strategy", () => {
  assert.doesNotMatch(source, /Content-Security-Policy/);
});
