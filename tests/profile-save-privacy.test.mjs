import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const actionsPath = new URL("../src/app/profile/actions.ts", import.meta.url);

test("profile save never copies account email into the public display name", async () => {
  const source = await readFile(actionsPath, "utf8");

  assert.match(
    source,
    /\[firstName, lastName\]\.filter\(Boolean\)\.join\(" "\) \|\| "Member"/,
  );
  assert.doesNotMatch(source, /join\(" "\) \|\| user\.email/);
});

test("profile save does not expose raw database errors in the redirect", async () => {
  const source = await readFile(actionsPath, "utf8");

  assert.doesNotMatch(source, /encodeURIComponent\(error\.message\)/);
  assert.match(source, /We%20could%20not%20save%20your%20profile/);
});
