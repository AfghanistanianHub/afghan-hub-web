import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";

const required = [
  "SECURITY_TEST_SUPABASE_URL",
  "SECURITY_TEST_PUBLISHABLE_KEY",
  "SECURITY_TEST_MEMBER_A_TOKEN",
  "SECURITY_TEST_MEMBER_B_PROFILE_ID",
  "SECURITY_TEST_HIDDEN_PROFILE_ID",
  "SECURITY_TEST_INCOMPLETE_PROFILE_ID",
];

for (const name of required) {
  assert.ok(process.env[name]?.trim(), `Missing required environment variable: ${name}`);
}

const supabaseUrl = process.env.SECURITY_TEST_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.SECURITY_TEST_PUBLISHABLE_KEY.trim();
const memberAToken = process.env.SECURITY_TEST_MEMBER_A_TOKEN.trim();
const memberBId = process.env.SECURITY_TEST_MEMBER_B_PROFILE_ID.trim();
const hiddenId = process.env.SECURITY_TEST_HIDDEN_PROFILE_ID.trim();
const incompleteId = process.env.SECURITY_TEST_INCOMPLETE_PROFILE_ID.trim();
const memberBSearchQuery = process.env.SECURITY_TEST_MEMBER_B_SEARCH_QUERY?.trim();
const moderatorToken = process.env.SECURITY_TEST_MODERATOR_TOKEN?.trim();
const adminToken = process.env.SECURITY_TEST_ADMIN_TOKEN?.trim();

const target = new URL(supabaseUrl);
assert.equal(target.protocol, "https:", "Security persona tests require an HTTPS Supabase URL");
assert.ok(
  !target.hostname.includes(PRODUCTION_PROJECT_REF),
  "Refusing to run security persona tests against Afghan Hub Production",
);

function client(accessToken) {
  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

const anon = client();
const memberA = client(memberAToken);
const moderator = moderatorToken ? client(moderatorToken) : null;
const admin = adminToken ? client(adminToken) : null;

let failures = 0;
let passes = 0;
let skipped = 0;

async function check(name, fn) {
  try {
    await fn();
    passes += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function skip(name, reason) {
  skipped += 1;
  console.log(`SKIP ${name}: ${reason}`);
}

function assertDeniedOrEmpty(result, label) {
  if (result.error) return;
  assert.equal(result.data?.length ?? 0, 0, `${label} unexpectedly returned rows`);
}

await check("anonymous direct profile access is denied or empty", async () => {
  const result = await anon.from("profiles").select("id").limit(1);
  assertDeniedOrEmpty(result, "anonymous profiles query");
});

await check("anonymous private profile projection is denied", async () => {
  const result = await anon.from("profiles").select("id,email,role").limit(1);
  assert.ok(result.error, "anonymous private profile projection unexpectedly succeeded");
});

await check("anonymous member search RPC is denied", async () => {
  const result = await anon.rpc("search_afghan_hub", {
    search_query: "security-persona-check",
    result_limit: 5,
  });
  assert.ok(result.error, "anonymous member search RPC unexpectedly succeeded");
});

const safeFields = [
  "id",
  "display_name",
  "first_name",
  "last_name",
  "username",
  "avatar_url",
  "headline",
  "bio",
  "profession",
  "company",
  "city",
  "province_state",
  "country",
  "linkedin_url",
  "website_url",
  "skills",
  "languages",
].join(",");

await check("member can read safe fields for a visible completed member", async () => {
  const result = await memberA.from("profiles").select(safeFields).eq("id", memberBId).maybeSingle();
  assert.ifError(result.error);
  assert.equal(result.data?.id, memberBId, "expected visible completed member was not returned");
});

await check("member cannot project another member email", async () => {
  const result = await memberA
    .from("profiles")
    .select("id,display_name,email")
    .eq("id", memberBId)
    .maybeSingle();
  assert.ok(result.error, "mixed projection including email unexpectedly succeeded");
});

await check("member cannot project another member role", async () => {
  const result = await memberA
    .from("profiles")
    .select("id,display_name,role")
    .eq("id", memberBId)
    .maybeSingle();
  assert.ok(result.error, "mixed projection including role unexpectedly succeeded");
});

await check("hidden member is not visible through direct safe-field lookup", async () => {
  const result = await memberA.from("profiles").select(safeFields).eq("id", hiddenId);
  assert.ifError(result.error);
  assert.equal(result.data?.length ?? 0, 0, "hidden member unexpectedly returned rows");
});

await check("incomplete member is not visible through direct safe-field lookup", async () => {
  const result = await memberA.from("profiles").select(safeFields).eq("id", incompleteId);
  assert.ifError(result.error);
  assert.equal(result.data?.length ?? 0, 0, "incomplete member unexpectedly returned rows");
});

await check("member access-context RPC returns only caller access state", async () => {
  const result = await memberA.rpc("get_my_access_context");
  assert.ifError(result.error);
  const payload = Array.isArray(result.data) ? result.data[0] : result.data;
  assert.ok(payload, "access-context RPC returned no data");
  const keys = Object.keys(payload).sort();
  assert.deepEqual(
    keys,
    ["onboarding_completed", "role"],
    `unexpected access-context fields: ${keys.join(", ")}`,
  );
});

await check("ordinary member cannot call admin account listing RPC", async () => {
  const result = await memberA.rpc("admin_list_member_accounts");
  assert.ok(result.error, "ordinary member unexpectedly called admin account listing RPC");
});

if (memberBSearchQuery) {
  await check("member search never exposes email and excludes hidden/incomplete fixtures", async () => {
    const result = await memberA.rpc("search_afghan_hub", {
      search_query: memberBSearchQuery,
      result_limit: 20,
    });
    assert.ifError(result.error);
    const rows = Array.isArray(result.data) ? result.data : [];
    assert.ok(rows.some((row) => row.entity_id === memberBId), "visible completed member missing from search");
    assert.ok(!rows.some((row) => row.entity_id === hiddenId), "hidden member appeared in search");
    assert.ok(!rows.some((row) => row.entity_id === incompleteId), "incomplete member appeared in search");
    for (const row of rows.filter((item) => item.entity_type === "profile")) {
      const serialized = JSON.stringify(row).toLowerCase();
      assert.ok(!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(serialized), "profile search result contains an email-like value");
    }
  });
} else {
  skip("member search fixture assertions", "SECURITY_TEST_MEMBER_B_SEARCH_QUERY is not set");
}

if (moderator) {
  await check("moderator cannot call admin account listing RPC", async () => {
    const result = await moderator.rpc("admin_list_member_accounts");
    assert.ok(result.error, "moderator unexpectedly called admin account listing RPC");
  });
} else {
  skip("moderator capability boundary", "SECURITY_TEST_MODERATOR_TOKEN is not set");
}

if (admin) {
  await check("admin can call intentionally privileged account listing RPC", async () => {
    const result = await admin.rpc("admin_list_member_accounts");
    assert.ifError(result.error);
    assert.ok(Array.isArray(result.data), "admin account listing RPC returned an unexpected shape");
  });
} else {
  skip("admin privileged account listing", "SECURITY_TEST_ADMIN_TOKEN is not set");
}

console.log(`\n${passes} passed, ${failures} failed, ${skipped} skipped`);
process.exitCode = failures ? 1 : 0;
