import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const forward = readFileSync(new URL("./security/secondary-messaging-forward.sql", import.meta.url), "utf8");
const rollback = readFileSync(new URL("./security/secondary-messaging-rollback.sql", import.meta.url), "utf8");
const forwardAssert = readFileSync(new URL("./security/secondary-messaging-forward-assert.sql", import.meta.url), "utf8");
const rollbackAssert = readFileSync(new URL("./security/secondary-messaging-rollback-assert.sql", import.meta.url), "utf8");
const productionRef = "yussznmwjsvfvpabmwdc";

const executableSql = (sql) => sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const functions = [
  "send_connection_request", "respond_connection_request", "start_direct_conversation",
  "get_message_inbox", "get_unread_message_counts", "mark_conversation_read",
  "mark_all_notifications_read", "mark_notification_read", "is_conversation_member",
  "create_connection_request_notification", "create_connection_accepted_notification", "create_new_message_notifications",
];
const policies = [
  "connections_select_participant", "connections_delete_participant",
  "conversation_members_select_member", "conversation_members_delete_self",
  "conversations_select_member", "messages_select_member", "messages_insert_member",
  "saved_opportunities_select_self", "saved_opportunities_insert_self", "saved_opportunities_delete_self",
];
const triggers = [
  "connections_create_request_notification", "connections_create_accepted_notification", "messages_create_notifications",
];

test("secondary messaging SQL is transaction-bound and isolated from production", () => {
  for (const [name, sql] of [["forward", forward], ["rollback", rollback]]) {
    assert.match(sql, /^--[\s\S]*\nbegin;/i, `${name} must begin a transaction`);
    assert.match(sql, /\ncommit;\s*$/i, `${name} must commit explicitly`);
    assert.equal(sql.includes(productionRef), false, `${name} must not name production`);
    assert.equal(/drop\s+database|truncate\s+/i.test(executableSql(sql)), false, `${name} contains an out-of-scope destructive primitive`);
  }
});

test("forward contains the complete bounded messaging contract", () => {
  assert.match(forward, /create type public\.connection_status/i);
  assert.match(forward, /add column created_by uuid not null/i);
  for (const name of functions) assert.ok(forward.includes(`public.${name}`), `forward missing ${name}`);
  for (const name of policies) assert.ok(forward.includes(name), `forward missing ${name}`);
  for (const name of triggers) assert.ok(forward.includes(name), `forward missing ${name}`);
  assert.equal(/alter\s+publication|supabase_realtime|search_vector/i.test(executableSql(forward)), false, "realtime/search statements are out of scope");
});

test("rollback is symmetric and preserves the prior role/RSVP refresh", () => {
  for (const name of functions) assert.ok(rollback.includes(name), `rollback missing ${name}`);
  for (const name of policies) assert.ok(rollback.includes(name), `rollback missing ${name}`);
  for (const name of triggers) assert.ok(rollback.includes(name), `rollback missing ${name}`);
  assert.match(rollback, /drop type if exists public\.connection_status/i);
  assert.match(rollback, /drop column if exists created_by/i);
  assert.equal(/drop table public\.notifications|drop table public\.event_rsvps/i.test(executableSql(rollback)), false, "messaging rollback must preserve prior launch tables");
  assert.equal(/drop function if exists public\.moderate_|drop function if exists public\.rsvp_to_event|drop function if exists public\.set_profile_role/i.test(executableSql(rollback)), false, "messaging rollback must preserve prior role/RSVP RPCs");
});

test("assertions verify both synced and restored states", () => {
  assert.match(forwardAssert, /secondary_messaging_forward_assertions_passed/);
  assert.match(forwardAssert, /conversations\.created_by missing\/not-null mismatch/);
  assert.match(rollbackAssert, /secondary_messaging_rollback_assertions_passed/);
  assert.match(rollbackAssert, /previous role\/RSVP refresh was damaged/);
});
