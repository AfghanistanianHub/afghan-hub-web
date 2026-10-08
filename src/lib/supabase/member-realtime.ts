import type { RealtimeChannel } from "@supabase/supabase-js";
import type { createClient } from "./client";

// Joining before browser session initialization can register PostgreSQL filters
// as anon even when the server-rendered page is authenticated.
export function subscribeMemberChannel(
  supabase: ReturnType<typeof createClient>,
  channel: RealtimeChannel,
) {
  let disposed = false;

  void (async () => {
    const { data, error } = await supabase.auth.getSession();
    if (disposed || error || !data.session) return;
    await supabase.realtime.setAuth(data.session.access_token);
    if (!disposed) channel.subscribe();
  })().catch(() => {
    // Leave the server-rendered data intact if session initialization fails.
    // Never fall back to an anonymous subscription for a member channel.
  });

  return () => {
    disposed = true;
    void supabase.removeChannel(channel);
  };
}
