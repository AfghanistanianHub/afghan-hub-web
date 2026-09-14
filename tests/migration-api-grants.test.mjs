import assert from "node:assert/strict";
import test from "node:test";

import {
  MIGRATION_GUARD_CUTOFF,
  analyzeMigration,
  isGuardedMigration,
} from "../scripts/check-migration-api-grants.mjs";

test("accepts a new public table with RLS and explicit anon/authenticated decisions", () => {
  const sql = `
    create table public.widgets (id uuid primary key);
    alter table public.widgets enable row level security;
    revoke all on table public.widgets from anon, authenticated;
    grant select on table public.widgets to anon;
    grant select, insert on table public.widgets to authenticated;
  `;
  assert.deepEqual(analyzeMigration(sql, "20260914000100_widgets.sql"), []);
});

test("rejects a new public table without RLS", () => {
  const sql = `
    create table public.widgets (id uuid primary key);
    revoke all on table public.widgets from anon, authenticated;
  `;
  assert.match(analyzeMigration(sql)[0], /enable row level security/i);
});

test("rejects a table without an explicit anon decision", () => {
  const sql = `
    create table public.widgets (id uuid primary key);
    alter table public.widgets enable row level security;
    grant select on table public.widgets to authenticated;
  `;
  assert.ok(analyzeMigration(sql).some((value) => /for anon$/i.test(value)));
});

test("rejects a table without an explicit authenticated decision", () => {
  const sql = `
    create table public.widgets (id uuid primary key);
    alter table public.widgets enable row level security;
    revoke all on table public.widgets from anon;
  `;
  assert.ok(analyzeMigration(sql).some((value) => /for authenticated$/i.test(value)));
});

test("ignores comments and non-table SQL", () => {
  const sql = `
    -- create table public.fake (id int);
    /* create table public.also_fake (id int); */
    alter function public.some_function() set search_path = '';
  `;
  assert.deepEqual(analyzeMigration(sql), []);
});

test("guard applies only from the checkpoint forward", () => {
  assert.equal(isGuardedMigration("20260913000100_old.sql"), false);
  assert.equal(isGuardedMigration(`${MIGRATION_GUARD_CUTOFF}_checkpoint.sql`), true);
  assert.equal(isGuardedMigration("20261001000100_future.sql"), true);
});
