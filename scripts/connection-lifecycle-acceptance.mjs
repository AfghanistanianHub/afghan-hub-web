import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const WRITE_ACK = "I_UNDERSTAND_THIS_TOUCHES_ONLY_DISPOSABLE_SECONDARY_PERSONAS";

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

const mode = process.env.CONNECTION_LIFECYCLE_ACCEPTANCE_MODE?.trim() || "plan";
assert.ok(["plan", "write"].includes(mode), "CONNECTION_LIFECYCLE_ACCEPTANCE_MODE must be plan or write");

const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
const target = new URL(supabaseUrl);
assert.equal(target.protocol, "https:", "Connection lifecycle acceptance requires HTTPS");
assert.ok(
  !target.hostname.includes(PRODUCTION_PROJECT_REF),
  "Connection lifecycle acceptance is secondary-only; production is hard-blocked",
);

if (mode === "write") {
  assert.equal(
    process.env.CONNECTION_LIFECYCLE_ACCEPTANCE_ALLOW_WRITES,
    WRITE_ACK,
    "Refusing writes without the disposable-secondary acknowledgement",
  );
}

const configured = [
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
  configured[0].email.toLowerCase(),
  configured[1].email.toLowerCase(),
  "Member A and Member B must be distinct disposable accounts",
);

