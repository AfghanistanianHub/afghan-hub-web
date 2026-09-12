import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const businessSource = fs.readFileSync(
  new URL("../src/app/(dashboard)/businesses/actions.ts", import.meta.url),
  "utf8",
);
const organizationSource = fs.readFileSync(
  new URL("../src/app/(dashboard)/organizations/actions.ts", import.meta.url),
  "utf8",
);

for (const [name, source] of [
  ["business", businessSource],
  ["organization", organizationSource],
]) {
  test(`${name} actions redact provider errors from user-facing redirects`, () => {
    assert.doesNotMatch(source, /encodeURIComponent\(error(?:\?\.message|\.message)/);
    assert.match(source, /Please%20try%20again/);
  });

  test(`${name} verification uses the centralized access adapter`, () => {
    assert.match(source, /getMyAccessContext/);
    assert.doesNotMatch(source, /\.from\("profiles"\)[\s\S]*?\.select\("role"\)/);
  });
}
