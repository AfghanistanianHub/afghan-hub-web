import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

test("account actions do not expose provider or database error messages", () => {
  const login = read("../src/app/login/actions.ts");
  const forgotPassword = read("../src/app/forgot-password/actions.ts");
  const updatePassword = read("../src/app/update-password/actions.ts");
  const settings = read("../src/app/(dashboard)/settings/actions.ts");

  for (const source of [login, forgotPassword, updatePassword, settings]) {
    assert.ok(!source.includes("encodeURIComponent(error.message)"));
    assert.ok(!source.includes("?error=${encodeURIComponent(error.message)}"));
  }

  assert.match(login, /loginErrorMessage/);
  assert.match(login, /signupErrorMessage/);
  assert.match(forgotPassword, /resetRequestErrorMessage/);
  assert.match(updatePassword, /passwordUpdateErrorMessage/);
  assert.match(settings, /settingsUpdateErrorMessage/);
});
