import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { getBrowseCopy } from "../src/lib/i18n/browse-copy.ts";
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
function recoveryModule({ pending = false, language = "en" } = {}) {
  return {
    react: { useTransition: () => [pending, callback => callback()] },
    "@/components/i18n/browse": {
      useBrowseCopy: () => ({ language, t: key => getBrowseCopy(language, key) }),
    },
    "@/lib/i18n/browse-copy": { getBrowseCopy },
    "@/components/i18n/localized": { useSiteLanguage: () => language, DocumentLanguage: () => null },
  };
}
test("recovery invokes the framework reset callback and shows pending feedback", () => {
  for (const pending of [false, true]) {
    let calls = 0;
    const { PageRecovery } = load("../src/components/feedback/page-recovery.tsx", recoveryModule({ pending }));
    const tree = PageRecovery({ reset: () => calls++ });
    const button = all(tree, "button")[0];
    assert.equal(button.props.disabled, pending);
    assert.equal(button.props.children.props.children, pending ? "Trying again…" : "Try again");
    if (!pending) { button.props.onClick(); assert.equal(calls, 1); }
    assert.equal(all(tree, "a")[0].props.href, "/");
  }
});
test("the recovery screen renders Farsi and Pashto copy inside an RTL boundary", () => {
  for (const language of ["fa", "ps"]) {
    const { PageRecovery } = load("../src/components/feedback/page-recovery.tsx", recoveryModule({ language }));
    const tree = PageRecovery({ reset: () => {} });
    assert.equal(tree.props.lang, language);
    assert.equal(tree.props.dir, "rtl");
    assert.equal(all(tree, "button")[0].props.children.props.children, getBrowseCopy(language, "recovery.retry"));
    assert.equal(all(tree, "h1")[0].props.children, getBrowseCopy(language, "recovery.title"));
    assert.ok(all(tree, "a")[0].props.children === getBrowseCopy(language, "recovery.home"));
  }
});
test("the global error document title follows the active language", () => {
  for (const language of ["en", "fa", "ps"]) {
    const { RecoveryDocumentTitle } = load("../src/components/feedback/page-recovery.tsx", recoveryModule({ language }));
    assert.equal(renderToStaticMarkup(RecoveryDocumentTitle()), `<title>${getBrowseCopy(language, "recovery.documentTitle")}</title>`);
  }
});
test("both boundaries suppress raw error details; global fallback owns its document", () => {
  const { PageRecovery, RecoveryDocumentTitle } = load("../src/components/feedback/page-recovery.tsx", recoveryModule());
  for (const name of ["error", "global-error"]) {
    const Boundary = load(`../src/app/${name}.tsx`, { "@/components/feedback/page-recovery": { PageRecovery, RecoveryDocumentTitle }, "./globals.css": {} }).default;
    const html = renderToStaticMarkup(Boundary({ reset: () => {}, error: new Error("private-message-secret") }));
    assert.ok(!html.includes("private-message-secret"));
    assert.ok(html.includes('role="alert"'));
    if (name === "global-error") { assert.ok(html.includes('<html lang="en">')); assert.ok(html.includes('content="noindex"')); }
  }
});
