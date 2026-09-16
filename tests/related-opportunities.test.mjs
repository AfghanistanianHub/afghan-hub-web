import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/lib/listing-recommendations.ts", import.meta.url),
  "utf8",
);

test("related opportunity ranking is implemented without a new persistence dependency", () => {
  assert.match(source, /export function rankRelatedOpportunities/);
  assert.match(source, /sameType \* 6/);
  assert.match(source, /opportunityLocationScore/);
  assert.match(source, /titleMatches \* 3/);
  assert.match(source, /summaryMatches \* 2/);
});

test("related event ranking uses topic and location signals with chronological tie-breaking", () => {
  assert.match(source, /export function rankRelatedEvents/);
  assert.match(source, /eventLocationScore/);
  assert.match(source, /new Date\(a\.event\.starts_at\)/);
});

test("related opportunity ranking preserves deterministic source order as the final tie-break", () => {
  assert.match(source, /b\.score - a\.score \|\| a\.index - b\.index/);
});
