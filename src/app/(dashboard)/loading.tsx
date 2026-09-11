export default function DashboardLoading() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10" aria-busy="true">
      <div role="status" aria-live="polite" className="space-y-8">
        <span className="sr-only">Loading your Afghan Hub workspace.</span>
        <div className="space-y-3">
          <div className="h-3 w-28 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="h-9 w-full max-w-sm animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
              <div className="mt-5 h-5 w-2/3 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
