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
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-border bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--primary)_32%,transparent),transparent_30%),radial-gradient(circle_at_85%_86%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_28%)]" />
        <div aria-hidden="true" className="absolute -right-24 top-24 size-[30rem] rounded-full border border-background/10" />
        <div aria-hidden="true" className="absolute right-12 top-40 size-72 rounded-full border border-dashed border-background/10" />

        <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.22em]">Afghan Hub</p>

        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/55">Finish account recovery</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.03] tracking-[-0.045em] xl:text-6xl">Choose a password built to last.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-background/65">A stronger password protects your profile, conversations, connections, and the work you share with the community.</p>
        </div>

        <div className="relative z-10 rounded-[1.75rem] border border-background/10 bg-background/[0.055] p-5 text-sm leading-6 text-background/65">
          <p className="font-semibold text-background">Password baseline</p>
          <p className="mt-2">{PASSWORD_POLICY_HINT}</p>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:min-h-0 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute left-1/2 top-[-18rem] size-[38rem] -translate-x-1/2 rounded-full border border-primary/10" />
          <div className="absolute left-1/2 top-[-12rem] size-[28rem] -translate-x-1/2 rounded-full border border-primary/10" />
        </div>

        <div className="relative w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Secure your account</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Choose a new password</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{PASSWORD_POLICY_HINT} Enter the same password twice.</p>

          {error ? (
            <div role="alert" className="mt-6 rounded-xl border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">{error}</div>
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