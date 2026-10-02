import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function compile(file, imports, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../src/components/dashboard/' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', ...Object.keys(globals), code)(name => name === 'react/jsx-runtime' ? require(name) : imports[name], exports, ...Object.values(globals));
  return exports;
}
const icons = new Proxy({}, {get: (_, name) => String(name)});
const navigation = compile('navigation.ts', {'lucide-react': icons});
function harness(matches = false) {
  let open = false, effect;
  const callbacks = new Map();
  const media = { matches, addEventListener: (key, fn) => callbacks.set(key, fn), removeEventListener: key => callbacks.delete(key) };
  const { MobileNavigation } = compile('mobile-navigation.tsx', {
    react: { useState: () => [open, value => {open = value;}], useEffect: fn => {effect = fn;} },
    'next/link': {default:'link'}, 'next/navigation': {usePathname:()=>'/events/sample'},
    '@base-ui/react/dialog': {Dialog:Object.fromEntries(['Root','Trigger','Portal','Backdrop','Popup','Close'].map(key=>[key,key]))},
    'lucide-react':icons, '@/components/dashboard/navigation':navigation,
    '@/components/network/network-surfaces.module.css':{default:{}},
  }, {window:{matchMedia:()=>media}});
  const render = canModerate => MobileNavigation({canModerate,pendingModerationCount:2,unreadMessageCount:3});
  return {render,media,callbacks,runEffect:()=>effect(),open:()=>open};
}
function links(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(links);
  return [...(node.type === 'link' ? [node] : []), ...links(node.props?.children)];
}
test('navigation preserves actual destinations, role visibility and direct link closing', () => {
  const h = harness();
  h.render(false).props.onOpenChange(true);
  const normal = links(h.render(false));
  assert.deepEqual(normal.slice(1,-2).map(n=>n.props.href), navigation.dashboardNavigation.map(n=>n.href));
  assert.equal(normal.some(n=>n.props.href==='/moderation'),false);
  const event = normal.find(n=>n.props.href==='/events');
  assert.equal(event.props['aria-current'],'page');
  event.props.onClick(); assert.equal(h.open(),false);
  assert.ok(links(h.render(true)).some(n=>n.props.href==='/moderation'));
});
test('opening at desktop width or crossing the breakpoint closes the drawer and cleans listeners', () => {
  for (const alreadyDesktop of [false,true]) {
    const h = harness(alreadyDesktop);
    h.render(false).props.onOpenChange(true); h.render(false);
    const cleanup = h.runEffect();
    if (!alreadyDesktop) { assert.equal(h.open(),true); h.media.matches=true; h.callbacks.get('change')(); }
    assert.equal(h.open(),false);
    cleanup(); assert.equal(h.callbacks.size,0);
  }
});
