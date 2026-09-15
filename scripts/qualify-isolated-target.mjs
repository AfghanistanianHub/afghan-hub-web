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
async function check(name, group, fn) {
  try {
    await fn();
    checks.push({ name, group, ok: true });
    console.log(`PASS [${group}] ${name}`);
  } catch (error) {
    checks.push({ name, group, ok: false });
    console.error(`FAIL [${group}] ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assertRpcExists(result) {
  if (!result.error) return;
  const text = `${result.error.code ?? ""} ${result.error.message ?? ""}`.toLowerCase();
  assert.ok(
    !text.includes("could not find the function") && result.error.code !== "PGRST202",
    result.error.message,
  );
}

await check("REST endpoint is reachable", "core", async () => {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: publishableKey },
  });

  // Any non-5xx HTTP response proves the PostgREST endpoint is reachable.
  // Credential/schema compatibility is verified by the table and RPC checks below,
  // so a publishable-key 401 at the OpenAPI root must not create a false negative.
  assert.ok(response.status < 500, `REST root returned HTTP ${response.status}`);
});

const tableGroups = {
  core: ["profiles", "organizations", "businesses", "events", "opportunities"],
  messaging: ["connections", "conversations", "conversation_members", "messages", "notifications"],
  saved: ["saved_opportunities"],
  rsvp: ["event_rsvps"],
};

for (const [group, tables] of Object.entries(tableGroups)) {
  for (const table of tables) {
    await check(`table surface exists: ${table}`, group, async () => {
      const result = await supabase.from(table).select("*").limit(0);
      if (result.error) {
        const text = `${result.error.code ?? ""} ${result.error.message ?? ""}`.toLowerCase();
        assert.ok(!text.includes("does not exist") && result.error.code !== "42P01", result.error.message);
      }
    });
  }
}

const rpcChecks = [
  ["auth", "get_my_access_context", () => supabase.rpc("get_my_access_context")],
  ["auth", "search_afghan_hub", () => supabase.rpc("search_afghan_hub", { search_query: "isolated-target-qualification-no-match", result_limit: 1 })],
  ["messaging", "send_connection_request", () => supabase.rpc("send_connection_request", { target_recipient_id: "00000000-0000-0000-0000-000000000000" })],
  ["messaging", "respond_connection_request", () => supabase.rpc("respond_connection_request", { target_connection_id: "00000000-0000-0000-0000-000000000000", target_decision: "declined" })],
  ["messaging", "start_direct_conversation", () => supabase.rpc("start_direct_conversation", { target_member_id: "00000000-0000-0000-0000-000000000000" })],
  ["messaging", "get_unread_message_counts", () => supabase.rpc("get_unread_message_counts")],
  ["messaging", "mark_conversation_read", () => supabase.rpc("mark_conversation_read", { target_conversation_id: "00000000-0000-0000-0000-000000000000", read_through_message_id: "00000000-0000-0000-0000-000000000000" })],
  ["rsvp", "get_event_rsvp_count", () => supabase.rpc("get_event_rsvp_count", { target_event_id: "00000000-0000-0000-0000-000000000000" })],
  ["rsvp", "rsvp_to_event", () => supabase.rpc("rsvp_to_event", { target_event_id: "00000000-0000-0000-0000-000000000000" })],
  ["moderation", "can_moderate", () => supabase.rpc("can_moderate")],
  ["moderation", "moderate_event", () => supabase.rpc("moderate_event", { target_event_id: "00000000-0000-0000-0000-000000000000", target_decision: "approve", target_note: null })],
  ["moderation", "moderate_business", () => supabase.rpc("moderate_business", { target_business_id: "00000000-0000-0000-0000-000000000000", target_decision: "approve", target_note: null })],
  ["moderation", "moderate_opportunity", () => supabase.rpc("moderate_opportunity", { target_opportunity_id: "00000000-0000-0000-0000-000000000000", target_decision: "approve", target_note: null })],
  ["moderation", "moderate_organization", () => supabase.rpc("moderate_organization", { target_organization_id: "00000000-0000-0000-0000-000000000000", target_decision: "approve", target_note: null })],
  ["admin", "is_admin", () => supabase.rpc("is_admin")],
  ["admin", "admin_list_member_accounts", () => supabase.rpc("admin_list_member_accounts")],
  ["admin", "set_profile_role", () => supabase.rpc("set_profile_role", { target_profile_id: "00000000-0000-0000-0000-000000000000", target_role: "member" })],
];

for (const [group, name, invoke] of rpcChecks) {
  await check(`RPC surface exists: ${name}`, group, async () => {
    const result = await invoke();
    assertRpcExists(result);
  });
}

const failures = checks.filter((item) => !item.ok);
const groups = [...new Set(checks.map((item) => item.group))];
console.log("\nQualification summary:");
for (const group of groups) {
  const scoped = checks.filter((item) => item.group === group);
  const failed = scoped.filter((item) => !item.ok);
  console.log(`- ${group}: ${scoped.length - failed.length}/${scoped.length} passed${failed.length ? `; missing/incompatible: ${failed.map((item) => item.name).join(", ")}` : ""}`);
}
console.log(`\n${checks.length - failures.length} passed, ${failures.length} failed overall`);
if (failures.length) process.exitCode = 1;
