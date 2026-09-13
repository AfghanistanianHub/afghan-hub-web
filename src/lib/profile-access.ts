import type { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
type UserRole = Database["public"]["Enums"]["user_role"];

type AccessContext = {
  role: UserRole;
  onboarding_completed: boolean;
};

type MemberAccount = AccessContext & {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
};

type RpcError = { message: string } | null;

export async function getMyAccessContext(
  supabase: ServerSupabaseClient,
  _userId: string,
) {
  const result = await (
    supabase.rpc as unknown as (
      fn: "get_my_access_context",
    ) => Promise<{ data: AccessContext[] | null; error: RpcError }>
  )("get_my_access_context");

  return {
    data: result.data?.[0] ?? null,
    error: result.error,
  };
}

export async function getAdminMemberAccounts(
  supabase: ServerSupabaseClient,
) {
  return (
    supabase.rpc as unknown as (
      fn: "admin_list_member_accounts",
    ) => Promise<{ data: MemberAccount[] | null; error: RpcError }>
  )("admin_list_member_accounts");
}
