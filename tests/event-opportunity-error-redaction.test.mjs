import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const eventSource = fs.readFileSync(
  new URL("../src/app/(dashboard)/events/actions.ts", import.meta.url),
  "utf8",
);
const opportunitySource = fs.readFileSync(
  new URL("../src/app/(dashboard)/opportunities/actions.ts", import.meta.url),
  "utf8",
);

test("event actions redact provider errors from user-facing redirects", () => {
  assert.doesNotMatch(eventSource, /encodeURIComponent\(error\.message\)/);
  assert.match(eventSource, /could%20not%20create%20the%20event/);
  assert.match(eventSource, /could%20not%20save%20the%20event/);
  assert.match(eventSource, /could%20not%20delete%20the%20event/);
  assert.match(eventSource, /error\.message\.includes\("event_full"\)/);
  assert.match(eventSource, /error\.message\.includes\("event_has_started"\)/);
});

test("opportunity actions redact provider errors from user-facing redirects", () => {
  assert.doesNotMatch(opportunitySource, /encodeURIComponent\(error\.message\)/);
  assert.match(opportunitySource, /could%20not%20create%20the%20opportunity/);
  assert.match(opportunitySource, /could%20not%20save%20the%20opportunity/);
  assert.match(opportunitySource, /could%20not%20delete%20the%20opportunity/);
  assert.match(opportunitySource, /could%20not%20update%20your%20saved%20opportunities/);
});
