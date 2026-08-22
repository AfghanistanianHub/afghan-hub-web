import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeadlinePicker } from "@/components/ui/deadline-picker";
import { createClient } from "@/lib/supabase/server";
import { updateOpportunity } from "../../actions";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditOpportunityPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!opportunity) {
    notFound();
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div>
        <h1 className="text-4xl font-bold">
          Edit Opportunity
        </h1>

        <p className="mt-2 text-slate-400">
          Update the opportunity information below.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
          {error}
        </div>
      ) : null}

      <form
        action={updateOpportunity}
        className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
      >
        <input
          type="hidden"
          name="original_slug"
          value={opportunity.slug}
        />

        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={opportunity.title}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="organization_id"
            className="block text-sm font-medium"
          >
            Posted by
          </label>
          <select
            id="organization_id"
            name="organization_id"
            defaultValue={opportunity.organization_id ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="">Personal / No organization</option>

            {organizations?.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium">
            Opportunity type
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={opportunity.type}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="job">Job</option>
            <option value="volunteer">Volunteer</option>
            <option value="scholarship">Scholarship</option>
            <option value="mentorship">Mentorship</option>
            <option value="investment">Investment</option>
            <option value="housing">Housing</option>
            <option value="event">Event</option>
            <option value="education">Education</option>
          </select>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium">
            Short summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            required
            defaultValue={opportunity.summary ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium"
          >
            Full description
          </label>
          <textarea
            id="description"
            name="description"
            rows={8}
            required
            defaultValue={opportunity.description}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={opportunity.city ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="province_state"
              className="block text-sm font-medium"
            >
              Province or state
            </label>
            <input
              id="province_state"
              name="province_state"
              type="text"
              defaultValue={opportunity.province_state ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium">
            Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            defaultValue={opportunity.country ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            name="is_remote"
            type="checkbox"
            defaultChecked={opportunity.is_remote}
            className="h-4 w-4 rounded border-slate-700 bg-slate-950"
          />
          <span>Remote opportunity</span>
        </label>

        <div>
          <label
            htmlFor="external_url"
            className="block text-sm font-medium"
          >
            Application or external link
          </label>
          <input
            id="external_url"
            name="external_url"
            type="url"
            defaultValue={opportunity.external_url ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="contact_email"
            className="block text-sm font-medium"
          >
            Contact email
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={opportunity.contact_email ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Deadline
          </label>
          <div className="mt-2">
            <DeadlinePicker
              defaultValue={opportunity.deadline}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
          >
            Save Changes
          </button>

          <Link
            href={`/opportunities/${opportunity.slug}`}
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
