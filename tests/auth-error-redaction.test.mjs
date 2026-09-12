import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

test("password recovery actions do not expose provider error messages", () => {
  const forgotPassword = read("../src/app/forgot-password/actions.ts");
  const updatePassword = read("../src/app/update-password/actions.ts");

  for (const source of [forgotPassword, updatePassword]) {
    assert.ok(!source.includes("encodeURIComponent(error.message)"));
    assert.ok(!source.includes("?error=${encodeURIComponent(error.message)}"));
  }

  assert.match(forgotPassword, /resetRequestErrorMessage/);
  assert.match(updatePassword, /passwordUpdateErrorMessage/);
});
