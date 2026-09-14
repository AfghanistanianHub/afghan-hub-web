import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const runbook = readFileSync(join(repoRoot, "docs/privacy/account-deletion-operations.md"), "utf8");

function walkFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walkFiles(path));
    else files.push(path);
  }
  return files;
}

test("deletion runbook preserves the required cleanup order and policy boundaries", () => {
  const storageFirst = runbook.indexOf("Delete Storage objects first");
  const appSecond = runbook.indexOf("Delete application/profile data through one reviewed path");
  const authLast = runbook.indexOf("Delete the Auth identity last");

  assert.ok(storageFirst >= 0 && appSecond > storageFirst && authLast > appSecond);
  assert.match(runbook, /verified support workflow/i);
  assert.match(runbook, /do not promise a deletion completion time or retention period/i);
  assert.match(runbook, /disposable identities/i);
  assert.match(runbook, /shared-content caution/i);
});

test("member-facing source contains no direct Supabase admin account deletion primitive", () => {
  const srcDir = join(repoRoot, "src");
  const source = walkFiles(srcDir)
    .filter((path) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

  assert.equal(/\.auth\.admin\.deleteUser\s*\(/.test(source), false);
  assert.equal(/auth\.admin\.deleteUser\s*\(/.test(source), false);
});
