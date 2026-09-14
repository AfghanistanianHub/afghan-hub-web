import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runbook = readFileSync(new URL("../docs/privacy/privacy-request-operations.md", import.meta.url), "utf8");
const deletionRunbook = readFileSync(new URL("../docs/privacy/account-deletion-operations.md", import.meta.url), "utf8");
const privacyPage = readFileSync(new URL("../src/app/(public)/privacy/page.tsx", import.meta.url), "utf8");
const supportPage = readFileSync(new URL("../src/app/(public)/support/page.tsx", import.meta.url), "utf8");
const exportRoute = readFileSync(new URL("../src/app/api/account/export/route.ts", import.meta.url), "utf8");

test("privacy request runbook keeps verification and secret-minimization boundaries", () => {
  assert.match(runbook, /verification state: `unverified`, `verified`, or `needs_review`/);
  assert.match(runbook, /Never ask a member to email:/);
  assert.match(runbook, /password-reset or confirmation link/);
  assert.match(runbook, /session cookies\/tokens/);
  assert.match(runbook, /do not perform destructive actions/i);
});

test("deletion requests are routed through storage-first guarded lifecycle", () => {
  assert.match(runbook, /docs\/privacy\/account-deletion-operations\.md/);
  assert.match(runbook, /delete exact Storage objects first/i);
  assert.match(runbook, /delete the Auth identity last/i);
  assert.match(deletionRunbook, /Delete Storage objects first/);
});

test("public privacy and support copy make no fixed operational SLA promise", () => {
  const publicCopy = `${privacyPage}\n${supportPage}`;
  assert.match(publicCopy, /fixed response time has not been published/i);
  assert.match(publicCopy, /does not promise immediate removal or a specific completion date/i);
  assert.equal(/within\s+\d+\s+(?:business\s+)?(?:hours?|days?|weeks?)/i.test(publicCopy), false);
});

test("current self-export remains explicitly scoped rather than dumping shared data", () => {
  assert.match(exportRoute, /scope:\s*\["account",\s*"profile"\]/);
  assert.match(exportRoute, /excluded:\s*\["conversations",\s*"messages",\s*"connections",\s*"listings",\s*"saved_opportunities",\s*"event_rsvps",\s*"uploaded_file_contents"\]/);
  assert.equal(/select\(["'`]\*["'`]\)/.test(exportRoute), false);
});
