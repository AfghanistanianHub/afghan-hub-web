import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sql = readFileSync(new URL("../../docs/security/sec01-proposed-scoped-rpc-forward-DO-NOT-APPLY.sql", import.meta.url), "utf8");

test("SEC-01 RPC denies null identity and unknown target types", () => {
  assert.match(sql, /caller is null or target_entity_id is null/);
  assert.match(sql, /target_entity_type not in \('business','organization','opportunity','event'\)/);
});
test("SEC-01 filters all four entities by owner or reviewer", () => {
  for (const [table, owner, alias] of [
    ["businesses", "owner_id", "b"],
    ["organizations", "owner_id", "o"],
    ["opportunities", "author_id", "p"],
    ["events", "creator_id", "e"],
  ]) {
    assert.match(sql, new RegExp("from public\\." + table + " " + alias));
    assert.match(sql, new RegExp(alias + "\\." + owner + "=caller or is_reviewer"));
  }
});
test("SEC-01 hides reviewer identity from owners", () => {
  for (const alias of ["b", "o", "p", "e"]) {
    assert.ok(sql.includes("case when is_reviewer then " + alias + ".moderated_by else null::uuid end"));
  }
});
test("SEC-01 execution privilege is restricted", () => {
  assert.match(sql, /security definer set search_path = ''/i);
  assert.match(sql, /revoke all on function public\.get_listing_moderation_feedback\(text,uuid\) from public, anon;/);
  assert.match(sql, /grant execute on function public\.get_listing_moderation_feedback\(text,uuid\) to authenticated, service_role;/);
});

test("moderation history is reviewer-gated, bounded, and has a paired rollback", () => {
  const history = readFileSync(new URL("../../docs/security/sec01-proposed-history-rpc-DO-NOT-APPLY.sql", import.meta.url), "utf8");
  const rollback = readFileSync(new URL("../../docs/security/sec01-proposed-history-rpc-rollback-DO-NOT-APPLY.sql", import.meta.url), "utf8");
  assert.match(history, /not coalesce\(public\.can_moderate\(\), false\)/);
  assert.match(history, /limit 40;/);
  assert.match(history, /revoke all on function public\.list_moderation_history\(\) from public, anon;/);
  assert.match(rollback, /drop function public\.list_moderation_history\(\);/);
});
