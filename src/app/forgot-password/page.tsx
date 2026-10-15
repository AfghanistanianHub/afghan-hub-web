import { SubmitButton } from "@/components/auth/submit-button";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className="auth-page min-h-screen text-foreground">
      <header className="auth-brand">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Afghan Hub</Link>
      </header>

      <section className="auth-form-region">

        <div className="relative w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Password recovery</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter your account email and we will send you a secure reset link.</p>

          {error ? (
            <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">{error}</div>
          ) : null}

          {message ? (
            <div role="status" aria-live="polite" className="mt-6 rounded-[var(--radius)] border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary">{message}</div>
          ) : null}

          <form action={requestPasswordReset} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <SubmitButton pendingLabel="Sending reset link…">Send reset link</SubmitButton>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center">
            <Link href="/login" className="rounded-sm text-sm font-medium text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Back to sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}