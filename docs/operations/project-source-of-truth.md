# Afghan Hub — Project Source of Truth

This document records where the live Afghan Hub project is stored and which systems are authoritative for each layer.

## Application source code

**Authoritative repository**

- GitHub: `AfghanistanianHub/afghan-hub-web`
- Default branch: `main`
- Production source of truth: the code merged into `main`

All active application code, tests, scripts, documentation, and repository migration files belong in this repository.

Key directories:

- `src/` — Next.js application code
- `public/` — static public assets
- `tests/` — regression/security/accessibility tests
- `scripts/` — smoke, acceptance, and operational verification scripts
- `supabase/` — repository-side Supabase migration history and configuration artifacts
- `docs/` — security, operations, release, and product documentation
- `.github/` — GitHub Actions and repository automation

## Production deployment

**Authoritative Vercel project**

- Project: `afghan-hub-web`
- Project ID: `prj_Se30wBpybGZEsmuEhoKmaoggBvwL`
- Team: `afghan-hub-s-projects`
- Team ID: `team_Y05xe0lqP2ATXkB4JLUNycKQ`
- Production domain: `https://app.apnbc.ca/`

Production deployments are expected to come from the GitHub repository above, normally from the `main` branch.

Do not treat Vercel preview deployments as separate copies of the project. They are temporary deployments of Git branches from the same repository.

## Production data and authentication

**Authoritative Supabase production project**

- Name: `Afghan Hub Production`
- Project ref: `yussznmwjsvfvpabmwdc`
- Region: `ca-central-1`

This project owns the live PostgreSQL database, Supabase Auth, Storage, and Realtime state.

### Production Storage buckets

Current production Storage is also centralized in this same Supabase project:

- `avatars` — public bucket for member avatar assets;
- `business-media` — private bucket for business media;
- `organization-media` — private bucket for organization media.

Object counts are intentionally not treated as documentation state because they change as users upload or remove files. Bucket names and visibility are the durable storage map.

The database is not a copy of the Git repository. The repository contains application code and migration artifacts; Supabase contains live data and live database state.

### Secondary Supabase project

- Name: `loadsnft's Project`
- Project ref: `rurgmyiiytesknsfwjjl`
- Region: `ca-central-1`

Treat this as a secondary/rehearsal environment only unless a specific task explicitly redefines its purpose. It is not the production source of truth.

## Legacy repository

A separate private repository exists:

- `AfghanistanianHub/bc-afghan-connect`

Its current structure identifies it as an older Lovable/Vite prototype. It is **not** the source repository for the current Next.js Afghan Hub production application and is not the Vercel project currently serving `app.apnbc.ca`.

Do not copy active Afghan Hub changes into this repository.

## Secrets and environment configuration

Real secrets do not belong in GitHub source control.

- `.env.example` may document variable names using placeholders.
- real development values belong in local environment configuration;
- production/preview environment variables belong in the corresponding deployment/service configuration.

Never commit production Supabase keys, service-role secrets, passwords, access tokens, or private credentials.

## Migration caveat

The repository's `supabase/migrations/` directory is **not** a one-to-one representation of the production Supabase migration ledger.

Therefore:

- never use a blind `supabase db push` against production;
- never replay all repository migrations into production;
- never repair production history merely to match the repository;
- use current production metadata, rehearsal, rollback, and verification for production DDL.

## Working branches

Feature, fix, design, security, and documentation branches are temporary working histories inside the same GitHub repository. They are not separate project copies.

After a branch is merged and no longer needed, it should be considered eligible for cleanup according to repository retention policy.

## Practical rule

If there is ever uncertainty about “where Afghan Hub lives,” use this order:

1. **Code:** GitHub `AfghanistanianHub/afghan-hub-web` → `main`
2. **Deployment:** Vercel project `afghan-hub-web`
3. **Production data/Auth/Storage:** Supabase `Afghan Hub Production`
4. **Production URL:** `https://app.apnbc.ca/`

Everything else should be treated as preview, rehearsal, legacy, or supporting material unless explicitly documented otherwise.
