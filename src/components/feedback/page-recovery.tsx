"use client";

import Link from "next/link";
import { useTransition } from "react";

export type RecoveryProps = { reset: () => void };

export function PageRecovery({ reset }: RecoveryProps) {
  const [pending, startTransition] = useTransition();
  return (
    <main id="main-content" className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-5 py-12 sm:px-8">
      <section aria-labelledby="recovery-title" className="w-full rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Afghan Hub</p>
        <h1 id="recovery-title" className="mt-4 text-3xl font-semibold tracking-tight">We couldn’t load this page.</h1>
        <p role="alert" className="mt-4 leading-7 text-muted-foreground">Something went wrong. You can try again, or return to the home page.</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button type="button" disabled={pending} onClick={() => startTransition(reset)} className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60">
            <span role="status">{pending ? "Trying again…" : "Try again"}</span>
          </button>
          <Link href="/" className="min-h-11 rounded-xl border border-border px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Go to home</Link>
        </div>
      </section>
    </main>
  );
}
