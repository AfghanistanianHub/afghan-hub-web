import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const PRODUCTION_ACK = "I_UNDERSTAND_THESE_ARE_DISPOSABLE_TEST_ACCOUNTS";

for (const name of [
  "AUTH_ACCEPTANCE_SUPABASE_URL",
  "AUTH_ACCEPTANCE_PUBLISHABLE_KEY",
  "AUTH_ACCEPTANCE_MEMBER_A_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD",
]) {
  assert.ok(process.env[name]?.trim(), `Missing required environment variable: ${name}`);
}

const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
const target = new URL(supabaseUrl);
assert.equal(target.protocol, "https:", "Acceptance target must use HTTPS");
const isProduction = target.hostname.includes(PRODUCTION_PROJECT_REF);

if (isProduction) {
  assert.equal(
    process.env.AUTH_ACCEPTANCE_ALLOW_PRODUCTION,
    PRODUCTION_ACK,
    "Refusing production preflight without the disposable-account acknowledgement",
  );
}

const requireAllPersonas = process.env.ROLE_ACCEPTANCE_REQUIRE_ALL_PERSONAS === "true";

const personas = [
  {
    label: "Member",
    expectedRole: "member",
    email: process.env.AUTH_ACCEPTANCE_MEMBER_A_EMAIL,
    password: process.env.AUTH_ACCEPTANCE_MEMBER_A_PASSWORD,
    required: true,
  },
  {
    label: "Moderator",
    expectedRole: "moderator",
    email: process.env.AUTH_ACCEPTANCE_MODERATOR_EMAIL,
    password: process.env.AUTH_ACCEPTANCE_MODERATOR_PASSWORD,
    required: requireAllPersonas,
  },
  {
    label: "Admin",
    expectedRole: "admin",
    email: process.env.AUTH_ACCEPTANCE_ADMIN_EMAIL,
    password: process.env.AUTH_ACCEPTANCE_ADMIN_PASSWORD,
    required: requireAllPersonas,
  },
];

function makeClient() {
  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signIn(persona) {
  if (!persona.email || !persona.password) {
    if (persona.required) throw new Error(`${persona.label} credentials are required`);
    return null;
  }
  const supabase = makeClient();
  const auth = await supabase.auth.signInWithPassword({ email: persona.email, password: persona.password });
  assert.ifError(auth.error);
  assert.ok(auth.data.user?.id, `${persona.label} sign-in returned no user id`);
  assert.ok(auth.data.user.email_confirmed_at, `${persona.label} email is not confirmed`);

  const access = await supabase.rpc("get_my_access_context");
  assert.ifError(access.error);
  const row = access.data?.[0];
  assert.ok(row, `${persona.label} access context is missing`);
  assert.equal(row.role, persona.expectedRole, `${persona.label} role mismatch`);
  assert.equal(row.onboarding_completed, true, `${persona.label} onboarding is incomplete`);
  return { ...persona, supabase, userId: auth.data.user.id };
}

async function expectDenied(promise, label, expectedMessage) {
  const result = await promise;
  assert.ok(result.error, `${label}: expected denial but call returned without error`);
  assert.equal(result.error.code, "P0001", `${label}: unexpected error code`);
  assert.equal(result.error.message, expectedMessage, `${label}: unexpected denial reason`);
}

let member;
let moderator;
let admin;
try {
  member = await signIn(personas[0]);
  console.log("PASS ordinary member persona authenticates with expected access context");

  const impossibleId = randomUUID();
  await expectDenied(
    member.supabase.rpc("moderate_event", {
      target_event_id: impossibleId,
      target_decision: "approve",
      target_note: null,
    }),
    "ordinary member moderation deny",
    "Not authorized to moderate content",
  );
  console.log("PASS ordinary member cannot invoke moderator content action");

  await expectDenied(
    member.supabase.rpc("set_profile_role", {
      target_profile_id: impossibleId,
      target_role: "moderator",
    }),
    "ordinary member admin-role deny",
    "Only admins can manage member roles",
  );
  console.log("PASS ordinary member cannot invoke admin role-management action");

  const owned = await member.supabase
    .from("events")
    .select("id,status,creator_id")
    .eq("creator_id", member.userId)
    .limit(5);
  assert.ifError(owned.error);
  for (const row of owned.data ?? []) assert.equal(row.creator_id, member.userId);
  console.log("PASS member can query only the explicitly requested owner-scoped event surface");

  moderator = await signIn(personas[1]);
  if (moderator) {
    const canModerate = await moderator.supabase.rpc("can_moderate");
    assert.ifError(canModerate.error);
    assert.equal(canModerate.data, true, "Moderator persona does not satisfy can_moderate()");
    console.log("PASS moderator persona satisfies can_moderate() read-only preflight");
  } else {
    console.log("SKIP moderator positive path: no disposable moderator credentials configured");
  }

  admin = await signIn(personas[2]);
  if (admin) {
    const isAdmin = await admin.supabase.rpc("is_admin");
    assert.ifError(isAdmin.error);
    assert.equal(isAdmin.data, true, "Admin persona does not satisfy is_admin()");

    await expectDenied(
      admin.supabase.rpc("set_profile_role", {
        target_profile_id: admin.userId,
        target_role: "member",
      }),
      "admin self-role-change deny",
      "Admins cannot change their own role",
    );
    console.log("PASS admin persona is recognized and cannot change its own role");
  } else {
    console.log("SKIP admin positive path: no disposable admin credentials configured");
  }

  console.log(`\nTarget: ${isProduction ? "production" : "non-production"}`);
  console.log("Role-persona preflight complete. No application data or roles were mutated.");
  if (!moderator || !admin) {
    console.log("Remaining positive role paths require explicitly designated disposable moderator/admin credentials.");
  }
} finally {
  for (const persona of [member, moderator, admin]) {
    if (persona?.supabase) await persona.supabase.auth.signOut({ scope: "local" });
  }
}