function makeClient() {
  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signIn(persona) {
  const supabase = makeClient();
  const auth = await supabase.auth.signInWithPassword({
    email: persona.email,
    password: persona.password,
  });
  assert.ifError(auth.error);
  assert.ok(auth.data.user?.id, `${persona.label} sign-in returned no user id`);
  assert.ok(auth.data.user?.email_confirmed_at, `${persona.label} is not email-confirmed`);

  const access = await supabase.rpc("get_my_access_context");
  assert.ifError(access.error);
  const state = access.data?.[0] ?? null;
  assert.ok(state, `${persona.label} access context is missing`);
  assert.equal(state.role, "member", `${persona.label} must be an ordinary member`);
  assert.equal(state.onboarding_completed, true, `${persona.label} onboarding incomplete`);

  const profile = await supabase
    .from("profiles")
    .select("id,is_public,onboarding_completed")
    .eq("id", auth.data.user.id)
    .single();
  assert.ifError(profile.error);
  assert.equal(profile.data.is_public, true, `${persona.label} must start public for request eligibility`);
  assert.equal(profile.data.onboarding_completed, true);

  return {
    ...persona,
    supabase,
    userId: auth.data.user.id,
    originalIsPublic: profile.data.is_public,
  };
}

async function findPairConnections(a, b) {
  const result = await a.supabase
    .from("connections")
    .select("id,status,requester_id,recipient_id")
    .or(
      `and(requester_id.eq.${a.userId},recipient_id.eq.${b.userId}),and(requester_id.eq.${b.userId},recipient_id.eq.${a.userId})`,
    );
  assert.ifError(result.error);
  return result.data ?? [];
}

async function assertNoPairState(a, b, label) {
  const rows = await findPairConnections(a, b);
  assert.equal(rows.length, 0, `${label}: Member A/B relationship state remains`);
}

async function requestNotification(recipient, connectionId) {
  const result = await recipient.supabase
    .from("notifications")
    .select("id,type,connection_id,actor_id,recipient_id")
    .eq("connection_id", connectionId)
    .eq("type", "connection_request")
    .maybeSingle();
  assert.ifError(result.error);
  return result.data;
}

async function acceptedNotification(requester, connectionId) {
  const result = await requester.supabase
    .from("notifications")
    .select("id,type,connection_id,actor_id,recipient_id")
    .eq("connection_id", connectionId)
    .eq("type", "connection_accepted")
    .maybeSingle();
  assert.ifError(result.error);
  return result.data;
}

async function assertNoConnectionNotifications(persona, connectionId, label) {
  const result = await persona.supabase
    .from("notifications")
    .select("id")
    .eq("connection_id", connectionId);
  assert.ifError(result.error);
  assert.equal(result.data?.length ?? 0, 0, `${label}: connection notification residue remains`);
}

async function createRequest(a, b) {
  const result = await a.supabase.rpc("send_connection_request", {
    target_recipient_id: b.userId,
  });
  assert.ifError(result.error);
  assert.ok(result.data, "Connection request returned no id");
  return result.data;
}

async function setOwnVisibility(persona, isPublic) {
  const result = await persona.supabase
    .from("profiles")
    .update({ is_public: isPublic })
    .eq("id", persona.userId)
    .select("id,is_public")
    .single();
  assert.ifError(result.error);
  assert.equal(result.data.is_public, isPublic);
}

let a;
let b;
let bVisibilityChanged = false;
try {
  a = await signIn(configured[0]);
  b = await signIn(configured[1]);
  console.log("PASS designated Member A/B are public, confirmed, onboarded ordinary members");

  await assertNoPairState(a, b, "Preflight");
  console.log("PASS Member A/B start with no relationship state");

  const unrelatedConversation = await a.supabase.rpc("start_direct_conversation", {
    target_member_id: b.userId,
  });
  assert.ok(unrelatedConversation.error, "Unrelated members unexpectedly opened a direct conversation");
  assert.equal(unrelatedConversation.error.code, "P0001");
  assert.equal(unrelatedConversation.error.message, "An accepted connection is required");
  console.log("PASS unrelated members cannot start a direct conversation");

  if (mode === "plan") {
    console.log("Plan mode passed. No connection or profile data was written.");
  } else {
    // Hidden recipient eligibility: temporarily hide only the designated disposable Member B,
    // verify Member A cannot discover/read or request that profile, then restore immediately.
    await setOwnVisibility(b, false);
    bVisibilityChanged = true;

    const hiddenProfile = await a.supabase
      .from("profiles")
      .select("id")
      .eq("id", b.userId)
      .maybeSingle();
    assert.ifError(hiddenProfile.error);
    assert.equal(hiddenProfile.data, null, "Member A can still read hidden Member B profile");

    const hiddenRequest = await a.supabase.rpc("send_connection_request", {
      target_recipient_id: b.userId,
    });
    assert.ok(hiddenRequest.error, "Hidden Member B unexpectedly accepted a connection request");
    assert.equal(hiddenRequest.error.code, "P0001");
    assert.equal(hiddenRequest.error.message, "Recipient is not available for connection requests");
    await assertNoPairState(a, b, "Hidden recipient eligibility");

    await setOwnVisibility(b, b.originalIsPublic);
    bVisibilityChanged = false;
    console.log("PASS hidden disposable member is not readable/request-eligible and visibility is restored");

    // Decline: recipient declines the request through the same RPC used by the app.
    const declineId = await createRequest(a, b);
    const declineRequestNotice = await requestNotification(b, declineId);
    assert.ok(declineRequestNotice, "Decline fixture did not create recipient request notification");

    const declined = await b.supabase.rpc("respond_connection_request", {
      target_connection_id: declineId,
      target_decision: "declined",
    });
    assert.ifError(declined.error);
    assert.equal(declined.data, true, "Recipient could not decline pending request");
    await assertNoPairState(a, b, "Decline");
    await assertNoConnectionNotifications(b, declineId, "Decline");
    console.log("PASS decline removes the pending relationship and cascades its request notification");

    // Cancel: requester removes its own pending request through the table delete contract used by removeConnection.
    const cancelId = await createRequest(a, b);
    const cancelRequestNotice = await requestNotification(b, cancelId);
    assert.ok(cancelRequestNotice, "Cancel fixture did not create recipient request notification");

    const cancelled = await a.supabase
      .from("connections")
      .delete()
      .eq("id", cancelId)
      .eq("requester_id", a.userId)
      .select("id")
      .maybeSingle();
    assert.ifError(cancelled.error);
    assert.equal(cancelled.data?.id, cancelId, "Requester could not cancel its pending request");
    await assertNoPairState(a, b, "Cancel");
    await assertNoConnectionNotifications(b, cancelId, "Cancel");
    console.log("PASS requester cancel removes pending relationship and notification residue");

    // Disconnect: create and accept a relationship, then remove it as a participant.
    const disconnectId = await createRequest(a, b);
    const disconnectRequestNotice = await requestNotification(b, disconnectId);
    assert.ok(disconnectRequestNotice, "Disconnect fixture did not create request notification");

    const accepted = await b.supabase.rpc("respond_connection_request", {
      target_connection_id: disconnectId,
      target_decision: "accepted",
    });
    assert.ifError(accepted.error);
    assert.equal(accepted.data, true, "Recipient could not accept disconnect fixture");

    const acceptedRow = await a.supabase
      .from("connections")
      .select("id,status")
      .eq("id", disconnectId)
      .single();
    assert.ifError(acceptedRow.error);
    assert.equal(acceptedRow.data.status, "accepted");

    const disconnectAcceptedNotice = await acceptedNotification(a, disconnectId);
    assert.ok(disconnectAcceptedNotice, "Accepted relationship did not notify requester");

    const directConversation = await a.supabase.rpc("start_direct_conversation", {
      target_member_id: b.userId,
    });
    assert.ifError(directConversation.error);
    assert.ok(directConversation.data, "Accepted members could not open a direct conversation");
    console.log("PASS accepted relationship enables a direct conversation");

    const disconnected = await b.supabase
      .from("connections")
      .delete()
      .eq("id", disconnectId)
      .select("id")
      .maybeSingle();
    assert.ifError(disconnected.error);
    assert.equal(disconnected.data?.id, disconnectId, "Connection participant could not disconnect");

    await assertNoPairState(a, b, "Disconnect");
    await assertNoConnectionNotifications(a, disconnectId, "Disconnect requester view");
    await assertNoConnectionNotifications(b, disconnectId, "Disconnect recipient view");

    const postDisconnectConversation = await a.supabase.rpc("start_direct_conversation", {
      target_member_id: b.userId,
    });
    assert.ok(postDisconnectConversation.error, "Disconnected members unexpectedly opened a new direct conversation");
    assert.equal(postDisconnectConversation.error.code, "P0001");
    assert.equal(postDisconnectConversation.error.message, "An accepted connection is required");
    console.log("PASS disconnect removes relationship eligibility and connection notification residue");

    await assertNoPairState(a, b, "Final cleanup");
    console.log("PASS connection lifecycle acceptance finished with a clean Member A/B pair state");
  }
} finally {
  if (bVisibilityChanged && b?.supabase) {
    try {
      await setOwnVisibility(b, b.originalIsPublic);
      console.log("PASS restored Member B visibility during cleanup");
    } catch (error) {
      console.error(`WARN Member B visibility restore failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  for (const persona of [a, b]) {
    if (!persona?.supabase) continue;
    const result = await persona.supabase.auth.signOut({ scope: "local" });
    if (result.error) console.error(`WARN ${persona.label} sign-out failed: ${result.error.message}`);
  }
}
