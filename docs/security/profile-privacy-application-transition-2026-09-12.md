# Profile privacy application transition — 2026-09-12

Status: **isolated-rehearsal application patch plan — do not merge before compatible DB target exists**

Related: #67, `profile-privacy-forward-rehearsal-2026-09-12.md`, `profile-privacy-rollback-rehearsal-2026-09-12.md`.

The application already centralizes the two private profile reads that block column-level privacy remediation in `src/lib/profile-access.ts`:

- self `role,onboarding_completed` → `getMyAccessContext(...)`;
- admin member account list including `email,role,created_at` → `getAdminMemberAccounts(...)`.

Dashboard layout and Moderation Team consume only the adapter's `{ data, error }` shape. Therefore the isolated transition can be limited to the adapter plus generated/manual database function types; no page-level behavior rewrite is required.

## Do not merge this transition against current production DB

Production does not yet contain `get_my_access_context()` or `admin_list_member_accounts()`. Landing the RPC-only adapter before the compatible DB change would break dashboard/admin reads.

The intended staging sequence is:

1. isolated DB gets the two narrow RPCs first while old broad SELECT still exists;
2. staging app adapter switches to RPCs;
3. verify dashboard/admin behavior;
4. apply the remainder of the forward rehearsal (search/policy/column SELECT boundary);
5. run persona and application regression tests.

For a future production rollout, use a reviewed ordering that avoids any interval where the deployed application expects an unavailable RPC.

## Exact adapter candidate

Replace the current direct profile queries in `src/lib/profile-access.ts` with the following shape in the isolated application branch:

```ts
import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getMyAccessContext(
  supabase: ServerSupabaseClient,
  _userId: string,
) {
  const { data, error } = await supabase.rpc("get_my_access_context");

  return {
    data: data?.[0] ?? null,
    error,
  };
}

export async function getAdminMemberAccounts(
  supabase: ServerSupabaseClient,
) {
  return supabase.rpc("admin_list_member_accounts");
}
```

The `_userId` parameter is deliberately retained during the first transition so existing callers do not need to change in the same patch. The RPC derives identity from `auth.uid()` and must **not** accept an arbitrary user ID.

After the security migration is established and tested, the unused `_userId` parameter may be removed in a separate cleanup.

## Type declarations candidate

Add these entries to `Database["public"]["Functions"]` in `src/types/database.ts` for the isolated branch:

```ts
admin_list_member_accounts: {
  Args: never
  Returns: {
    id: string
    display_name: string | null
    first_name: string | null
    last_name: string | null
    email: string | null
    role: Database["public"]["Enums"]["user_role"]
    onboarding_completed: boolean
    created_at: string
  }[]
}
get_my_access_context: {
  Args: never
  Returns: {
    role: Database["public"]["Enums"]["user_role"]
    onboarding_completed: boolean
  }[]
}
```

If regenerated Supabase types differ after the isolated migration, prefer the generated types rather than forcing this hand-written shape.

## Why no fallback to direct private SELECT

Do **not** implement an RPC-then-direct-table fallback for production convenience. Once the privacy boundary is active, a fallback that silently tries direct `profiles.role/email` reads would:

- obscure rollout ordering errors;
- make a missing/misconfigured RPC look like a profile-grant failure;
- preserve an unnecessary code path toward private columns;
- complicate proving the persona boundary.

Fail closed and surface the normal user-safe page error/redirect behavior if the private RPC is unavailable.

## Existing callers expected to remain behaviorally unchanged

### Dashboard layout

`src/app/(dashboard)/layout.tsx` currently:

- reads safe display fields directly (`display_name,first_name`);
- calls `getMyAccessContext(...)` for role/onboarding;
- uses the returned role only to derive moderator/admin capability.

Safe display-field read remains permitted by the forward column grant.

### Moderation Team

`src/app/(dashboard)/moderation/team/page.tsx` currently:

- calls `getMyAccessContext(...)` to require admin;
- calls `getAdminMemberAccounts(...)` for account administration fields;
- keeps role mutation through existing `set_profile_role(...)` database authorization.

No broad direct private-profile SELECT should remain after the adapter transition.

## Tests to add in the isolated application branch

Static/regression tests should assert:

1. `profile-access.ts` contains RPC calls to `get_my_access_context` and `admin_list_member_accounts`;
2. it does not contain direct `.select("role,onboarding_completed")` or member-account `email,role,...` selection;
3. the self access RPC takes no caller-supplied profile/user ID;
4. existing dashboard/moderation pages continue to use the adapter rather than bypassing it;
5. Settings account email remains sourced from `auth.getUser()` and not `profiles.email`.

Then the direct API persona harness must prove the DB field boundary independently of these application tests.

## Rollback compatibility

If the database rollback removes the two staged RPCs, the application must also be rolled back to a version whose adapter uses the restored pre-change DB shape. Application and DB rollback artifacts should therefore be paired in the release plan rather than treated independently.

No production code or database change is authorized by this document.
