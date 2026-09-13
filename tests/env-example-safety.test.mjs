import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");

test("env example keeps production and privileged secrets out", () => {
  assert.ok(!envExample.includes(PRODUCTION_PROJECT_REF), "Do not put the production Supabase project ref in .env.example");
  assert.ok(!/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/.test(envExample), "Do not put JWT-like tokens in .env.example");
  assert.ok(!/\bsb_secret_[A-Za-z0-9_-]+\b/.test(envExample), "Do not put Supabase secret keys in .env.example");
  assert.ok(!/^\s*(?:SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY)\s*=/m.test(envExample), "Do not advertise privileged server keys in the public env template");
});

test("env example keeps required public development placeholders", () => {
  assert.match(envExample, /^NEXT_PUBLIC_SUPABASE_URL=https:\/\/YOUR_PROJECT_REF\.supabase\.co$/m);
  assert.match(envExample, /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY$/m);
  assert.match(envExample, /^SECURITY_TEST_SUPABASE_URL=https:\/\/YOUR_ISOLATED_PROJECT_REF\.supabase\.co$/m);
});
