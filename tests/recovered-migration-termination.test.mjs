import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const recoveredMigrations = [
  '20260719000100_extensions.sql',
  '20260719000200_enums.sql',
  '20260719000300_functions.sql',
  '20260719000400_profiles.sql',
  '20260719000500_businesses.sql',
  '20260719000600_organizations.sql',
  '20260719000700_opportunities.sql',
  '20260719000800_events.sql',
  '20260719000900_messaging.sql',
  '20260719001000_connections.sql',
  '20260719001100_indexes.sql',
  '20260719001200_search.sql',
  '20260719001300_rls_enable.sql',
  '20260719001350_auth_helpers.sql',
  '20260719001400_policies.sql',
  '20260719001500_storage.sql',
  '20260808000100_connections_update_policy.sql',
  '20260809000100_messages_realtime.sql',
  '20260809000200_notifications.sql',
  '20260809000300_connections_respond_rpc.sql',
];

function validateStatementBlocks(sql, filename) {
  const lines = sql.replaceAll('\r\n', '\n').split('\n');
  let block = [];
  let parenDepth = 0;
  let dollarTag = null;
  let singleQuoted = false;
  let doubleQuoted = false;

  const validateBlock = () => {
    const text = block.join('\n').trim();
    block = [];
    if (!text || text.split('\n').every((line) => line.trim().startsWith('--'))) return;
    assert.match(
      text,
      /;\s*$/,
      `${filename} contains a top-level SQL statement block without a terminating semicolon:\n${text.slice(0, 240)}`,
    );
  };

  for (const line of lines) {
    if (!line.trim() && !dollarTag && !singleQuoted && !doubleQuoted && parenDepth === 0) {
      validateBlock();
      continue;
    }

    block.push(line);

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (dollarTag) {
        if (line.startsWith(dollarTag, i)) {
          i += dollarTag.length - 1;
          dollarTag = null;
        }
        continue;
      }

      if (!singleQuoted && !doubleQuoted && char === '-' && next === '-') break;

      if (!singleQuoted && !doubleQuoted && char === '$') {
        const match = line.slice(i).match(/^\$[A-Za-z_]*\$/);
        if (match) {
          dollarTag = match[0];
          i += match[0].length - 1;
          continue;
        }
      }

      if (!doubleQuoted && char === "'") {
        if (singleQuoted && next === "'") {
          i += 1;
          continue;
        }
        singleQuoted = !singleQuoted;
        continue;
      }

      if (!singleQuoted && char === '"') {
        if (doubleQuoted && next === '"') {
          i += 1;
          continue;
        }
        doubleQuoted = !doubleQuoted;
        continue;
      }

      if (singleQuoted || doubleQuoted) continue;
      if (char === '(') parenDepth += 1;
      if (char === ')') parenDepth -= 1;
      assert.ok(parenDepth >= 0, `${filename} has unbalanced parentheses`);
    }
  }

  validateBlock();
  assert.equal(dollarTag, null, `${filename} has an unterminated dollar-quoted body`);
  assert.equal(singleQuoted, false, `${filename} has an unterminated single-quoted string`);
  assert.equal(doubleQuoted, false, `${filename} has an unterminated double-quoted identifier`);
  assert.equal(parenDepth, 0, `${filename} has unbalanced parentheses`);
}

test('recovered migration statement blocks remain SQL-terminated', () => {
  for (const filename of recoveredMigrations) {
    const path = resolve('supabase/migrations', filename);
    validateStatementBlocks(readFileSync(path, 'utf8'), filename);
  }
});
