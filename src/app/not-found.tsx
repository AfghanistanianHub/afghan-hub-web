import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[65vh] w-full max-w-3xl flex-1 items-center px-5 py-16 sm:px-8">
      <section className="w-full border-y border-border py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">404 · Page not found</p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">This page isn’t available.</h1>
        <p className="mt-5 max-w-xl leading-7 text-muted-foreground">The link may be outdated, the page may have moved, or you may not have access to it. You can head home or keep exploring Afghan Hub.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">Go to homepage</Link>
          <Link href="/explore" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-muted">Explore community</Link>
          <Link href="/login" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-5 py-3 text-sm font-semibold text-primary transition hover:bg-secondary">Sign in</Link>
        </div>
      </section>
    </main>
  );
}
