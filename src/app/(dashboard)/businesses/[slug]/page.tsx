import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type BusinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BusinessPage({
  params,
}: BusinessPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        category,
        short_description,
        description,
        services,
        website_url,
        email,
        phone,
        address_line,
        city,
        province_state,
        country,
        logo_url,
        is_verified,
        is_hiring,
        owner_id
      `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !business) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canEdit = user?.id === business.owner_id;
  const services = Array.isArray(business.services)
    ? business.services.filter(
        (service: unknown): service is string =>
          typeof service === "string",
      )
    : [];
  const location = [
    business.city,
    business.province_state,
    business.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/businesses"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to businesses
        </Link>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 md:h-32" />

          <div className="px-6 pb-8 md:px-10">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
              {business.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  className="h-24 w-24 rounded-2xl border-4 border-slate-950 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-slate-950 bg-slate-800 text-3xl font-bold text-emerald-400">
                  {business.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {business.name}
                  </h1>

                  {business.is_verified ? (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      Verified
                    </span>
                  ) : null}

                  {business.is_hiring ? (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Hiring
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-slate-400">{business.category}</p>

                {location ? (
                  <p className="mt-1 text-sm text-slate-500">{location}</p>
                ) : null}
              </div>
            </div>

            {business.short_description ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                {business.short_description}
              </p>
            ) : null}

            {canEdit ? (
              <Link
                href={`/businesses/${business.slug}/edit`}
                className="mt-6 inline-flex rounded-lg border border-slate-700 px-5 py-3 font-semibold transition hover:bg-slate-800"
              >
                Edit business
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {business.description ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
                <h2 className="text-2xl font-semibold">About</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-slate-300">
                  {business.description}
                </p>
              </section>
            ) : null}

            {services.length > 0 ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
                <h2 className="text-2xl font-semibold">Services</h2>

                <div className="mt-5 flex flex-wrap gap-3">
                  {services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold">Contact</h2>

            <div className="mt-5 space-y-4 text-sm">
              {business.website_url ? (
                <div>
                  <p className="text-slate-500">Website</p>
                  <a
                    href={business.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-words text-emerald-400 hover:text-emerald-300"
                  >
                    {business.website_url}
                  </a>
                </div>
              ) : null}

              {business.email ? (
                <div>
                  <p className="text-slate-500">Email</p>
                  <a
                    href={`mailto:${business.email}`}
                    className="mt-1 block break-words text-slate-300 hover:text-white"
                  >
                    {business.email}
                  </a>
                </div>
              ) : null}

              {business.phone ? (
                <div>
                  <p className="text-slate-500">Phone</p>
                  <a
                    href={`tel:${business.phone}`}
                    className="mt-1 block text-slate-300 hover:text-white"
                  >
                    {business.phone}
                  </a>
                </div>
              ) : null}

              {business.address_line ? (
                <div>
                  <p className="text-slate-500">Address</p>
                  <p className="mt-1 text-slate-300">
                    {business.address_line}
                  </p>
                </div>
              ) : null}

              {location ? (
                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="mt-1 text-slate-300">{location}</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
