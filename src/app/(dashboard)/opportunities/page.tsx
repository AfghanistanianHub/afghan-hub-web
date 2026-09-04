import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    format?: string | string[];
    city?: string | string[];
  }>;
};

const OPPORTUNITY_TYPES = [
  "job",
  "volunteer",
  "scholarship",
  "mentorship",
  "investment",
  "housing",
  "event",
  "education",
] as const;

function getOrganizationName(
  organization: { name: string } | { name: string }[] | null,
) {
  return Array.isArray(organization)
    ? organization[0]?.name
    : organization?.name;
}

function getSearchValue(value: string | string[] | undefined, maxLength = 100) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function formatType(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function OpportunitiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = getSearchValue(params.q);
  const city = getSearchValue(params.city, 80);
  const requestedType = getSearchValue(params.type, 30);
  const type = OPPORTUNITY_TYPES.includes(
    requestedType as (typeof OPPORTUNITY_TYPES)[number],
  )
    ? requestedType
    : "all";
  const requestedFormat = getSearchValue(params.format, 20);
  const format =
    requestedFormat === "remote" || requestedFormat === "in-person"
      ? requestedFormat
      : "all";

  const supabase = await createClient();

  let opportunitiesQuery = supabase
    .from("opportunities")
    .select(`
      id,
      title,
      slug,
      summary,
      type,
      city,
      country,
      is_remote,
      deadline,
      created_at,
      organization:organizations (
        name,
        slug
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (search) {
    opportunitiesQuery = opportunitiesQuery.ilike(
      "title",
      `%${escapeLikePattern(search)}%`,
    );
  }

  if (city) {
    opportunitiesQuery = opportunitiesQuery.ilike(
      "city",
      `%${escapeLikePattern(city)}%`,
    );
  }

  if (type !== "all") {
    opportunitiesQuery = opportunitiesQuery.eq(
      "type",
      type as (typeof OPPORTUNITY_TYPES)[number],
    );
  }

  if (format !== "all") {
    opportunitiesQuery = opportunitiesQuery.eq(
      "is_remote",
      format === "remote",
    );
  }

  const { data: opportunities, error } = await opportunitiesQuery;
  const hasFilters = Boolean(
    search || city || type !== "all" || format !== "all",
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-4xl font-bold">Opportunities</h1>

          <p className="mt-2 text-slate-400">
            Jobs, volunteering, scholarships, mentorship and community opportunities.
          </p>
        </div>

        <Link
          href="/opportunities/new"
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
        >
          Post Opportunity
        </Link>
      </div>

      <form
        action="/opportunities"
        method="get"
        className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Search opportunities
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by title"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Type
          <select
            name="type"
            defaultValue={type}
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          >
            <option value="all">All types</option>
            {OPPORTUNITY_TYPES.map((opportunityType) => (
              <option key={opportunityType} value={opportunityType}>
                {formatType(opportunityType)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Format
          <select
            name="format"
            defaultValue={format}
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          >
            <option value="all">All formats</option>
            <option value="remote">Remote</option>
            <option value="in-person">In person</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          City
          <input
            type="search"
            name="city"
            defaultValue={city}
            placeholder="Any city"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />
        </label>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Apply
          </button>

          {hasFilters ? (
            <Link
              href="/opportunities"
              className="rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          {error
            ? "Opportunities could not be loaded."
            : `${opportunities?.length ?? 0} ${
                opportunities?.length === 1
                  ? "opportunity"
                  : "opportunities"
              } found`}
        </p>

        {hasFilters ? (
          <p className="text-xs text-slate-500">
            Filters are reflected in the URL, so this view can be shared.
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
            <h2 className="text-xl font-semibold text-red-200">
              We could not load opportunities
            </h2>
            <p className="mt-2 text-sm text-red-200/70">
              Please try again in a moment.
            </p>
          </div>
        ) : opportunities?.length ? (
          opportunities.map((opportunity) => (
            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.slug}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-600"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-400">
                  {formatType(opportunity.type)}
                </span>
                <span className="inline-flex rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400">
                  {opportunity.is_remote ? "Remote" : "In person"}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold">
                {opportunity.title}
              </h2>

              {opportunity.organization ? (
                <p className="mt-2 text-sm text-emerald-400">
                  Posted by {getOrganizationName(opportunity.organization)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Personal opportunity
                </p>
              )}

              <p className="mt-3 text-slate-400">
                {opportunity.summary}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {opportunity.city ? <span>{opportunity.city}</span> : null}
                {opportunity.country ? <span>{opportunity.country}</span> : null}
                {opportunity.deadline ? (
                  <span>
                    Deadline{" "}
                    {new Intl.DateTimeFormat("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(opportunity.deadline))}
                  </span>
                ) : null}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-2xl font-semibold">
              {hasFilters
                ? "No opportunities match these filters"
                : "No opportunities yet"}
            </h2>

            <p className="mt-3 text-slate-400">
              {hasFilters
                ? "Try adjusting or clearing your filters."
                : "The first opportunities will appear here."}
            </p>

            {hasFilters ? (
              <Link
                href="/opportunities"
                className="mt-5 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
