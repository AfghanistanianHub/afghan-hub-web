import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/app/(dashboard)/search/page.tsx", import.meta.url),
  "utf8",
);

test("intent-aware search filters eligibility before ranking", () => {
  const eligibilityIndex = source.indexOf("const eligibleResults = rawResults.filter");
  const rankingIndex = source.indexOf("rankIntentCandidates(");
  assert.ok(eligibilityIndex >= 0);
  assert.ok(rankingIndex > eligibilityIndex);
  assert.match(source, /visibleMemberIds\.has\(result\.entity_id\)/);
  assert.match(source, /visibleOpportunityIds\.has\(result\.entity_id\)/);
  assert.match(source, /visibleEventIds\.has\(result\.entity_id\)/);
  assert.match(source, /visibleBusinessIds\.has\(result\.entity_id\)/);
  assert.match(source, /visibleOrganizationIds\.has\(result\.entity_id\)/);
});

test("search exposes supported intents and human-readable reasons", () => {
  assert.match(source, /phaseOneSearchIntents\.map/);
  assert.match(source, /getPhaseOneSearchIntent\(rawIntent\)/);
  assert.match(source, /intentReasonByKey/);
  assert.match(source, /VerificationBadge/);
});

test("intent-only browse stays bounded and keyword remains optional", () => {
  assert.match(source, /const isIntentOnlyBrowse = Boolean\(intent && query\.length === 0\)/);
  assert.match(source, /isIntentOnlyBrowse \? 24 : eligibleResults\.length/);
  assert.doesNotMatch(source, /name="q"[\s\S]{0,200}required/);
});
