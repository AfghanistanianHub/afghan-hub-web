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

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/organizations"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to organizations
        </Link>

        <section className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Create an organization
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Add your organization
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Create a public page for your nonprofit, association, cultural
            group, professional network, or community initiative.
          </p>
        </section>

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form
          action={createOrganization}
          className="mt-8 space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
        >
          <section>
            <h2 className="text-xl font-semibold">Basic information</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-medium">Organization name *</span>
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="Afghan Community Association"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Organization type</span>
                <select
                  name="organization_type"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
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
                  placeholder="https://example.org"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Short description</span>
                <input
                  name="short_description"
                  type="text"
                  maxLength={220}
                  placeholder="A short summary of what your organization does."
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Full description</span>
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Tell the community about your organization, history, work, and impact."
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Mission</span>
                <textarea
                  name="mission"
                  rows={4}
                  placeholder="What is your organization's mission?"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium">Programs</span>
                <input
                  name="programs"
                  type="text"
                  placeholder="Education, Mentorship, Settlement support"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Separate each program with a comma.
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
                  placeholder="hello@example.org"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Phone</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 604 000 0000"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-xl font-semibold">Location</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <label>
                <span className="text-sm font-medium">City</span>
                <input
                  name="city"
                  type="text"
                  placeholder="Vancouver"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Province / State</span>
                <input
                  name="province_state"
                  type="text"
                  placeholder="British Columbia"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="text-sm font-medium">Country</span>
                <input
                  name="country"
                  type="text"
                  placeholder="Canada"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/organizations"
              className="rounded-lg border border-slate-700 px-5 py-3 text-center font-semibold transition hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Create organization
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
