import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { createBoundedDatabaseFetch } from "./bounded-fetch";

// An unreachable or hung Supabase endpoint (for example a paused PostgREST
// upstream silently dropping connections) must produce an error object quickly
// enough for pages to announce the failure, not an indefinitely pending
// Server Component render.
const boundedFetch = createBoundedDatabaseFetch();

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
