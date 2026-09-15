import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

const migrationsDir = new URL("../supabase/migrations/", import.meta.url);
const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();

const parsed = files.map((name) => {
  const match = /^(\d{14})_(.+)\.sql$/.exec(name);
  assert.ok(match, `Migration filename must use <14-digit-version>_<name>.sql: ${name}`);
  return { name, version: match[1], slug: match[2] };
});

const requiredRecovered = [
  "20260719000100_extensions.sql",
  "20260719000200_enums.sql",
  "20260719000300_functions.sql",
  "20260719000400_profiles.sql",
  "20260719000500_businesses.sql",
  "20260719000600_organizations.sql",
  "20260719000700_opportunities.sql",
  "20260719000800_events.sql",
  "20260719000900_messaging.sql",
  "20260719001000_connections.sql",
  "20260719001100_indexes.sql",
  "20260719001200_search.sql",
  "20260719001300_rls_enable.sql",
  "20260719001350_auth_helpers.sql",
  "20260719001400_policies.sql",
  "20260719001500_storage.sql",
  "20260808000100_connections_update_policy.sql",
  "20260809000100_messages_realtime.sql",
  "20260809000200_notifications.sql",
  "20260809000300_connections_respond_rpc.sql",
  "20260830024037_restore_missing_messaging_functions_and_read_receipts.sql",
  "20260904054521_optimize_event_rsvps.sql",
  "20260904184515_harden_moderation_function_permissions.sql",
  "20260904184543_remove_public_moderation_function_execute.sql",
  "20260913221159_harden_profile_privacy_and_existing_public_privileges.sql",
  "20260913221215_fix_safe_profile_search_projection.sql",
  "20260913221220_reduce_postgres_public_table_default_privileges.sql",
  "20260913221317_expand_admin_member_account_rpc_display_fields.sql",
  "20260913222546_protect_draft_listing_media.sql",
  "20260913222649_preserve_published_state_for_media_reference_migration.sql",
  "20260913222712_restore_published_media_org_after_reference_migration.sql",
];

const fileSet = new Set(files);

function indexOf(name) {
  const index = files.indexOf(name);
  assert.notEqual(index, -1, `Missing migration required by replay contract: ${name}`);
  return index;
}

test("migration versions are unique", () => {
  const versions = parsed.map((entry) => entry.version);
  assert.equal(new Set(versions).size, versions.length, "Duplicate migration version detected");
});

test("recovered production baseline and hardening migrations stay tracked", () => {
  for (const name of requiredRecovered) {
    assert.ok(fileSet.has(name), `Missing recovered production migration: ${name}`);
  }
});

test("core prerequisites remain ordered before dependent migrations", () => {
  assert.ok(indexOf("20260719000400_profiles.sql") < indexOf("20260809000200_notifications.sql"));
  assert.ok(indexOf("20260719000900_messaging.sql") < indexOf("20260830024037_restore_missing_messaging_functions_and_read_receipts.sql"));
  assert.ok(indexOf("20260719001200_search.sql") < indexOf("20260913221215_fix_safe_profile_search_projection.sql"));
  assert.ok(indexOf("20260719001500_storage.sql") < indexOf("20260913222546_protect_draft_listing_media.sql"));
  assert.ok(indexOf("20260809000200_notifications.sql") < indexOf("20260830024037_restore_missing_messaging_functions_and_read_receipts.sql"));
});

test("migration filenames are lexically chronological", () => {
  const sorted = [...files].sort();
  assert.deepEqual(files, sorted);
});
