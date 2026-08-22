import { DeleteOpportunityButton } from "@/components/opportunities/delete-opportunity-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OpportunityPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !opportunity) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">

        <div className="mb-4 inline-flex rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-400">
          {opportunity.type}
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-4xl font-bold">
            {opportunity.title}
          </h1>

          {user?.id === opportunity.author_id ? (
            <div className="flex shrink-0 gap-3">
              <Link
                href={`/opportunities/${opportunity.slug}/edit`}
                className="rounded-lg border border-slate-700 px-4 py-2 font-semibold hover:bg-slate-800"
              >
                Edit
              </Link>

              <DeleteOpportunityButton
                slug={opportunity.slug}
              />
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-lg text-slate-300">
          {opportunity.summary}
        </p>

        <div className="mt-8 whitespace-pre-wrap leading-8 text-slate-200">
          {opportunity.description}
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 space-y-2 text-slate-400">

          {opportunity.city && (
            <p>
              <strong>City:</strong> {opportunity.city}
            </p>
          )}

          {opportunity.country && (
            <p>
              <strong>Country:</strong> {opportunity.country}
            </p>
          )}

          {opportunity.deadline && (
            <p>
              <strong>Deadline:</strong>{" "}
              {new Date(opportunity.deadline).toLocaleDateString()}
            </p>
          )}

          {opportunity.contact_email && (
            <p>
              <strong>Email:</strong> {opportunity.contact_email}
            </p>
          )}

          {opportunity.external_url && (
            <p>
              <a
                href={opportunity.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Apply Here
              </a>
            </p>
          )}

        </div>
      </div>
    </main>
  );
}
