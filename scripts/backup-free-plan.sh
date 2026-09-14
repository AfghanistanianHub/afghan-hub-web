#!/usr/bin/env bash
set -euo pipefail

umask 077

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL is required. Keep it in your shell or secret manager; never commit it." >&2
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is required: https://supabase.com/docs/guides/local-development/cli/getting-started" >&2
  exit 1
fi

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
out_dir="${BACKUP_OUTPUT_DIR:-backups/afghan-hub-${stamp}}"
mkdir -p "$out_dir"

roles_file="$out_dir/roles.sql"
schema_file="$out_dir/schema.sql"
data_file="$out_dir/data.sql"
manifest_file="$out_dir/manifest.txt"
checksums_file="$out_dir/SHA256SUMS"

printf 'Creating logical backup in %s\n' "$out_dir"

supabase db dump --db-url "$SUPABASE_DB_URL" -f "$roles_file" --role-only
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$schema_file"
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$data_file" --data-only --use-copy \
  -x "storage.buckets_vectors" \
  -x "storage.vector_indexes"

cat > "$manifest_file" <<EOF
Afghan Hub logical backup
Created UTC: ${stamp}
Contents:
- roles.sql
- schema.sql
- data.sql

This backup intentionally does not contain the database connection string.
Store this directory encrypted and off-site. Do not commit it to Git.
EOF

(
  cd "$out_dir"
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 roles.sql schema.sql data.sql manifest.txt > SHA256SUMS
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum roles.sql schema.sql data.sql manifest.txt > SHA256SUMS
  else
    echo "No SHA-256 utility found; checksum file was not generated." >&2
    : > SHA256SUMS
  fi
)

printf '\nBackup created: %s\n' "$out_dir"
printf 'Next: move the entire directory to encrypted off-site storage and verify the checksum file there.\n'
