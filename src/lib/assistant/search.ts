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

function memberTitle(profile: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  const title =
    profile.display_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    "Afghan Hub member";

  return /\S+@\S+\.\S+/.test(title) ? "Afghan Hub member" : title;
}

function mentorshipQualifier(query: string) {
  return query
    .toLocaleLowerCase()
    .replace(/\b(?:mentor|mentors|mentee|mentees)\b/gu, " ")
    .replace(
      /(?<![\p{L}\p{N}_])(?:منتور|منتورها|مربی|مربیان|لارښود|لارښودان)(?![\p{L}\p{N}_])/gu,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function mentorshipRelevance(
  profile: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    headline: string | null;
    profession: string | null;
    company: string | null;
    city: string | null;
    country: string | null;
    skills: string[] | null;
    mentorship_topics: string[] | null;
  },
  qualifier: string,
) {
  if (!qualifier) return 1;

  const fields = [
    profile.headline,
    profile.profession,
    profile.company,
    profile.city,
    profile.country,
    ...(profile.skills ?? []),
    ...(profile.mentorship_topics ?? []),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLocaleLowerCase());

  const terms = qualifier.split(/\s+/u).filter((term) => term.length >= 2);
  if (terms.length === 0) return 1;

  return terms.reduce(
    (score, term) =>
      score +
      fields.reduce(
        (fieldScore, field) => fieldScore + (field.includes(term) ? 1 : 0),
        0,
      ),
    0,
  );
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

  if (options.memberSignal) {
    let profileQuery = supabase
      .from("profiles")
      .select(
        "id,display_name,first_name,last_name,headline,profession,company,city,country,skills,mentorship_topics",
      )
      .eq("is_public", true)
      .eq("onboarding_completed", true);

    profileQuery =
      options.memberSignal === "open_to_mentoring"
        ? profileQuery.eq("open_to_mentoring", true)
        : profileQuery.eq("looking_for_mentor", true);

    const { data: profiles, error: profileError } = await profileQuery.order(
      "display_name",
    );

    if (profileError) {
      throw profileError;
    }

    const qualifier = mentorshipQualifier(normalizedQuery);

    return (profiles ?? [])
      .map((profile, index) => ({
        profile,
        index,
        relevance: mentorshipRelevance(profile, qualifier),
      }))
      .filter((item) => !qualifier || item.relevance > 0)
      .sort(
        (a, b) =>
          b.relevance - a.relevance ||
          a.index - b.index,
      )
      .slice(0, limit)
      .map(({ profile, relevance }) => ({
        entityType: "profile" as const,
        entityId: profile.id,
        title: memberTitle(profile),
        subtitle:
          profile.mentorship_topics?.[0] ??
          profile.headline ??
          profile.profession,
        city: profile.city,
        country: profile.country,
        href: `/members/${profile.id}`,
        rank: relevance,
      }));
  }

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
