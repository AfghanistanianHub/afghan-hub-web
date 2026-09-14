import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const forward = readFileSync(new URL("./security/secondary-role-rsvp-forward.sql", import.meta.url), "utf8");
const rollback = readFileSync(new URL("./security/secondary-role-rsvp-rollback.sql", import.meta.url), "utf8");
const forwardAssert = readFileSync(new URL("./security/secondary-role-rsvp-forward-assert.sql", import.meta.url), "utf8");
const rollbackAssert = readFileSync(new URL("./security/secondary-role-rsvp-rollback-assert.sql", import.meta.url), "utf8");

const productionRef = "yussznmwjsvfvpabmwdc";
const executableSql = (sql) => sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

const requiredFunctions = [
  "moderate_event",
  "moderate_opportunity",
  "moderate_business",
  "moderate_organization",
  "set_profile_role",
  "rsvp_to_event",
  "get_event_rsvp_count",
];

const requiredTriggers = [
  "enforce_event_moderation",
  "enforce_opportunity_moderation",
  "enforce_business_moderation",
  "enforce_organization_moderation",
  "enforce_profile_role",
  "enforce_business_verification",
  "enforce_organization_verification",
  "preserve_event_identity",
  "preserve_opportunity_identity",
  "preserve_business_identity",
  "preserve_organization_identity",
];

test("secondary refresh SQL is transaction-bound and never names production", () => {
  for (const [name, sql] of [["forward", forward], ["rollback", rollback]]) {
    assert.match(sql, /^--[\s\S]*\nbegin;/i, `${name} must begin a transaction`);
    assert.match(sql, /\ncommit;\s*$/i, `${name} must commit explicitly`);
    assert.equal(sql.includes(productionRef), false, `${name} must not name production`);
    assert.equal(/drop\s+database|truncate\s+/i.test(executableSql(sql)), false, `${name} contains an out-of-scope destructive primitive`);
  }
});

test("forward package contains the bounded launch tables and RPCs", () => {
  assert.match(forward, /create table public\.notifications/i);
  assert.match(forward, /create table public\.event_rsvps/i);
  for (const name of requiredFunctions) assert.ok(forward.includes(`public.${name}`), `forward missing ${name}`);
  for (const name of requiredTriggers) assert.ok(forward.includes(name), `forward missing ${name}`);
  assert.equal(/search_vector|alter\s+publication|supabase_realtime/i.test(executableSql(forward)), false, "search/realtime statements must stay outside this bounded delta");
});

test("rollback removes every bounded launch RPC and trigger surface", () => {
  for (const name of requiredFunctions) assert.ok(rollback.includes(`public.${name}`), `rollback missing ${name}`);
  for (const name of requiredTriggers) assert.ok(rollback.includes(name), `rollback missing ${name}`);
  assert.match(rollback, /drop table public\.event_rsvps/i);
  assert.match(rollback, /drop table public\.notifications/i);
});

test("assertion files validate both forward and restored baseline states", () => {
  assert.match(forwardAssert, /forward_assertions_passed/);
  assert.match(forwardAssert, /has_table_privilege\('authenticated','public\.notifications','SELECT'\)/);
  assert.match(rollbackAssert, /rollback_assertions_passed/);
  assert.match(rollbackAssert, /get_my_access_context/);
  assert.match(rollbackAssert, /can_moderate/);
  assert.match(rollbackAssert, /is_admin/);
});
