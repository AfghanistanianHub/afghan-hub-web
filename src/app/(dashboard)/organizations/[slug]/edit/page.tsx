import formStyles from "@/components/forms/listing-form.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrganizationLogoUpload } from "@/components/organizations/organization-logo-upload";
import { createClient } from "@/lib/supabase/server";
import { updateOrganization } from "../../actions";

type EditOrganizationPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditOrganizationPage({
  params,
  searchParams,
}: EditOrganizationPageProps) {
  const { slug } = await params;
  const { error: formError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: organization, error } = await supabase
    .from("organizations")
    .select(
      `
        id,
        name,
        slug,
        short_description,
        description,
        organization_type,
        mission,
        programs,
        website_url,
        email,
        phone,
        city,
        province_state,
        country,
        logo_url,
        cover_url,
        is_accepting_volunteers,
        owner_id
      `,
    )
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !organization) {
    notFound();
  }

  const fieldClassName =
    "mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

  return (
    <main className={`${formStyles.page} px-4 py-8 md:px-8`}>
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/organizations/${organization.slug}`}
          className="rounded-sm text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          ← Back to organization
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8 md:px-8 md:py-10">
          
          
          <CommunitySignature className={formStyles.signature} /><div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Organization settings</p>
            <h1 className="mt-3 break-words text-3xl font-medium tracking-[-0.035em] text-foreground md:text-4xl">Edit {organization.name}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Keep your organization profile current and useful to the community.</p>
          </div>
        </section>

        {formError ? (
          <div role="alert" aria-live="assertive" className="mt-8 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive">
            {formError}
          </div>
        ) : null}

        <div className="mt-8">
          <OrganizationLogoUpload
            organizationId={organization.id}
            organizationName={organization.name}
            userId={user.id}
            currentLogoUrl={organization.logo_url}
            currentCoverUrl={organization.cover_url}
          />
        </div>

        <form action={updateOrganization} className="surface-panel mt-8 space-y-8 rounded-[var(--radius)] p-6 md:p-8">
          <input type="hidden" name="slug" value={organization.slug} />

          <section>
            <h2 className="text-xl font-semibold text-foreground">Basic information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-foreground">Organization name *</span>
                <input required name="name" type="text" defaultValue={organization.name} className={fieldClassName} />
              </label>

              <label>
                <span className="text-sm font-semibold text-foreground">Organization type</span>
                <select name="organization_type" defaultValue={organization.organization_type ?? ""} className={fieldClassName}>
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
                <span className="text-sm font-semibold text-foreground">Website</span>
                <input name="website_url" type="url" defaultValue={organization.website_url ?? ""} className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-foreground">Short description</span>
                <input name="short_description" type="text" maxLength={220} defaultValue={organization.short_description ?? ""} className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-foreground">Full description</span>
                <textarea name="description" rows={6} defaultValue={organization.description ?? ""} className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-foreground">Mission</span>
                <textarea name="mission" rows={4} defaultValue={organization.mission ?? ""} className={fieldClassName} />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-foreground">Programs</span>
                <input name="programs" type="text" defaultValue={organization.programs.join(", ")} className={fieldClassName} />
                <span className="mt-2 block text-xs text-muted-foreground">Separate each program with a comma.</span>
              </label>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground">Contact and location</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-foreground">Email</span>
                <input name="email" type="email" defaultValue={organization.email ?? ""} className={fieldClassName} />
              </label>

              <label>
                <span className="text-sm font-semibold text-foreground">Phone</span>
                <input name="phone" type="tel" defaultValue={organization.phone ?? ""} className={fieldClassName} />
              </label>

              <label>
                <span className="text-sm font-semibold text-foreground">City</span>
                <input name="city" type="text" defaultValue={organization.city ?? ""} className={fieldClassName} />
              </label>

              <label>
                <span className="text-sm font-semibold text-foreground">Province / State</span>
                <input name="province_state" type="text" defaultValue={organization.province_state ?? ""} className={fieldClassName} />
              </label>

              <label>
                <span className="text-sm font-semibold text-foreground">Country</span>
                <input name="country" type="text" defaultValue={organization.country ?? ""} className={fieldClassName} />
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-secondary/40 px-4 py-3 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 md:self-end">
                <input
                  name="is_accepting_volunteers"
                  type="checkbox"
                  defaultChecked={organization.is_accepting_volunteers}
                  className="size-5 shrink-0 rounded border-border accent-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <span className="text-sm font-medium text-foreground">Accepting volunteers</span>
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Link
              href={`/organizations/${organization.slug}`}
              className="rounded-[var(--radius)] border border-border/80 bg-background px-5 py-3 text-center text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-[var(--radius)] bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
