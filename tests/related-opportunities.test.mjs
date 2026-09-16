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

test("related ranking preserves deterministic source order as the final tie-break", () => {
  assert.match(source, /b\.score - a\.score \|\| a\.index - b\.index/);
});
