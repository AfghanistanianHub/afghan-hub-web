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

  const fieldClassName =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Create an opportunity</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">Post an Opportunity</h1>
        <p className="mt-3 text-muted-foreground">
          Share a job, scholarship, volunteer role, mentorship, or another opportunity.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
          Your submission will be reviewed before it appears publicly.
        </p>
      </div>

      <form action={createOpportunity} className="surface-panel mt-10 space-y-6 rounded-3xl p-6 md:p-8">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground">Title</label>
          <input id="title" name="title" type="text" required className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="organization_id" className="block text-sm font-medium text-foreground">Posted by</label>
          <select id="organization_id" name="organization_id" className={fieldClassName}>
            <option value="">Personal / No organization</option>
            {organizations?.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-foreground">Opportunity type</label>
          <select id="type" name="type" required className={fieldClassName}>
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
          <label htmlFor="summary" className="block text-sm font-medium text-foreground">Short summary</label>
          <textarea id="summary" name="summary" rows={3} required className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground">Full description</label>
          <textarea id="description" name="description" rows={8} required className={fieldClassName} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground">City</label>
            <input id="city" name="city" type="text" className={fieldClassName} />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-foreground">Country</label>
            <input id="country" name="country" type="text" className={fieldClassName} />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <input name="is_remote" type="checkbox" className="size-4 rounded border-input accent-primary" />
          <span className="text-sm font-medium text-foreground">Remote opportunity</span>
        </label>

        <div>
          <label htmlFor="external_url" className="block text-sm font-medium text-foreground">Application or external link</label>
          <input id="external_url" name="external_url" type="url" className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-foreground">Contact email</label>
          <input id="contact_email" name="contact_email" type="email" className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-foreground">Deadline</label>
          <div className="mt-2"><DeadlinePicker /></div>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <button type="submit" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90">
            Submit for Review
          </button>
        </div>
      </form>
    </main>
  );
}
