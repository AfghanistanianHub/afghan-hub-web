import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutPath = new URL(
  "../src/app/(dashboard)/layout.tsx",
  import.meta.url,
);
const adapterPath = new URL("../src/lib/profile-access.ts", import.meta.url);

test("dashboard layout routes role/onboarding reads through the profile access adapter", async () => {
  const [layoutSource, adapterSource] = await Promise.all([
    readFile(layoutPath, "utf8"),
    readFile(adapterPath, "utf8"),
  ]);

  assert.match(layoutSource, /getMyAccessContext\(supabase, user\.id\)/);
  assert.doesNotMatch(
    layoutSource,
    /\.select\(["'`]display_name,first_name,onboarding_completed,role["'`]\)/,
  );
  assert.match(adapterSource, /\.select\(["'`]role,onboarding_completed["'`]\)/);
});
