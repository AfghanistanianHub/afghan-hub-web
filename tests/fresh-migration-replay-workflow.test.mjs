import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(
  new URL("../.github/workflows/fresh-migration-replay.yml", import.meta.url),
  "utf8",
);
const verifier = await readFile(
  new URL("../scripts/verify-fresh-replay.sql", import.meta.url),
  "utf8",
);

test("fresh replay workflow is manual-only and local-only", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s*push:/m);
  assert.doesNotMatch(workflow, /^\s*pull_request:/m);
  assert.doesNotMatch(workflow, /^\s*schedule:/m);

  assert.match(workflow, /supabase\/setup-cli@v1/);
  assert.match(workflow, /supabase db start/);
  assert.match(workflow, /supabase db reset --local --no-seed/);
  assert.match(workflow, /scripts\/verify-fresh-replay\.sql/);

  assert.doesNotMatch(workflow, /supabase link/);
  assert.doesNotMatch(workflow, /supabase db push/);
  assert.doesNotMatch(workflow, /--linked/);
  assert.doesNotMatch(workflow, /SUPABASE_ACCESS_TOKEN/);
  assert.doesNotMatch(workflow, /yussznmwjsvfvpabmwdc/);
  assert.doesNotMatch(workflow, /rurgmyiiytesknsfwjjl/);
});

test("fresh replay verifier covers launch-critical schema surfaces", () => {
  for (const required of [
    "profiles",
    "businesses",
    "organizations",
    "opportunities",
    "events",
    "connections",
    "conversations",
    "conversation_members",
    "messages",
    "notifications",
    "saved_opportunities",
    "event_rsvps",
    "profiles_username_format",
    "organizations_short_description_length",
    "search_afghan_hub",
    "avatars",
    "business-media",
    "organization-media",
    "storage_business_media_select_status_aware",
    "storage_organization_media_select_status_aware",
    "supabase_realtime",
    "supabase_migrations.schema_migrations",
  ]) {
    assert.ok(verifier.includes(required), `Fresh replay verifier is missing invariant: ${required}`);
  }
});
