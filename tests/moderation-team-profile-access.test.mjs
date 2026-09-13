import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL(
  "../src/app/(dashboard)/moderation/team/page.tsx",
  import.meta.url,
);
const adapterPath = new URL("../src/lib/profile-access.ts", import.meta.url);

test("moderation team routes privileged profile reads through RPC-backed access adapters", async () => {
  const [pageSource, adapterSource] = await Promise.all([
    readFile(pagePath, "utf8"),
    readFile(adapterPath, "utf8"),
  ]);

  assert.match(pageSource, /getMyAccessContext\(supabase, user\.id\)/);
  assert.match(pageSource, /getAdminMemberAccounts\(supabase\)/);
  assert.doesNotMatch(pageSource, /\.from\(["'`]profiles["'`]\)/);
  assert.match(adapterSource, /get_my_access_context/);
  assert.match(adapterSource, /admin_list_member_accounts/);
  assert.doesNotMatch(adapterSource, /\.from\(["'`]profiles["'`]\)/);
});

test("moderation team does not expose raw database load errors", async () => {
  const pageSource = await readFile(pagePath, "utf8");

  assert.doesNotMatch(pageSource, /membersError\.message/);
  assert.match(pageSource, /We could not load members\. Please try again\./);
});
