import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const moderationPagePath = new URL(
  "../src/app/(dashboard)/moderation/page.tsx",
  import.meta.url,
);
const moderationActionsPath = new URL(
  "../src/app/(dashboard)/moderation/actions.ts",
  import.meta.url,
);
const teamActionsPath = new URL(
  "../src/app/(dashboard)/moderation/team/actions.ts",
  import.meta.url,
);

test("moderation surfaces use the centralized profile access adapter", async () => {
  const [moderationPageSource, moderationSource, teamSource] = await Promise.all([
    readFile(moderationPagePath, "utf8"),
    readFile(moderationActionsPath, "utf8"),
    readFile(teamActionsPath, "utf8"),
  ]);

  for (const source of [moderationPageSource, moderationSource, teamSource]) {
    assert.match(source, /getMyAccessContext\(supabase, user\.id\)/);
    assert.doesNotMatch(source, /\.from\(["'`]profiles["'`]\)/);
  }
});

test("moderation actions do not expose raw database or RPC errors", async () => {
  const [moderationSource, teamSource] = await Promise.all([
    readFile(moderationActionsPath, "utf8"),
    readFile(teamActionsPath, "utf8"),
  ]);

  assert.doesNotMatch(moderationSource, /encodeURIComponent\(.*error/);
  assert.doesNotMatch(teamSource, /error\?\.message|error\.message/);
  assert.match(moderationSource, /We%20could%20not%20apply%20that%20moderation%20decision/);
  assert.match(teamSource, /We%20could%20not%20update%20that%20member%20role/);
});
