import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
const ts = createRequire(import.meta.url)("typescript");

async function loadModule(path, imports) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const exports = {};
  new Function("require", "exports", compiled)((name) => {
    assert.ok(name in imports, "Unexpected import: " + name);
    return imports[name];
  }, exports);
  return exports;
}

function profileClient(result) {
  const calls = [];
  return {
    calls,
    from(table) {
      assert.equal(table, "profiles");
      return { update(payload) {
        assert.ok(!("updated_at" in payload), "database timestamp must not be member-writable");
        calls.push(payload);
        return { eq(column, owner) {
          assert.equal(column, "id"); assert.equal(owner, "trusted-member");
          return { select(projection) {
            assert.equal(projection, "id");
            return { maybeSingle: async () => result };
          } };
        } };
      } };
    },
  };
}

async function settingsHarness(result, signedIn = true) {
  const client = profileClient(result);
  const revalidations = [];
  client.auth = { getUser: async () => ({ data: { user: signedIn ? { id: "trusted-member" } : null }, error: null }) };
  const module = await loadModule("../src/app/(dashboard)/settings/actions.ts", {
    "next/navigation": { redirect: (url) => { throw new Error(url); } },
    "next/cache": { revalidatePath: (...args) => revalidations.push(args) },
    "@/lib/supabase/server": { createClient: async () => client },
  });
  return { save: module.updateAccountSettings, calls: client.calls, revalidations };
}

test("visibility can change using only the permitted column and authenticated owner", async () => {
  const h = await settingsHarness({ data: { id: "trusted-member" }, error: null });
  const data = new FormData(); data.set("is_public", "on"); data.set("id", "someone-else");
  await assert.rejects(h.save(data), { message: "/settings?saved=1" });
  assert.deepEqual(h.calls, [{ is_public: true }]);
  assert.deepEqual(h.revalidations, [["/", "layout"]]);
});

test("zero-row visibility updates cannot report success", async () => {
  const h = await settingsHarness({ data: null, error: null });
  await assert.rejects(h.save(new FormData()), /Unable%20to%20update/);
  assert.equal(h.revalidations.length, 0);
});

test("signed-out visibility requests cannot mutate profiles", async () => {
  const h = await settingsHarness({ data: null, error: null }, false);
  await assert.rejects(h.save(new FormData()), { message: "/login" });
  assert.equal(h.calls.length, 0);
});

function findInput(element) {
  if (!element || typeof element !== "object") return null;
  if (element.type === "input") return element;
  for (const child of [element.props?.children].flat(Infinity)) {
    const found = findInput(child); if (found) return found;
  }
  return null;
}

async function avatarHarness(result, uploadError = null) {
  const client = profileClient(result);
  const messages = []; const uploads = []; let refreshed = false; let stateIndex = 0;
  client.storage = { from(bucket) {
    assert.equal(bucket, "avatars");
    return {
      upload: async (path) => { uploads.push(path); return { error: uploadError }; },
      getPublicUrl: () => ({ data: { publicUrl: "https://example.test/avatar.png" } }),
    };
  } };
  const jsx = (type, props) => ({ type, props });
  const module = await loadModule("../src/components/profile/avatar-upload.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react": { useState: (initial) => {
      const messageState = stateIndex++ === 1;
      return [initial, (value) => { if (messageState && value) messages.push(value); }];
    } },
    "next/navigation": { useRouter: () => ({ refresh: () => { refreshed = true; } }) },
    "@/components/ui/external-image": { ExternalImage: () => null },
    "@/lib/supabase/client": { createClient: () => client },
  });
  const element = module.default({ userId: "trusted-member", currentAvatarUrl: null });
  const input = findInput(element); assert.ok(input);
  return {
    async upload() {
      input.props.onChange({ target: { files: [{ name: "avatar.png", type: "image/png" }] } });
      await new Promise((resolve) => setImmediate(resolve));
    },
    messages, calls: client.calls, uploads, refreshed: () => refreshed,
  };
}

test("avatar updates only avatar_url and confirms the owner row before success", async () => {
  const h = await avatarHarness({ data: { id: "trusted-member" }, error: null });
  await h.upload();
  assert.deepEqual(h.calls, [{ avatar_url: "https://example.test/avatar.png" }]);
  assert.deepEqual(h.uploads, ["trusted-member/avatar.png"]);
  assert.equal(h.messages.at(-1).kind, "success"); assert.equal(h.refreshed(), true);
});

for (const [label, result] of [
  ["zero rows", { data: null, error: null }],
  ["database rejection", { data: null, error: { message: "private detail" } }],
]) {
  test("avatar does not claim success after " + label, async () => {
    const h = await avatarHarness(result); await h.upload();
    assert.equal(h.messages.at(-1).kind, "error"); assert.equal(h.refreshed(), false);
    assert.ok(!h.messages.at(-1).text.includes("private detail"));
  });
}

test("failed Storage upload never changes the profile", async () => {
  const h = await avatarHarness({ data: null, error: null }, { message: "private detail" });
  await h.upload();
  assert.equal(h.calls.length, 0); assert.equal(h.messages.at(-1).kind, "error");
  assert.equal(h.refreshed(), false);
});
