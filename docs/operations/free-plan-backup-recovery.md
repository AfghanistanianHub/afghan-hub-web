# Afghan Hub — Free-plan backup and recovery runbook

## Purpose

Afghan Hub currently operates on the Supabase Free plan. Free projects do not include automatic database backups or Point-in-Time Recovery (PITR). Until the project deliberately moves to a paid plan, operational recovery depends on regular logical exports that are stored outside the repository.

This runbook is intentionally zero-cost and does not change production data.

## Backup contents

Use `scripts/backup-free-plan.sh` to create three logical export files:

- `roles.sql` — custom role definitions supported by the Supabase CLI dump flow;
- `schema.sql` — application schema and database objects exported by `supabase db dump`;
- `data.sql` — application data using COPY statements.

The script also writes a manifest and SHA-256 checksums when a checksum utility is available.

Supabase-managed internal schemas are filtered by the CLI. Storage objects themselves are not contained in a database dump; the database only contains Storage metadata. If Afghan Hub later stores irreplaceable user media, object-storage backup needs a separate procedure.

## Create a backup

Requirements:

1. Supabase CLI installed.
2. A current production Postgres connection string available only in the operator shell or secret manager.
3. Sufficient local disk space.

Never paste the database connection string into source files, issue comments, chat logs, or GitHub commits.

Run:

```bash
export SUPABASE_DB_URL='postgresql://...'
./scripts/backup-free-plan.sh
```

Optional destination override:

```bash
BACKUP_OUTPUT_DIR="$HOME/secure-backups/afghan-hub-$(date -u +%Y%m%d)" \
  ./scripts/backup-free-plan.sh
```

The default output is under `backups/`, which is git-ignored.

## After every backup

1. Open `SHA256SUMS` and confirm it is non-empty.
2. Move the complete backup directory to encrypted off-site storage.
3. Verify the copied files against `SHA256SUMS` at the destination.
4. Keep at least two recent generations in separate locations when practical.
5. Delete unencrypted temporary local copies after the off-site copy is verified.

Do not upload plaintext database dumps to the Git repository or attach them to public issues/PRs.

## Recovery rehearsal

A backup is not considered proven recoverable merely because the dump command succeeded. Before launch and after material schema changes, perform a controlled restore rehearsal into an isolated disposable Postgres/Supabase target, never over production.

High-level restore order:

1. Provision or select an isolated empty target.
2. Confirm required extensions and target compatibility.
3. Apply role definitions as appropriate for the target.
4. Restore schema.
5. Restore data in a single controlled session and fail on SQL errors.
6. Run application schema/security qualification and representative read/write acceptance on the restored target.
7. Destroy the disposable restore target after evidence is captured.

Do **not** use `supabase db reset --linked` or other destructive remote reset commands as a recovery shortcut.

## Release evidence

For every production release, run the manual GitHub Actions workflow **Production release smoke** after the Vercel production deployment is Ready. It executes only anonymous/read-only checks against `https://app.apnbc.ca` using the existing `smoke:public` script.

A green smoke run is release evidence, but it is not a substitute for authenticated #120 behavioral acceptance or a tested database restore.

## Current limitations

- Free plan: no automatic backup retention and no PITR.
- The current ChatGPT Supabase connector exposes schema/data operations but no direct backup-download/restore evidence endpoint.
- Storage object bytes are outside the logical database dump.
- A real restore rehearsal still requires an explicitly isolated disposable target; do not restore into production just to prove the procedure.
