import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const WRITE_ACK = "I_UNDERSTAND_THIS_TOUCHES_ONLY_DISPOSABLE_SECONDARY_PERSONAS";

for (const name of [
  "AUTH_ACCEPTANCE_SUPABASE_URL",
  "AUTH_ACCEPTANCE_PUBLISHABLE_KEY",
  "AUTH_ACCEPTANCE_MEMBER_A_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD",
  "AUTH_ACCEPTANCE_ADMIN_EMAIL",
  "AUTH_ACCEPTANCE_ADMIN_PASSWORD",
]) {
  assert.ok(process.env[name]?.trim(), `Missing ${name}`);
}

const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
assert.ok(!new URL(supabaseUrl).hostname.includes(PRODUCTION_PROJECT_REF), "Listing verification acceptance is secondary-only");
assert.equal(process.env.LISTING_VERIFICATION_ACCEPTANCE_ALLOW_WRITES, WRITE_ACK, "Missing disposable-secondary write acknowledgement");

function client() {
  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signIn(label, email, password, expectedRole) {
  const supabase = client();
  const auth = await supabase.auth.signInWithPassword({ email, password });
  assert.ifError(auth.error);
  assert.ok(auth.data.user?.id, `${label} returned no user id`);
  const access = await supabase.rpc("get_my_access_context");
  assert.ifError(access.error);
  assert.equal(access.data?.[0]?.role, expectedRole, `${label} role mismatch`);
  assert.equal(access.data?.[0]?.onboarding_completed, true, `${label} onboarding incomplete`);
  return { label, supabase, id: auth.data.user.id };
}

async function ownerCreate(owner, table, values) {
  const result = await owner.supabase
    .from(table)
    .insert(values)
    .select("id,status,is_verified")
    .single();
  assert.ifError(result.error);
  assert.equal(result.data.status, "draft", `${table} must start in draft`);
  assert.equal(result.data.is_verified, false, `${table} must start unverified`);
  return result.data.id;
}

async function ownerCannotVerify(owner, table, id) {
  const attempt = await owner.supabase
    .from(table)
    .update({ is_verified: true })
    .eq("id", id)
    .select("id,status,is_verified")
    .single();
  assert.ifError(attempt.error);
  assert.equal(attempt.data.status, "draft", `${table} owner verification attempt changed moderation state unexpectedly`);
  assert.equal(attempt.data.is_verified, false, `${table} owner unexpectedly changed verification`);
}

async function adminSetsVerification(admin, table, id, value) {
  const result = await admin.supabase
    .from(table)
    .update({ is_verified: value })
    .eq("id", id)
    .select("id,status,is_verified")
    .single();
  assert.ifError(result.error);
  assert.equal(result.data.is_verified, value, `${table} admin verification update did not persist`);
  return result.data;
}

async function cleanup(owner, table, id, ownerColumn) {
  const deletion = await owner.supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq(ownerColumn, owner.id)
    .select("id")
    .single();
  assert.ifError(deletion.error);
  assert.equal(deletion.data.id, id, `${table} cleanup deleted unexpected row`);

  const verification = await owner.supabase.from(table).select("id").eq("id", id).maybeSingle();
  assert.ifError(verification.error);
  assert.equal(verification.data, null, `${table} verification fixture remains after cleanup`);
}

let owner;
let admin;
let businessId = null;
let organizationId = null;
try {
  owner = await signIn("Member A", process.env.AUTH_ACCEPTANCE_MEMBER_A_EMAIL.trim(), process.env.AUTH_ACCEPTANCE_MEMBER_A_PASSWORD, "member");
  admin = await signIn("Admin", process.env.AUTH_ACCEPTANCE_ADMIN_EMAIL.trim(), process.env.AUTH_ACCEPTANCE_ADMIN_PASSWORD, "admin");
  assert.notEqual(owner.id, admin.id, "Owner and Admin must be distinct disposable personas");

  const marker = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  businessId = await ownerCreate(owner, "businesses", {
    owner_id: owner.id,
    name: `Verification Business ${marker}`,
    slug: `verification-business-${marker}`,
    category: "IT services",
    status: "draft",
    is_verified: true,
  });

  organizationId = await ownerCreate(owner, "organizations", {
    owner_id: owner.id,
    name: `Verification Organization ${marker}`,
    slug: `verification-organization-${marker}`,
    organization_type: "community",
    status: "draft",
    is_verified: true,
  });
  console.log("PASS ordinary owner inserts cannot self-verify business or organization");

  await ownerCannotVerify(owner, "businesses", businessId);
  await ownerCannotVerify(owner, "organizations", organizationId);
  console.log("PASS ordinary owner updates cannot change business or organization verification");

  await adminSetsVerification(admin, "businesses", businessId, true);
  await adminSetsVerification(admin, "organizations", organizationId, true);
  console.log("PASS Admin can verify business and organization through the protected update path");

  await adminSetsVerification(admin, "businesses", businessId, false);
  await adminSetsVerification(admin, "organizations", organizationId, false);
  console.log("PASS Admin can remove verification from business and organization");

  await cleanup(owner, "businesses", businessId, "owner_id");
  businessId = null;
  await cleanup(owner, "organizations", organizationId, "owner_id");
  organizationId = null;
  console.log("PASS exact owner cleanup removed both verification fixtures with zero residue");
} finally {
  for (const [table, id] of [["businesses", businessId], ["organizations", organizationId]]) {
    if (!id || !owner?.supabase) continue;
    const result = await owner.supabase.from(table).delete().eq("id", id).eq("owner_id", owner.id);
    if (result.error) {
      console.error(`ERROR emergency ${table} cleanup failed: ${result.error.message}`);
      process.exitCode = 1;
    }
  }
  for (const persona of [owner, admin]) {
    if (!persona?.supabase) continue;
    const signOut = await persona.supabase.auth.signOut({ scope: "local" });
    if (signOut.error) console.error(`WARN ${persona.label} sign-out failed: ${signOut.error.message}`);
  }
}
