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

test("login accepts an existing password while signup enforces the shared new-password minimum", () => {
  const pageSource = fs.readFileSync(new URL("../src/app/login/page.tsx", import.meta.url), "utf8");
  const formSource = fs.readFileSync(new URL("../src/app/login/localized-login-content.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /LocalizedLoginContent/);
  assert.match(formSource, /minLength=\{joining \? PASSWORD_MIN_LENGTH : undefined\}/);
  assert.match(formSource, /autoComplete=\{joining \? "new-password" : "current-password"\}/);
  assert.match(formSource, /action=\{joining \? signup : login\}/);
  assert.match(formSource, /role="alert"/);
  assert.match(formSource, /role="status"/);
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


test("localized recovery and password update retain server-side security boundaries", () => {
  const recoveryPage = fs.readFileSync(new URL("../src/app/forgot-password/page.tsx", import.meta.url), "utf8");
  const recoveryView = fs.readFileSync(new URL("../src/app/forgot-password/localized-forgot-password-content.tsx", import.meta.url), "utf8");
  const updatePage = fs.readFileSync(new URL("../src/app/update-password/page.tsx", import.meta.url), "utf8");
  const updateView = fs.readFileSync(new URL("../src/app/update-password/localized-update-password-content.tsx", import.meta.url), "utf8");
  assert.match(recoveryPage, /LocalizedForgotPasswordContent/);
  assert.match(recoveryView, /action=\{requestPasswordReset\}/);
  assert.match(updatePage, /supabase\.auth\.getUser\(\)/);
  assert.match(updatePage, /if \(!user\)/);
  assert.match(updateView, /action=\{updatePassword\}/);
  assert.match(updateView, /minLength=\{PASSWORD_MIN_LENGTH\}/);
  assert.match(updateView, /autoComplete="new-password"/);
  assert.match(updateView, /aria-describedby="password-policy"/);
  for (const source of [recoveryView, updateView]) {
    assert.match(source, /en:/);
    assert.match(source, /fa:/);
    assert.match(source, /ps:/);
  }
});

test("localized account views display translated safe feedback and preserve LTR credentials", () => {
  const login = fs.readFileSync(new URL("../src/app/login/localized-login-content.tsx", import.meta.url), "utf8");
  const recovery = fs.readFileSync(new URL("../src/app/forgot-password/localized-forgot-password-content.tsx", import.meta.url), "utf8");
  const update = fs.readFileSync(new URL("../src/app/update-password/localized-update-password-content.tsx", import.meta.url), "utf8");
  assert.match(login, /feedbackText\(error, language\)/);
  assert.match(login, /feedbackText\(message, language\)/);
  assert.match(login, /name="email"[\s\S]*?dir="ltr"/);
  assert.match(login, /name="password"[\s\S]*?dir="ltr"/);
  assert.match(recovery, /localizeFeedback\(error, language\)/);
  assert.match(recovery, /localizeFeedback\(message, language\)/);
  assert.match(update, /Passwords do not match\./);
  assert.match(update, /errors\[error\]/);
  for (const source of [login, recovery, update]) {
    assert.match(source, /subscribeSiteLanguagePreference/);
    assert.match(source, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
  }
});
