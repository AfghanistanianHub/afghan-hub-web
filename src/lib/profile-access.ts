import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getMyAccessContext(
  supabase: ServerSupabaseClient,
  _userId: string,
) {
  return supabase.rpc("get_my_access_context").maybeSingle();
}

export async function getAdminMemberAccounts(
  supabase: ServerSupabaseClient,
) {
  return supabase.rpc("admin_list_member_accounts");
}
