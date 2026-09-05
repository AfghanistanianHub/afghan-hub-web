import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadValidationHelpers() {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/lib/validation.ts"),
    "utf8",
  );
  const exports = {};

  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      URL,
    },
  );

  return exports;
}

test("HTTP URL validator only accepts http and https schemes", () => {
  const { isValidHttpUrl } = loadValidationHelpers();

  assert.equal(isValidHttpUrl("https://example.com/path"), true);
  assert.equal(isValidHttpUrl("http://example.com"), true);
  assert.equal(isValidHttpUrl("javascript:alert(1)"), false);
  assert.equal(isValidHttpUrl("data:text/html,test"), false);
  assert.equal(isValidHttpUrl("not a url"), false);
});

test("email validator accepts basic mailbox addresses and rejects malformed input", () => {
  const { isValidEmail } = loadValidationHelpers();

  assert.equal(isValidEmail("member@example.com"), true);
  assert.equal(isValidEmail("member+hub@example.co"), true);
  assert.equal(isValidEmail("member@example"), false);
  assert.equal(isValidEmail("@example.com"), false);
  assert.equal(isValidEmail("member @example.com"), false);
});
