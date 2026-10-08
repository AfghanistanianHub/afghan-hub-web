import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import type { Database } from "@/types/database";
import type { PublicKind } from "@/lib/public-catalog";
import { discoveryLocationTerms } from "@/lib/assistant/discovery-location";
import { getUtcDateKey } from "@/lib/opportunities";
import {
  currentEventFilter,
  currentOpportunityFilter,
} from "@/lib/public-listing-eligibility";

export type PublicListing = {
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  location: string;
  region?: string | null;
  category: string;
  date: string | null;
  endDate: string | null;
};
type Result = { items: PublicListing[]; hasMore: boolean; unavailable: boolean };
type Options = { slug?: string; search?: string; page?: number; limit?: number; discoveryTerms?: string[]; discoveryLocation?: string; signal?: AbortSignal };
const unavailable: Result = { items: [], hasMore: false, unavailable: true };
const location = (city: string | null, country: string | null) => [city, country].filter(Boolean).join(", ") || "Location not listed";
const placeholderText = new Set(["n/a", "na", "test", "testing"]);

export function cleanPublicText(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || placeholderText.has(trimmed.toLowerCase().replace(/\s+/g, " "))) return null;
  return trimmed;
}

// Deliberately independent of cookies and the signed-in user's server client.
// The publishable key plus anon RLS defines the public boundary, even for admins.
function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

export async function getPublicListings(kind: PublicKind, options: Options = {}): Promise<Result> {
  const limit = options.slug ? 1 : Math.min(Math.max(options.limit ?? 12, 1), 24);
  const start = options.slug ? 0 : (Math.min(Math.max(options.page ?? 1, 1), 9999) - 1) * limit;
  const end = options.slug ? 0 : start + limit; // One extra row for pagination.
  const pattern = `%${(options.search ?? "").slice(0, 100).replace(/[\\%_]/g, "\\$&")}%`;
  // Only the Navigator opts into broader public-field matching. Remove filter
  // grammar characters before constructing PostgREST expressions; field names
  // are fixed by the application, never supplied by the visitor.
  const safeTerm = (value: string) => value.slice(0, 80).replace(/[^\p{L}\p{N} +#'.-]/gu, " ").replace(/\s+/g, " ").trim();
  const discoveryTerms = options.discoveryTerms?.slice(0, 8).map(safeTerm).filter(Boolean) ?? [];
  const discoveryLocations = discoveryLocationTerms(options.discoveryLocation ?? "").map(safeTerm).filter(Boolean);
  const discoveryFilter = (fields: string[], current?: string, remote?: string) => {
    const clauses = current ? [`or(${current})`] : [];
    if (discoveryTerms.length) clauses.push(`or(${discoveryTerms.flatMap(term => fields.map(field => `${field}.ilike.%${term}%`)).join(",")})`);
    if (discoveryLocations.length) clauses.push(`or(${discoveryLocations.flatMap(term => ["city", "province_state", "country"].map(field => term.length <= 3 ? `${field}.ilike.${term}` : `${field}.ilike.%${term}%`)).join(",")}${remote ? `,${remote}.eq.true` : ""})`);
    return clauses.length ? `and(${clauses.join(",")})` : "";
  };
  const discovery = options.discoveryTerms !== undefined || options.discoveryLocation !== undefined;
  const finish = (items: PublicListing[], error: unknown): Result => error ? unavailable : ({ items: items.slice(0, limit), hasMore: items.length > limit, unavailable: false });
  try {
    const client = publicClient();
    if (!client) return unavailable;
    const signal = options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000);
    if (kind === "opportunities") {
      let query = client.from("opportunities")
        .select("slug,title,summary,description,type,city,province_state,country,is_remote,deadline")
        .eq("status", "published");
      if (options.slug) query = query.eq("slug", options.slug);
      else if (discovery) query = query.or(discoveryFilter(["title", "summary", "description"], currentOpportunityFilter(getUtcDateKey()), "is_remote"));
      else query = query.or(currentOpportunityFilter(getUtcDateKey())).ilike("title", pattern);
      const { data, error } = await query.order("created_at", { ascending: false }).order("slug").range(start, end).abortSignal(signal);
      const items = (data ?? []).flatMap(row => {
        const title = cleanPublicText(row.title);
        return title ? [{ slug: row.slug, title, summary: cleanPublicText(row.summary), description: cleanPublicText(row.description), region: row.province_state, category: row.type.replace(/_/g, " "), location: row.is_remote ? "Remote" : location(row.city, row.country), date: row.deadline, endDate: null }] : [];
      });
      return finish(items, error);
    }
    if (kind === "events") {
      let query = client.from("events")
        .select("slug,title,summary,description,city,province_state,country,is_online,starts_at,ends_at")
        .eq("status", "published");
      if (options.slug) query = query.eq("slug", options.slug);
      else if (discovery) query = query.or(discoveryFilter(["title", "summary", "description"], currentEventFilter(new Date().toISOString()), "is_online"));
      else query = query.or(currentEventFilter(new Date().toISOString())).ilike("title", pattern);
      const { data, error } = await query.order("starts_at").order("slug").range(start, end).abortSignal(signal);
      const items = (data ?? []).flatMap(row => {
        const title = cleanPublicText(row.title);
        return title ? [{ slug: row.slug, title, summary: cleanPublicText(row.summary), description: cleanPublicText(row.description), region: row.province_state, category: row.is_online ? "Online event" : "Community event", location: row.is_online ? "Online" : location(row.city, row.country), date: row.starts_at, endDate: row.ends_at }] : [];
      });
      return finish(items, error);
    }
    if (kind === "businesses") {
      let query = client.from("businesses")
        .select("slug,name,short_description,description,category,city,province_state,country")
        .eq("status", "published");
      if (options.slug) query = query.eq("slug", options.slug);
      else if (discovery && discoveryFilter(["name", "short_description", "description", "category"])) query = query.or(discoveryFilter(["name", "short_description", "description", "category"]));
      else query = query.ilike("name", pattern);
      const { data, error } = await query.order("name").order("slug").range(start, end).abortSignal(signal);
      const items = (data ?? []).flatMap(row => {
        const title = cleanPublicText(row.name);
        return title ? [{ slug: row.slug, title, summary: cleanPublicText(row.short_description), description: cleanPublicText(row.description), region: row.province_state, category: row.category, location: location(row.city, row.country), date: null, endDate: null }] : [];
      });
      return finish(items, error);
    }
    let query = client.from("organizations")
      .select("slug,name,short_description,description,organization_type,city,province_state,country")
      .eq("status", "published");
    if (options.slug) query = query.eq("slug", options.slug);
    else if (discovery && discoveryFilter(["name", "short_description", "description", "organization_type"])) query = query.or(discoveryFilter(["name", "short_description", "description", "organization_type"]));
    else query = query.ilike("name", pattern);
    const { data, error } = await query.order("name").order("slug").range(start, end).abortSignal(signal);
    const items = (data ?? []).flatMap(row => {
      const title = cleanPublicText(row.name);
      return title ? [{ slug: row.slug, title, summary: cleanPublicText(row.short_description), description: cleanPublicText(row.description), region: row.province_state, category: row.organization_type ?? "Community organization", location: location(row.city, row.country), date: null, endDate: null }] : [];
    });
    return finish(items, error);
  } catch {
    return unavailable;
  }
}

export const getPublicListing = cache((kind: PublicKind, slug: string) => getPublicListings(kind, { slug }));
