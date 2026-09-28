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

  const fieldClassName =
    "mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <Link
        href={`/opportunities/${opportunity.slug}`}
        className="rounded-sm text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        ← Back to opportunity
      </Link>

      <section className="relative mt-5 overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/45 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Opportunity editor</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Edit opportunity</h1>
          <p className="mt-3 text-muted-foreground">Update the opportunity information below.</p>
          <p className="mt-4 inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-sm font-medium text-primary">
            Saving changes submits this opportunity for moderator review.
          </p>
        </div>
      </section>

      {error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form action={updateOpportunity} className="surface-panel mt-8 space-y-8 rounded-[2rem] p-6 md:p-8">
        <input type="hidden" name="original_slug" value={opportunity.slug} />

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-foreground">Title</label>
          <input id="title" name="title" type="text" required defaultValue={opportunity.title} className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="organization_id" className="block text-sm font-semibold text-foreground">Posted by</label>
          <select id="organization_id" name="organization_id" defaultValue={opportunity.organization_id ?? ""} className={fieldClassName}>
            <option value="">Personal / No organization</option>
            {organizations?.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-foreground">Opportunity type</label>
          <select id="type" name="type" required defaultValue={opportunity.type} className={fieldClassName}>
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
          <label htmlFor="summary" className="block text-sm font-semibold text-foreground">Short summary</label>
          <textarea id="summary" name="summary" rows={3} required defaultValue={opportunity.summary ?? ""} className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-foreground">Full description</label>
          <textarea id="description" name="description" rows={8} required defaultValue={opportunity.description} className={fieldClassName} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-foreground">City</label>
            <input id="city" name="city" type="text" defaultValue={opportunity.city ?? ""} className={fieldClassName} />
          </div>
          <div>
            <label htmlFor="province_state" className="block text-sm font-semibold text-foreground">Province or state</label>
            <input id="province_state" name="province_state" type="text" defaultValue={opportunity.province_state ?? ""} className={fieldClassName} />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-semibold text-foreground">Country</label>
          <input id="country" name="country" type="text" defaultValue={opportunity.country ?? ""} className={fieldClassName} />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/80 bg-secondary/40 px-4 py-3 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
          <input name="is_remote" type="checkbox" defaultChecked={opportunity.is_remote} className="size-5 shrink-0 rounded border-border accent-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
          <span className="text-sm font-medium text-foreground">Remote opportunity</span>
        </label>

        <div>
          <label htmlFor="external_url" className="block text-sm font-semibold text-foreground">Application or external link</label>
          <input id="external_url" name="external_url" type="url" defaultValue={opportunity.external_url ?? ""} className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-semibold text-foreground">Contact email</label>
          <input id="contact_email" name="contact_email" type="email" defaultValue={opportunity.contact_email ?? ""} className={fieldClassName} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground">Deadline</label>
          <div className="mt-2"><DeadlinePicker defaultValue={opportunity.deadline} /></div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_16%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            Save and submit for review
          </button>
          <Link href={`/opportunities/${opportunity.slug}`} className="rounded-2xl border border-border/80 bg-background px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
