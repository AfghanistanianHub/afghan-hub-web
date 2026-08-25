import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Search,
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
  const opportunityIds = rawResults
    .filter((result) => result.entity_type === "opportunity")
    .map((result) => result.entity_id);
  const eventIds = rawResults
    .filter((result) => result.entity_type === "event")
    .map((result) => result.entity_id);
  const [{ data: visibleOpportunities }, { data: visibleEvents }] =
    await Promise.all([
      opportunityIds.length > 0
        ? supabase
            .from("opportunities")
            .select("id")
            .in("id", opportunityIds)
            .eq("status", "published")
        : Promise.resolve({ data: [] as { id: string }[] }),
      eventIds.length > 0
        ? supabase
            .from("events")
            .select("id")
            .in("id", eventIds)
            .eq("status", "published")
        : Promise.resolve({ data: [] as { id: string }[] }),
    ]);
  const visibleOpportunityIds = new Set(
    (visibleOpportunities ?? []).map((item) => item.id),
  );
  const visibleEventIds = new Set(
    (visibleEvents ?? []).map((item) => item.id),
  );
  const results = rawResults.filter((result) => {
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Discover Afghan Hub
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Search
        </h1>

        <form action="/search" role="search" className="relative mt-8">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
          <input
            name="q"
            type="search"
            required
            minLength={2}
            defaultValue={query}
            placeholder="Search members, businesses, organizations, opportunities, or events"
            aria-label="Search Afghan Hub"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-28 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Search
          </button>
        </form>

        {query && query.length < 2 ? (
          <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            Enter at least two characters to search.
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not complete your search. Please try again.
          </div>
        ) : null}

        {!error && query.length >= 2 ? (
          <div className="mt-8">
            <p className="text-sm text-slate-400">
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
                      className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/50"
                    >
                      {result.image_url ? (
                        <ExternalImage
                          src={result.image_url}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                          <Icon className="size-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                          {getTypeLabel(result.entity_type)}
                        </span>
                        <h2 className="mt-1 truncate font-bold text-white">
                          {result.title}
                        </h2>
                        {result.subtitle ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                            {result.subtitle}
                          </p>
                        ) : null}
                        {location ? (
                          <p className="mt-2 text-xs text-slate-500">
                            {location}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 text-center">
                <Search className="size-10 text-slate-600" />
                <h2 className="mt-4 text-lg font-bold text-white">
                  No results found
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try another name, location, skill, organization, business,
                  opportunity, or event.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {!query ? (
          <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 text-center">
            <Search className="size-10 text-slate-600" />
            <h2 className="mt-4 text-lg font-bold text-white">
              Search the community
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Find people, services, organizations, opportunities, and events
              across Afghan Hub.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
