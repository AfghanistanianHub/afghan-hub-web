import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";

type ProfilePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ProfilePage({
  searchParams,
}: ProfilePageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name,last_name,profession,company,city,province_state,country,bio",
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Afghan Hub
          </p>

          <h1 className="mt-3 text-3xl font-bold">Create your profile</h1>

          <p className="mt-2 text-slate-400">
            Add some basic information so other community members can learn
            about you.
          </p>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <form action={saveProfile} className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  First name
                </span>
                <input
                  name="first_name"
                  defaultValue={profile?.first_name ?? ""}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Last name
                </span>
                <input
                  name="last_name"
                  defaultValue={profile?.last_name ?? ""}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Profession
                </span>
                <input
                  name="profession"
                  defaultValue={profile?.profession ?? ""}
                  placeholder="Computer technician"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Company
                </span>
                <input
                  name="company"
                  defaultValue={profile?.company ?? ""}
                  placeholder="BC Computers"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">City</span>
                <input
                  name="city"
                  defaultValue={profile?.city ?? ""}
                  placeholder="Vancouver"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Province/State
                </span>
                <input
                  name="province_state"
                  defaultValue={profile?.province_state ?? ""}
                  placeholder="British Columbia"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200">
                  Country
                </span>
                <input
                  name="country"
                  defaultValue={profile?.country ?? ""}
                  placeholder="Canada"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">
                About you
              </span>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ""}
                rows={5}
                placeholder="Tell the community a little about yourself..."
                className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Save profile
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
