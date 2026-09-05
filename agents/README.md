# Afghan Hub Agent

Afghan Hub Autopilot is a conservative multi-agent workflow built with the OpenAI Agents SDK for TypeScript.

## Roles

Each run uses four cooperating roles:

- **Planner** — reads the RC1 policy and repository, then selects one low-risk task.
- **Builder** — edits only the Level 1 allowlist: `src/`, `tests/`, and `docs/`.
- **Reviewer** — checks correctness, regressions, scope, accessibility, and test coverage.
- **Security Reviewer** — checks authorization/privacy/security implications.

After the LLM reviews pass, deterministic QA runs:

- `npm run lint`
- `npx tsc --noEmit`
- all `tests/*.test.mjs`
- `npm run build`
- `git diff --check`

Only then can the workflow push a branch and open a pull request. Level 1 never merges its own PR and never applies a database migration.

## Schedule

`.github/workflows/afghan-hub-agent.yml` runs hourly at minute 17 and can also be started manually. If any pull request is already open, it exits without creating parallel work.

## Required GitHub Actions secrets

Configure these in **Settings → Secrets and variables → Actions → Repository secrets**:

1. `OPENAI_API_KEY` — an OpenAI API key used only by the agent workflow.
2. `AFGHAN_HUB_AGENT_GITHUB_TOKEN` — a fine-grained GitHub personal access token restricted to this repository with:
   - **Contents: Read and write**
   - **Pull requests: Read and write**

Use a dedicated token rather than the workflow's default `GITHUB_TOKEN`. A dedicated token allows the agent's pushed branch/PR to trigger the normal GitHub CI workflow.

No Supabase or Vercel secret is needed for Level 1. Database and production actions remain human-gated.

## Safety policy

See `docs/agent/autopilot-policy.md`.
