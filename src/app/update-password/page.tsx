import Link from "next/link";
import { SubmitButton } from "@/components/auth/submit-button";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_HINT,
} from "@/lib/password-policy";
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
    "w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="auth-page min-h-screen text-foreground">
      <header className="auth-brand">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Afghan Hub</Link>
      </header>

      <section className="auth-form-region">

        <div className="relative w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Secure your account</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Choose a new password</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{PASSWORD_POLICY_HINT} Enter the same password twice.</p>

          {error ? (
            <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">{error}</div>
          ) : null}

          <form action={updatePassword} className="mt-7 space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">New password</label>
              <input id="password" name="password" type="password" required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" placeholder={`Minimum ${PASSWORD_MIN_LENGTH} characters`} aria-describedby="password-policy" className={fieldClassName} />
              <p id="password-policy" className="mt-2 text-xs leading-5 text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
            </div>

            <div>
              <label htmlFor="passwordConfirmation" className="mb-2 block text-sm font-medium">Confirm new password</label>
              <input id="passwordConfirmation" name="passwordConfirmation" type="password" required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" placeholder="Enter the new password again" className={fieldClassName} />
            </div>

            <SubmitButton pendingLabel="Updating password…">Update password</SubmitButton>
          </form>
        </div>
      </section>
    </main>
  );
}