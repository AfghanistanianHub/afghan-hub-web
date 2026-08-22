import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function getOrganizationName(
  organization: { name: string } | { name: string }[] | null,
) {
  return Array.isArray(organization)
    ? organization[0]?.name
    : organization?.name;
}

export default async function OpportunitiesPage() {
  const supabase = await createClient();

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      slug,
      summary,
      type,
      city,
      country,
      created_at,
      organization:organizations (
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Opportunities
          </h1>

          <p className="mt-2 text-slate-400">
            Jobs, internships, volunteering, grants and scholarships.
          </p>
        </div>

        <Link
          href="/opportunities/new"
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
        >
          Post Opportunity
        </Link>
      </div>

      <div className="mt-10 space-y-6">

        {opportunities?.length ? (

          opportunities.map((opportunity) => (

            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.slug}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-600"
            >
              <div className="inline-flex rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-400">
                {opportunity.type}
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

              <div className="mt-5 flex gap-6 text-sm text-slate-500">
                {opportunity.city && (
                  <span>{opportunity.city}</span>
                )}

                {opportunity.country && (
                  <span>{opportunity.country}</span>
                )}
              </div>

            </Link>

          ))

        ) : (

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">

            <h2 className="text-2xl font-semibold">
              No opportunities yet
            </h2>

            <p className="mt-3 text-slate-400">
              The first opportunities will appear here.
            </p>

          </div>

        )}

      </div>
    </main>
  );
}
