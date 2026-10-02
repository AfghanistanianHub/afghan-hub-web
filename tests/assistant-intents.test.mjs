import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/lib/assistant/intents.ts", import.meta.url),
  "utf8",
);

test("assistant intent layer includes English, Dari and Pashto prompt support", () => {
  assert.match(source, /assistantSuggestedPrompts/);
  assert.match(source, /en:/);
  assert.match(source, /fa:/);
  assert.match(source, /ps:/);
  assert.match(source, /فرصت‌های داوطلبی/);
  assert.match(source, /د رضاکارۍ فرصتونه/);
});

test("assistant intent layer only maps to read-only discovery entity types", () => {
  for (const entity of ["profile", "organization", "business", "opportunity", "event"]) {
    assert.match(source, new RegExp(`entityType: "${entity}"`));
  }

  assert.doesNotMatch(source, /send_message|connection_request|rsvp|save_opportunity/);
});
