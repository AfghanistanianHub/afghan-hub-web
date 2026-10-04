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

export class MentorshipSearchScopeError extends Error {}

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


function normalizeExpertise(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function explicitSkillClauses(query: string) {
  const cleaned = query
    .replace(/[“”"«»؟?،,!.:;؛()[\]{}]/g, " ")
    .replace(/\s+/gu, " ")
    .trim();
  const phrase = cleaned.match(
    /\b(?:skilled\s+in|skills?(?:\s+in)?|topics?(?:\s+in)?)\s+(.+?)(?=\s+(?:for|with|named|called|at|near|from|who\s+works|who\s+is|located\s+in)\b|$)/iu,
  )?.[1]?.trim() ?? "";
  if (!phrase) return [];
  return phrase
    .split(/\s+or\s+/iu)
    .map(normalizeExpertise)
    .filter(Boolean);
}

function expertiseMatchesClause(
  profile: { city: string | null; country: string | null },
  expertiseFields: string[],
  clause: string,
) {
  const normalizedFields = expertiseFields.map(normalizeExpertise);
  const exactPhrase = normalizedFields.some(
    value => (" " + value + " ").includes(" " + clause + " "),
  );
  if (exactPhrase) return true;

  const marker = clause.lastIndexOf(" in ");
  if (marker > 0) {
    const skill = clause.slice(0, marker).trim();
    const place = clause.slice(marker + 4).trim();
    const profilePlaces = [profile.city, profile.country]
      .filter(Boolean)
      .map(value => normalizeExpertise(String(value)));
    if (profilePlaces.includes(place)) {
      return normalizedFields.some(
        value => (" " + value + " ").includes(" " + skill + " "),
      );
    }
  }
  return false;
}

function mentorshipQualifier(query: string) {
  let qualifier = query
    .replace(/[“”"'«»؟?،,!.:;؛()[\]{}]/g, " ")
    .toLocaleLowerCase()
    .replace(/^\s*(?:please\s+)?(?:find|show(?:\s+me)?|search(?:\s+for)?|look\s+for)(?:\s+|$)/u, " ")
    .replace(/^\s*(?:a|an|the)\s+(?=(?:(?:professional|professionals|people|members?)\s+)?mentors?\b)/u, " ")
    .replace(/\b(?:working\s+in|skilled\s+in|that\s+supports?|similar\s+to|related\s+to|who\s+coaches)\b/gu, " ")
    .replace(/\b(?:professional|professionals|people|members?)\s+(?=mentors?\b)/gu, " ")
    .replace(/(?<![\p{L}\p{N}_])(?:مرتبط\s+با|مشابه\s+با|در\s+زمینه|حوزه|اړوند|ورته)(?![\p{L}\p{N}_])/gu, " ")
    .replace(/\bi\s+(?:met|know)\b/gu, " ")
    .replace(/\b(?:mentor|mentors|mentee|mentees)\b/gu, " ")
    .replace(/(?<![\p{L}\p{N}_])(?:منتور|منتورها|مربی|مربیان|لارښود|لارښودان)(?![\p{L}\p{N}_])/gu, " ")
    .replace(/(?:را\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن|پیدا\s+کړه|را\s+وښیه|وښیه)/gu, " ")
    .replace(/\s+/g, " ").trim();
  if (/^for me$/u.test(qualifier)) return "";
  // Preserve a standalone name/initial, even when it resembles an article.
  if (qualifier.split(/\s+/u).length > 1) {
    qualifier = qualifier.replace(/(?<![\p{L}\p{N}_])(?:in|at|for|to|of|the|a|an|me|در|به|از|برای|د|په|کې|لپاره)(?![\p{L}\p{N}_])/gu, " ");
  }
  return qualifier.replace(/\s+/g, " ").trim();
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
  skillTerms: ReadonlySet<string> = new Set(),
  skillClauses: readonly string[] = [],
) {
  if (!qualifier) return 1;

  const fields = [
    profile.display_name,
    profile.first_name,
    profile.last_name,
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

  const terms = qualifier.split(/\s+/u).filter((term) => term.length >= 1);
  if (terms.length === 0) return 1;

  const nameTokens = [profile.display_name, profile.first_name, profile.last_name]
    .filter(Boolean).flatMap(value => String(value).toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u));
  const expertiseFields = [...(profile.skills ?? []), ...(profile.mentorship_topics ?? []), profile.headline ?? "", profile.profession ?? ""];
  const skillTokens = expertiseFields
    .flatMap(value => value.toLocaleLowerCase().split(/[\s/,;؛،]+/u).map(token => token.replace(/[.!?]+$/u, "")));
  // Explicit expertise is a hard scope. Alternatives are disjunctive and
  // token/phrase boundaries prevent substring collisions such as Go/Django.
  if (
    skillClauses.length > 0 &&
    !skillClauses.some(clause => expertiseMatchesClause(profile, expertiseFields, clause))
  ) return 0;
  return terms.reduce((score, term) => {
    if (skillTerms.has(term)) {
      const exact = skillTokens.includes(term);
      const related = term.length > 1 && expertiseFields.some(value => value.toLocaleLowerCase().includes(term));
      return score + (exact ? 4 : related ? 2 : 0);
    }
    if (term.length === 1) {
      const nameScore = nameTokens.includes(term) ? 4 : nameTokens.some(token => token.startsWith(term)) ? 3 : 0;
      const skillScore = skillTokens.includes(term) ? 2 : 0;
      return score + (skillTerms.has(term) ? skillScore : nameScore || skillScore);
    }
    const nameScore = nameTokens.includes(term) ? 8 : nameTokens.some(token => token.startsWith(term)) ? 5 : 0;
    const fieldScore = Math.min(2, fields.filter(field => field.includes(term)).length);
    return score + nameScore + fieldScore;
  }, 0);
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

    const qualifier = mentorshipQualifier(query);
    const skillClauses = explicitSkillClauses(query);
    const skillTerms = new Set(
      skillClauses.flatMap(clause =>
        clause.split(/\s+/u).filter(term => term && !["and", "or", "in"].includes(term)),
      ),
    );
    // Generic browse needs one page. Qualified queries scan at most 10,000
    // eligible rows and retain only the best twelve, never partial results.
    const pageSize = qualifier ? 500 : limit;
    const maxPages = qualifier ? 20 : 1;
    let best: { profile: NonNullable<Awaited<ReturnType<typeof profileQuery.range>>["data"]>[number]; index: number; relevance: number }[] = [];
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const offset = pageIndex * pageSize;
      const { data: page, error: profileError } = await profileQuery
        .order("display_name")
        .order("id")
        .range(offset, offset + pageSize - 1);
      if (profileError) throw profileError;
      best = best.concat((page ?? []).map((profile, index) => ({
        profile, index: offset + index,
        relevance: mentorshipRelevance(profile, qualifier, skillTerms, skillClauses),
      })))
        .filter(item => !qualifier || item.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
        .slice(0, limit);
      if (!qualifier || !page || page.length < pageSize) break;
      if (pageIndex === maxPages - 1) {
        const { data: overflow, error: overflowError } = await profileQuery
          .order("display_name").order("id")
          .range(offset + pageSize, offset + pageSize);
        if (overflowError) throw overflowError;
        if (overflow?.length) {
          throw new MentorshipSearchScopeError("The mentor catalogue is too large for this search. Browse people in Network.");
        }
      }
    }

    return best
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

  const rows = (data ?? [])
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
