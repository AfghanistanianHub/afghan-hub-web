import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../scripts/qualify-isolated-target.mjs", import.meta.url), "utf8");

test("qualification hard-blocks production", () => {
  assert.match(source, /PRODUCTION_PROJECT_REF/);
  assert.match(source, /Refusing to qualify Afghan Hub Production/);
});

test("qualification covers launch-critical grouped surfaces", () => {
  for (const group of ["core", "messaging", "rsvp", "moderation", "admin"]) {
    assert.match(source, new RegExp(`\\[?\"${group}\"`));
  }
  for (const rpc of [
    "get_my_access_context",
    "send_connection_request",
    "start_direct_conversation",
    "rsvp_to_event",
    "can_moderate",
    "moderate_event",
    "is_admin",
    "set_profile_role",
  ]) {
    assert.match(source, new RegExp(rpc));
  }
});

test("qualification performs no table mutation", () => {
  assert.doesNotMatch(source, /\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/);
});
