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

test("target qualification and persona preflight happen before write acceptance", () => {
  const qualify = workflow.indexOf("npm run security:qualify-target");
  const roles = workflow.indexOf("npm run acceptance:roles");
  const journey = workflow.indexOf("JOURNEY_ACCEPTANCE_MODE: write");
  const rsvp = workflow.indexOf("RSVP_ACCEPTANCE_MODE: write");
  assert.ok(qualify >= 0 && roles > qualify && journey > roles && rsvp > roles);
});
