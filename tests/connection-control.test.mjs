import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const actions = { sendConnectionRequest: () => {}, removeConnection: () => {}, startConversation: () => {} };
const pendingControl = () => null;
let confirmed = false;
const imports = {
  'react/jsx-runtime': require('react/jsx-runtime'),
  'next/link': { default: 'link' },
  './network-surfaces.module.css': { default: { control: 'control' } },
  '@/components/forms/pending-submit-button': { PendingSubmitButton: pendingControl },
  '@/app/(dashboard)/messages/actions': actions,
  '@/app/(dashboard)/network/actions': actions,
};
const exports = {};
const source = readFileSync(new URL('../src/components/network/connection-button.tsx', import.meta.url), 'utf8');
new Function('require', 'exports', 'window', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText)(name => { assert.ok(name in imports, name); return imports[name]; }, exports, { confirm: () => confirmed });
const render = connection => exports.ConnectionButton({ currentUserId: 'viewer', memberId: 'member', connection });
function find(node, type) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(child => find(child, type));
  return [...(node.type === type ? [node] : []), ...find(node.props?.children, type)];
}
const connection = { id: 'connection', requester_id: 'viewer', recipient_id: 'member', status: 'pending' };

test('new connections preserve the recipient and submit action with pending feedback', () => {
  const form = render(null);
  assert.equal(form.props.action, actions.sendConnectionRequest);
  assert.equal(find(form, 'input')[0].props.name, 'recipient_id');
  assert.equal(find(form, 'input')[0].props.value, 'member');
  assert.equal(find(form, pendingControl)[0].props.pendingLabel, 'Sending…');
});

test('accepted connections preserve message destination and confirmation-gated disconnect', () => {
  const forms = find(render({ ...connection, status: 'accepted' }), 'form');
  assert.equal(forms[0].props.action, actions.startConversation);
  assert.equal(find(forms[0], 'input')[0].props.value, 'member');
  assert.equal(forms[1].props.action, actions.removeConnection);
  assert.equal(find(forms[1], 'input')[0].props.value, 'connection');
  let prevented = 0;
  confirmed = false;
  forms[1].props.onSubmit({ preventDefault: () => prevented++ });
  confirmed = true;
  forms[1].props.onSubmit({ preventDefault: () => prevented++ });
  assert.equal(prevented, 1);
  assert.deepEqual(forms.map(form => find(form, pendingControl)[0].props.pendingLabel), ['Opening…', 'Disconnecting…']);
});

test('outgoing requests cancel the existing connection; incoming requests remain direct links', () => {
  const form = find(render(connection), 'form')[0];
  assert.equal(form.props.action, actions.removeConnection);
  assert.equal(find(form, 'input')[0].props.value, 'connection');
  assert.equal(find(form, pendingControl)[0].props.pendingLabel, 'Cancelling…');
  const incoming = render({ ...connection, requester_id: 'member', recipient_id: 'viewer' });
  assert.equal(incoming.type, 'link');
  assert.equal(incoming.props.href, '/network');
  assert.equal(find(incoming, 'form').length, 0);
});

test('self and declined connections expose no mutation controls', () => {
  assert.equal(exports.ConnectionButton({ currentUserId: 'member', memberId: 'member', connection: null }), null);
  const declined = render({ ...connection, status: 'declined' });
  assert.equal(find(declined, 'form').length, 0);
  assert.equal(declined.props.children, 'Request declined');
});
