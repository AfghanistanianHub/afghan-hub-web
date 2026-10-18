import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Search } from "lucide-react";
import {
  formatOpportunityDeadline,
  getUtcDateKey,
} from "@/lib/opportunities";
import { createClient } from "@/lib/supabase/server";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import {
  catalogClearClass,
  catalogFieldClass,
  catalogFilterPanelClass,
  catalogPageContainerClass,
  catalogSubmitClass,
} from "@/components/catalog/catalog-filter-styles";

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
    <main data-illustration-focus-scope className={catalogPageContainerClass}>
      <MemberPageHeader title="Opportunities" description="Find jobs, volunteering, scholarships, mentorship and community opportunities." icon={BriefcaseBusiness}><Link href="/opportunities/new" className={catalogSubmitClass}>Post opportunity</Link></MemberPageHeader>

      <form
        action="/opportunities"
        method="get"
        className={`${catalogFilterPanelClass} md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]`}
      >
        <label className="grid gap-2 text-sm font-medium text-foreground">
          <span className="inline-flex items-center gap-2"><Search aria-hidden="true" className="size-4 text-primary" /> Search opportunities</span>
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by title"
            className={catalogFieldClass}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Type
          <select name="type" defaultValue={type} className={catalogFieldClass}>
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
          <select name="format" defaultValue={format} className={catalogFieldClass}>
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
            className={catalogFieldClass}
          />
        </label>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className={catalogSubmitClass}
          >
            Apply
          </button>

          {hasFilters ? (
            <Link
              href="/opportunities"
              className={catalogClearClass}
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

      {/* The bordered card wraps results only; the empty state keeps the page's shared panel rhythm. */}
      <div className={opportunities?.length ? "mt-4 divide-y divide-border border-y border-border bg-card" : "mt-4"}>
        {error ? (
          <div role="alert" aria-live="assertive" className="relative overflow-hidden rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.05] p-8 text-center"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-destructive/[0.06] blur-3xl"/>
            <h2 className="text-xl font-semibold text-destructive">We could not load opportunities</h2>
            <p className="mt-2 text-sm text-destructive/80">Please try again in a moment.</p>
          </div>
        ) : opportunities?.length ? (
          opportunities.map((opportunity) => (
            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.slug}`}
              className="group block px-4 py-5 transition hover:bg-muted/40 focus-visible:relative focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
            >
              <div className="relative flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {formatType(opportunity.type)}
                </span>
                <span className="inline-flex rounded-full border border-border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
                  {opportunity.is_remote ? "Remote" : "In person"}
                </span>
              </div>

              <div className="relative mt-3 flex items-start justify-between gap-4">
                <h2 className="break-words text-xl font-semibold tracking-tight text-foreground transition group-hover:text-primary md:text-2xl">
                  {opportunity.title}
                </h2>
                <ArrowUpRight aria-hidden="true" data-profile-arrow className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </div>

              {opportunity.organization ? (
                <p className="relative mt-2 text-sm font-medium text-primary">Posted by {getOrganizationName(opportunity.organization)}</p>
              ) : (
                <p className="relative mt-2 text-sm text-muted-foreground">Personal opportunity</p>
              )}

              <p className="relative mt-3 line-clamp-3 break-words text-sm leading-7 text-muted-foreground md:text-base">{opportunity.summary}</p>

              <div className="relative mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {opportunity.city ? <span>{opportunity.city}</span> : null}
                {opportunity.country ? <span>{opportunity.country}</span> : null}
                {opportunity.deadline ? <span>Deadline {formatOpportunityDeadline(opportunity.deadline)}</span> : null}
              </div>
            </Link>
          ))
        ) : (
          <DirectoryEmptyState title={hasFilters ? "No opportunities match these filters" : "No opportunities yet"} description={hasFilters ? "Try adjusting or clearing your filters." : "Published opportunities will appear here."} href={hasFilters ? "/opportunities" : "/opportunities/new"} action={hasFilters ? "Clear filters" : "Post opportunity"} />
        )}
      </div>
    </main>
  );
}
