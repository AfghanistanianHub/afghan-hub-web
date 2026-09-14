import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function harness({ user = { id: "own-id", email: "own@example.test", created_at: "created", app_metadata: { secret: "auth-secret" } }, profile = { id: "own-id", display_name: "Own member", role: "admin", email: "private-profile-email", search_vector: "internal" }, error = null, throws = false } = {}) {
  let created = 0;
  const calls = [];
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/app/api/account/export/route.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, Response, AbortSignal, URL, Date, Object,
    require(name) {
      assert.equal(name, "@/lib/supabase/server");
      return { async createClient() {
        created++;
        if (throws) throw new Error("provider-secret");
        return {
          auth: { async getUser() { return { data: { user }, error: null }; } },
          from(table) {
            assert.equal(table, "profiles");
            return {
              select(columns) {
                assert.ok(!columns.split(",").includes("role"));
                assert.ok(!columns.split(",").includes("email"));
                return {
                  eq(column, id) {
                    calls.push([column, id]);
                    return { abortSignal() { return { async maybeSingle() { return { data: profile, error }; } }; } };
                  },
                };
              },
            };
          },
        };
      } };
    },
  });
  return { POST: exports.POST, calls, created: () => created };
}

function request(origin = "https://app.apnbc.ca") {
  return new Request("https://app.apnbc.ca/api/account/export?userId=another-member", {
    method: "POST", headers: origin ? { origin } : {}, body: JSON.stringify({ userId: "another-member" }),
  });
}

test("foreign or missing origin is rejected before accessing account data", async () => {
  for (const origin of ["https://another.example", null]) {
    const h = harness();
    const response = await h.POST(request(origin));
    assert.equal(response.status, 403);
    assert.equal(h.created(), 0);
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
});

test("anonymous download is denied with no profile query or attachment", async () => {
  const h = harness({ user: null });
  const response = await h.POST(request());
  assert.equal(response.status, 401);
  assert.deepEqual(h.calls, []);
  assert.equal(response.headers.get("content-disposition"), null);
  assert.match(response.headers.get("cache-control"), /no-store/);
});

test("download uses validated account identity and explicit safe fields", async () => {
  const h = harness();
  const response = await h.POST(request());
  assert.equal(response.status, 200);
  assert.deepEqual(h.calls, [["id", "own-id"]]);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.match(response.headers.get("content-disposition"), /attachment; filename="afghan-hub-account-profile.json"/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const data = await response.json();
  assert.equal(data.account.email, "own@example.test");
  assert.equal(data.profile.id, "own-id");
  assert.equal(data.profile.display_name, "Own member");
  assert.deepEqual(data.scope, ["account", "profile"]);
  const text = JSON.stringify(data);
  for (const secret of ["auth-secret", "private-profile-email", "search_vector", "another-member"]) assert.ok(!text.includes(secret));
  assert.ok(!Object.hasOwn(data.profile, "role"));
  assert.ok(data.excluded.includes("messages"));
});

test("mismatched owner, provider error and thrown failure return no sensitive details", async () => {
  for (const options of [{ profile: { id: "other-id" } }, { error: new Error("provider-secret") }, { throws: true }]) {
    const response = await harness(options).POST(request());
    assert.equal(response.status, 500);
    assert.ok(!(await response.text()).includes("provider-secret"));
    assert.equal(response.headers.get("content-disposition"), null);
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
});

test("an account without a profile receives a clearly empty profile section", async () => {
  const response = await harness({ profile: null }).POST(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).profile, null);
});
