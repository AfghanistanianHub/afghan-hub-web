import { redirect } from "next/navigation";
import { DeadlinePicker } from "@/components/ui/deadline-picker";
import { createClient } from "@/lib/supabase/server";
import { createOpportunity } from "../actions";

export default async function NewOpportunityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div>
        <h1 className="text-4xl font-bold">Post an Opportunity</h1>
        <p className="mt-2 text-slate-400">
          Share a job, scholarship, volunteer role, mentorship, or another opportunity.
        </p>
      </div>

      <form
        action={createOpportunity}
        className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
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
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="">Select a type</option>
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
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Full description
          </label>
          <textarea
            id="description"
            name="description"
            rows={8}
            required
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
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            name="is_remote"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-700 bg-slate-950"
          />
          <span>Remote opportunity</span>
        </label>

        <div>
          <label htmlFor="external_url" className="block text-sm font-medium">
            Application or external link
          </label>
          <input
            id="external_url"
            name="external_url"
            type="url"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium">
            Contact email
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium">
            Deadline
          </label>
          <div className="mt-2">
            <DeadlinePicker />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
        >
          Submit for Review
        </button>
      </form>
    </main>
  );
}
