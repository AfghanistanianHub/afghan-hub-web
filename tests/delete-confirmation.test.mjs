import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
for (const [folder, name, action] of [['events', 'DeleteEventButton', 'deleteEvent'], ['opportunities', 'DeleteOpportunityButton', 'deleteOpportunity']]) {
  test(`${name} cancels without submitting and preserves confirmed action and slug`, async () => {
    const source = await readFile(new URL(`../src/components/${folder}/delete-${folder === 'events' ? 'event' : 'opportunity'}-button.tsx`, import.meta.url), 'utf8');
    const serverAction = () => {};
    const exports = {};
    const imports = {
      'react/jsx-runtime': require('react/jsx-runtime'),
      'lucide-react': { Trash2: () => null },
      '@/components/forms/pending-submit-button': { PendingSubmitButton: () => null },
      [`@/app/(dashboard)/${folder}/actions`]: { [action]: serverAction },
    };
    new Function('require', 'exports', 'window', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText)(key => imports[key], exports, { confirm: () => accepted });
    let accepted = false;
    const form = exports[name]({ slug: 'sample-owner-listing' });
    let prevented = 0;
    form.props.onSubmit({ preventDefault: () => prevented++ });
    assert.equal(prevented, 1);
    accepted = true;
    form.props.onSubmit({ preventDefault: () => prevented++ });
    assert.equal(prevented, 1);
    assert.equal(form.props.action, serverAction);
    assert.equal(form.props.children[0].props.value, 'sample-owner-listing');
  });
}
