import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Search } from "lucide-react";
import {
  formatOpportunityDeadline,
  getUtcDateKey,
} from "@/lib/opportunities";
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

const fieldClassName =
  "rounded-2xl border border-border bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/10";

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
  const today = getUtcDateKey(new Date());

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
    .or(`deadline.is.null,deadline.gte.${today}`)
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
    opportunitiesQuery = opportunitiesQuery.eq("is_remote", format === "remote");
  }

  const { data: opportunities, error } = await opportunitiesQuery;
  const hasFilters = Boolean(search || city || type !== "all" || format !== "all");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/50 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <BriefcaseBusiness aria-hidden="true" className="size-3.5" />
            Opportunity board
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Opportunities</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Discover jobs, volunteering, scholarships, mentorship, education, investment, and community opportunities.
          </p>
        </div>

        <Link
          href="/opportunities/new"
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_18%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/92"
        >
          Post opportunity
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
        </div>
      </section>

      <form
        action="/opportunities"
        method="get"
        className="mt-8 grid gap-4 rounded-[1.75rem] border border-border/80 bg-card/88 p-5 shadow-[0_12px_38px_rgb(15_23_42/0.035)] backdrop-blur md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <label className="grid gap-2 text-sm font-medium text-foreground">
          <span className="inline-flex items-center gap-2"><Search aria-hidden="true" className="size-4 text-primary" /> Search opportunities</span>
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by title"
            className={fieldClassName}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Type
          <select name="type" defaultValue={type} className={fieldClassName}>
            <option value="all">All types</option>
            {OPPORTUNITY_TYPES.map((opportunityType) => (
              <option key={opportunityType} value={opportunityType}>
                {formatType(opportunityType)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Format
          <select name="format" defaultValue={format} className={fieldClassName}>
            <option value="all">All formats</option>
            <option value="remote">Remote</option>
            <option value="in-person">In person</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          City
          <input
            type="search"
            name="city"
            defaultValue={city}
            placeholder="Any city"
            className={fieldClassName}
          />
        </label>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Apply
          </button>

          {hasFilters ? (
            <Link
              href="/opportunities"
              className="rounded-2xl border border-border bg-card px-4 py-3 font-semibold text-foreground transition hover:bg-accent"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {error
            ? "Opportunities could not be loaded."
            : `${opportunities?.length ?? 0} ${opportunities?.length === 1 ? "opportunity" : "opportunities"} found`}
        </p>

        {hasFilters ? (
          <p className="text-xs text-muted-foreground">Filters are reflected in the URL, so this view can be shared.</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-red-700">We could not load opportunities</h2>
            <p className="mt-2 text-sm text-red-600">Please try again in a moment.</p>
          </div>
        ) : opportunities?.length ? (
          opportunities.map((opportunity) => (
            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.slug}`}
              className="group relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)] transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_42px_rgb(15_23_42/0.07)]"
            >
              <div aria-hidden="true" className="absolute -right-10 -top-10 size-28 rounded-full border border-primary/10" />
              <div className="relative flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {formatType(opportunity.type)}
                </span>
                <span className="inline-flex rounded-full border border-border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
                  {opportunity.is_remote ? "Remote" : "In person"}
                </span>
              </div>

              <div className="relative mt-5 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-tight text-foreground transition group-hover:text-primary md:text-2xl">
                  {opportunity.title}
                </h2>
                <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              {opportunity.organization ? (
                <p className="relative mt-2 text-sm font-medium text-primary">Posted by {getOrganizationName(opportunity.organization)}</p>
              ) : (
                <p className="relative mt-2 text-sm text-muted-foreground">Personal opportunity</p>
              )}

              <p className="relative mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground md:text-base">{opportunity.summary}</p>

              <div className="relative mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                {opportunity.city ? <span>{opportunity.city}</span> : null}
                {opportunity.country ? <span>{opportunity.country}</span> : null}
                {opportunity.deadline ? <span>Deadline {formatOpportunityDeadline(opportunity.deadline)}</span> : null}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">
              {hasFilters ? "No opportunities match these filters" : "No opportunities yet"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {hasFilters ? "Try adjusting or clearing your filters." : "The first opportunities will appear here."}
            </p>

            {hasFilters ? (
              <Link
                href="/opportunities"
                className="mt-5 inline-flex rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
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
