import Link from "next/link";
import { login, signup } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    mode?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { error, message, mode } = await searchParams;
  const joining = mode === "join";

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
          <Link href="/">Afghan Hub</Link>
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">{joining ? "Join Afghan Hub" : "Welcome back"}</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {joining ? "Create your account and find your place in the community." : "Sign in to connect with your community."}
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

        <form id="join" className="mt-7 space-y-5">
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
              className={fieldClassName}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary transition hover:opacity-75"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={joining ? "new-password" : "current-password"}
              placeholder="Minimum 8 characters"
              className={fieldClassName}
            />
          </div>

          <button
            formAction={joining ? signup : login}
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {joining ? "Create account" : "Sign in"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {joining ? "Already a member? " : "New to Afghan Hub? "}
            <Link href={joining ? "/login" : "/login?mode=join"} className="font-semibold text-primary underline">
              {joining ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
