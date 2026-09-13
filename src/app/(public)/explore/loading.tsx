export default function ExploreLoading() {
  return (
    <main id="main-content" aria-busy="true">
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading community listings.</span>
            <div className="h-7 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="mt-5 h-12 w-full max-w-xl animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
            <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-card p-4">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
                  <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  <div className="mt-2 h-4 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <div className="h-9 w-48 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-border bg-card p-6">
                  <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
                  <div className="mt-5 h-5 w-3/4 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  <div className="mt-8 h-4 w-1/2 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-64 animate-pulse rounded-3xl border border-border bg-muted/60 motion-reduce:animate-none" />
        </div>
      </section>
    </main>
  );
}
