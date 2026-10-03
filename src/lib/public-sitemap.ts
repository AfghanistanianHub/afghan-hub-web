import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { PublicKind } from "@/lib/public-catalog";
import { getUtcDateKey } from "@/lib/opportunities";

export type PublicSitemapItem = { kind: PublicKind; slug: string };

const placeholderTitle = new Set(["n/a", "na", "test", "testing"]);

function hasPublicTitle(value: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return Boolean(normalized) && !placeholderTitle.has(normalized);
}

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

export async function getPublicSitemapItems(): Promise<PublicSitemapItem[]> {
  const client = publicClient();
  if (!client) return [];

  try {
    const signal = AbortSignal.timeout(8000);
    const [opportunities, events, businesses, organizations] = await Promise.all([
      client.from("opportunities")
        .select("slug,title")
        .eq("status", "published")
        .or(`deadline.is.null,deadline.gte.${getUtcDateKey()}`)
        .order("slug")
        .limit(1000)
        .abortSignal(signal),
      client.from("events")
        .select("slug,title")
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString())
        .order("slug")
        .limit(1000)
        .abortSignal(signal),
      client.from("businesses").select("slug,name").eq("status", "published").order("slug").limit(1000).abortSignal(signal),
      client.from("organizations").select("slug,name").eq("status", "published").order("slug").limit(1000).abortSignal(signal),
    ]);

    return [
      ...(opportunities.error ? [] : (opportunities.data ?? []).filter(({ title }) => hasPublicTitle(title)).map(({ slug }) => ({ kind: "opportunities" as const, slug }))),
      ...(events.error ? [] : (events.data ?? []).filter(({ title }) => hasPublicTitle(title)).map(({ slug }) => ({ kind: "events" as const, slug }))),
      ...(businesses.error ? [] : (businesses.data ?? []).filter(({ name }) => hasPublicTitle(name)).map(({ slug }) => ({ kind: "businesses" as const, slug }))),
      ...(organizations.error ? [] : (organizations.data ?? []).filter(({ name }) => hasPublicTitle(name)).map(({ slug }) => ({ kind: "organizations" as const, slug }))),
    ];
  } catch {
    return [];
  }
}
