import { readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const MIGRATION_GUARD_CUTOFF = "20260914000000";

const CREATE_PUBLIC_TABLE_RE =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-zA-Z_][\w$]*)"?/gi;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--.*$/gm, " ");
}

export function analyzeMigration(sql, filename = "migration.sql") {
  const clean = stripComments(sql);
  const violations = [];
  const tables = new Set();

  for (const match of clean.matchAll(CREATE_PUBLIC_TABLE_RE)) {
    tables.add(match[1]);
  }

  for (const table of tables) {
    const escaped = escapeRegExp(table);
    const tableRef = `(?:public\\.)?"?${escaped}"?`;
    const rls = new RegExp(
      `alter\\s+table\\s+(?:only\\s+)?${tableRef}\\s+enable\\s+row\\s+level\\s+security`,
      "i",
    );
    const aclStatements = clean
      .split(";")
      .filter((statement) =>
        new RegExp(`\\b(?:grant|revoke)\\b[\\s\\S]*\\bon\\s+(?:table\\s+)?${tableRef}\\b`, "i").test(
          statement,
        ),
      )
      .join(";\n");

    if (!rls.test(clean)) {
      violations.push(`${filename}: public.${table} must enable row level security in the creating migration`);
    }
    if (!/\banon\b/i.test(aclStatements)) {
      violations.push(
        `${filename}: public.${table} must make an explicit Data API privilege decision for anon`,
      );
    }
    if (!/\bauthenticated\b/i.test(aclStatements)) {
      violations.push(
        `${filename}: public.${table} must make an explicit Data API privilege decision for authenticated`,
      );
    }
  }

  return violations;
}

export function isGuardedMigration(filename) {
  const match = basename(filename).match(/^(\d{14})_.*\.sql$/);
  return Boolean(match && match[1] >= MIGRATION_GUARD_CUTOFF);
}

export function collectViolations(directory = resolve("supabase/migrations")) {
  const violations = [];
  for (const filename of readdirSync(directory).filter((name) => name.endsWith(".sql")).sort()) {
    if (!isGuardedMigration(filename)) continue;
    const sql = readFileSync(join(directory, filename), "utf8");
    violations.push(...analyzeMigration(sql, filename));
  }
  return violations;
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (invokedDirectly) {
  const violations = collectViolations();
  if (violations.length) {
    console.error("Explicit Data API grant guard failed:\n");
    for (const violation of violations) console.error(`- ${violation}`);
    console.error(
      "\nEvery new public table must enable RLS and explicitly address both anon and authenticated privileges in its creating migration.",
    );
    process.exitCode = 1;
  } else {
    console.log(
      `PASS migration Data API grant guard (cutoff ${MIGRATION_GUARD_CUTOFF}): new public tables require RLS plus explicit anon/authenticated privilege decisions`,
    );
  }
}
