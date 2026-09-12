import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getMyAccessContext(
  supabase: ServerSupabaseClient,
  userId: string,
) {
  return supabase
    .from("profiles")
    .select("role,onboarding_completed")
    .eq("id", userId)
    .maybeSingle();
}

export async function getAdminMemberAccounts(
  supabase: ServerSupabaseClient,
) {
  return supabase
    .from("profiles")
    .select(
      "id,display_name,first_name,last_name,email,role,onboarding_completed,created_at",
    )
    .order("created_at", { ascending: true });
}
