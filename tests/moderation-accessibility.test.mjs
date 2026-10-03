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
  assert.match(source, /name="decision"/);
  assert.match(source, /value="approve"/);
  assert.match(source, /value="reject"/);
  assert.match(source, /formNoValidate/);
  const formStart = source.indexOf("<form action={moderateContent}");
  const formEnd = source.indexOf("</form>", formStart);
  const sharedDecisionForm = source.slice(formStart, formEnd + "</form>".length);
  assert.ok(formStart >= 0 && formEnd > formStart);
  assert.equal((source.match(/<form action=\{moderateContent\}/g) ?? []).length, 1);
  assert.match(sharedDecisionForm, /name="decision"[\s\S]*?value="approve"/);
  assert.match(sharedDecisionForm, /name="decision"[\s\S]*?value="reject"/);
  assert.match(sharedDecisionForm, /name="moderation_note"/);
  assert.match(sharedDecisionForm, /formNoValidate/);
  assert.ok(
    sharedDecisionForm.indexOf('value="approve"') <
      sharedDecisionForm.indexOf('value="reject"'),
  );
  assert.doesNotMatch(source, /<button\s+[\s\S]*?>\s*<Check[^>]*\/> Approve\s*<\/button>/);
  assert.doesNotMatch(source, /<button\s+[\s\S]*?>\s*<X[^>]*\/> Reject submission\s*<\/button>/);
});


test("both moderation views expose the active tab to assistive technology", () => {
  assert.match(source, /aria-current=\{activeView === "pending" \? "page" : undefined\}/);
  assert.match(source, /aria-current=\{activeView === "history" \? "page" : undefined\}/);
});
