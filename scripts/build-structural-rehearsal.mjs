import { readFileSync } from "node:fs";

// Produces SQL only. No network, environment credentials, or production target.
const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
function candidate(direction) {
  const source = read(`docs/security/public-schema-structural-privilege-${direction}-rehearsal-2026-09-12.md`);
  const blocks = [...source.matchAll(/```sql\n([\s\S]*?)```/g)].map((match) => match[1]);
  const selected = blocks.filter((sql) => sql.includes("ISOLATED REHEARSAL ONLY"));
  if (selected.length !== 1) throw new Error(`Expected one ${direction} candidate`);
  return selected[0];
}
const negative = process.argv.includes("--negative-control");
process.stdout.write([
  "\\set ON_ERROR_STOP on",
  read("tests/security/structural-bootstrap.sql"),
  negative ? "-- Intentionally omit forward SQL to prove assertions detect broad grants." : candidate("forward"),
  read("tests/security/structural-forward-assert.sql"),
  candidate("rollback"),
  read("tests/security/structural-rollback-assert.sql"),
].join("\n"));
