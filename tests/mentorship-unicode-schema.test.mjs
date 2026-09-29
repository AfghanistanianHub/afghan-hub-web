import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(
  new URL(
    "../supabase/migrations/20260929021000_harden_mentorship_unicode_normalization.sql",
    import.meta.url,
  ),
  "utf8",
);

test("mentorship topics require NFC normalization", () => {
  assert.match(migration, /topic <> normalize\(topic, NFC\)/i);
  assert.match(migration, /SECURITY INVOKER/i);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.mentorship_topics_are_valid\(text\[\]\) FROM PUBLIC/i);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.mentorship_topics_are_valid\(text\[\]\) FROM anon/i);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.mentorship_topics_are_valid\(text\[\]\) TO authenticated/i);
});
