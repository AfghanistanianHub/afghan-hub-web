import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const ALLOWED_ROLES = new Set(["member", "moderator", "admin"]);

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
assert.equal(target.protocol, "https:", "Auth acceptance requires an HTTPS Supabase URL");

const isProduction = target.hostname.includes(PRODUCTION_PROJECT_REF);
if (isProduction) {
  assert.equal(
    process.env.AUTH_ACCEPTANCE_ALLOW_PRODUCTION,
    "I_UNDERSTAND_THESE_ARE_DISPOSABLE_TEST_ACCOUNTS",
    "Refusing production auth acceptance without the explicit disposable-account acknowledgement",
  );
}

const personas = [
  {
    name: "member A",
    email: process.env.AUTH_ACCEPTANCE_MEMBER_A_EMAIL.trim(),
    password: process.env.AUTH_ACCEPTANCE_MEMBER_A_PASSWORD,
    expectedRole: "member",
  },
  {
    name: "member B",
    email: process.env.AUTH_ACCEPTANCE_MEMBER_B_EMAIL.trim(),
    password: process.env.AUTH_ACCEPTANCE_MEMBER_B_PASSWORD,
    expectedRole: "member",
  },
];

for (const [name, prefix, expectedRole] of [
  ["moderator", "AUTH_ACCEPTANCE_MODERATOR", "moderator"],
  ["admin", "AUTH_ACCEPTANCE_ADMIN", "admin"],
]) {
  const email = process.env[`${prefix}_EMAIL`]?.trim();
  const password = process.env[`${prefix}_PASSWORD`];
  if (email || password) {
    assert.ok(email && password, `${name} requires both ${prefix}_EMAIL and ${prefix}_PASSWORD`);
    personas.push({ name, email, password, expectedRole });
  }
}

const seenEmails = new Set();
for (const persona of personas) {
  const normalized = persona.email.toLowerCase();
  assert.ok(!seenEmails.has(normalized), `Duplicate test-account email configured for ${persona.name}`);
  seenEmails.add(normalized);
}

let failures = 0;
let passes = 0;

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

function createAcceptanceClient() {
  return createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

for (const persona of personas) {
  await check(`${persona.name}: password sign-in and own access state`, async () => {
    const client = createAcceptanceClient();
    try {
      const signIn = await client.auth.signInWithPassword({
        email: persona.email,
        password: persona.password,
      });

      assert.ifError(signIn.error);
      assert.ok(signIn.data.session?.access_token, "sign-in returned no access token");
      assert.ok(signIn.data.user?.id, "sign-in returned no user id");
      assert.ok(signIn.data.user?.email_confirmed_at, "test account is not email-confirmed");

      const userCheck = await client.auth.getUser();
      assert.ifError(userCheck.error);
      assert.equal(userCheck.data.user?.id, signIn.data.user.id, "getUser returned a different user");

      const accessResult = await client.rpc("get_my_access_context");
      const ownProfile = { data: accessResult.data?.[0] ?? null, error: accessResult.error };

      assert.ifError(ownProfile.error);
      assert.ok(ownProfile.data, "own profile row is missing");
      assert.ok(ALLOWED_ROLES.has(ownProfile.data.role), `unexpected role ${ownProfile.data.role}`);
      assert.equal(
        ownProfile.data.role,
        persona.expectedRole,
        `${persona.name} role differs from the expected acceptance persona`,
      );
      assert.equal(
        ownProfile.data.onboarding_completed,
        true,
        `${persona.name} has not completed onboarding`,
      );

      const refresh = await client.auth.refreshSession();
      assert.ifError(refresh.error);
      assert.ok(refresh.data.session?.access_token, "refreshSession returned no access token");

    } finally {
      const signOut = await client.auth.signOut({ scope: "local" });
      assert.ifError(signOut.error);

      const afterSignOut = await client.auth.getSession();
      assert.ifError(afterSignOut.error);
      assert.equal(afterSignOut.data.session, null, "local sign-out left a session behind");
    }
  });
}

console.log(`\nTarget: ${isProduction ? "production" : "non-production"}`);
console.log(`${passes} passed, ${failures} failed`);
console.log("No signup, password-reset, profile writes, content writes, or admin/service-role operations were performed.");
process.exitCode = failures ? 1 : 0;
