import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
function load(path, dependencies) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports, require(name) {
      if (name === "react/jsx-runtime") return jsx;
      assert.ok(name in dependencies, name);
      return dependencies[name];
    },
  });
  return exports;
}
function all(node, type) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(n => all(n, type));
  return [...(node.type === type ? [node] : []), ...all(node.props?.children, type)];
}
test("recovery invokes the framework refetch callback and shows pending feedback", () => {
  for (const pending of [false, true]) {
    let calls = 0;
    const { PageRecovery } = load("../src/components/feedback/page-recovery.tsx", { react: { useTransition: () => [pending, callback => callback()] } });
    const tree = PageRecovery({ unstable_retry: () => calls++ });
    const button = all(tree, "button")[0];
    assert.equal(button.props.disabled, pending);
    assert.equal(button.props.children.props.children, pending ? "Trying again…" : "Try again");
    if (!pending) { button.props.onClick(); assert.equal(calls, 1); }
    assert.equal(all(tree, "a")[0].props.href, "/");
  }
});
test("both boundaries suppress raw error details; global fallback owns its document", () => {
  const { PageRecovery } = load("../src/components/feedback/page-recovery.tsx", { react: { useTransition: () => [false, fn => fn()] } });
  for (const name of ["error", "global-error"]) {
    const Boundary = load(`../src/app/${name}.tsx`, { "@/components/feedback/page-recovery": { PageRecovery }, "./globals.css": {} }).default;
    const html = renderToStaticMarkup(Boundary({ unstable_retry: () => {}, error: new Error("private-message-secret") }));
    assert.ok(!html.includes("private-message-secret"));
    assert.ok(html.includes('role="alert"'));
    if (name === "global-error") { assert.ok(html.includes('<html lang="en">')); assert.ok(html.includes('content="noindex"')); }
  }
});
