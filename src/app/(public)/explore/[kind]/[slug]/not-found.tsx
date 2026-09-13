import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function ListingNotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Compass aria-hidden="true" className="size-5" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Afghan Hub</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">This listing isn’t available.</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">It may have been removed, unpublished, or is no longer available to the public.</p>
        <Link href="/explore" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Explore community listings
        </Link>
      </div>
    </main>
  );
}
