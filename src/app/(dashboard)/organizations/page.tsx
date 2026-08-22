import Link from "next/link";
import { OrganizationDirectory } from "@/components/organizations/organization-directory";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationsPage() {
  const supabase = await createClient();

  const { data: organizations, error } = await supabase
    .from("organizations")
    .select(
      `
        id,
        name,
        slug,
        short_description,
        organization_type,
        city,
        province_state,
        country,
        logo_url,
        is_verified
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
              Community organizations
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Discover organizations
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Explore Afghan-led nonprofits, associations, cultural groups,
              community initiatives, and professional organizations.
            </p>
          </div>

          <Link
            href="/organizations/new"
            className="inline-flex w-fit rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Add organization
          </Link>
        </section>

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load organizations: {error.message}
          </div>
        ) : (
          <OrganizationDirectory organizations={organizations ?? []} />
        )}
      </div>
    </main>
  );
}
