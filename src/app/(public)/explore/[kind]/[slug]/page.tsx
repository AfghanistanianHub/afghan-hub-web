import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getPublicListing } from "@/lib/public-content";
import { isPublicKind, publicCategories, publicHref } from "@/lib/public-catalog";
import { ListingDate } from "@/components/public/listing-card";
import { getUtcDateKey, hasOpportunityDeadlinePassed } from "@/lib/opportunities";

type Props = { params: Promise<{ kind: string; slug: string }> };

const icons = {
  opportunities: BriefcaseBusiness,
  events: CalendarDays,
  businesses: Building2,
  organizations: UsersRound,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, slug } = await params;
  if (!isPublicKind(kind)) notFound();
  const result = await getPublicListing(kind, slug);
  const item = result.items[0];
  if (result.unavailable) return { title: "Listing temporarily unavailable", robots: { index: false } };
  if (!item) notFound();
  const description = (item.summary || item.description || `${publicCategories[kind].singular} on Afghan Hub.`).slice(0, 160);
  const url = `https://app.apnbc.ca${publicHref(kind, slug)}`;
  const socialImage = "/opengraph-image";
  return {
    title: item.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: item.title,
      description,
      url,
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${item.title} — Afghan Hub` }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [socialImage],
    },
  };
}

export default async function PublicDetailPage({ params }: Props) {
  const { kind, slug } = await params;
  if (!isPublicKind(kind)) notFound();

  const result = await getPublicListing(kind, slug);
  const item = result.items[0];

  if (result.unavailable) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Afghan Hub</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">We couldn’t load this listing.</h1>
          <p className="mt-4 leading-7 text-muted-foreground">Please try again shortly.</p>
          <Link href={publicHref(kind, slug)} className="mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            Try again <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </main>
    );
  }

  if (!item) notFound();

  const expired = kind === "opportunities"
    ? hasOpportunityDeadlinePassed(item.date, getUtcDateKey())
    : kind === "events" && Boolean(item.date && new Date(item.endDate ?? item.date).getTime() < new Date().getTime());
  const Icon = icons[kind];

  return (
    <main id="main-content">
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,color-mix(in_oklab,var(--primary)_11%,transparent),transparent_28%),radial-gradient(circle_at_12%_82%,color-mix(in_oklab,var(--accent)_52%,transparent),transparent_32%)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <Link href={`/explore?type=${kind}`} className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <ArrowLeft aria-hidden="true" className="size-4" />
            All {publicCategories[kind].label.toLowerCase()}
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="rounded-full border border-border/80 bg-background/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
                  {item.category}
                </span>
                {expired && (
                  <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    {kind === "events" ? "Event ended" : "Deadline passed"}
                  </span>
                )}
              </div>

              <h1 className="mt-6 max-w-4xl break-words text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                {item.title}
              </h1>

              {item.summary && (
                <p className="mt-6 max-w-3xl break-words text-lg leading-8 text-muted-foreground sm:text-xl">
                  {item.summary}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-border/80 bg-background/82 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">At a glance</p>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="mt-1 break-words leading-6 text-muted-foreground">{item.location}</p>
                  </div>
                </div>
                {item.date && (
                  <div className="flex items-start gap-3">
                    <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{kind === "opportunities" ? "Deadline" : "Date"}</p>
                      <p className="mt-1 leading-6 text-muted-foreground"><ListingDate item={item} kind={kind} /></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <article className="min-w-0">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles aria-hidden="true" className="size-3.5" />
            About this {publicCategories[kind].singular.toLowerCase()}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Details</h2>
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <p className="whitespace-pre-wrap break-words leading-8 text-muted-foreground">
              {item.description || "More information has not been added yet."}
            </p>
          </div>

          {expired && (
            <div className="mt-6 rounded-2xl border border-border bg-muted/45 p-5 text-sm font-medium text-muted-foreground">
              {kind === "events" ? "This event has ended." : "The application deadline has passed."}
            </div>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Continue in Afghan Hub</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">Take the next step.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Join Afghan Hub to connect with members, save listings, and contribute to the community.
            </p>
            <div className="mt-5 grid gap-3">
              <Link href="/login?mode=join" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                Join Afghan Hub <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href={`/${kind}/${encodeURIComponent(slug)}`} className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                Open member view
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-muted/35 p-5">
            <p className="text-sm font-semibold">Keep exploring</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Discover more {publicCategories[kind].label.toLowerCase()} from across the community.
            </p>
            <Link href={`/explore?type=${kind}`} className="mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              Browse all <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
