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

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/organizations/${organization.slug}`}
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to organization
        </Link>

        <section className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Organization settings
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Edit {organization.name}
          </h1>
        </section>

        {formError ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
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

        <form
          action={updateOrganization}
          className="mt-8 space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
        >
          <input type="hidden" name="slug" value={organization.slug} />

          <section>
            <h2 className="text-xl font-semibold">Basic information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-medium">Organization name *</span>
                <input
                  required
                  name="name"
                  type="text"
                  defaultValue={organization.name}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Organization type</span>
                <select
                  name="organization_type"
                  defaultValue={organization.organization_type ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">Select a type</option>
                  <option value="Nonprofit">Nonprofit</option>
                  <option value="Community organization">
                    Community organization
                  </option>
                  <option value="Professional association">
                    Professional association
                  </option>
                  <option value="Cultural organization">
                    Cultural organization
                  </option>
                  <option value="Student organization">
                    Student organization
                  </option>
                  <option value="Charity">Charity</option>
                  <option value="Media organization">
                    Media organization
                  </option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                <span className="text-sm font-medium">Website</span>
                <input
                  name="website_url"
                  type="url"
                  defaultValue={organization.website_url ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Short description</span>
                <input
                  name="short_description"
                  type="text"
                  maxLength={220}
                  defaultValue={organization.short_description ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Full description</span>
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={organization.description ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Mission</span>
                <textarea
                  name="mission"
                  rows={4}
                  defaultValue={organization.mission ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Programs</span>
                <input
                  name="programs"
                  type="text"
                  defaultValue={organization.programs.join(", ")}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Separate each program with a comma.
                </span>
              </label>
            </div>
          </section>

          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-xl font-semibold">Contact and location</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm font-medium">Email</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={organization.email ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Phone</span>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={organization.phone ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">City</span>
                <input
                  name="city"
                  type="text"
                  defaultValue={organization.city ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Province / State</span>
                <input
                  name="province_state"
                  type="text"
                  defaultValue={organization.province_state ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Country</span>
                <input
                  name="country"
                  type="text"
                  defaultValue={organization.country ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="flex items-center gap-3 pt-7">
                <input
                  name="is_accepting_volunteers"
                  type="checkbox"
                  defaultChecked={organization.is_accepting_volunteers}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950"
                />
                <span className="text-sm font-medium">
                  Accepting volunteers
                </span>
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
            <Link
              href={`/organizations/${organization.slug}`}
              className="rounded-lg border border-slate-700 px-5 py-3 text-center font-semibold hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
