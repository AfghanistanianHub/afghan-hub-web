import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const WRITE_ACK = "I_UNDERSTAND_THIS_TOUCHES_ONLY_DISPOSABLE_SECONDARY_PERSONAS";

for (const name of [
  "AUTH_ACCEPTANCE_SUPABASE_URL",
  "AUTH_ACCEPTANCE_PUBLISHABLE_KEY",
  "AUTH_ACCEPTANCE_MEMBER_A_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD",
  "AUTH_ACCEPTANCE_MEMBER_B_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_B_PASSWORD",
  "AUTH_ACCEPTANCE_MODERATOR_EMAIL",
  "AUTH_ACCEPTANCE_MODERATOR_PASSWORD",
]) {
  assert.ok(process.env[name]?.trim(), `Missing ${name}`);
}

const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
assert.ok(!new URL(supabaseUrl).hostname.includes(PRODUCTION_PROJECT_REF), "Third-party responder acceptance is secondary-only");
assert.equal(process.env.UNRELATED_RESPONDER_ACCEPTANCE_ALLOW_WRITES, WRITE_ACK, "Missing disposable-secondary write acknowledgement");

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

async function setOnboarding(persona, value) {
  const result = await persona.supabase
    .from("profiles")
    .update({ onboarding_completed: value })
    .eq("id", persona.id)
    .select("id,onboarding_completed")
    .single();
  assert.ifError(result.error);
  assert.equal(result.data.onboarding_completed, value);
}

let a;
let b;
let thirdParty;
let connectionId = null;
let bOnboardingChanged = false;
try {
  a = await signIn("Member A", process.env.AUTH_ACCEPTANCE_MEMBER_A_EMAIL.trim(), process.env.AUTH_ACCEPTANCE_MEMBER_A_PASSWORD, "member");
  b = await signIn("Member B", process.env.AUTH_ACCEPTANCE_MEMBER_B_EMAIL.trim(), process.env.AUTH_ACCEPTANCE_MEMBER_B_PASSWORD, "member");
  thirdParty = await signIn("Moderator", process.env.AUTH_ACCEPTANCE_MODERATOR_EMAIL.trim(), process.env.AUTH_ACCEPTANCE_MODERATOR_PASSWORD, "moderator");
  assert.equal(new Set([a.id, b.id, thirdParty.id]).size, 3, "All three disposable personas must be distinct");

  const before = await a.supabase
    .from("connections")
    .select("id")
    .or(`and(requester_id.eq.${a.id},recipient_id.eq.${b.id}),and(requester_id.eq.${b.id},recipient_id.eq.${a.id})`);
  assert.ifError(before.error);
  assert.equal(before.data?.length ?? 0, 0, "Member A/B pair must start clean");

  await setOnboarding(b, false);
  bOnboardingChanged = true;

  const directoryEligibility = await a.supabase
    .from("profiles")
    .select("id")
    .eq("id", b.id)
    .eq("is_public", true)
    .eq("onboarding_completed", true)
    .maybeSingle();
  assert.ifError(directoryEligibility.error);
  assert.equal(directoryEligibility.data, null, "Incomplete Member B unexpectedly appears in the eligible directory query");

  const incompleteRequest = await a.supabase.rpc("send_connection_request", { target_recipient_id: b.id });
  assert.ok(incompleteRequest.error, "Incomplete Member B unexpectedly accepted a connection request");
  assert.equal(incompleteRequest.error.code, "P0001");
  assert.equal(incompleteRequest.error.message, "Recipient is not available for connection requests");

  await setOnboarding(b, true);
  bOnboardingChanged = false;
  console.log("PASS incomplete disposable member is excluded from eligible discovery/request flow and onboarding is restored");

  const request = await a.supabase.rpc("send_connection_request", { target_recipient_id: b.id });
  assert.ifError(request.error);
  connectionId = request.data;
  assert.ok(connectionId, "Connection request returned no id");

  const unrelatedAttempt = await thirdParty.supabase.rpc("respond_connection_request", {
    target_connection_id: connectionId,
    target_decision: "accepted",
  });
  assert.ifError(unrelatedAttempt.error);
  assert.equal(unrelatedAttempt.data, false, "Unrelated moderator unexpectedly responded to A/B request");

  const stillPending = await b.supabase
    .from("connections")
    .select("id,status,requester_id,recipient_id")
    .eq("id", connectionId)
    .single();
  assert.ifError(stillPending.error);
  assert.equal(stillPending.data.status, "pending");
  assert.equal(stillPending.data.requester_id, a.id);
  assert.equal(stillPending.data.recipient_id, b.id);
  console.log("PASS unrelated disposable moderator cannot respond to Member A/B request and pending state is unchanged");

  const cleanup = await a.supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)
    .eq("requester_id", a.id)
    .select("id")
    .single();
  assert.ifError(cleanup.error);
  assert.equal(cleanup.data.id, connectionId);
  connectionId = null;

  const after = await a.supabase
    .from("connections")
    .select("id")
    .or(`and(requester_id.eq.${a.id},recipient_id.eq.${b.id}),and(requester_id.eq.${b.id},recipient_id.eq.${a.id})`);
  assert.ifError(after.error);
  assert.equal(after.data?.length ?? 0, 0, "A/B relationship residue remains");

  const notificationResidue = await b.supabase
    .from("notifications")
    .select("id")
    .eq("connection_id", cleanup.data.id);
  assert.ifError(notificationResidue.error);
  assert.equal(notificationResidue.data?.length ?? 0, 0, "Request notification residue remains");
  console.log("PASS exact requester cleanup removed connection and notification residue");
} finally {
  if (bOnboardingChanged && b?.supabase) {
    try {
      await setOnboarding(b, true);
      console.log("PASS restored Member B onboarding during cleanup");
    } catch (error) {
      console.error(`ERROR Member B onboarding restore failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
  if (connectionId && a?.supabase) {
    const cleanup = await a.supabase.from("connections").delete().eq("id", connectionId).eq("requester_id", a.id);
    if (cleanup.error) {
      console.error(`ERROR emergency request cleanup failed: ${cleanup.error.message}`);
      process.exitCode = 1;
    }
  }
  for (const persona of [a, b, thirdParty]) {
    if (!persona?.supabase) continue;
    const signOut = await persona.supabase.auth.signOut({ scope: "local" });
    if (signOut.error) console.error(`WARN ${persona.label} sign-out failed: ${signOut.error.message}`);
  }
}
