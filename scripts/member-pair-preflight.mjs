import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const SAFE_DISCOVERY_FIELDS = [
  "id",
  "display_name",
  "username",
  "avatar_url",
  "headline",
  "profession",
  "company",
  "city",
  "province_state",
  "country",
  "languages",
  "skills",
  "website_url",
  "linkedin_url",
  "opportunity_status",
  "is_public",
  "onboarding_completed",
].join(",");

const required = [
  "AUTH_ACCEPTANCE_SUPABASE_URL",
  "AUTH_ACCEPTANCE_PUBLISHABLE_KEY",
  "AUTH_ACCEPTANCE_MEMBER_A_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD",
  "AUTH_ACCEPTANCE_MEMBER_B_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_B_PASSWORD",
];

for (const name of required) {
  assert.ok(process.env[name]?.trim(), `Missing required environment variable: ${name}`);
}

const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
const target = new URL(supabaseUrl);
assert.equal(target.protocol, "https:", "Member-pair preflight requires an HTTPS Supabase URL");

const isProduction = target.hostname.includes(PRODUCTION_PROJECT_REF);
if (isProduction) {
  assert.equal(
    process.env.AUTH_ACCEPTANCE_ALLOW_PRODUCTION,
    "I_UNDERSTAND_THESE_ARE_DISPOSABLE_TEST_ACCOUNTS",
    "Refusing production preflight without the explicit disposable-account acknowledgement",
  );
}

const personas = [
  {
    label: "Member A",
    email: process.env.AUTH_ACCEPTANCE_MEMBER_A_EMAIL.trim(),
    password: process.env.AUTH_ACCEPTANCE_MEMBER_A_PASSWORD,
  },
  {
    label: "Member B",
    email: process.env.AUTH_ACCEPTANCE_MEMBER_B_EMAIL.trim(),
    password: process.env.AUTH_ACCEPTANCE_MEMBER_B_PASSWORD,
  },
];

assert.notEqual(
  personas[0].email.toLowerCase(),
  personas[1].email.toLowerCase(),
  "Member A and Member B must be distinct disposable accounts",
);

function createAcceptanceClient() {
  return createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function signInPersona(persona) {
  const client = createAcceptanceClient();
  const result = await client.auth.signInWithPassword({
    email: persona.email,
    password: persona.password,
  });

  assert.ifError(result.error);
  assert.ok(result.data.user?.id, `${persona.label} sign-in returned no user id`);
  assert.ok(result.data.user?.email_confirmed_at, `${persona.label} is not email-confirmed`);

  const access = await client.rpc("get_my_access_context");
  assert.ifError(access.error);
  const row = access.data?.[0] ?? null;
  assert.ok(row, `${persona.label} access context is missing`);
  assert.equal(row.role, "member", `${persona.label} is not an ordinary member persona`);
  assert.equal(row.onboarding_completed, true, `${persona.label} has not completed onboarding`);

  return { ...persona, client, userId: result.data.user.id };
}

async function safeSignOut(persona) {
  if (!persona?.client) return;
  const result = await persona.client.auth.signOut({ scope: "local" });
  assert.ifError(result.error);
}

let memberA;
let memberB;

try {
  memberA = await signInPersona(personas[0]);
  memberB = await signInPersona(personas[1]);

  console.log("PASS designated Member A/B accounts authenticate as confirmed, onboarded members");

  const discovery = await memberA.client
    .from("profiles")
    .select(SAFE_DISCOVERY_FIELDS)
    .eq("id", memberB.userId)
    .maybeSingle();

  assert.ifError(discovery.error);
  assert.ok(discovery.data, "Member B is not discoverable to Member A");
  assert.equal(discovery.data.id, memberB.userId, "Discovery returned the wrong member");
  assert.equal(discovery.data.is_public, true, "Member B is not public");
  assert.equal(discovery.data.onboarding_completed, true, "Member B is not onboarding-complete");
  console.log("PASS Member A can discover Member B through the safe profile contract");

  const privateRead = await memberA.client
    .from("profiles")
    .select("id,email")
    .eq("id", memberB.userId)
    .maybeSingle();

  assert.ok(privateRead.error, "Private profile email unexpectedly remained directly selectable");
  assert.equal(privateRead.data, null, "Private profile query returned data despite the expected denial");
  console.log("PASS Member A cannot directly select Member B's private email field");

  const existing = await memberA.client
    .from("connections")
    .select("id,status,requester_id,recipient_id")
    .or(
      `and(requester_id.eq.${memberA.userId},recipient_id.eq.${memberB.userId}),and(requester_id.eq.${memberB.userId},recipient_id.eq.${memberA.userId})`,
    );

  assert.ifError(existing.error);
  assert.equal(
    existing.data?.length ?? 0,
    0,
    "Member A/B already have relationship state; reset only these designated disposable fixtures before write acceptance",
  );
  console.log("PASS Member A/B have no pre-existing connection state");

  const aNotifications = await memberA.client
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", memberB.userId);

  assert.ifError(aNotifications.error);
  assert.equal(
    aNotifications.count ?? 0,
    0,
    "Member A can count notifications belonging to Member B",
  );
  console.log("PASS Member A cannot enumerate Member B notifications");

  const bConversations = await memberA.client
    .from("conversation_members")
    .select("conversation_id", { count: "exact", head: true })
    .eq("profile_id", memberB.userId);

  assert.ifError(bConversations.error);
  assert.equal(
    bConversations.count ?? 0,
    0,
    "Member A can enumerate Member B conversation memberships before sharing a conversation",
  );
  console.log("PASS Member A cannot enumerate Member B conversation memberships");

  console.log(`\nTarget: ${isProduction ? "production" : "non-production"}`);
  console.log("5 read-only member-pair checks passed.");
  console.log("No signup, profile/content writes, connection mutations, messages, notifications, moderation, or service-role operations were performed.");
} finally {
  await safeSignOut(memberA);
  await safeSignOut(memberB);
}
