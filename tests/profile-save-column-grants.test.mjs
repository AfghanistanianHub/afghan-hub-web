import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = await readFile(new URL("../src/app/profile/actions.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function harness({ missing = false, updateError = null, insertError = null, mentorshipUpdateError = null, signedIn = true } = {}) {
  const calls = [];
  const user = { id: "trusted-member", email: "member@example.test" };
  const client = {
    auth: { getUser: async () => ({ data: { user: signedIn ? user : null }, error: null }) },
    from(table) {
      assert.equal(table, "profiles");
      return {
        update(payload) {
          calls.push({ operation: "update", payload });
          for (const key of ["id", "email", "updated_at", "created_at", "role"]) assert.ok(!(key in payload), "protected update: " + key);
          return { eq(key, value) {
            assert.equal(key, "id"); assert.equal(value, user.id);
            return { error: mentorshipUpdateError, select(columns) {
              assert.equal(columns, "id");
              return { maybeSingle: async () => ({ data: missing ? null : { id: user.id }, error: updateError }) };
            } };
          } };
        },
        insert(payload) {
          calls.push({ operation: "insert", payload });
          assert.equal(payload.id, user.id); assert.equal(payload.email, user.email);
          assert.ok(!("updated_at" in payload)); assert.ok(!("role" in payload));
          return { select(columns) {
            assert.equal(columns, "id");
            return { single: async () => ({ data: insertError ? null : { id: user.id }, error: insertError }) };
          } };
        },
      };
    },
  };
  const exports = {};
  const imports = (name) => {
    if (name === "next/navigation") return { redirect: (url) => { throw new Error(url); } };
    if (name === "@/lib/supabase/server") return { createClient: async () => client };
    if (name === "@/lib/validation") return { isValidHttpUrl: (value) => /^https?:\/\//.test(value) };
    throw new Error("Unexpected import " + name);
  };
  new Function("require", "exports", compiled)(imports, exports);
  return { save: exports.saveProfile, calls };
}

function form() {
  const data = new FormData();
  data.set("first_name", "  Test "); data.set("last_name", "Member");
  data.set("id", "someone-else"); data.set("email", "other@example.test");
  data.set("role", "admin"); data.set("updated_at", "2099-01-01");
  return data;
}

test("existing profile saves with column-restricted UPDATE permissions and trusted owner filter", async () => {
  const h = harness();
  await assert.rejects(h.save(form()), { message: "/dashboard" });
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].payload.first_name, "Test");
  assert.equal(h.calls[0].payload.display_name, "Test Member");
  assert.equal(h.calls[0].payload.onboarding_completed, true);
});

test("missing own profile inserts with authenticated identity after zero-row update", async () => {
  const h = harness({ missing: true });
  await assert.rejects(h.save(form()), { message: "/dashboard" });
  assert.deepEqual(h.calls.map(c => c.operation), ["update", "insert", "update"]);
  assert.deepEqual(Object.keys(h.calls[2].payload).sort(), [
    "looking_for_mentor",
    "mentorship_topics",
    "open_to_mentoring",
  ]);
  assert.ok(!("mentorship_topics" in h.calls[1].payload));
  assert.deepEqual(h.calls[2].payload, { open_to_mentoring: false, looking_for_mentor: false, mentorship_topics: [] });
});

test("failed update never falls back to insert or exposes database details", async () => {
  const h = harness({ updateError: { message: "sensitive detail" } });
  await assert.rejects(h.save(form()), /We%20could%20not%20save%20your%20profile/);
  assert.equal(h.calls.length, 1);
});

test("failed or concurrently conflicting insert does not report success", async () => {
  const h = harness({ missing: true, insertError: { code: "23505", message: "sensitive detail" } });
  await assert.rejects(h.save(form()), /We%20could%20not%20save%20your%20profile/);
});

test("signed-out callers cannot write profiles", async () => {
  const h = harness({ signedIn: false });
  await assert.rejects(h.save(form()), { message: "/login" });
  assert.equal(h.calls.length, 0);
});

test("invalid links fail before any profile write", async () => {
  const h = harness(); const data = form(); data.set("website_url", "javascript:alert(1)");
  await assert.rejects(h.save(data), /Enter%20a%20valid%20website%20URL/);
  assert.equal(h.calls.length, 0);
});

test("failed mentorship update after insert does not report success or expose details", async () => {
  const h = harness({ missing: true, mentorshipUpdateError: { message: "sensitive detail" } });
  await assert.rejects(h.save(form()), /We%20could%20not%20save%20your%20mentorship%20preferences/);
  assert.deepEqual(h.calls.map(c => c.operation), ["update", "insert", "update"]);
});
