import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const pages = [
  ["../src/app/(dashboard)/submissions/page.tsx", "get_owned_listing_moderation_note"],
  ["../src/app/(dashboard)/moderation/page.tsx", "get_moderation_history"],
  ["../src/app/(dashboard)/businesses/[slug]/page.tsx", "get_owned_listing_moderation_note"],
  ["../src/app/(dashboard)/organizations/[slug]/page.tsx", "get_owned_listing_moderation_note"],
  ["../src/app/(dashboard)/events/[slug]/page.tsx", "get_owned_listing_moderation_note"],
  ["../src/app/(dashboard)/opportunities/[slug]/page.tsx", "get_owned_listing_moderation_note"],
];

test("SEC-01: pages use scoped moderation RPC rather than table-level notes", () => {
  for (const [path, rpc] of pages) {
    const source = read(path);
    assert.ok(source.includes(rpc), path);
    assert.doesNotMatch(source, /\.select\([^)]*moderation_note/s, path);
  }
});

test("SEC-01: no wildcard SELECT in listing detail pages", () => {
  for (const [path] of [...pages.slice(2),
    ["../src/app/(dashboard)/events/[slug]/edit/page.tsx"],
    ["../src/app/(dashboard)/opportunities/[slug]/edit/page.tsx"],
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /\.select\(\s*["'`]\*[,\x60"'\s)]/, path);
  }
});

test("SEC-01: review SQL restricts anonymous execution and enforces in-DB ownership", () => {
  const source = read("../docs/security/sec01-owner-reviewer-rpcs.REHEARSAL-ONLY.sql");
  assert.match(source, /caller uuid := \(SELECT auth\.uid\(\)\)/);
  for (const ownerColumn of ["owner_id", "creator_id", "author_id"]) {
    assert.ok(source.includes(ownerColumn));
  }
  assert.match(source, /NOT public\.can_moderate\(\)/);
  assert.match(source, /FROM PUBLIC, anon/);
  assert.match(source, /SECURITY DEFINER/g);
});
