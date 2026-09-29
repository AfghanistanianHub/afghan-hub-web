import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import { ExternalImage } from "@/components/ui/external-image";
import { discoveryIntentCards } from "@/components/discovery/goal-paths";
import { VerificationBadge } from "@/components/ui/verification-badge";
import {
  getPhaseOneSearchIntent,
  limitIntentBrowseCandidates,
  phaseOneSearchIntents,
  rankIntentCandidates,
} from "@/lib/intent-discovery";
import { businessIntentCandidate, eventIntentCandidate, memberIntentCandidate, opportunityIntentCandidate, organizationIntentCandidate } from "@/lib/intent-signals";
import { getIntentBrowseItems } from "@/lib/intent-browse";
import { createClient } from "@/lib/supabase/server";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    intent?: string;
  }>;
};

type SearchResult = {
  entity_id: string;
  entity_type: string;
  entity_slug: string;
  title: string;
  subtitle: string;
  image_url: string;
  city: string;
  country: string;
  rank: number;
  browse_verified?: boolean;
};

function isMemberResult(result: SearchResult) {
  return result.entity_type === "profile" || result.entity_type === "member";
}

function getSafeResultTitle(result: SearchResult) {
  if (isMemberResult(result) && /\S+@\S+\.\S+/.test(result.title)) {
    return "Afghan Hub member";
  }

  return result.title;
}

function getResultHref(result: SearchResult) {
  switch (result.entity_type) {
    case "profile":
    case "member":
      return `/members/${result.entity_id}`;
    case "business":
      return `/businesses/${result.entity_slug}`;
    case "organization":
      return `/organizations/${result.entity_slug}`;
    case "opportunity":
      return `/opportunities/${result.entity_slug}`;
    case "event":
      return `/events/${result.entity_slug}`;
    default:
      return null;
  }
}

function getResultIcon(entityType: string) {
  switch (entityType) {
    case "profile":
    case "member":
      return UserRound;
    case "business":
      return Building2;
    case "organization":
      return UsersRound;
    case "opportunity":
      return BriefcaseBusiness;
    case "event":
      return CalendarDays;
    default:
      return Search;
  }
}

function getTypeLabel(entityType: string) {
  switch (entityType) {
    case "profile":
    case "member":
      return "Member";
    case "business":
      return "Business";
    case "organization":
      return "Organization";
    case "opportunity":
      return "Opportunity";
    case "event":
      return "Event";
    default:
      return entityType;
  }
}

function getIntentEmptyCopy(intent: ReturnType<typeof getPhaseOneSearchIntent>) {
  switch (intent) {
    case "find_work":
      return "No current jobs or explicitly hiring businesses match this view yet.";
    case "hire_talent":
      return "No eligible public member profiles are available in this view yet.";
    case "volunteer":
      return "No current volunteer roles or organizations explicitly accepting volunteers are available yet.";
    case "find_services":
      return "No published businesses are available in this view yet.";
    case "join_community":
      return "No published community organizations or current events are available in this view yet.";
    default:
      return null;
  }
}

