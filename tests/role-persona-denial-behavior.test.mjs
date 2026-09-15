import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import test from "node:test";

const source = readFileSync(new URL("../scripts/role-persona-acceptance.mjs", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const run = new AsyncFunction("assert", "randomUUID", "createClient", "process", "console", source);

async function exercise({ complete = true, denialOverride } = {}) {
  const env = {
    AUTH_ACCEPTANCE_SUPABASE_URL: "https://rurgmyiiytesknsfwjjl.supabase.co",
    AUTH_ACCEPTANCE_PUBLISHABLE_KEY: "synthetic-key",
    AUTH_ACCEPTANCE_MEMBER_A_EMAIL: "member@example.invalid",
    AUTH_ACCEPTANCE_MEMBER_A_PASSWORD: "synthetic-password",
    ROLE_ACCEPTANCE_REQUIRE_ALL_PERSONAS: "true",
  };
  if (complete) for (const role of ["MODERATOR", "ADMIN"]) {
    env[`AUTH_ACCEPTANCE_${role}_EMAIL`] = `${role.toLowerCase()}@example.invalid`;
    env[`AUTH_ACCEPTANCE_${role}_PASSWORD`] = "synthetic-password";
  }
  let signOuts = 0;
  function createClient() {
    let role;
    return {
      auth: {
        async signInWithPassword({ email }) {
          role = email.split("@")[0];
          return { data: { user: { id: role, email_confirmed_at: "2026-01-01" } }, error: null };
        },
        async signOut() { signOuts++; },
      },
      async rpc(name, params) {
        if (name === "get_my_access_context")
          return { data: [{ role, onboarding_completed: true }], error: null };
        if (name === "can_moderate" || name === "is_admin") return { data: true, error: null };
        const message = name === "moderate_event" ? "Not authorized to moderate content"
          : params.target_profile_id === role ? "Admins cannot change their own role"
          : "Only admins can manage member roles";
        return { data: null, error: denialOverride ?? { code: "P0001", message } };
      },
      from() {
        return { select() { return this; }, eq() { return this; },
          async limit() { return { data: [], error: null }; } };
      },
    };
  }
  try { await run(assert, randomUUID, createClient, { env }, { log() {} }); }
  finally { assert.ok(signOuts > 0, "Authenticated sessions must be signed out even after failure"); }
}

test("complete role matrix accepts only the expected authorization denials", () => exercise());
test("strict matrix rejects missing privileged personas", () =>
  assert.rejects(exercise({ complete: false }), /Moderator credentials are required/));
test("transport errors cannot masquerade as authorization denial", () =>
  assert.rejects(exercise({ denialOverride: { code: "FETCH_ERROR", message: "network unavailable" } }), /unexpected error code/));
test("unrelated database exceptions cannot masquerade as authorization denial", () =>
  assert.rejects(exercise({ denialOverride: { code: "P0001", message: "record not found" } }), /unexpected denial reason/));
