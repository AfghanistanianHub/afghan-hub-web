import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// An unreachable or hung Supabase endpoint (for example a paused PostgREST
// upstream silently dropping connections) must produce an error object quickly
// enough for pages to announce the failure, not an indefinitely pending
// Server Component render.
function boundedFetch(request: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> {
  return fetch(request, { ...init, signal: init?.signal ?? AbortSignal.timeout(10000) });
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { fetch: boundedFetch },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes may be unavailable inside Server Components.
          }
        },
      },
    }
  );
}