function getResultKey(result: SearchResult) {
  return `${result.entity_type}:${result.entity_id}`;
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { q, intent: rawIntent } = await searchParams;
  const query = q?.trim() ?? "";
  const intent = getPhaseOneSearchIntent(rawIntent);
  const supabase = await createClient();
  const isIntentOnlyBrowse = intent !== null && query.length === 0;
  const user =
    intent === "hire_talent" && query.length === 0
      ? (await supabase.auth.getUser()).data.user
      : null;
  const browseItems =
    intent !== null && query.length === 0
      ? await getIntentBrowseItems(supabase, intent, { viewerId: user?.id })
      : [];

  const KEYWORD_RESULT_LIMIT = 30;
  const INTENT_KEYWORD_CANDIDATE_LIMIT = 100;
  const BROWSE_RESULT_LIMIT = 24;

  const { data, error } =
    query.length >= 2
      ? await supabase.rpc("search_afghan_hub", {
          search_query: query,
          result_limit: intent
            ? INTENT_KEYWORD_CANDIDATE_LIMIT
            : KEYWORD_RESULT_LIMIT,
        })
      : { data: [], error: null };

  const browseResults: SearchResult[] = browseItems.map((item) => ({
    entity_id: item.id,
    entity_type: item.entityType,
    entity_slug: item.slug ?? "",
    title: item.title,
    subtitle: item.subtitle ?? "",
    image_url: "",
    city: item.city ?? "",
    country: item.country ?? "",
    rank: 0,
    browse_verified: item.isVerified,
  }));

  const rawResults = (
    isIntentOnlyBrowse ? browseResults : ((data ?? []) as SearchResult[])
  ).filter((result) => getResultHref(result) !== null);
  const memberIds = rawResults
    .filter(isMemberResult)
    .map((result) => result.entity_id);
  const opportunityIds = rawResults
    .filter((result) => result.entity_type === "opportunity")
    .map((result) => result.entity_id);
  const eventIds = rawResults
    .filter((result) => result.entity_type === "event")
    .map((result) => result.entity_id);
  const businessIds = rawResults
    .filter((result) => result.entity_type === "business")
    .map((result) => result.entity_id);
  const organizationIds = rawResults
    .filter((result) => result.entity_type === "organization")
    .map((result) => result.entity_id);
  const [
    { data: visibleMembers },
    { data: visibleOpportunities },
    { data: visibleEvents },
    { data: businessSignals },
    { data: organizationSignals },
  ] = await Promise.all([
    memberIds.length > 0
      ? supabase
          .from("profiles")
          .select("id")
          .in("id", memberIds)
          .eq("is_public", true)
          .eq("onboarding_completed", true)
      : Promise.resolve({ data: [] as { id: string }[] }),
    opportunityIds.length > 0
      ? supabase
          .from("opportunities")
          .select("id,deadline,type")
          .in("id", opportunityIds)
          .eq("status", "published")
      : Promise.resolve({
          data: [] as { id: string; deadline: string | null; type: string | null }[],
        }),
    eventIds.length > 0
      ? supabase
          .from("events")
          .select("id,starts_at,ends_at")
          .in("id", eventIds)
          .eq("status", "published")
      : Promise.resolve({
          data: [] as {
            id: string;
            starts_at: string;
            ends_at: string | null;
          }[],
        }),
    businessIds.length > 0
      ? supabase
          .from("businesses")
          .select("id,is_hiring,is_verified")
          .in("id", businessIds)
          .eq("status", "published")
      : Promise.resolve({ data: [] as { id: string; is_hiring: boolean; is_verified: boolean }[] }),
    organizationIds.length > 0
      ? supabase
          .from("organizations")
          .select("id,is_accepting_volunteers,is_verified")
          .in("id", organizationIds)
          .eq("status", "published")
      : Promise.resolve({
          data: [] as { id: string; is_accepting_volunteers: boolean; is_verified: boolean }[],
        }),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().getTime();
  const visibleMemberIds = new Set(
    (visibleMembers ?? []).map((item) => item.id),
  );
  const visibleOpportunityIds = new Set(
    (visibleOpportunities ?? [])
      .filter(
        (item) =>
          item.deadline === null || item.deadline.slice(0, 10) >= today,
      )
      .map((item) => item.id),
  );
  const visibleEventIds = new Set(
    (visibleEvents ?? [])
      .filter((item) => {
        const visibleThrough = item.ends_at ?? item.starts_at;
        return new Date(visibleThrough).getTime() >= now;
      })
      .map((item) => item.id),
  );
  const visibleBusinessIds = new Set(
    (businessSignals ?? []).map((item) => item.id),
  );
  const visibleOrganizationIds = new Set(
    (organizationSignals ?? []).map((item) => item.id),
  );

  const eligibleResults = rawResults.filter((result) => {
    if (isMemberResult(result)) {
      return visibleMemberIds.has(result.entity_id);
    }

    if (result.entity_type === "opportunity") {
      return visibleOpportunityIds.has(result.entity_id);
    }

    if (result.entity_type === "event") {
      return visibleEventIds.has(result.entity_id);
    }

    if (result.entity_type === "business") {
      return visibleBusinessIds.has(result.entity_id);
    }

    if (result.entity_type === "organization") {
      return visibleOrganizationIds.has(result.entity_id);
    }

    return false;
  });

  const businessSignalById = new Map(
    (businessSignals ?? []).map((item) => [item.id, item]),
  );
  const organizationSignalById = new Map(
    (organizationSignals ?? []).map((item) => [item.id, item]),
  );
  const opportunitySignalById = new Map(
    (visibleOpportunities ?? []).map((item) => [item.id, item]),
  );

  const rankedIntentCandidates = rankIntentCandidates(
    intent,
    eligibleResults.map((result) => {
      const key = getResultKey(result);

      if (isMemberResult(result)) {
        return memberIntentCandidate(key);
      }

      if (result.entity_type === "business") {
        return businessIntentCandidate(key, {
          isHiring: businessSignalById.get(result.entity_id)?.is_hiring ?? false,
        });
      }

      if (result.entity_type === "organization") {
        return organizationIntentCandidate(key, {
          acceptsVolunteers:
            organizationSignalById.get(result.entity_id)
              ?.is_accepting_volunteers ?? false,
        });
      }

      if (result.entity_type === "opportunity") {
        return opportunityIntentCandidate(
          key,
          opportunitySignalById.get(result.entity_id)?.type,
        );
      }

      return eventIntentCandidate(key);
    }),
    eligibleResults.length,
  );
  const rankedIntentResults =
    isIntentOnlyBrowse && intent
      ? limitIntentBrowseCandidates(
          intent,
          rankedIntentCandidates,
          BROWSE_RESULT_LIMIT,
        )
      : rankedIntentCandidates.slice(0, KEYWORD_RESULT_LIMIT);

  const resultByKey = new Map(
    eligibleResults.map((result) => [getResultKey(result), result]),
  );
  const intentReasonByKey = new Map(
    rankedIntentResults.map((item) => [item.id, item.intentReason]),
  );
  const isVerifiedResult = (result: SearchResult) =>
    result.browse_verified ??
    (result.entity_type === "business"
      ? businessSignalById.get(result.entity_id)?.is_verified ?? false
      : result.entity_type === "organization"
        ? organizationSignalById.get(result.entity_id)?.is_verified ?? false
        : false);
  const results = rankedIntentResults
    .map((item) => resultByKey.get(item.id))
    .filter((result): result is SearchResult => Boolean(result));

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/45 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Discover Afghan Hub
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">
              Search with purpose.
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Choose what you are trying to do, then browse or add a keyword. Afghan Hub uses only explicit, public signals to prioritize relevant people and listings.
            </p>
          </div>
        </section>

        <form action="/search" role="search" className="relative mt-8 grid gap-3 rounded-[1.75rem] border border-border/80 bg-card/88 p-4 shadow-[0_12px_38px_rgb(15_23_42/0.035)] backdrop-blur md:grid-cols-[14rem_minmax(0,1fr)_auto] md:items-end">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            What are you looking for?
            <select
              name="intent"
              defaultValue={intent ?? ""}
              className="rounded-2xl border border-border/80 bg-background/70 px-4 py-4 text-sm text-foreground outline-none transition hover:border-primary/20 focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Anything in the community</option>
              {phaseOneSearchIntents.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="relative grid gap-2 text-sm font-medium text-foreground">
            Search Afghan Hub
            <Search className="pointer-events-none absolute bottom-4 left-4 size-5 text-muted-foreground" />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder={intent ? "Optional keyword…" : "Name, skill, organization, service, opportunity…"}
              aria-label="Search Afghan Hub"
              className="w-full rounded-2xl border border-border/80 bg-background/70 py-4 pl-12 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-primary/20 focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <button
            type="submit"
            className="rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {intent && !query ? "Browse" : "Search"}
          </button>
        </form>

        {query && query.length < 2 ? (
          <div className="mt-8 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-700">
            Enter at least two characters to search.
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">
            We could not complete your search. Please try again.
          </div>
        ) : null}

        {!error && (query.length >= 2 || isIntentOnlyBrowse) ? (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"}
              {query ? ` for “${query}”` : ""}
              {intent
                ? ` · ${isIntentOnlyBrowse ? "browsing" : "prioritized for"} ${phaseOneSearchIntents.find((option) => option.value === intent)?.label.toLowerCase()}`
                : ""}
            </p>

            {results.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {results.map((result) => {
                  const href = getResultHref(result)!;
                  const Icon = getResultIcon(result.entity_type);
                  const location = [result.city, result.country]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <Link
                      key={`${result.entity_type}-${result.entity_id}`}
                      href={href}
                      className="surface-panel group relative flex items-start gap-4 overflow-hidden rounded-[1.5rem] p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_36px_rgb(15_23_42/0.06)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      <div aria-hidden="true" className="absolute -right-8 -top-8 size-24 rounded-full border border-primary/10" />
                      {result.image_url ? (
                        <ExternalImage
                          src={result.image_url}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                      )}

                      <div className="relative min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                            {getTypeLabel(result.entity_type)}
                          </span>
                          {isVerifiedResult(result) ? <VerificationBadge compact /> : null}
                        </div>
                        <h2 className="mt-1 line-clamp-2 break-words font-bold leading-5 text-foreground">
                          {getSafeResultTitle(result)}
                        </h2>
                        {result.subtitle ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {result.subtitle}
                          </p>
                        ) : null}
                        {location ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {location}
                          </p>
                        ) : null}
                        {intentReasonByKey.get(getResultKey(result)) ? (
                          <p className="mt-2 text-xs font-semibold text-primary">
                            {intentReasonByKey.get(getResultKey(result))}
                          </p>
                        ) : null}
                      </div>
                      <ArrowUpRight aria-hidden="true" className="relative mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="relative mt-5 flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-border/80 bg-card/70 px-6 text-center shadow-[0_10px_30px_rgb(15_23_42/0.025)]">
                <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/[0.05] blur-3xl" />
                <Search className="size-10 text-muted-foreground/60" />
                <h2 className="mt-4 text-lg font-bold text-foreground">
                  No results found
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {isIntentOnlyBrowse && intent
                    ? getIntentEmptyCopy(intent)
                    : "Try another name, location, skill, organization, business, opportunity, or event."}
                </p>
                {isIntentOnlyBrowse ? (
                  <p className="mt-3 max-w-md text-xs leading-5 text-muted-foreground">
                    Add an optional keyword above to broaden or refine your discovery.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {!query && !intent ? (
          <section className="mt-8" aria-labelledby="search-start-heading">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Start with a goal
              </p>
              <h2
                id="search-start-heading"
                className="text-2xl font-bold tracking-[-0.025em] text-foreground"
              >
                Tell us what you are trying to do.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                You do not need to know where something lives in Afghan Hub.
                Choose a path and we will narrow the community for you.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {discoveryIntentCards.map((goal) => {
                const Icon = goal.icon;

                return (
                  <Link
                    key={goal.href}
                    href={goal.href}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-border/80 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_14px_34px_rgb(15_23_42/0.05)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -right-8 -top-8 size-24 rounded-full border border-primary/10"
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.07] text-primary">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </div>
                    <div className="relative mt-6">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-primary">
                        {goal.label}
                      </p>
                      <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-foreground">
                        {goal.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                  </Link>
                );
              })}

              <div className="relative overflow-hidden rounded-[1.5rem] border border-dashed border-border bg-muted/30 p-5">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-10 -right-10 size-28 rounded-full bg-primary/[0.05] blur-2xl"
                />
                <span className="relative flex size-11 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
                  <Search aria-hidden="true" className="size-5" />
                </span>
                <div className="relative mt-6">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Explore
                  </p>
                  <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-foreground">
                    Search anything
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Use the search box above for a person, skill, service, place,
                    organization, opportunity, or event.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
