import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const prior = readFileSync("supabase/migrations/20260825000100_precise_message_read_receipts.sql", "utf8");
const restore = readFileSync("supabase/migrations/20260830024037_restore_missing_messaging_functions_and_read_receipts.sql", "utf8");

test("messaging recovery replaces the read-receipt signature already created in August", () => {
  const signature = /public\.mark_conversation_read\(\s*target_conversation_id uuid,\s*read_through_message_id uuid\s*\)/i;
  assert.match(prior, signature);
  assert.match(restore, /create or replace function public\.mark_conversation_read\(\s*target_conversation_id uuid,\s*read_through_message_id uuid\s*\)/i);
  assert.doesNotMatch(restore, /create function public\.mark_conversation_read\(\s*target_conversation_id uuid,\s*read_through_message_id uuid\s*\)/i);
});
