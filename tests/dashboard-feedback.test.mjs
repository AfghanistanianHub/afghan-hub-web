import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function load(file, imports, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../src/components/dashboard/' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', ...Object.keys(globals), code)(name => name === 'react/jsx-runtime' ? require(name) : imports[name], exports, ...Object.values(globals));
  return exports;
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(child => find(child, predicate));
  return [...(predicate(node) ? [node] : []), ...find(node.props?.children, predicate)];
}

test('pending notification rows retain their content and stop repeat activation', () => {
  let pending = false;
  const { NotificationSubmit } = load('action-submit.tsx', { 'react-dom': { useFormStatus: () => ({pending}) }, 'lucide-react': { LogOut: 'icon' } });
  const children = { type: 'span', props: { children: 'Test notification and timestamp' } };
  const props = { children, preserveContent: true, className: 'relative' };
  assert.equal(NotificationSubmit(props).props.disabled, false);
  pending = true;
  const row = NotificationSubmit(props);
  assert.equal(row.props.disabled, true);
  assert.equal(row.props['aria-busy'], true);
  assert.ok(find(row, n => n === children).length);
  assert.equal(find(row, n => n.props?.role === 'status')[0].props.children, 'Opening…');
  assert.equal(NotificationSubmit({children:'Mark all read',className:''}).props.children.props.children, 'Marking…');
  pending = false;
  assert.equal(NotificationSubmit(props).props.disabled, false);
});

test('sign out retains a submit button and announces pending state', () => {
  let pending = false;
  const { SignOutSubmit } = load('action-submit.tsx', { 'react-dom': { useFormStatus: () => ({pending}) }, 'lucide-react': { LogOut: 'icon' } });
  assert.equal(SignOutSubmit({className:''}).props['aria-label'], 'Sign out');
  pending = true;
  const button = SignOutSubmit({className:''});
  assert.equal(button.props.type, 'submit');
  assert.equal(button.props.disabled, true);
  assert.equal(button.props['aria-label'], 'Signing out');
  assert.ok(find(button, n => n.props?.role === 'status').every(n => n.props.children === 'Signing out…'));
});

test('notification opening focuses the panel; Escape closes and restores the trigger', () => {
  let open = false, cursor = 0, effects = [], panelFocus = 0, triggerFocus = 0;
  const refs = [{current:{contains:()=>false}}, {current:{focus:()=>triggerFocus++}}, {current:{focus:()=>panelFocus++}}];
  const listeners = new Map();
  const document = { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const imports = {
    react: { useState: () => [open, value => { open = typeof value === 'function' ? value(open) : value; }], useRef: () => refs[cursor++], useId: () => 'panel', useEffect: fn => effects.push(fn) },
    'next/navigation': { useRouter: () => ({refresh(){}}) },
    'lucide-react': { Bell:'bell', CircleCheck:'approved', CircleX:'declined', UserRound:'person' },
    '@/components/dashboard/action-submit': {},
    '@/components/network/network-surfaces.module.css': { default: {} },
    '@/components/ui/external-image': {},
    '@/app/(dashboard)/notifications/actions': {},
    '@/lib/supabase/client': { createClient: () => { throw new Error('No live subscription in callback test'); } },
  };
  const { NotificationBell } = load('notification-bell.tsx', imports, {document, Node: class {}});
  const render = () => { cursor = 0; effects = []; return NotificationBell({currentUserId:'test',notifications:[],unreadCount:0}); };
  const trigger = find(render(), n => n.type === 'button')[0];
  trigger.props.onClick();
  assert.equal(find(render(), n => n.props?.role === 'dialog').length, 1);
  const cleanup = effects[1]();
  assert.equal(panelFocus, 1);
  let prevented = 0;
  listeners.get('keydown')({key:'Escape',preventDefault:()=>prevented++});
  assert.equal(open, false);
  assert.equal(triggerFocus, 1);
  assert.equal(prevented, 1);
  cleanup();
  assert.equal(listeners.size, 0);
  assert.equal(find(render(), n => n.props?.role === 'dialog').length, 0);
});
