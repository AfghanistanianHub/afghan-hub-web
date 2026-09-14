import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../scripts/role-persona-acceptance.mjs", import.meta.url), "utf8");
const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("role persona harness is exposed through the acceptance command", () => {
  assert.equal(pkg.scripts["acceptance:roles"], "node scripts/role-persona-acceptance.mjs");
});

test("role persona harness uses publishable credentials and contains no application writes", () => {
  assert.match(source, /AUTH_ACCEPTANCE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(source, /SERVICE_ROLE|service_role/i);
  assert.doesNotMatch(source, /\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/);
});

test("role persona harness verifies member denies and privileged self-protection", () => {
  assert.match(source, /moderate_event/);
  assert.match(source, /set_profile_role/);
  assert.match(source, /can_moderate/);
  assert.match(source, /is_admin/);
  assert.match(source, /target_profile_id:\s*admin\.userId/);
});

test("production execution requires the disposable-account acknowledgement", () => {
  assert.match(source, /PRODUCTION_PROJECT_REF/);
  assert.match(source, /AUTH_ACCEPTANCE_ALLOW_PRODUCTION/);
  assert.match(source, /I_UNDERSTAND_THESE_ARE_DISPOSABLE_TEST_ACCOUNTS/);
});
