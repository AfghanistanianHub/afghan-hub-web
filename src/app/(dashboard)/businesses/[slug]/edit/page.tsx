import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BusinessMediaUpload } from "@/components/businesses/business-media-upload";
import { createClient } from "@/lib/supabase/server";
import { updateBusiness } from "../../actions";

type EditBusinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditBusinessPage({
  params,
  searchParams,
}: EditBusinessPageProps) {
  const { slug } = await params;
  const { error: formError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
        cover_url,
        is_hiring,
        owner_id
      `,
    )
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !business) {
    notFound();
  }

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/businesses/${business.slug}`}
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to business
        </Link>

        <section className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Business settings
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Edit {business.name}
          </h1>
        </section>

        {formError ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {formError}
          </div>
        ) : null}

        <div className="mt-8">
          <BusinessMediaUpload
            businessId={business.id}
            businessName={business.name}
            userId={user.id}
            currentLogoUrl={business.logo_url}
            currentCoverUrl={business.cover_url}
          />
        </div>

        <form
          action={updateBusiness}
          className="mt-8 space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
        >
          <input type="hidden" name="slug" value={business.slug} />

          <section>
            <h2 className="text-xl font-semibold">Business information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-medium">Business name *</span>
                <input
                  required
                  name="name"
                  type="text"
                  minLength={2}
                  maxLength={120}
                  defaultValue={business.name}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Category *</span>
                <input
                  required
                  name="category"
                  type="text"
                  maxLength={120}
                  defaultValue={business.category}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Website</span>
                <input
                  name="website_url"
                  type="url"
                  defaultValue={business.website_url ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Short description</span>
                <input
                  name="short_description"
                  type="text"
                  maxLength={200}
                  defaultValue={business.short_description ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Full description</span>
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={business.description ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Services</span>
                <input
                  name="services"
                  type="text"
                  defaultValue={business.services.join(", ")}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Separate each service with a comma.
                </span>
              </label>

              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  name="is_hiring"
                  type="checkbox"
                  defaultChecked={business.is_hiring}
                  className="size-4 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium">
                  This business is currently hiring
                </span>
              </label>
            </div>
          </section>

          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-xl font-semibold">Contact information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm font-medium">Email</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={business.email ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Phone</span>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={business.phone ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-xl font-semibold">Location</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <label className="md:col-span-3">
                <span className="text-sm font-medium">Address</span>
                <input
                  name="address_line"
                  type="text"
                  defaultValue={business.address_line ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">City</span>
                <input
                  name="city"
                  type="text"
                  defaultValue={business.city ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Province / State</span>
                <input
                  name="province_state"
                  type="text"
                  defaultValue={business.province_state ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Country</span>
                <input
                  name="country"
                  type="text"
                  defaultValue={business.country ?? ""}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
            <Link
              href={`/businesses/${business.slug}`}
              className="rounded-lg border border-slate-700 px-5 py-3 text-center font-semibold transition hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
