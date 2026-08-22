import Link from "next/link";

import { BusinessDirectory } from "@/components/businesses/business-directory";
import { createClient } from "@/lib/supabase/server";

export default async function BusinessesPage() {
  const supabase = await createClient();

  const { data: businesses, error } = await supabase
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

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load businesses: {error.message}
          </div>
        ) : (
          <BusinessDirectory businesses={businesses ?? []} />
        )}
      </div>
    </main>
  );
}
