# Afghan Hub

Afghan Hub is a community platform for Afghan professionals, organizations, businesses and opportunities. The application combines a public discovery surface with an authenticated member network for profiles, connections, messaging, notifications, events, opportunities and community contributions.

Production: https://app.apnbc.ca/

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn / Base UI components
- Supabase PostgreSQL, Auth, Storage and Realtime
- Server Actions for authenticated mutations
- Vercel deployment

## Product surfaces

### Public

- landing/about pages
- public discovery for published opportunities, events, businesses and organizations
- searchable/paginated catalog pages and public detail routes
- robots/sitemap/Open Graph metadata
- published-content and placeholder-content guards

### Authenticated member product

- signup/login/password recovery
- onboarding and profile/settings
- member directory and search
- connections and connection requests
- direct messaging, unread counts and realtime refresh
- notifications
- organizations and businesses
- opportunities and saved opportunities
- events, RSVP, attendees and calendar export
- moderation/admin role management

## Local development

Requirements:

- Node.js 22 or 24
- npm
- a Supabase project/configuration suitable for development

Install and run:

```bash
npm ci
npm run dev
```

Then open `http://localhost:3000`.

Production or shared secrets must not be committed to the repository. Use environment configuration appropriate to the target environment.

## Verification

The pull-request CI matrix runs on Node 22 and Node 24 and performs:

```bash
npm ci
npm run lint
npx tsc --noEmit
node --test tests/*.test.mjs
node --check agents/orchestrator.mjs
npm run build
```

Run the same checks before merging meaningful application changes.

For anonymous production-compatible smoke testing, see `scripts/smoke-public.mjs` and `RELEASE_VERIFICATION.md`.

## Repository structure

```text
src/app/                 Next.js routes and Server Actions
src/components/          product and UI components
src/lib/                 shared application/Supabase/domain helpers
src/types/               generated/static database types
supabase/migrations/     repository migration history (not the full production baseline)
tests/                   regression/static security/accessibility tests
scripts/                 smoke/security verification scripts
docs/security/           production snapshots and review-only security rehearsal plans
agents/                   optional agent/orchestration tooling
```

## Database and migration safety

The repository migration directory is **not** a one-to-one copy of the production migration ledger. Production has an older baseline and some timestamp-divergent logical migrations.

Therefore:

- do not run a blind `supabase db push` against production;
- do not repair production migration history merely to make it resemble this directory;
- do not replay all repository migrations into production;
- production security changes must be generated from current production metadata, rehearsed in an isolated compatible database and paired with a same-window rollback.

See the security documents in `docs/security/` and the current project state before any database change.

## Security / privacy change control

Current launch-sensitive database work is intentionally separated from normal app delivery:

- profile-field privacy and private-read RPC remediation is tracked in issue #67;
- public-schema least-privilege hardening is tracked in issue #80;
- draft-media lifecycle is tracked in issue #93.

The repository contains review-only forward/rollback rehearsal documents for these areas. Their presence does **not** authorize production DDL.

Do not change production RLS, grants, functions, Auth policy, storage visibility or production data without isolated evidence, reviewed rollback and an explicit production risk decision.

## Project status

Use these files as the durable handoff references:

- `AFGHAN_HUB_CURRENT_STATE.md`
- `AFGHAN_HUB_LAUNCH_REVIEW.md`
- `RELEASE_VERIFICATION.md`

They record the current launch gates, verified production evidence, known security constraints and change-control rules.

## Delivery / cost discipline

The project is operated in zero-cost mode for routine work:

- prefer deterministic tests, CI and existing free infrastructure;
- do not trigger paid AI agents or infrastructure upgrades for normal delivery;
- batch meaningful changes instead of creating no-op deployments;
- do not create a potentially billable Supabase branch/project without explicit cost review and approval.

## Legal/support surfaces

Privacy, Terms and Support/Contact surfaces are tracked separately because they require confirmed operator identity, support contact and retention/deletion facts. Do not invent legal or operational claims in code or documentation.
