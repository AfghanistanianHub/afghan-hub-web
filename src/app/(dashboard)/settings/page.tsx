import Link from "next/link";
import { redirect } from "next/navigation";

import { updateAccountSettings } from "@/app/(dashboard)/settings/actions";
import { createClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { error: formError, saved } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, first_name, last_name, email, is_public")
    .eq("id", user.id)
    .maybeSingle();

  const accountName =
    profile?.display_name?.trim() ||
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    "Afghan Hub member";
  const accountEmail = profile?.email || user.email || "Not available";

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Account
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Settings
        </h1>
        <p className="mt-3 leading-7 text-slate-400">
          Manage your account details and profile visibility.
        </p>

        {formError ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {formError}
          </div>
        ) : null}

        {saved === "1" ? (
          <div className="mt-8 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Your settings have been saved.
          </div>
        ) : null}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
          <h2 className="text-xl font-semibold">Account information</h2>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Name</dt>
              <dd className="mt-1 font-medium text-slate-100">
                {accountName}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Email</dt>
              <dd className="mt-1 break-words font-medium text-slate-100">
                {accountEmail}
              </dd>
            </div>
          </dl>

          <Link
            href="/profile"
            className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            Edit profile details
          </Link>
        </section>

        <form
          action={updateAccountSettings}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
        >
          <h2 className="text-xl font-semibold">Profile visibility</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Public profiles can appear in the member directory and be viewed
            by other Afghan Hub members.
          </p>

          <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <input
              name="is_public"
              type="checkbox"
              defaultChecked={profile?.is_public ?? true}
              className="mt-0.5 size-5 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            <span>
              <span className="block font-semibold text-slate-100">
                Show my profile in the community
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">
                Turn this off to hide your profile from public member listings.
              </span>
            </span>
          </label>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Save settings
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
