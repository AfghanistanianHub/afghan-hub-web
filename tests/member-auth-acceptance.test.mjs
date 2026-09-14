import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../scripts/member-auth-acceptance.mjs", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function runHarness({ role = "member", rpcError = null } = {}) {
  let logouts = 0;
  let rpcCalls = 0;
  const output = [];
  const processStub = {
    env: {
      AUTH_ACCEPTANCE_SUPABASE_URL: "https://isolated.example.test",
      AUTH_ACCEPTANCE_PUBLISHABLE_KEY: "synthetic-key",
      AUTH_ACCEPTANCE_MEMBER_A_EMAIL: "a@example.test",
      AUTH_ACCEPTANCE_MEMBER_A_PASSWORD: "synthetic-password",
      AUTH_ACCEPTANCE_MEMBER_B_EMAIL: "b@example.test",
      AUTH_ACCEPTANCE_MEMBER_B_PASSWORD: "synthetic-password",
    },
    exitCode: undefined,
  };
  const createClient = () => ({
    from() { throw new Error("Direct profile reads are forbidden after privacy hardening"); },
    async rpc(name) {
      assert.equal(name, "get_my_access_context");
      rpcCalls++;
      return { data: [{ role, onboarding_completed: true }], error: rpcError };
    },
    auth: {
      async signInWithPassword() {
        return { data: { session: { access_token: "synthetic" }, user: { id: "synthetic-id", email_confirmed_at: "confirmed" } }, error: null };
      },
      async getUser() { return { data: { user: { id: "synthetic-id" } }, error: null }; },
      async refreshSession() { return { data: { session: { access_token: "refreshed" } }, error: null }; },
      async signOut(options) {
        assert.deepEqual(options, { scope: "local" });
        logouts++;
        return { error: null };
      },
      async getSession() { return { data: { session: null }, error: null }; },
    },
  });
  await new AsyncFunction("assert", "createClient", "process", "console", source)(
    assert, createClient, processStub, { log(...args) { output.push(args.join(" ")); }, error(...args) { output.push(args.join(" ")); } },
  );
  return { exitCode: processStub.exitCode, logouts, rpcCalls, output: output.join("\n") };
}

test("ordinary personas pass with private role columns inaccessible", async () => {
  const { output, ...result } = await runHarness();
  assert.match(output, /2 passed, 0 failed/);
  assert.deepEqual(result, { exitCode: 0, logouts: 2, rpcCalls: 2 });
});

test("role mismatch fails acceptance and still signs out both clients", async () => {
  const { output, ...result } = await runHarness({ role: "admin" });
  assert.match(output, /0 passed, 2 failed/);
  assert.deepEqual(result, { exitCode: 1, logouts: 2, rpcCalls: 2 });
});

test("access RPC failure fails acceptance and still signs out both clients", async () => {
  const { output, ...result } = await runHarness({ rpcError: new Error("synthetic RPC failure") });
  assert.match(output, /0 passed, 2 failed/);
  assert.deepEqual(result, { exitCode: 1, logouts: 2, rpcCalls: 2 });
});

test("provider error text cannot expose identities or session details in output", async () => {
  const secret = "private@example.test password=secret-sentinel access_token=token-sentinel";
  const { output, exitCode, logouts } = await runHarness({ rpcError: new Error(secret) });
  assert.equal(exitCode, 1);
  assert.equal(logouts, 2);
  assert.match(output, /sensitive error details withheld/);
  for (const value of ["private@example.test", "secret-sentinel", "token-sentinel"]) {
    assert.ok(!output.includes(value), "sensitive provider details were printed");
  }
});
