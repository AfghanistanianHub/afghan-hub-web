import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const WRITE_ACK = "I_UNDERSTAND_THIS_TOUCHES_ONLY_DISPOSABLE_SECONDARY_PERSONAS";
const mode = process.env.OWNER_ACCEPTANCE_MODE?.trim() || "plan";

for (const name of [
  "AUTH_ACCEPTANCE_SUPABASE_URL",
  "AUTH_ACCEPTANCE_PUBLISHABLE_KEY",
  "AUTH_ACCEPTANCE_MEMBER_A_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD",
  "AUTH_ACCEPTANCE_MEMBER_B_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_B_PASSWORD",
]) {
  assert.ok(process.env[name]?.trim(), `Missing ${name}`);
}
assert.ok(["plan", "write"].includes(mode), "OWNER_ACCEPTANCE_MODE must be plan or write");

const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
const target = new URL(supabaseUrl);
assert.equal(target.protocol, "https:");
assert.ok(!target.hostname.includes(PRODUCTION_PROJECT_REF), "Owner acceptance is secondary-only; production is hard-blocked");
if (mode === "write") {
  assert.equal(process.env.OWNER_ACCEPTANCE_ALLOW_WRITES, WRITE_ACK, "Missing disposable-secondary write acknowledgement");
}

function makeClient() {
  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signIn(label, emailName, passwordName) {
  const supabase = makeClient();
  const auth = await supabase.auth.signInWithPassword({
    email: process.env[emailName].trim(),
    password: process.env[passwordName],
  });
  assert.ifError(auth.error);
  assert.ok(auth.data.user?.id, `${label} sign-in returned no user id`);
  const access = await supabase.rpc("get_my_access_context");
  assert.ifError(access.error);
  const state = access.data?.[0];
  assert.equal(state?.role, "member", `${label} must be an ordinary member`);
  assert.equal(state?.onboarding_completed, true, `${label} onboarding incomplete`);
  return { label, supabase, id: auth.data.user.id };
}

const created = [];
let owner;
let outsider;

function remember(table, id, ownerColumn) {
  created.push({ table, id, ownerColumn });
  return id;
}

async function assertHiddenFromOutsider(table, id) {
  const result = await outsider.supabase.from(table).select("id").eq("id", id).maybeSingle();
  assert.ifError(result.error);
  assert.equal(result.data, null, `${table} draft leaked to non-owner`);
}

async function assertOutsiderCannotMutate(table, id, ownerField) {
  const updated = await outsider.supabase
    .from(table)
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  assert.ifError(updated.error);
  assert.equal(updated.data?.length ?? 0, 0, `${table} non-owner update unexpectedly matched`);

  const deleted = await outsider.supabase.from(table).delete().eq("id", id).select("id");
  assert.ifError(deleted.error);
  assert.equal(deleted.data?.length ?? 0, 0, `${table} non-owner delete unexpectedly matched`);

  const stillOwned = await owner.supabase
    .from(table)
    .select(`id,${ownerField},status`)
    .eq("id", id)
    .single();
  assert.ifError(stillOwned.error);
  assert.equal(stillOwned.data[ownerField], owner.id);
  assert.equal(stillOwned.data.status, "draft");
}

async function ownerEdit(table, id, patch) {
  const result = await owner.supabase
    .from(table)
    .update({ ...patch, status: "draft" })
    .eq("id", id)
    .select("id,status")
    .single();
  assert.ifError(result.error);
  assert.equal(result.data.status, "draft");
}

async function exactCleanup() {
  if (!owner) return;
  for (const fixture of [...created].reverse()) {
    const deletion = await owner.supabase
      .from(fixture.table)
      .delete()
      .eq("id", fixture.id)
      .eq(fixture.ownerColumn, owner.id)
      .select("id");
    assert.ifError(deletion.error);
    if ((deletion.data?.length ?? 0) > 0) {
      assert.equal(deletion.data.length, 1, `${fixture.table} cleanup cardinality mismatch`);
    }
  }

  for (const fixture of created) {
    const verification = await owner.supabase
      .from(fixture.table)
      .select("id")
      .eq("id", fixture.id)
      .maybeSingle();
    assert.ifError(verification.error);
    assert.equal(verification.data, null, `${fixture.table} fixture remains after cleanup`);
  }
}

try {
  owner = await signIn("Member A", "AUTH_ACCEPTANCE_MEMBER_A_EMAIL", "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD");
  outsider = await signIn("Member B", "AUTH_ACCEPTANCE_MEMBER_B_EMAIL", "AUTH_ACCEPTANCE_MEMBER_B_PASSWORD");
  assert.notEqual(owner.id, outsider.id, "Member A/B must be distinct");
  console.log("PASS disposable Member A/B authenticate as distinct ordinary members");

  if (mode === "plan") {
    console.log("Plan mode passed. No owner fixtures were written.");
  } else {
    const marker = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const organization = await owner.supabase
      .from("organizations")
      .insert({ owner_id: owner.id, name: `Acceptance Organization ${marker}`, slug: `acceptance-org-${marker}`, organization_type: "community", status: "draft" })
      .select("id,status")
      .single();
    assert.ifError(organization.error);
    const organizationId = remember("organizations", organization.data.id, "owner_id");
    assert.equal(organization.data.status, "draft");

    const business = await owner.supabase
      .from("businesses")
      .insert({ owner_id: owner.id, name: `Acceptance Business ${marker}`, slug: `acceptance-business-${marker}`, category: "IT services", status: "draft" })
      .select("id,status")
      .single();
    assert.ifError(business.error);
    const businessId = remember("businesses", business.data.id, "owner_id");
    assert.equal(business.data.status, "draft");

    const opportunity = await owner.supabase
      .from("opportunities")
      .insert({ author_id: owner.id, organization_id: organizationId, title: `Acceptance Opportunity ${marker}`, slug: `acceptance-opportunity-${marker}`, summary: "Disposable owner acceptance fixture", description: "Disposable owner acceptance fixture for secondary validation.", type: "job", status: "draft" })
      .select("id,status")
      .single();
    assert.ifError(opportunity.error);
    const opportunityId = remember("opportunities", opportunity.data.id, "author_id");
    assert.equal(opportunity.data.status, "draft");

    const event = await owner.supabase
      .from("events")
      .insert({ creator_id: owner.id, organization_id: organizationId, title: `Acceptance Event ${marker}`, slug: `acceptance-event-${marker}`, summary: "Disposable owner acceptance fixture", description: "Disposable owner acceptance fixture for secondary validation.", starts_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), status: "draft" })
      .select("id,status")
      .single();
    assert.ifError(event.error);
    const eventId = remember("events", event.data.id, "creator_id");
    assert.equal(event.data.status, "draft");
    console.log("PASS owner created organization, business, opportunity and event as draft submissions");

    for (const [table, id, ownerField] of [
      ["organizations", organizationId, "owner_id"],
      ["businesses", businessId, "owner_id"],
      ["opportunities", opportunityId, "author_id"],
      ["events", eventId, "creator_id"],
    ]) {
      await assertHiddenFromOutsider(table, id);
      await assertOutsiderCannotMutate(table, id, ownerField);
    }
    console.log("PASS draft submissions are hidden and immutable to non-owner Member B");

    await ownerEdit("organizations", organizationId, { short_description: "Owner-edited organization fixture" });
    await ownerEdit("businesses", businessId, { short_description: "Owner-edited business fixture" });
    await ownerEdit("opportunities", opportunityId, { summary: "Owner-edited opportunity fixture" });
    await ownerEdit("events", eventId, { summary: "Owner-edited event fixture" });
    console.log("PASS owner can edit all four submissions while they remain draft");

    await exactCleanup();
    created.length = 0;
    console.log("PASS exact owner cleanup removed all four fixtures and verification returned zero residue");
  }
} finally {
  if (created.length > 0) {
    try {
      await exactCleanup();
      console.log("PASS emergency exact cleanup removed partial owner fixtures");
    } catch (error) {
      console.error(`ERROR owner fixture cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
  for (const persona of [owner, outsider]) {
    if (!persona?.supabase) continue;
    const result = await persona.supabase.auth.signOut({ scope: "local" });
    if (result.error) {
      console.error(`WARN ${persona.label} sign-out failed: ${result.error.message}`);
    }
  }
}
