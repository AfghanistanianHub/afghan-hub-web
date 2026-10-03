import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { AssistantMemberSignal } from "@/lib/assistant/intents";
import { extractAssistantSearchTerms } from "@/lib/assistant/query";

export type AssistantEntityType =
  | "profile"
  | "business"
  | "organization"
  | "opportunity"
  | "event";

export type AssistantSearchResult = {
  entityType: AssistantEntityType;
  entityId: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  country: string | null;
  href: string;
  rank: number;
};

type SearchRpcRow =
  Database["public"]["Functions"]["search_afghan_hub"]["Returns"][number];

const ASSISTANT_RESULT_LIMIT = 12;

function resultHref(row: SearchRpcRow) {
  switch (row.entity_type) {
    case "profile":
      return `/members/${row.entity_id}`;
    case "business":
      return row.entity_slug ? `/businesses/${row.entity_slug}` : null;
    case "organization":
      return row.entity_slug ? `/organizations/${row.entity_slug}` : null;
    case "opportunity":
      return row.entity_slug ? `/opportunities/${row.entity_slug}` : null;
    case "event":
      return row.entity_slug ? `/events/${row.entity_slug}` : null;
    default:
      return null;
  }
}

function safeTitle(row: SearchRpcRow) {
  if (row.entity_type === "profile" && /\S+@\S+\.\S+/.test(row.title ?? "")) {
    return "Afghan Hub member";
  }

  return row.title || "Afghan Hub result";
}

function isAssistantEntityType(value: string): value is AssistantEntityType {
  return (
    value === "profile" ||
    value === "business" ||
    value === "organization" ||
    value === "opportunity" ||
    value === "event"
  );
}

export async function searchAssistantCatalog(
  supabase: SupabaseClient<Database>,
  query: string,
  options: {
    limit?: number;
    entityType?: AssistantEntityType;
    memberSignal?: AssistantMemberSignal;
  } = {},
): Promise<AssistantSearchResult[]> {
  const normalizedQuery = extractAssistantSearchTerms(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const limit = Math.min(
    Math.max(options.limit ?? ASSISTANT_RESULT_LIMIT, 1),
    ASSISTANT_RESULT_LIMIT,
  );

  const { data, error } = await supabase.rpc("search_afghan_hub", {
    search_query: normalizedQuery,
    result_limit: limit * 3,
  });

  if (error) {
    throw error;
  }

  let rows = (data ?? [])
    .filter((row) => isAssistantEntityType(row.entity_type))
    .filter((row) => !options.entityType || row.entity_type === options.entityType);

  if (options.memberSignal) {
    const profileIds = rows
      .filter((row) => row.entity_type === "profile")
      .map((row) => row.entity_id);

    if (profileIds.length === 0) {
      return [];
    }

    let profileQuery = supabase
      .from("profiles")
      .select("id")
      .in("id", profileIds)
      .eq("is_public", true)
      .eq("onboarding_completed", true);

    profileQuery =
      options.memberSignal === "open_to_mentoring"
        ? profileQuery.eq("open_to_mentoring", true)
        : profileQuery.eq("looking_for_mentor", true);

    const { data: eligibleProfiles, error: profileError } = await profileQuery;

    if (profileError) {
      throw profileError;
    }

    const eligibleProfileIds = new Set(
      (eligibleProfiles ?? []).map((profile) => profile.id),
    );

    rows = rows.filter(
      (row) =>
        row.entity_type === "profile" &&
        eligibleProfileIds.has(row.entity_id),
    );
  }

  return rows
    .map<AssistantSearchResult | null>((row) => {
      const href = resultHref(row);

      if (!href) {
        return null;
      }

      return {
        entityType: row.entity_type as AssistantEntityType,
        entityId: row.entity_id,
        title: safeTitle(row),
        subtitle: row.subtitle,
        city: row.city,
        country: row.country,
        href,
        rank: row.rank,
      };
    })
    .filter((row): row is AssistantSearchResult => row !== null)
    .slice(0, limit);
}
