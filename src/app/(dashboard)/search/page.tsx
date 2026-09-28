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
import { createClient } from "@/lib/supabase/server";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
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

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const supabase = await createClient();

  const { data, error } =
    query.length >= 2
      ? await supabase.rpc("search_afghan_hub", {
          search_query: query,
          result_limit: 30,
        })
      : { data: [], error: null };

  const rawResults = ((data ?? []) as SearchResult[]).filter(
    (result) => getResultHref(result) !== null,
  );
  const memberIds = rawResults
    .filter(isMemberResult)
    .map((result) => result.entity_id);
  const opportunityIds = rawResults
    .filter((result) => result.entity_type === "opportunity")
    .map((result) => result.entity_id);
  const eventIds = rawResults
    .filter((result) => result.entity_type === "event")
    .map((result) => result.entity_id);
  const [
    { data: visibleMembers },
    { data: visibleOpportunities },
    { data: visibleEvents },
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
          .select("id,deadline")
          .in("id", opportunityIds)
          .eq("status", "published")
      : Promise.resolve({
          data: [] as { id: string; deadline: string | null }[],
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
  const results = rawResults.filter((result) => {
    if (isMemberResult(result)) {
      return visibleMemberIds.has(result.entity_id);
    }

    if (result.entity_type === "opportunity") {
      return visibleOpportunityIds.has(result.entity_id);
    }

    if (result.entity_type === "event") {
      return visibleEventIds.has(result.entity_id);
    }

    return true;
  });

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
            <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Search</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Find people, services, organizations, opportunities, and events across the community.</p>
          </div>
        </section>

        <form action="/search" role="search" className="relative mt-8 rounded-[1.75rem] border border-border/80 bg-card/88 p-2 shadow-[0_12px_38px_rgb(15_23_42/0.035)] backdrop-blur">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            required
            minLength={2}
            defaultValue={query}
            placeholder="Search members, businesses, organizations, opportunities, or events"
            aria-label="Search Afghan Hub"
            className="w-full rounded-2xl border border-transparent bg-background/70 py-4 pl-12 pr-28 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/30 focus:bg-background focus:ring-4 focus:ring-primary/10"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-[calc(50%+1px)] hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Search
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

        {!error && query.length >= 2 ? (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"}
              {` for “${query}”`}
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
                      className="surface-panel group relative overflow-hidden flex items-start gap-4 rounded-[1.5rem] p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_36px_rgb(15_23_42/0.06)]"
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
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {getTypeLabel(result.entity_type)}
                        </span>
                        <h2 className="mt-1 truncate font-bold text-foreground">
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
                      </div>
                      <ArrowUpRight aria-hidden="true" className="relative mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 px-6 text-center">
                <Search className="size-10 text-muted-foreground/60" />
                <h2 className="mt-4 text-lg font-bold text-foreground">
                  No results found
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Try another name, location, skill, organization, business,
                  opportunity, or event.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {!query ? (
          <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 px-6 text-center">
            <Search className="size-10 text-muted-foreground/60" />
            <h2 className="mt-4 text-lg font-bold text-foreground">
              Search the community
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Find people, services, organizations, opportunities, and events
              across Afghan Hub.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
