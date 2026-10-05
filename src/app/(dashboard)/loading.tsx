export default function DashboardLoading() {
  const pulse = "animate-pulse bg-muted motion-reduce:animate-none";

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12"
      aria-busy="true"
    >
      <div role="status" aria-live="polite" className="space-y-8">
        <span className="sr-only">Loading your Afghan Hub workspace.</span>

        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card px-6 py-7 sm:px-8 sm:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full border border-primary/10" />
          <div aria-hidden="true" className="pointer-events-none absolute right-20 top-12 size-24 rounded-full border border-primary/10" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className={`h-3 w-28 rounded-full ${pulse}`} />
              <div className={`mt-4 h-10 w-full max-w-md rounded-xl ${pulse}`} />
              <div className={`mt-4 h-4 w-full max-w-xl rounded-full ${pulse}`} />
              <div className={`mt-2 h-4 w-4/5 max-w-lg rounded-full ${pulse}`} />
              <div className="mt-7 flex gap-3">
                <div className={`h-11 w-32 rounded-xl ${pulse}`} />
                <div className={`h-11 w-28 rounded-xl ${pulse}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className={`h-3 w-16 rounded-full ${pulse}`} />
                  <div className={`mt-4 h-7 w-12 rounded-lg ${pulse}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <section className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={`h-3 w-24 rounded-full ${pulse}`} />
                <div className={`mt-3 h-7 w-44 rounded-lg ${pulse}`} />
              </div>
              <div className={`h-9 w-24 rounded-xl ${pulse}`} />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className={`h-9 w-9 rounded-xl ${pulse}`} />
                    <div className={`h-3 w-14 rounded-full ${pulse}`} />
                  </div>
                  <div className={`mt-5 h-5 w-2/3 rounded-full ${pulse}`} />
                  <div className={`mt-3 h-4 w-full rounded-full ${pulse}`} />
                  <div className={`mt-2 h-4 w-4/5 rounded-full ${pulse}`} />
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-[1.75rem] border border-border bg-card p-6">
                <div className={`h-3 w-20 rounded-full ${pulse}`} />
                <div className={`mt-3 h-6 w-40 rounded-lg ${pulse}`} />
                <div className={`mt-5 h-4 w-full rounded-full ${pulse}`} />
                <div className={`mt-2 h-4 w-4/5 rounded-full ${pulse}`} />
                <div className={`mt-6 h-10 w-28 rounded-xl ${pulse}`} />
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}
