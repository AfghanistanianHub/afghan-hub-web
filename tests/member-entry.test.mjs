import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
function actions(error = null) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/app/login/actions.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    require(name) {
      if (name === "next/navigation") return { redirect: path => { throw new Error(path); } };
      if (name === "@/lib/supabase/server") return { createClient: async () => ({ auth: { signInWithPassword: async () => ({ error }), signUp: async () => ({ error }) } }) };
      throw new Error(name);
    },
  });
  return exports;
}
const form = password => new Map([["email", "member@example.com"], ["password", password]]);
test("successful login enters member dashboard instead of public landing", async () => {
  await assert.rejects(actions().login(form("test-password")), { message: "/dashboard" });
});
test("failed login remains on sign-in page", async () => {
  await assert.rejects(actions({ message: "Invalid login" }).login(form("test-password")), { message: "/login?error=Invalid%20login" });
});
test("signup validation preserves the join flow", async () => {
  await assert.rejects(actions().signup(form("short")), { message: "/login?mode=join&error=Password%20must%20be%20at%20least%208%20characters." });
});

test("dashboard redirects signed-out requests before starting member queries", async () => {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/app/(dashboard)/dashboard/page.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports,
    require(name) {
      if (name === "next/navigation") return { redirect: path => { throw new Error(path); } };
      if (name === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) }, from: () => { throw new Error("Member query ran without a user"); } }) };
      if (["react/jsx-runtime", "next/link", "lucide-react", "@/components/ui/connection-thread", "@/lib/opportunities"].includes(name)) return {};
      throw new Error(name);
    },
  });
  await assert.rejects(exports.default(), { message: "/login" });
});
