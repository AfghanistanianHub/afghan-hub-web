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
  // Failures redirect with a stable code; the localized message lives in the
  // catalogue, so no English copy is baked into the server action.
  assert.match(moderationSource, /error=apply-failed/);
  assert.match(teamSource, /error=update-failed/);
  assert.doesNotMatch(moderationSource, /error=[A-Z]|error=[A-Za-z]+%20/);
  assert.doesNotMatch(teamSource, /error=[A-Z]|error=[A-Za-z]+%20/);
});
