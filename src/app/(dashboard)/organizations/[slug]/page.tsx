import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OrganizationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

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
        is_verified,
        is_accepting_volunteers,
        owner_id
      `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !organization) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canEdit = user?.id === organization.owner_id;

const programs = Array.isArray(organization.programs)
  ? organization.programs.filter(
      (program: unknown): program is string =>
        typeof program === "string",
    )
  : [];

  const location = [
    organization.city,
    organization.province_state,
    organization.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/organizations"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to organizations
        </Link>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
          {organization.cover_url ? (
            <img
              src={organization.cover_url}
              alt={`${organization.name} cover`}
              className="h-40 w-full object-cover md:h-56"
            />
          ) : (
            <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 md:h-56" />
          )}

          <div className="px-6 pb-8 md:px-10">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={`${organization.name} logo`}
                  className="h-24 w-24 rounded-2xl border-4 border-slate-950 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-slate-950 bg-slate-800 text-3xl font-bold text-emerald-400">
                  {organization.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {organization.name}
                  </h1>

                  {organization.is_verified ? (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      Verified
                    </span>
                  ) : null}
                </div>

                {organization.organization_type ? (
                  <p className="mt-2 text-slate-400">
                    {organization.organization_type}
                  </p>
                ) : null}

                {location ? (
                  <p className="mt-1 text-sm text-slate-500">{location}</p>
                ) : null}
              </div>
            </div>

            {organization.short_description ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                {organization.short_description}
              </p>
            ) : null}

            {canEdit ? (
              <Link
                href={`/organizations/${organization.slug}/edit`}
                className="mt-6 inline-flex rounded-lg border border-slate-700 px-5 py-3 font-semibold transition hover:bg-slate-800"
              >
                Edit organization
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {organization.description ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
                <h2 className="text-2xl font-semibold">About</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-slate-300">
                  {organization.description}
                </p>
              </section>
            ) : null}

            {organization.mission ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
                <h2 className="text-2xl font-semibold">Mission</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-slate-300">
                  {organization.mission}
                </p>
              </section>
            ) : null}

            {programs.length > 0 ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
                <h2 className="text-2xl font-semibold">Programs</h2>

                <div className="mt-5 flex flex-wrap gap-3">
                  {programs.map((program) => (
                    <span
                      key={program}
                      className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300"
                    >
                      {program}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold">Contact</h2>

            <div className="mt-5 space-y-4 text-sm">
              {organization.website_url ? (
                <div>
                  <p className="text-slate-500">Website</p>
                  <a
                    href={organization.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-words text-emerald-400 hover:text-emerald-300"
                  >
                    {organization.website_url}
                  </a>
                </div>
              ) : null}

              {organization.email ? (
                <div>
                  <p className="text-slate-500">Email</p>
                  <a
                    href={`mailto:${organization.email}`}
                    className="mt-1 block break-words text-slate-300 hover:text-white"
                  >
                    {organization.email}
                  </a>
                </div>
              ) : null}

              {organization.phone ? (
                <div>
                  <p className="text-slate-500">Phone</p>
                  <a
                    href={`tel:${organization.phone}`}
                    className="mt-1 block text-slate-300 hover:text-white"
                  >
                    {organization.phone}
                  </a>
                </div>
              ) : null}

              {location ? (
                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="mt-1 text-slate-300">{location}</p>
                </div>
              ) : null}

              {organization.is_accepting_volunteers ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
                  This organization is accepting volunteers.
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
