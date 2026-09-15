import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sql = readFileSync("supabase/migrations/20260902000100_harden_function_permissions.sql", "utf8");
test("optional RLS event helper is hardened only when its exact signature exists", () => {
  assert.match(sql, /if to_regprocedure\('public\.rls_auto_enable\(\)'\) is not null then\s+revoke execute on function public\.rls_auto_enable\(\)\s+from public, anon, authenticated;\s+end if;/i);
  assert.doesNotMatch(sql, /exception\s+when|create (or replace )?function public\.rls_auto_enable/i);
});
test("application helper ACL hardening remains unconditional", () => {
  const outside = sql.replace(/do \$\$[\s\S]*?\$\$;/i, "");
  assert.match(outside, /revoke execute on function public\.handle_new_user\(\)\s+from public, anon, authenticated;/i);
  assert.match(outside, /revoke execute on function public\.is_admin\(\)\s+from public, anon;/i);
  assert.match(outside, /revoke execute on function public\.is_conversation_member\(uuid\)\s+from public, anon;/i);
});