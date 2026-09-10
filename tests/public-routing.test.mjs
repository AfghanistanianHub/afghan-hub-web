import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/lib/public-catalog.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
test("public route matching does not include member routes or similar prefixes", () => {
  for (const path of ["/", "/about", "/explore", "/explore/events/test"]) assert.equal(exports.isPublicPath(path), true);
  for (const path of ["/dashboard", "/members/member", "/messages", "/events/test", "/explorer", "/about-private", "/moderation"]) assert.equal(exports.isPublicPath(path), false);
});
test("category and pagination inputs reject prototype names and malformed pages", () => {
  assert.equal(exports.isPublicKind("events"), true);
  for (const kind of ["toString", "__proto__", "profiles", "unknown"]) assert.equal(exports.isPublicKind(kind), false);
  for (const page of ["0", "-1", "NaN", "1.5", "10000", ["2"], undefined]) assert.equal(exports.publicPageNumber(page), 1);
  assert.equal(exports.publicPageNumber("2"), 2);
  assert.equal(exports.publicHref("events", "a/b?next=bad"), "/explore/events/a%2Fb%3Fnext%3Dbad");
});
