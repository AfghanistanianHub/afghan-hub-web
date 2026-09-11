export default function ExploreLoading() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16" aria-busy="true">
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading community listings.</span>
        <div className="h-3 w-32 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-4 h-10 w-full max-w-md animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
              <div className="mt-5 h-5 w-3/4 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              <div className="mt-8 h-4 w-1/2 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
