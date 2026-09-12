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
