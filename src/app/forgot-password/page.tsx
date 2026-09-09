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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18rem] size-[38rem] -translate-x-1/2 rounded-full border border-primary/10" />
        <div className="absolute left-1/2 top-[-12rem] size-[28rem] -translate-x-1/2 rounded-full border border-primary/10" />
      </div>

      <div className="surface-panel relative w-full max-w-md rounded-3xl p-8 md:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Afghan Hub
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter your email address and we will send you a secure reset link.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary">
            {message}
          </div>
        ) : null}

        <form className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <button
            formAction={requestPasswordReset}
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Send reset link
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-primary transition hover:opacity-75"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
