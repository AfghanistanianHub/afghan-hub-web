import Link from "next/link";
import { createOrganization } from "../actions";

type NewOrganizationPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewOrganizationPage({
  searchParams,
}: NewOrganizationPageProps) {
  const { error } = await searchParams;
  const fieldClassName =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/organizations" className="rounded-sm text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          ← Back to organizations
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/45 blur-3xl" />
          <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Create an organization</p>
          <h1 className="mt-3 break-words text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Add your organization</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Create a public page for your nonprofit, association, cultural group, professional network, or community initiative.
          </p>
          </div>
        </section>

        {error ? (
          <div role="alert" aria-live="assertive" className="mt-8 rounded-xl border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive">{error}</div>
        ) : null}

        <form action={createOrganization} className="surface-panel mt-8 space-y-8 rounded-[2rem] p-6 md:p-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Basic information</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-foreground">Organization name *</span>
                <input required name="name" type="text" placeholder="Afghan Community Association" className={fieldClassName} />
              </label>

              <label>
                <span className="text-sm font-medium text-foreground">Organization type</span>
                <select name="organization_type" className={fieldClassName}>
                  <option value="">Select a type</option>
                  <option value="Nonprofit">Nonprofit</option>
                  <option value="Community organization">Community organization</option>
                  <option value="Professional association">Professional association</option>
                  <option value="Cultural organization">Cultural organization</option>
                  <option value="Student organization">Student organization</option>
                  <option value="Charity">Charity</option>
                  <option value="Media organization">Media organization</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                <span className="text-sm font-medium text-foreground">Website</span>
                <input name="website_url" type="url" placeholder="https://example.org" className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-foreground">Short description</span>
                <input name="short_description" type="text" maxLength={220} placeholder="A short summary of what your organization does." className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-foreground">Full description</span>
                <textarea name="description" rows={6} placeholder="Tell the community about your organization, history, work, and impact." className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-foreground">Mission</span>
                <textarea name="mission" rows={4} placeholder="What is your organization's mission?" className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-foreground">Programs</span>
                <input name="programs" type="text" placeholder="Education, Mentorship, Settlement support" className={fieldClassName} />
                <span className="mt-2 block text-xs text-muted-foreground">Separate each program with a comma.</span>
              </label>

              <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-border/80 bg-muted/35 p-4">
                <input
                  name="is_accepting_volunteers"
                  type="checkbox"
                  className="mt-1 size-4 rounded border-input text-primary focus:ring-primary"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Accepting volunteers</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    This helps people discover this organization when looking for volunteer opportunities.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground">Contact information</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-foreground">Email</span>
                <input name="email" type="email" placeholder="hello@example.org" className={fieldClassName} />
              </label>
              <label>
                <span className="text-sm font-medium text-foreground">Phone</span>
                <input name="phone" type="tel" placeholder="+1 604 000 0000" className={fieldClassName} />
              </label>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground">Location</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <label>
                <span className="text-sm font-medium text-foreground">City</span>
                <input name="city" type="text" placeholder="Vancouver" className={fieldClassName} />
              </label>
              <label>
                <span className="text-sm font-medium text-foreground">Province / State</span>
                <input name="province_state" type="text" placeholder="British Columbia" className={fieldClassName} />
              </label>
              <label>
                <span className="text-sm font-medium text-foreground">Country</span>
                <input name="country" type="text" placeholder="Canada" className={fieldClassName} />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Link href="/organizations" className="rounded-2xl border border-border/80 bg-background px-5 py-3 text-center font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Cancel</Link>
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_16%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Create organization</button>
          </div>
        </form>
      </div>
    </main>
  );
}
