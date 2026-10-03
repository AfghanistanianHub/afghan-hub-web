import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/app/(dashboard)/moderation/team/page.tsx", import.meta.url),
  "utf8",
);

test("moderation team feedback is announced accessibly", () => {
  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="assertive"/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
});

test("role updates prevent repeat submission while pending", () => {
  assert.match(source, /<PendingSubmitButton/);
  assert.match(source, /pendingLabel="Saving role…"/);
  assert.doesNotMatch(source, />\s*Save role\s*<\/button>/);
});


test("moderation team renders a clear empty state when no accounts are available", () => {
  assert.match(source, /No member accounts to manage/);
  assert.match(source, /Member accounts will appear here once they are available to the admin directory/);
});
