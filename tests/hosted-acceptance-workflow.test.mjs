import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workflow = fs.readFileSync(
  new URL("../.github/workflows/hosted-acceptance.yml", import.meta.url),
  "utf8",
);

test("hosted acceptance is manual-only and pinned to the secondary project", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\bschedule:/);
  assert.doesNotMatch(workflow, /\bpush:/);
  assert.doesNotMatch(workflow, /\bpull_request:/);
  assert.match(workflow, /https:\/\/rurgmyiiytesknsfwjjl\.supabase\.co/);
  assert.doesNotMatch(workflow, /yussznmwjsvfvpabmwdc/);
});

test("hosted acceptance uses secrets for credentials and defaults writes off", () => {
  assert.match(workflow, /default: false/);
  assert.match(workflow, /secrets\.ACCEPTANCE_MEMBER_A_EMAIL/);
  assert.match(workflow, /secrets\.ACCEPTANCE_MEMBER_A_PASSWORD/);
  assert.match(workflow, /secrets\.ACCEPTANCE_MEMBER_B_EMAIL/);
  assert.match(workflow, /secrets\.ACCEPTANCE_MEMBER_B_PASSWORD/);
  assert.doesNotMatch(workflow, /AUTH_ACCEPTANCE_MEMBER_A_EMAIL:\s+[^$\n]/);
  assert.doesNotMatch(workflow, /AUTH_ACCEPTANCE_MEMBER_A_PASSWORD:\s+[^$\n]/);
});

test("write journey preserves short-lived exact cleanup material", () => {
  assert.match(workflow, /JOURNEY_ACCEPTANCE_MODE: write/);
  assert.match(workflow, /JOURNEY_ACCEPTANCE_ALLOW_WRITES:/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /retention-days: 3/);
  assert.match(workflow, /afghan-hub-member-journey-cleanup-\*\.sql/);
  assert.match(workflow, /if-no-files-found: error/);
});

test("all suites depend on qualification and failures do not cancel sibling suites", () => {
  assert.match(workflow, /needs: qualify/);
  assert.match(workflow, /fail-fast: false/);
  assert.match(workflow, /suite: \[roles, journey, rsvp, avatar\]/);
  assert.match(workflow, /group: secondary-hosted-acceptance/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /ROLE_ACCEPTANCE_REQUIRE_ALL_PERSONAS: "true"/);
  for (const suite of ["roles", "journey", "rsvp", "avatar"]) {
    assert.ok(workflow.includes(`matrix.suite == '${suite}'`));
  }
});
