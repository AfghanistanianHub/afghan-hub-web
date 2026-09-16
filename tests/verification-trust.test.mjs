import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const verificationSource = fs.readFileSync(
  new URL("../src/components/ui/verification-badge.tsx", import.meta.url),
  "utf8",
);

test("verification UI uses bounded listing language", () => {
  assert.match(verificationSource, /Verified listing/);
  assert.match(verificationSource, /administrators have marked this listing as verified/i);
});

test("verification UI does not imply endorsement or guarantee", () => {
  assert.match(verificationSource, /not an endorsement or guarantee/i);
});
