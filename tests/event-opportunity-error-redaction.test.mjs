import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { eventActionErrorKey } from "../src/lib/i18n/browse-copy.ts";
import { eventFormErrorKey } from "../src/lib/i18n/workspace-copy.ts";

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
  // Failures redirect with stable codes; the visible copy is localized.
  assert.match(eventSource, /error=create-failed/);
  assert.match(eventSource, /error=update-failed/);
  assert.match(eventSource, /error=delete-failed/);
  assert.match(eventSource, /error=title-required/);
  assert.match(eventSource, /error=end-before-start/);
  assert.doesNotMatch(eventSource, /error=[A-Za-z]+%20/);
  assert.match(eventSource, /error\.message\.includes\("event_full"\)/);
  assert.match(eventSource, /error\.message\.includes\("event_has_started"\)/);
});

test("every event error code resolves to catalogue copy", () => {
  const codes = [
    ...new Set(
      [...eventSource.matchAll(/error=([a-z][a-z-]*)/g)].map((match) => match[1]),
    ),
  ];

  assert.ok(codes.length >= 10, "event actions emit their failure codes");

  for (const code of codes) {
    const localized =
      eventFormErrorKey(code) !== "eventForm.errorGeneric" ||
      eventActionErrorKey(code) !== "action.errorGeneric";
    assert.ok(localized, `event error code ${code} has no catalogue entry`);
  }
});

test("opportunity actions redact provider errors from user-facing redirects", () => {
  assert.doesNotMatch(opportunitySource, /encodeURIComponent\(error\.message\)/);
  // Failures redirect with stable codes; the visible copy is localized.
  assert.match(opportunitySource, /error=create-failed/);
  assert.match(opportunitySource, /error=update-failed/);
  assert.match(opportunitySource, /error=delete-failed/);
  assert.match(opportunitySource, /error=save-failed/);
  assert.doesNotMatch(opportunitySource, /error=[A-Za-z]+%20/);
});
