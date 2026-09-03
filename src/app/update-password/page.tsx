import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Open a valid password reset link before choosing a new password."
      )}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Afghan Hub
        </p>

        <h1 className="mt-3 text-3xl font-bold">Choose a new password</h1>

        <p className="mt-2 text-sm text-slate-400">
          Use at least 8 characters and enter the same password twice.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              New password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="passwordConfirmation"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Confirm new password
            </label>

            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Enter the new password again"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
            />
          </div>

          <button
            formAction={updatePassword}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
