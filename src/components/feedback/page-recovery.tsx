"use client";

import { useTransition } from "react";

export type RecoveryProps = { reset: () => void };

export function PageRecovery({ reset }: RecoveryProps) {
  const [pending, startTransition] = useTransition();

  return (
    <main
      id="main-content"
      className="relative mx-auto flex min-h-[68vh] w-full max-w-5xl items-center overflow-hidden px-5 py-12 sm:px-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-1/2 h-64 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

      <section
        aria-labelledby="recovery-title"
        className="surface-panel relative grid w-full overflow-hidden rounded-[2rem] lg:grid-cols-[0.82fr_1.18fr]"
      >
        <div className="relative hidden min-h-[390px] overflow-hidden border-r border-border/70 bg-primary/[0.035] p-8 lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute -left-16 -top-16 size-56 rounded-full border border-primary/15" />
          <div aria-hidden="true" className="absolute left-16 top-16 size-36 rounded-full border border-dashed border-primary/15" />
          <div aria-hidden="true" className="absolute -bottom-12 right-[-2rem] size-48 rounded-full border border-primary/10" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Afghan Hub</p>
            <p className="mt-4 max-w-xs text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Your community space is still here.
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="text-xs font-semibold text-primary">Reconnect</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Retry the page without losing the rest of the experience.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="text-xs font-semibold text-primary">Recover</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Return home if this part of the app is unavailable.</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[390px] flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Page unavailable</p>
          <h1 id="recovery-title" className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
            We couldn’t load this page.
          </h1>
          <p role="alert" className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Something went wrong. You can try the page again, or return to Afghan Hub and continue from there.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(reset)}
              className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
            >
              <span role="status">{pending ? "Trying again…" : "Try again"}</span>
            </button>
            {/* Full document navigation is intentional when the client router/layout may have failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="min-h-11 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Go to home
            </a>
          </div>

          <p className="mt-7 text-xs leading-5 text-muted-foreground">
            For privacy, Afghan Hub does not show internal error details on this screen.
          </p>
        </div>
      </section>
    </main>
  );
}
