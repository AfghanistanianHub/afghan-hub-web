import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";

function load(path, dependencies) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports, require(name) {
      if (name === "react/jsx-runtime") return jsx;
      assert.ok(name in dependencies, `Unexpected dependency ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}
function elements(node, type) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(child => elements(child, type));
  return [...(node.type === type ? [node] : []), ...elements(node.props?.children, type)];
}

const passwordPolicy = load("../src/lib/password-policy.ts", {});
const iconStubs = {
  BriefcaseBusiness: "briefcase-icon",
  Building2: "building-icon",
  CalendarDays: "calendar-icon",
  Sparkles: "sparkles-icon",
  UsersRound: "users-icon",
};

test("password policy requires 12 characters and at least three character groups", () => {
  assert.equal(passwordPolicy.PASSWORD_MIN_LENGTH, 12);
  assert.match(passwordPolicy.getPasswordPolicyError("Short1!"), /at least 12/);
  assert.match(passwordPolicy.getPasswordPolicyError("alllowercase1"), /at least 3/);
  assert.equal(passwordPolicy.getPasswordPolicyError("LongEnough123"), null);
  assert.equal(passwordPolicy.getPasswordPolicyError("Long-enough-password"), null);
});

test("login accepts an existing password while signup enforces the shared new-password minimum", async () => {
  const login = () => {}, signup = () => {};
  const page = load("../src/app/login/page.tsx", { "next/link": {}, "lucide-react": iconStubs, "@/components/public/support-links": { SupportLinks: "support-links" }, "./actions": { login, signup }, "@/components/auth/submit-button": { SubmitButton: "submit-control" }, "@/lib/password-policy": passwordPolicy }).default;
  for (const joining of [false, true]) {
    const tree = await page({ searchParams: Promise.resolve({ mode: joining ? "join" : undefined, error: "Try again", message: "Check your email" }) });
    const password = elements(tree, "input").find(el => el.props.name === "password");
    assert.equal(password.props.minLength, joining ? 12 : undefined);
    assert.equal(password.props.autoComplete, joining ? "new-password" : "current-password");
    assert.equal(elements(tree, "form")[0].props.action, joining ? signup : login);
    assert.ok(elements(tree, "div").some(el => el.props.role === "alert"));
    assert.ok(elements(tree, "div").some(el => el.props.role === "status"));
  }
});

test("signup and reset server actions both use the shared password validator", () => {
  const signupAction = fs.readFileSync(new URL("../src/app/login/actions.ts", import.meta.url), "utf8");
  const resetAction = fs.readFileSync(new URL("../src/app/update-password/actions.ts", import.meta.url), "utf8");
  assert.match(signupAction, /getPasswordPolicyError\(password\)/);
  assert.match(resetAction, /getPasswordPolicyError\(password\)/);
});

test("submit control disables repeat submissions and announces progress only while pending", () => {
  for (const pending of [false, true]) {
    const { SubmitButton } = load("../src/components/auth/submit-button.tsx", { "react-dom": { useFormStatus: () => ({ pending }) } });
    const button = SubmitButton({ children: "Sign in", pendingLabel: "Signing in…" });
    assert.equal(button.props.disabled, pending);
    assert.equal(button.props.type, "submit");
    assert.equal(button.props.children.props.children, pending ? "Signing in…" : "Sign in");
    assert.equal(button.props.children.props.role, "status");
  }
});
