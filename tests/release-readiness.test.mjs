import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../.github/workflows/release-smoke.yml", import.meta.url), "utf8");
const backup = readFileSync(new URL("../scripts/backup-free-plan.sh", import.meta.url), "utf8");
const gitignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
const runbook = readFileSync(new URL("../docs/operations/free-plan-backup-recovery.md", import.meta.url), "utf8");

test("release smoke is manual, read-only, secret-free and pinned to production", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.equal(/schedule:|cron:/i.test(workflow), false, "release smoke must not create recurring Actions usage");
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.equal(/secrets\./i.test(workflow), false, "public smoke must not require repository secrets");
  assert.match(workflow, /SMOKE_BASE_URL:\s*https:\/\/app\.apnbc\.ca/);
  assert.match(workflow, /EXPECT_NO_POWERED_BY:\s*["']?1["']?/);
  assert.match(workflow, /npm run smoke:public/);
});

test("free-plan backup helper fails closed and keeps credentials out of output", () => {
  assert.match(backup, /set -euo pipefail/);
  assert.match(backup, /umask 077/);
  assert.match(backup, /SUPABASE_DB_URL is required/);
  assert.match(backup, /supabase db dump --db-url "\$SUPABASE_DB_URL"/);
  assert.match(backup, /--role-only/);
  assert.match(backup, /--data-only --use-copy/);
  assert.equal(
    /(?:echo|printf)[^\n]*\$\{?SUPABASE_DB_URL\}?/.test(backup),
    false,
    "backup helper must not print the connection-string value",
  );
  assert.match(gitignore, /^\/backups\/$/m);
});

test("recovery runbook explicitly forbids destructive proof on production", () => {
  assert.match(runbook, /Free plan: no automatic backup retention and no PITR/);
  assert.match(runbook, /never over production/i);
  assert.match(runbook, /Do \*\*not\*\* use `supabase db reset --linked`/);
  assert.match(runbook, /encrypted off-site storage/i);
});
