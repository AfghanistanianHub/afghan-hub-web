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
      <section
        aria-labelledby="recovery-title"
        className="relative mx-auto w-full max-w-3xl border-y border-border"
      >
        <div className="flex min-h-[390px] flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Page unavailable</p>
          <h1 id="recovery-title" className="mt-4 max-w-xl text-3xl font-medium tracking-[-0.035em] text-foreground sm:text-4xl">
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
              className="min-h-11 rounded-[var(--radius-control)] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
            >
              <span role="status" aria-live="polite">{pending ? "Trying again…" : "Try again"}</span>
            </button>
            {/* Full document navigation is intentional when the client router/layout may have failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="min-h-11 rounded-[var(--radius-control)] border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
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
