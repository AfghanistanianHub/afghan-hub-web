import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "yussznmwjsvfvpabmwdc";
const PRODUCTION_ACK = "I_UNDERSTAND_THESE_ARE_DISPOSABLE_TEST_ACCOUNTS";
const required = [
  "AUTH_ACCEPTANCE_SUPABASE_URL",
  "AUTH_ACCEPTANCE_PUBLISHABLE_KEY",
  "AUTH_ACCEPTANCE_MEMBER_A_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD",
  "AUTH_ACCEPTANCE_MEMBER_B_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_B_PASSWORD",
];
for (const name of required) assert.ok(process.env[name]?.trim(), `Missing ${name}`);

const mode = process.env.RSVP_ACCEPTANCE_MODE?.trim() || "plan";
assert.ok(["plan", "write"].includes(mode), "RSVP_ACCEPTANCE_MODE must be plan or write");
const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
const isProduction = new URL(supabaseUrl).hostname.includes(PRODUCTION_PROJECT_REF);
if (isProduction) {
  assert.equal(process.env.AUTH_ACCEPTANCE_ALLOW_PRODUCTION, PRODUCTION_ACK);
  assert.equal(mode, "plan", "RSVP write acceptance is hard-blocked on production");
}

const configs = [
  ["Member A", process.env.AUTH_ACCEPTANCE_MEMBER_A_EMAIL.trim(), process.env.AUTH_ACCEPTANCE_MEMBER_A_PASSWORD],
  ["Member B", process.env.AUTH_ACCEPTANCE_MEMBER_B_EMAIL.trim(), process.env.AUTH_ACCEPTANCE_MEMBER_B_PASSWORD],
];
const cEmail = process.env.AUTH_ACCEPTANCE_MEMBER_C_EMAIL?.trim();
const cPassword = process.env.AUTH_ACCEPTANCE_MEMBER_C_PASSWORD;
if (cEmail || cPassword) {
  assert.ok(cEmail && cPassword, "Member C requires both email and password");
  configs.push(["Member C", cEmail, cPassword]);
}

function makeClient() {
  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signIn([label, email, password]) {
  const supabase = makeClient();
  const auth = await supabase.auth.signInWithPassword({ email, password });
  assert.ifError(auth.error);
  assert.ok(auth.data.user?.id, `${label} missing user id`);
  assert.ok(auth.data.user?.email_confirmed_at, `${label} is not email-confirmed`);
  const access = await supabase.rpc("get_my_access_context");
  assert.ifError(access.error);
  const state = access.data?.[0];
  assert.equal(state?.role, "member", `${label} must be an ordinary member`);
  assert.equal(state?.onboarding_completed, true, `${label} onboarding incomplete`);
  return { label, supabase, id: auth.data.user.id };
}

const people = [];
let eventId = null;
let cleanupFailure = null;
try {
  for (const config of configs) people.push(await signIn(config));
  const [a, b, c] = people;
  assert.notEqual(a.id, b.id, "Member A/B must be distinct");
  if (c) assert.ok(c.id !== a.id && c.id !== b.id, "Member C must be distinct");
  console.log("PASS designated member personas authenticate and are onboarding-complete");

  if (mode === "plan") {
    console.log(`Target: ${isProduction ? "production" : "non-production"}`);
    console.log("Plan mode passed. No event or RSVP was created.");
  } else {
    const marker = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const startsAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const created = await a.supabase
      .from("events")
      .insert({
        creator_id: a.id,
        title: `Acceptance RSVP ${marker}`,
        slug: `acceptance-rsvp-${marker}`,
        summary: "Disposable launch acceptance fixture",
        description: "Disposable launch acceptance fixture. Safe to remove after this run.",
        is_online: true,
        online_url: "https://example.com/acceptance-fixture",
        starts_at: startsAt,
        capacity: 1,
        status: "published",
      })
      .select("id,creator_id,capacity,status")
      .single();
    assert.ifError(created.error);
    eventId = created.data.id;
    console.log("PASS Member A created one disposable capacity-1 event");

    const creatorAttempt = await a.supabase.rpc("rsvp_to_event", { target_event_id: eventId });
    assert.ok(creatorAttempt.error, "Event creator unexpectedly RSVP'd to own event");
    console.log("PASS event creator RSVP is denied");

    const first = await b.supabase.rpc("rsvp_to_event", { target_event_id: eventId });
    assert.ifError(first.error);
    const duplicate = await b.supabase.rpc("rsvp_to_event", { target_event_id: eventId });
    assert.ifError(duplicate.error);
    const countOne = await b.supabase.rpc("get_event_rsvp_count", { target_event_id: eventId });
    assert.ifError(countOne.error);
    assert.equal(Number(countOne.data), 1, "Duplicate RSVP created extra attendance");
    console.log("PASS Member B RSVP succeeds and duplicate is idempotent");

    if (c) {
      const full = await c.supabase.rpc("rsvp_to_event", { target_event_id: eventId });
      assert.ok(full.error, "Capacity-1 event unexpectedly accepted Member C");
      console.log("PASS capacity-full path denies optional Member C");
    }

    const cancelled = await b.supabase
      .from("event_rsvps")
      .delete()
      .eq("event_id", eventId)
      .eq("profile_id", b.id)
      .select("event_id,profile_id");
    assert.ifError(cancelled.error);
    assert.equal(cancelled.data?.length, 1, "Member B cancellation did not remove exactly one own RSVP");
    const countZero = await b.supabase.rpc("get_event_rsvp_count", { target_event_id: eventId });
    assert.ifError(countZero.error);
    assert.equal(Number(countZero.data), 0, "RSVP count did not return to zero after cancellation");
    console.log("PASS Member B can cancel own RSVP and count returns to zero");
  }
} finally {
  const a = people[0];
  if (eventId && a) {
    try {
      const deleted = await a.supabase.from("events").delete().eq("id", eventId).eq("creator_id", a.id).select("id");
      assert.ifError(deleted.error);
      assert.equal(deleted.data?.length, 1, "Fixture cleanup did not delete exactly one event");
      console.log("PASS disposable event fixture cleaned up");
    } catch (error) {
      cleanupFailure = error;
    }
  }
  for (const person of people) {
    const result = await person.supabase.auth.signOut({ scope: "local" });
    if (result.error && !cleanupFailure) cleanupFailure = result.error;
  }
  if (cleanupFailure) throw cleanupFailure;
}
