import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { PhaseOneSearchIntent } from "@/lib/intent-discovery";
import { getUtcDateKey } from "@/lib/opportunities";

export type IntentBrowseItem = {
  id: string;
  entityType: "member" | "business" | "organization" | "opportunity" | "event";
  title: string;
  subtitle: string | null;
  slug: string | null;
  city: string | null;
  country: string | null;
  isVerified: boolean;
};

const DEFAULT_LIMIT = 24;

function memberTitle(profile: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  return (
    profile.display_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    "Afghan Hub member"
  );
}

export async function getIntentBrowseItems(
  supabase: SupabaseClient<Database>,
  intent: PhaseOneSearchIntent,
  options: { limit?: number; viewerId?: string } = {},
): Promise<IntentBrowseItem[]> {
  const safeLimit = Math.min(
    Math.max(options.limit ?? DEFAULT_LIMIT, 1),
    DEFAULT_LIMIT,
  );

  if (intent === "find_work") {
    const [{ data: jobs }, { data: hiringBusinesses }] = await Promise.all([
      supabase
        .from("opportunities")
        .select("id,title,summary,slug,city,country,deadline,created_at")
        .eq("status", "published")
        .eq("type", "job")
        .or(`deadline.is.null,deadline.gte.${getUtcDateKey()}`)
        .order("created_at", { ascending: false })
        .limit(safeLimit),
      supabase
        .from("businesses")
        .select("id,name,category,slug,city,country,is_verified")
        .eq("status", "published")
        .eq("is_hiring", true)
        .order("name")
        .limit(safeLimit),
    ]);

    return [
      ...(jobs ?? []).map((item) => ({
        id: item.id,
        entityType: "opportunity" as const,
        title: item.title,
        subtitle: item.summary,
        slug: item.slug,
        city: item.city,
        country: item.country,
        isVerified: false,
      })),
      ...(hiringBusinesses ?? []).map((item) => ({
        id: item.id,
        entityType: "business" as const,
        title: item.name,
        subtitle: item.category,
        slug: item.slug,
        city: item.city,
        country: item.country,
        isVerified: item.is_verified,
      })),
    ];
  }

  if (intent === "hire_talent") {
    let query = supabase
      .from("profiles")
      .select(
        "id,display_name,first_name,last_name,headline,profession,city,country",
      )
      .eq("is_public", true)
      .eq("onboarding_completed", true)
      .order("display_name")
      .limit(safeLimit);

    if (options.viewerId) {
      query = query.neq("id", options.viewerId);
    }

    const { data } = await query;

    return (data ?? []).map((item) => ({
      id: item.id,
      entityType: "member" as const,
      title: memberTitle(item),
      subtitle: item.headline ?? item.profession,
      slug: null,
      city: item.city,
      country: item.country,
      isVerified: false,
    }));
  }

  if (intent === "volunteer") {
    const [{ data: roles }, { data: organizations }] = await Promise.all([
      supabase
        .from("opportunities")
        .select("id,title,summary,slug,city,country,deadline,created_at")
        .eq("status", "published")
        .eq("type", "volunteer")
        .or(`deadline.is.null,deadline.gte.${getUtcDateKey()}`)
        .order("created_at", { ascending: false })
        .limit(safeLimit),
      supabase
        .from("organizations")
        .select("id,name,organization_type,slug,city,country,is_verified")
        .eq("status", "published")
        .eq("is_accepting_volunteers", true)
        .order("name")
        .limit(safeLimit),
    ]);

    return [
      ...(roles ?? []).map((item) => ({
        id: item.id,
        entityType: "opportunity" as const,
        title: item.title,
        subtitle: item.summary,
        slug: item.slug,
        city: item.city,
        country: item.country,
        isVerified: false,
      })),
      ...(organizations ?? []).map((item) => ({
        id: item.id,
        entityType: "organization" as const,
        title: item.name,
        subtitle: item.organization_type,
        slug: item.slug,
        city: item.city,
        country: item.country,
        isVerified: item.is_verified,
      })),
    ];
  }

  if (intent === "find_services") {
    const { data } = await supabase
      .from("businesses")
      .select("id,name,category,slug,city,country,is_verified")
      .eq("status", "published")
      .order("name")
      .limit(safeLimit);

    return (data ?? []).map((item) => ({
      id: item.id,
      entityType: "business" as const,
      title: item.name,
      subtitle: item.category,
      slug: item.slug,
      city: item.city,
      country: item.country,
      isVerified: item.is_verified,
    }));
  }

  const nowIso = new Date().toISOString();
  const [{ data: organizations }, { data: events }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id,name,organization_type,slug,city,country,is_verified")
      .eq("status", "published")
      .order("name")
      .limit(safeLimit),
    supabase
      .from("events")
      .select("id,title,summary,slug,city,country,starts_at,ends_at")
      .eq("status", "published")
      .or(
        `ends_at.gte.${nowIso},and(ends_at.is.null,starts_at.gte.${nowIso})`,
      )
      .order("starts_at")
      .limit(safeLimit),
  ]);

  return [
    ...(organizations ?? []).map((item) => ({
      id: item.id,
      entityType: "organization" as const,
      title: item.name,
      subtitle: item.organization_type,
      slug: item.slug,
      city: item.city,
      country: item.country,
      isVerified: item.is_verified,
    })),
    ...(events ?? []).map((item) => ({
      id: item.id,
      entityType: "event" as const,
      title: item.title,
      subtitle: item.summary,
      slug: item.slug,
      city: item.city,
      country: item.country,
      isVerified: false,
    })),
  ];
}
