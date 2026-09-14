import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(`../tests/security/${name}`, import.meta.url), "utf8");
const preflight = read("secondary-phase-b-preflight.sql");
const forward = read("secondary-phase-b-forward.sql");
const forwardAssert = read("secondary-phase-b-forward-assert.sql");
const rollback = read("secondary-phase-b-rollback.sql");
const rollbackAssert = read("secondary-phase-b-rollback-assert.sql");
const productionRef = "yussznmwjsvfvpabmwdc";

test("secondary Phase B package is transaction-bound and excludes production/profile rewrites", () => {
  assert.match(forward, /begin;/i);
  assert.match(forward, /commit;/i);
  assert.match(rollback, /begin;/i);
  assert.match(rollback, /commit;/i);

  for (const sql of [preflight, forward, forwardAssert, rollback, rollbackAssert]) {
    assert.equal(sql.includes(productionRef), false, "secondary package must never name production");
  }

  assert.equal(/(?:grant|revoke)[\s\S]{0,160}on\s+table\s+public\.profiles/i.test(forward), false);
  assert.equal(/(?:grant|revoke)[\s\S]{0,160}on\s+table\s+public\.profiles/i.test(rollback), false);
  assert.match(preflight, /e1c13bc50c5a10cbcdcfb66c5207fc53/);
  assert.match(forwardAssert, /e1c13bc50c5a10cbcdcfb66c5207fc53/);
  assert.match(rollbackAssert, /e1c13bc50c5a10cbcdcfb66c5207fc53/);
});

test("forward encodes the complete intended direct-DML minimum", () => {
  assert.match(forward, /revoke insert, update, delete on table[\s\S]*public\.businesses[\s\S]*public\.events[\s\S]*public\.opportunities[\s\S]*public\.organizations[\s\S]*from anon;/i);
  assert.match(forward, /revoke select, insert, update, delete on table[\s\S]*public\.connections[\s\S]*public\.conversation_members[\s\S]*public\.conversations[\s\S]*public\.event_rsvps[\s\S]*public\.messages[\s\S]*public\.notifications[\s\S]*public\.saved_opportunities[\s\S]*from anon;/i);
  assert.match(forward, /revoke insert, update on table public\.connections from authenticated;/i);
  assert.match(forward, /revoke insert, update on table public\.conversation_members from authenticated;/i);
  assert.match(forward, /revoke insert, update, delete on table public\.conversations from authenticated;/i);
  assert.match(forward, /revoke update, delete on table public\.messages from authenticated;/i);
  assert.match(forward, /revoke update on table public\.saved_opportunities from authenticated;/i);
});

test("rollback restores exactly the captured grants removed by forward", () => {
  assert.match(rollback, /grant insert, update, delete on table[\s\S]*public\.businesses[\s\S]*public\.events[\s\S]*public\.opportunities[\s\S]*public\.organizations[\s\S]*to anon;/i);
  assert.match(rollback, /grant select, insert, update, delete on table[\s\S]*public\.connections[\s\S]*public\.conversation_members[\s\S]*public\.conversations[\s\S]*public\.messages[\s\S]*public\.saved_opportunities[\s\S]*to anon;/i);
  assert.match(rollback, /grant insert, update on table public\.connections to authenticated;/i);
  assert.match(rollback, /grant insert, update on table public\.conversation_members to authenticated;/i);
  assert.match(rollback, /grant insert, update, delete on table public\.conversations to authenticated;/i);
  assert.match(rollback, /grant update, delete on table public\.messages to authenticated;/i);
  assert.match(rollback, /grant update on table public\.saved_opportunities to authenticated;/i);
  assert.equal(/grant[\s\S]{0,140}public\.(?:event_rsvps|notifications)[\s\S]{0,80}to anon/i.test(rollback), false);
});

test("assertion files verify both hardened and restored states", () => {
  assert.match(preflight, /secondary_phase_b_preflight_passed/);
  assert.match(forwardAssert, /secondary_phase_b_forward_assertions_passed/);
  assert.match(rollbackAssert, /secondary_phase_b_rollback_assertions_passed/);
  assert.match(forwardAssert, /connections grants mismatch/);
  assert.match(forwardAssert, /messages grants mismatch/);
  assert.match(forwardAssert, /saved_opportunities grants mismatch/);
});
