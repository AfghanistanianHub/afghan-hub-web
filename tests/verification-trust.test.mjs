import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

const verificationSource = read("../src/components/ui/verification-badge.tsx");
const catalogSource = read("../src/lib/i18n/browse-copy.ts");

test("verification UI uses bounded listing language", () => {
  assert.match(verificationSource, /verification\.label/);
  assert.match(verificationSource, /verification\.aria/);
  assert.match(catalogSource, /"verification\.label": "Verified listing"/);
  assert.match(catalogSource, /administrators have marked this listing as verified/i);
});

test("verification UI does not imply endorsement or guarantee", () => {
  assert.match(catalogSource, /not an endorsement or guarantee/i);
});

test("verification copy is translated for every supported language", () => {
  assert.equal(
    (catalogSource.match(/"verification\.label":/g) ?? []).length,
    3,
  );
  assert.equal(
    (catalogSource.match(/"verification\.explanation":/g) ?? []).length,
    3,
  );
  assert.doesNotMatch(verificationSource, /Verified listing/);
});
