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
  assert.match(source, /find_mentor/);
  assert.match(source, /offer_mentorship/);
  assert.match(source, /open_to_mentoring/);
  assert.match(source, /looking_for_mentor/);
  assert.match(source, /memberIntentCandidate\(key, \{/);
});

test("intent-only browse stays bounded and keyword remains optional", () => {
  assert.match(source, /const BROWSE_RESULT_LIMIT = 24/);
  assert.match(source, /limitIntentBrowseCandidates/);
  assert.doesNotMatch(source, /name="q"[\s\S]{0,200}required/);
});

test("keyword intent expands candidates before the final display cap", () => {
  assert.match(source, /const KEYWORD_RESULT_LIMIT = 30/);
  assert.match(source, /const INTENT_KEYWORD_CANDIDATE_LIMIT = 100/);
  assert.match(
    source,
    /result_limit:\s*intent[\s\S]*INTENT_KEYWORD_CANDIDATE_LIMIT[\s\S]*KEYWORD_RESULT_LIMIT/,
  );
  const rankingIndex = source.indexOf("rankIntentCandidates(");
  const displaySliceIndex = source.indexOf(
    "rankedIntentCandidates.slice(0, KEYWORD_RESULT_LIMIT)",
  );
  assert.ok(rankingIndex >= 0 && displaySliceIndex > rankingIndex);
});
