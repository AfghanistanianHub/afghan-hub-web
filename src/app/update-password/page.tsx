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
        "Open a valid password reset link before choosing a new password.",
      )}`,
    );
  }

  const fieldClassName =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18rem] size-[38rem] -translate-x-1/2 rounded-full border border-primary/10" />
        <div className="absolute left-1/2 top-[-12rem] size-[28rem] -translate-x-1/2 rounded-full border border-primary/10" />
      </div>

      <div className="surface-panel relative w-full max-w-md rounded-3xl p-8 md:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Afghan Hub
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use at least 8 characters and enter the same password twice.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form className="mt-7 space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
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
              className={fieldClassName}
            />
          </div>

          <div>
            <label
              htmlFor="passwordConfirmation"
              className="mb-2 block text-sm font-medium"
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
              className={fieldClassName}
            />
          </div>

          <button
            formAction={updatePassword}
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
