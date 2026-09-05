# Afghan Hub Autopilot — Level 1

This document is the operating contract for the repository agent.

## Goal

Move Afghan Hub toward Release Candidate 1.0 through small, reviewable, low-risk pull requests while preserving user data, production stability, and the existing architecture.

## Safe autonomous work

The agent may autonomously change files under:

- `src/`
- `tests/`
- `docs/`

Typical safe tasks:

1. Add or improve regression tests.
2. Improve validation and friendly error handling.
3. Improve accessibility, labels, keyboard behavior, and empty/error states.
4. Make small UI consistency fixes.
5. Improve project documentation.
6. Remove clearly dead or duplicated application code when behavior is covered.
7. Fix bounded bugs that do not change authorization, persistence semantics, or production configuration.

## Human approval gates

The Level 1 agent must stop instead of implementing any task that requires:

- Supabase migrations, RLS, grants, roles, triggers, or SECURITY DEFINER changes.
- Authentication/authorization policy changes.
- Deleting or rewriting user data.
- Listing deletion or storage cleanup.
- Admin/moderator role changes.
- Secrets, tokens, environment variables, domains, or production configuration.
- Dependency upgrades, package-lock changes, or GitHub workflow changes.
- Destructive git operations.
- Automatic merge or automatic Production deployment.
- A product decision with multiple materially different user experiences.

## Pull request discipline

- One focused task per PR.
- Never write directly to `main`.
- Never merge its own PR in Level 1.
- Never apply a database migration.
- Run lint, TypeScript checking, and regression tests before opening a PR.
- Existing GitHub CI and Vercel Preview remain the final automated gates.
- If another PR is already open, wait rather than creating parallel work.

## Repository rules

Read `AGENTS.md` before making changes. When editing Next.js behavior that depends on framework APIs or conventions, inspect the relevant documentation under `node_modules/next/dist/docs/` first.

## Initial RC1 backlog

Prefer the highest-value safe item that is not already complete:

1. Friendly/generic authentication and password-recovery error UX; avoid exposing raw provider errors.
2. Profile create/edit copy and validation consistency.
3. Accessibility pass for forms, buttons, status messages, focus behavior, and semantic labels.
4. Regression coverage for connections, notifications, moderation, RSVP, and directory filters where practical without external service credentials.
5. Empty/loading/error-state consistency across directory and dashboard pages.
6. README and operational documentation: local setup, architecture, test commands, deploy flow, Supabase project caution, and release checklist.
7. Small code-quality cleanup that reduces duplication without changing behavior.
8. Launch checklist and manual QA matrix for desktop/mobile/authenticated roles.

The following remain human-gated even if they are important:

- Remaining Supabase SECURITY DEFINER audit.
- `pg_trgm` schema relocation.
- Migration-history reconciliation.
- Listing deletion/storage cleanup.
- Dependency/Node engine cleanup.
- Production observability/monitoring integrations.
