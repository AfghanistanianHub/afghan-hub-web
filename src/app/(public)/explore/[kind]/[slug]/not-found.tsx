import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function ListingNotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <div className="relative overflow-hidden rounded-md border border-border/80 bg-card p-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 size-56 rounded-full bg-primary/[0.06] blur-3xl" /><span className="relative flex size-12 items-center justify-center rounded-md bg-secondary text-primary"><Compass aria-hidden="true" className="size-5" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Afghan Hub</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">This listing isn’t available.</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">It may have been removed, unpublished, or is no longer available to the public.</p>
        <Link href="/explore" className="relative mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Explore community listings
        </Link>
      </div>
    </main>
  );
}
