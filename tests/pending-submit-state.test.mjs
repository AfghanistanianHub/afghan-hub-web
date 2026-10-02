import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
test('pending button preserves unavailable and toggle states before, during and after submission', () => {
  let pending = false;
  const exports = {};
  const source = readFileSync(new URL('../src/components/forms/pending-submit-button.tsx', import.meta.url), 'utf8');
  new Function('require', 'exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText)(name => name === 'react-dom' ? { useFormStatus: () => ({pending}) } : require(name), exports);
  const button = exports.PendingSubmitButton;
  const props = { children: 'Saved', pendingLabel: 'Removing…', 'aria-pressed': true };
  assert.equal(button(props).props.disabled, false);
  pending = true;
  const waiting = button(props);
  assert.equal(waiting.props.disabled, true);
  assert.equal(waiting.props['aria-disabled'], true);
  assert.equal(waiting.props['aria-pressed'], true);
  assert.equal(waiting.props.children.props.children, 'Removing…');
  pending = false;
  assert.equal(button(props).props.children.props.children, 'Saved');
  const full = button({ disabled: true, children: 'Event full', pendingLabel: 'Registering…' });
  assert.equal(full.props.disabled, true);
  assert.equal(full.props['aria-disabled'], true);
  assert.equal(full.props.children.props.children, 'Event full');
  assert.ok(full.props.className.includes('cursor-not-allowed'));
});

test('named decisions disable both controls while only the chosen decision announces progress', () => {
  let pending = true;
  const data = new FormData();
  const exports = {};
  const source = readFileSync(new URL('../src/components/forms/pending-submit-button.tsx', import.meta.url), 'utf8');
  new Function('require', 'exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText)(name => name === 'react-dom' ? { useFormStatus: () => ({pending, data}) } : require(name), exports);
  for (const chosen of ['accepted', 'declined']) {
    data.set('decision', chosen);
    for (const value of ['accepted', 'declined']) {
      const button = exports.PendingSubmitButton({ name: 'decision', value, children: value, pendingLabel: 'Working…' });
      assert.equal(button.props.name, 'decision');
      assert.equal(button.props.value, value);
      assert.equal(button.props.disabled, true);
      assert.equal(button.props.children.props.children, chosen === value ? 'Working…' : value);
    }
  }
  pending = false;
  assert.equal(exports.PendingSubmitButton({ name: 'decision', value: 'accepted', children: 'Accept', pendingLabel: 'Working…' }).props.disabled, false);
});
