import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// An unreachable or hung Supabase endpoint (for example a paused PostgREST
// upstream silently dropping connections) must produce an error object quickly
// enough for pages to announce the failure, not an indefinitely pending
// Server Component render.
function boundedFetch(request: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> {
  if (init?.signal) return fetch(request, init);
  // An AbortController (rather than AbortSignal.timeout) rejects with the
  // AbortError name that postgrest-js treats as "never retry"; without it a
  // hung endpoint is retried with backoff repeatedly before failing.
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 10000);
  return fetch(request, { ...init, signal: controller.signal }).finally(() => clearTimeout(deadline));
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
