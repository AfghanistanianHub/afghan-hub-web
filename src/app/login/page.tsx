import { SupportLinks } from "@/components/public/support-links";
import { SubmitButton } from "@/components/auth/submit-button";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_HINT,
} from "@/lib/password-policy";
import { login, signup } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    mode?: string;
  }>;
};

const communityPaths = [
  { label: "People", note: "Meet and connect", icon: UsersRound },
  { label: "Opportunities", note: "Find your next step", icon: BriefcaseBusiness },
  { label: "Events", note: "Show up together", icon: CalendarDays },
  { label: "Businesses", note: "Support Afghan-led work", icon: Building2 },
];

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { error, message, mode } = await searchParams;
  const joining = mode === "join";

  const fieldClassName =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-border bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,color-mix(in_oklab,var(--primary)_32%,transparent),transparent_30%),radial-gradient(circle_at_86%_86%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_30%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:44px_44px]" />
        <div aria-hidden="true" className="absolute -right-20 top-24 size-[28rem] rounded-full border border-background/10" />
        <div aria-hidden="true" className="absolute right-12 top-40 size-72 rounded-full border border-dashed border-background/10" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em]">
            <span className="flex size-8 items-center justify-center rounded-xl bg-background/10">A</span>
            Afghan Hub
          </Link>

          <div className="mt-20 max-w-xl xl:mt-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-background/10 bg-background/5 px-3 py-1.5 text-xs font-semibold">
              <Sparkles aria-hidden="true" className="size-3.5" />
              People. Possibilities. Belonging.
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.045em] xl:text-6xl">
              A place to find your people — and your next step.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-background/65">
              Afghan Hub brings community, opportunities, gatherings, and Afghan-led work into one connected space.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          {communityPaths.map(path => {
            const Icon = path.icon;
            return (
              <div key={path.label} className="rounded-2xl border border-background/10 bg-background/[0.055] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background/10">
                    <Icon aria-hidden="true" className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{path.label}</p>
                    <p className="mt-0.5 text-xs text-background/55">{path.note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:min-h-0 lg:px-10 xl:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute left-1/2 top-[-18rem] size-[38rem] -translate-x-1/2 rounded-full border border-primary/10" />
          <div className="absolute left-1/2 top-[-12rem] size-[28rem] -translate-x-1/2 rounded-full border border-primary/10" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Afghan Hub</Link>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {joining ? "Join the community" : "Member access"}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            {joining ? "Create your Afghan Hub account" : "Welcome back"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {joining
              ? "Create your profile and start discovering people, events, opportunities, and Afghan-led organizations."
              : "Sign in to continue where you left off."}
          </p>

          {error ? (
            <div role="alert" className="mt-6 rounded-xl border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {message ? (
            <div role="status" className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary">
              {message}
            </div>
          ) : null}

          <form id="join" action={joining ? signup : login} className="mt-7 space-y-5">
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
                minLength={joining ? PASSWORD_MIN_LENGTH : undefined}
                autoComplete={joining ? "new-password" : "current-password"}
                placeholder={joining ? `Minimum ${PASSWORD_MIN_LENGTH} characters` : "Your password"}
                aria-describedby={joining ? "password-policy" : undefined}
                className={fieldClassName}
              />
              {joining ? (
                <p id="password-policy" className="mt-2 text-xs leading-5 text-muted-foreground">
                  {PASSWORD_POLICY_HINT}
                </p>
              ) : null}
            </div>

            <SubmitButton pendingLabel={joining ? "Creating account…" : "Signing in…"}>
              {joining ? "Create account" : "Sign in"}
            </SubmitButton>

            <p className="text-center text-sm text-muted-foreground">
              {joining ? "Already a member? " : "New to Afghan Hub? "}
              <Link href={joining ? "/login" : "/login?mode=join"} className="font-semibold text-primary underline">
                {joining ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </form>

          <div className="mt-7 border-t border-border pt-5">
            <SupportLinks />
          </div>
        </div>
      </section>
    </main>
  );
}
