import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ListingCard } from "@/components/public/listing-card";
import { publicCategories, publicKinds, publicHref } from "@/lib/public-catalog";
import { getPublicListings } from "@/lib/public-content";

const description =
  "Find opportunities, events, Afghan businesses, and community organizations. Explore Afghan Hub and connect with your community.";

export const metadata: Metadata = {
  title: "A community to belong to. A place to grow.",
  description,
  alternates: { canonical: "https://app.apnbc.ca/" },
  openGraph: {
    title: "Afghan Hub — People, possibilities, belonging",
    description,
    url: "https://app.apnbc.ca/",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Afghan Hub — community, opportunities, organizations, businesses, and events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Afghan Hub — People, possibilities, belonging",
    description,
    images: ["/opengraph-image"],
  },
};

const icons = {
  opportunities: BriefcaseBusiness,
  events: CalendarDays,
  businesses: Building2,
  organizations: UsersRound,
};

export default async function PublicHome() {
  const feeds = await Promise.all(
    publicKinds.map(kind => getPublicListings(kind, { limit: 3 })),
  );

  const pulseItems = publicKinds.flatMap((kind, index) =>
    feeds[index].items.slice(0, 1).map(item => ({ kind, item })),
  );

  return (
    <main id="main-content">
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_28%),radial-gradient(circle_at_18%_85%,color-mix(in_oklab,var(--accent)_58%,transparent),transparent_32%)]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-20 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              People. Possibilities. Belonging.
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Rooted in community.
              <span className="mt-1 block text-primary">Growing together.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              Discover the people, businesses, events, and opportunities shaping our Afghan community. Find your next step, make a connection, or bring something of your own.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Explore the community
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/login?mode=join"
                className="rounded-xl border border-border bg-background/70 px-6 py-3.5 font-semibold backdrop-blur hover:bg-muted"
              >
                Join Afghan Hub
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Start exploring. No account needed.</p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2.5rem] bg-primary/5 blur-2xl" />
            <div className="surface-panel relative overflow-hidden rounded-[2rem] bg-background/82 p-4 backdrop-blur sm:p-5">
              <div className="flex items-center justify-between gap-4 border-b border-border/70 px-1 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Community pulse</p>
                  <p className="mt-1 text-sm text-muted-foreground">A glimpse of what is happening now</p>
                </div>
                <Link href="/explore" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  View all
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </Link>
              </div>

              {pulseItems.length ? (
                <div className="grid gap-3 pt-4 sm:grid-cols-2">
                  {pulseItems.map(({ kind, item }) => {
                    const Icon = icons[kind];
                    return (
                      <Link
                        key={`${kind}-${item.slug}`}
                        href={publicHref(kind, item.slug)}
                        className="group min-w-0 rounded-2xl border border-border/80 bg-card/90 p-4 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                            <Icon aria-hidden="true" className="size-4.5" />
                          </span>
                          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        </div>
                        <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                          {publicCategories[kind].label}
                        </p>
                        <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5">{item.title}</h2>
                        <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                          <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                          <span className="line-clamp-1">{item.location}</span>
                        </p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-3 pt-4 sm:grid-cols-2">
                  {publicKinds.map(kind => {
                    const Icon = icons[kind];
                    return (
                      <Link
                        key={kind}
                        href={`/explore?type=${kind}`}
                        className="group rounded-2xl border border-border/80 bg-card/90 p-4 hover:border-primary/35"
                      >
                        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                          <Icon aria-hidden="true" className="size-4.5" />
                        </span>
                        <h2 className="mt-4 font-semibold">{publicCategories[kind].label}</h2>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{publicCategories[kind].description}</p>
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {publicKinds.map(kind => {
                  const Icon = icons[kind];
                  return (
                    <Link
                      key={kind}
                      href={`/explore?type=${kind}`}
                      className="flex min-w-0 items-center gap-2 rounded-xl bg-muted/65 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary"
                    >
                      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                      <span className="truncate">{publicCategories[kind].label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-card/70">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          <p className="text-sm leading-7 text-muted-foreground">
            <span className="font-semibold text-foreground">A shared place, wherever you are.</span>{" "}
            From a first introduction to a new opportunity, community starts with showing up for one another.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-5 py-16 sm:px-8 sm:py-20">
        {publicKinds.map((kind, index) => (
          <section key={kind} aria-labelledby={`${kind}-heading`}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {kind === "events" ? "Coming together" : kind === "opportunities" ? "Your next chapter" : "Meet the community"}
                </p>
                <h2 id={`${kind}-heading`} className="mt-2 text-3xl font-semibold tracking-tight">
                  {publicCategories[kind].label}
                </h2>
              </div>
              <Link
                href={`/explore?type=${kind}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Explore {publicCategories[kind].label.toLowerCase()}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            {feeds[index].unavailable ? (
              <p role="status" className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
                We couldn’t load these listings right now. Please try again shortly.
              </p>
            ) : feeds[index].items.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {feeds[index].items.map(item => (
                  <ListingCard key={item.slug} item={item} kind={kind} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8">
                <p className="font-medium">
                  {kind === "events"
                    ? "New gatherings are on the horizon."
                    : kind === "opportunities"
                      ? "The next opportunity starts with someone sharing it."
                      : "Help this part of our community grow."}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {kind === "events" ? "No upcoming events are listed right now." : "No current listings yet. Check back soon or join to contribute."}
                </p>
                <Link href="/login?mode=join" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
                  Join and contribute →
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="border-t border-primary/10 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">You have a place here.</h2>
            <p className="mt-3 max-w-xl leading-7 opacity-90">
              Build your profile, connect with members, and share what’s happening in your corner of the community.
            </p>
          </div>
          <Link
            href="/login?mode=join"
            className="shrink-0 rounded-xl bg-background px-6 py-3.5 font-semibold text-primary hover:bg-background/90"
          >
            Join Afghan Hub
          </Link>
        </div>
      </section>
    </main>
  );
}
