import { CommunityIllustration } from "@/components/public/community-illustrations";
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
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-border/80 bg-card p-10 text-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">

        <Link href="/" className="relative z-10 rounded-sm text-sm font-semibold uppercase tracking-[0.22em] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Afghan Hub</Link>

        <div aria-hidden="true" className="relative mx-auto my-6 w-full max-w-sm"><CommunityIllustration /></div>
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Secure account recovery</p>
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight">Get back to your community.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">We will send the recovery link only through the email connected to your Afghan Hub account.</p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
          <div className="rounded-2xl border border-primary/10 bg-background/72 px-3 py-4"><span className="block text-lg font-bold text-foreground">1</span><span className="mt-1 block">Enter email</span></div>
          <div className="rounded-2xl border border-primary/10 bg-background/72 px-3 py-4"><span className="block text-lg font-bold text-foreground">2</span><span className="mt-1 block">Open secure link</span></div>
          <div className="rounded-2xl border border-primary/10 bg-background/72 px-3 py-4"><span className="block text-lg font-bold text-foreground">3</span><span className="mt-1 block">Choose password</span></div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:min-h-0 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute left-1/2 top-[-18rem] size-[38rem] -translate-x-1/2 rounded-full border border-primary/10" />
          <div className="absolute left-1/2 top-[-12rem] size-[28rem] -translate-x-1/2 rounded-full border border-primary/10" />
        </div>

        <div className="relative w-full max-w-md">
          <Link href="/" className="mb-8 inline-block rounded-sm text-sm font-semibold uppercase tracking-[0.22em] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:hidden">Afghan Hub</Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Password recovery</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Reset your password</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter your account email and we will send you a secure reset link.</p>

          {error ? (
            <div role="alert" aria-live="assertive" className="mt-6 rounded-xl border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">{error}</div>
          ) : null}

          {message ? (
            <div role="status" aria-live="polite" className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary">{message}</div>
          ) : null}

          <form action={requestPasswordReset} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10" />
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