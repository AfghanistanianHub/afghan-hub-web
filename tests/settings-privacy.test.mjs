import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/app/(dashboard)/settings/page.tsx", import.meta.url),
  "utf8",
);

test("settings reads account email from auth, not the profiles table", () => {
  const profileSelect = source.match(/\.from\("profiles"\)[\s\S]*?\.select\("([^"]+)"\)/)?.[1];
  assert.ok(profileSelect, "Expected an explicit profiles select in settings");
  assert.doesNotMatch(profileSelect, /(^|,\s*)email(\s*,|$)/);
  assert.match(source, /const accountEmail = user\.email \|\| "Not available";/);
  assert.doesNotMatch(source, /profile\?\.email/);
});
