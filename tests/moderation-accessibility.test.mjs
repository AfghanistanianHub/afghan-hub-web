import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/app/(dashboard)/moderation/page.tsx", import.meta.url),
  "utf8",
);

test("moderation errors and success messages are announced", () => {
  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="assertive"/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
});

test("approve and reject actions prevent repeat submissions while pending", () => {
  assert.match(source, /<PendingSubmitButton/);
  assert.match(source, /pendingLabel="Approving…"/);
  assert.match(source, /pendingLabel="Rejecting…"/);
  assert.doesNotMatch(source, /<button\s+[\s\S]*?>\s*<Check[^>]*\/> Approve\s*<\/button>/);
  assert.doesNotMatch(source, /<button\s+[\s\S]*?>\s*<X[^>]*\/> Reject submission\s*<\/button>/);
});
