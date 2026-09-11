import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-20 sm:px-8">
      <section className="w-full rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">404 · Page not found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">This page isn’t available.</h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
          The link may be outdated, the page may have moved, or you may not have access to it. You can return home or continue exploring Afghan Hub.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Go to homepage
          </Link>
          <Link href="/explore" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted">
            Explore community listings
          </Link>
          <Link href="/login" className="rounded-xl px-5 py-3 text-sm font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
