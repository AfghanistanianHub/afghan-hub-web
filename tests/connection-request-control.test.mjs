import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
test('request responses retain one shared form, trusted request ID and distinct submitter decisions', () => {
  const action = () => {};
  const control = () => null;
  const imports = {
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: 'link' },
    './network-surfaces.module.css': { default: {} },
    'lucide-react': { UserRound: () => null },
    '@/components/public/community-signature': { CommunitySignature: () => null },
    '@/components/ui/external-image': { ExternalImage: () => null },
    '@/components/forms/pending-submit-button': { PendingSubmitButton: control },
    '@/app/(dashboard)/network/actions': { respondConnectionRequest: action },
  };
  const exports = {};
  const source = readFileSync(new URL('../src/components/network/connection-requests.tsx', import.meta.url), 'utf8');
  new Function('require', 'exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText)(name => { assert.ok(name in imports, name); return imports[name]; }, exports);
  function find(node, type) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(child => find(child, type));
    return [...(node.type === type ? [node] : []), ...find(node.props?.children, type)];
  }
  const render = exports.ConnectionRequests;
  assert.equal(render({ requests: [] }), null);
  const tree = render({ requests: [{ id: 'missing', requester: null }, { id: 'request-1', requester: [{ id: 'member-1', display_name: 'Test member' }] }] });
  const forms = find(tree, 'form');
  assert.equal(forms.length, 1);
  assert.equal(forms[0].props.action, action);
  assert.equal(find(forms[0], 'input')[0].props.value, 'request-1');
  const buttons = find(forms[0], control);
  assert.deepEqual(buttons.map(b => [b.props.name, b.props.value, b.props.pendingLabel]), [['decision', 'accepted', 'Accepting…'], ['decision', 'declined', 'Declining…']]);
  assert.equal(find(tree, 'link')[0].props.href, '/members/member-1');
});
