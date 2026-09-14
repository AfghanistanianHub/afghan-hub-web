import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="relative mx-auto flex w-full max-w-6xl flex-1 items-center overflow-hidden px-5 py-16 sm:px-8 sm:py-20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-12 top-1/2 h-64 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

      <section className="surface-panel relative grid w-full overflow-hidden rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[430px] overflow-hidden border-r border-border/70 bg-primary/[0.035] p-8 lg:block">
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20" />
          <div aria-hidden="true" className="absolute left-[18%] top-[18%] size-16 rounded-2xl border border-border bg-background/85 shadow-sm" />
          <div aria-hidden="true" className="absolute right-[15%] top-[28%] size-20 rounded-full border border-border bg-background/85 shadow-sm" />
          <div aria-hidden="true" className="absolute bottom-[17%] left-[24%] h-16 w-24 rounded-2xl border border-border bg-background/85 shadow-sm" />
          <div aria-hidden="true" className="absolute bottom-[13%] right-[18%] size-14 rounded-2xl border border-border bg-background/85 shadow-sm" />

          <div className="relative flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Afghan Hub</p>
            <div>
              <p className="text-7xl font-semibold tracking-[-0.08em] text-primary/18">404</p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                One path ended here. The rest of the community is still within reach.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[430px] flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">404 · Page not found</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
            This page isn’t available.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
            The link may be outdated, the page may have moved, or you may not have access to it. You can head home or keep exploring Afghan Hub.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Go to homepage
            </Link>
            <Link
              href="/explore"
              className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Explore community
            </Link>
            <Link
              href="/login"
              className="rounded-xl px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
