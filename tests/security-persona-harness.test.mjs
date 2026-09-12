import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const harnessPath = new URL(
  "../scripts/security-profile-personas.mjs",
  import.meta.url,
);

test("profile persona harness hard-blocks Afghan Hub Production", async () => {
  const source = await readFile(harnessPath, "utf8");

  assert.match(source, /PRODUCTION_PROJECT_REF\s*=\s*["']yussznmwjsvfvpabmwdc["']/);
  assert.match(source, /Refusing to run security persona tests against Afghan Hub Production/);
  assert.match(source, /!target\.hostname\.includes\(PRODUCTION_PROJECT_REF\)/);
});

test("profile persona harness is read-only", async () => {
  const source = await readFile(harnessPath, "utf8");

  assert.doesNotMatch(source, /\.insert\s*\(/);
  assert.doesNotMatch(source, /\.update\s*\(/);
  assert.doesNotMatch(source, /\.delete\s*\(/);
  assert.doesNotMatch(source, /\.upsert\s*\(/);
  assert.doesNotMatch(source, /\.rpc\(["']set_profile_role["']/);
});
