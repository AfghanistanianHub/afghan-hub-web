import Link from "next/link";

import { BusinessDirectory } from "@/components/businesses/business-directory";
import { createClient } from "@/lib/supabase/server";

type BusinessesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    city?: string | string[];
    hiring?: string | string[];
    verified?: string | string[];
  }>;
};

function getSearchValue(
  value: string | string[] | undefined,
  maxLength = 100,
) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default async function BusinessesPage({
  searchParams,
}: BusinessesPageProps) {
  const params = await searchParams;
  const search = getSearchValue(params.q);
  const category = getSearchValue(params.category, 80);
  const city = getSearchValue(params.city, 80);
  const hiring = getSearchValue(params.hiring, 20) === "only";
  const verified = getSearchValue(params.verified, 20) === "only";

  const supabase = await createClient();

  let businessesQuery = supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        category,
        short_description,
        city,
        province_state,
        country,
        services,
        logo_url,
        is_verified,
        is_hiring
      `,
    )
    .eq("status", "published")
    .order("name", { ascending: true });

  if (search) {
    businessesQuery = businessesQuery.ilike(
      "name",
      `%${escapeLikePattern(search)}%`,
    );
  }

  if (category) {
    businessesQuery = businessesQuery.ilike(
      "category",
      `%${escapeLikePattern(category)}%`,
    );
  }

  if (city) {
    businessesQuery = businessesQuery.ilike(
      "city",
      `%${escapeLikePattern(city)}%`,
    );
  }

  if (hiring) {
    businessesQuery = businessesQuery.eq("is_hiring", true);
  }

  if (verified) {
    businessesQuery = businessesQuery.eq("is_verified", true);
  }

  const { data: businesses, error } = await businessesQuery;
  const hasFilters = Boolean(search || category || city || hiring || verified);

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Community businesses
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Discover businesses
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Support Afghan-owned businesses, services, and entrepreneurs in
              the community.
            </p>
          </div>

          <Link
            href="/businesses/new"
            className="inline-flex w-fit rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Create business
          </Link>
        </section>

        <form
          action="/businesses"
          method="get"
          className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]"
        >
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Search businesses
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Business name"
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Category
            <input
              type="search"
              name="category"
              defaultValue={category}
              placeholder="Any category"
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
            />
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

          <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-300">
            <input
              type="checkbox"
              name="hiring"
              value="only"
              defaultChecked={hiring}
              className="size-4 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            Hiring now
          </label>

          <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-300">
            <input
              type="checkbox"
              name="verified"
              value="only"
              defaultChecked={verified}
              className="size-4 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            Verified
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
                href="/businesses"
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
              ? "Businesses could not be loaded."
              : `${businesses?.length ?? 0} ${
                  businesses?.length === 1 ? "business" : "businesses"
                } found`}
          </p>

          {hasFilters ? (
            <p className="text-xs text-slate-500">
              Filters are reflected in the URL, so this view can be shared.
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load businesses: {error.message}
          </div>
        ) : businesses?.length ? (
          <BusinessDirectory businesses={businesses} />
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
            <h2 className="text-xl font-semibold">
              {hasFilters
                ? "No businesses match these filters"
                : "No businesses yet"}
            </h2>
            <p className="mt-2 text-slate-400">
              {hasFilters
                ? "Try adjusting or clearing your filters."
                : "Community businesses will appear here once they are added."}
            </p>
            {hasFilters ? (
              <Link
                href="/businesses"
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
