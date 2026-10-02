import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');

async function harness(file, exported, props = {}) {
  const source = await readFile(new URL('../src/components/ui/' + file, import.meta.url), 'utf8');
  const states = []; let cursor = 0; let focused = 0;
  const ref = { current: { focus: () => focused++ } };
  const DayPicker = () => null;
  const imports = {
    react: { useId: () => 'calendar-test', useRef: () => ref, useState: initial => {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    } },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'date-fns': require('date-fns'),
    '@daypicker/react': { DayPicker },
    '@daypicker/react/style.css': {},
    './calendar-field.module.css': { default: {} },
    'lucide-react': { CalendarDays: () => null },
  };
  const exports = {};
  new Function('require', 'exports', ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
  } }).outputText)(name => { assert.ok(name in imports, name); return imports[name]; }, exports);
  const render = () => { cursor = 0; return exports[exported](props); };
  function nodes(element) {
    if (!element || typeof element !== 'object') return [];
    return [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
  }
  const find = (tree, predicate) => nodes(tree).find(predicate);
  return { render, find, DayPicker, focused: () => focused };
}

for (const [file,name,props] of [
  ['deadline-picker.tsx','DeadlinePicker',{}],
  ['event-date-time-picker.tsx','EventDateTimePicker',{name:'starts_at',label:'Start date'}],
]) test(name + ': Escape closes the calendar and restores trigger focus', async () => {
  const h = await harness(file,name,props);
  let tree = h.render();
  h.find(tree,n=>n.type==='button'&&'aria-expanded' in n.props).props.onClick();
  tree = h.render();
  assert.equal(h.find(tree,n=>n.type===h.DayPicker).props.autoFocus,true);
  assert.ok(h.find(tree,n=>n.props.role==='dialog'));
  let prevented=0, stopped=0;
  tree.props.onKeyDown({key:'Escape',preventDefault:()=>prevented++,stopPropagation:()=>stopped++});
  assert.equal(h.find(h.render(),n=>n.props.role==='dialog'),undefined);
  assert.equal(h.focused(),1); assert.equal(prevented,1); assert.equal(stopped,1);
});

test('deadline selection preserves the date-only submission and returns focus', async () => {
  const h=await harness('deadline-picker.tsx','DeadlinePicker');
  h.find(h.render(),n=>n.type==='button').props.onClick();
  h.find(h.render(),n=>n.type===h.DayPicker).props.onSelect(new Date(2028,1,29));
  const tree=h.render();
  assert.equal(h.find(tree,n=>n.type==='input').props.value,'2028-02-29');
  assert.equal(h.focused(),1);
});

test('event Clear removes date/time without submitting the form and returns focus', async () => {
  const h=await harness('event-date-time-picker.tsx','EventDateTimePicker',{name:'starts_at',label:'Start date',defaultValue:'2028-02-29T12:15:00'});
  assert.equal(h.find(h.render(),n=>n.type==='input').props.value,'2028-02-29T12:15');
  h.find(h.render(),n=>n.type==='button').props.onClick();
  const clear=h.find(h.render(),n=>n.type==='button'&&n.props.children==='Clear');
  assert.equal(clear.props.type,'button'); clear.props.onClick();
  assert.equal(h.find(h.render(),n=>n.type==='input').props.value,'');
  assert.equal(h.focused(),1);
});
