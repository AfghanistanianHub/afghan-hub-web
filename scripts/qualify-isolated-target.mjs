import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const required = ["SECURITY_TEST_SUPABASE_URL", "SECURITY_TEST_PUBLISHABLE_KEY"];

for (const name of required) {
  assert.ok(process.env[name]?.trim(), `Missing required environment variable: ${name}`);
}

const supabaseUrl = process.env.SECURITY_TEST_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.SECURITY_TEST_PUBLISHABLE_KEY.trim();
const target = new URL(supabaseUrl);

assert.equal(target.protocol, "https:", "Isolated target must use HTTPS");
assert.ok(!target.hostname.includes(PRODUCTION_PROJECT_REF), "Refusing to qualify Afghan Hub Production");
assert.ok(target.hostname.endsWith(".supabase.co"), "Expected a Supabase project URL");

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const checks = [];
async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    checks.push({ name, ok: false });
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

await check("REST endpoint is reachable", async () => {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` },
  });
  assert.ok(response.ok, `REST root returned HTTP ${response.status}`);
});

const expectedTables = [
  "profiles",
  "connections",
  "conversations",
  "conversation_members",
  "messages",
  "notifications",
  "organizations",
  "businesses",
  "events",
  "opportunities",
  "saved_opportunities",
  "event_rsvps",
];

for (const table of expectedTables) {
  await check(`table surface exists: ${table}`, async () => {
    const result = await supabase.from(table).select("*").limit(0);
    if (result.error) {
      const text = `${result.error.code ?? ""} ${result.error.message ?? ""}`.toLowerCase();
      assert.ok(!text.includes("does not exist") && result.error.code !== "42P01", result.error.message);
    }
  });
}

await check("profile-privacy RPC surface exists", async () => {
  const result = await supabase.rpc("get_my_access_context");
  if (result.error) {
    const text = `${result.error.code ?? ""} ${result.error.message ?? ""}`.toLowerCase();
    assert.ok(!text.includes("could not find the function") && result.error.code !== "PGRST202", result.error.message);
  }
});

await check("search RPC surface exists", async () => {
  const result = await supabase.rpc("search_afghan_hub", {
    search_query: "isolated-target-qualification-no-match",
    result_limit: 1,
  });
  if (result.error) {
    const text = `${result.error.code ?? ""} ${result.error.message ?? ""}`.toLowerCase();
    assert.ok(!text.includes("could not find the function") && result.error.code !== "PGRST202", result.error.message);
  }
});

const failures = checks.filter((item) => !item.ok);
console.log(`\n${checks.length - failures.length} passed, ${failures.length} failed`);
if (failures.length) process.exitCode = 1;
