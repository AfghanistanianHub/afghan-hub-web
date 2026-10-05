import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  UsersRound,
} from "lucide-react";
import { CommunitySignature } from "@/components/public/community-signature";
import { CommunityStoryMotion } from "@/components/public/community-story-motion";
import { CommunityHeroMotion } from "@/components/public/community-hero-motion";
import { CommunityNetwork } from "@/components/public/community-network";
import { DiscoveryPanels } from "@/components/public/discovery-panels";
import styles from "./landing.module.css";
import { ListingCard } from "@/components/public/listing-card";
import { publicCategories, publicKinds, type PublicKind } from "@/lib/public-catalog";
import { getPublicListings } from "@/lib/public-content";

const description =
  "A global community for Afghans to find people, opportunities, organizations, businesses and events — and build meaningful connections.";

export const metadata: Metadata = {
  title: "Your Afghan community, connected.",
  description,
  alternates: { canonical: "https://app.apnbc.ca/" },
  openGraph: {
    title: "Afghan Hub — Your Afghan community, connected",
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
    title: "Afghan Hub — Your Afghan community, connected",
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

const categoryKicker: Record<PublicKind, string> = {
  opportunities: "Move forward",
  events: "Come together",
  businesses: "Shop local",
  organizations: "Find your people",
};

export default async function PublicHome() {
  const feeds = await Promise.all(
    publicKinds.map(kind => getPublicListings(kind, { limit: 3 })),
  );

  return (
    <main id="main-content" className="!flex-none" data-community-story>
      <CommunityStoryMotion />
      <section className={styles.hero} data-hero-region aria-labelledby="landing-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>For Afghans, wherever life takes you.</p>
          <h1 id="landing-title">Your Afghan community,<span>connected.</span></h1>
          <p className={styles.intro}>Find people, opportunities, organizations, businesses and events. Build connections that move you forward.</p>
          <div className={styles.actions}>
            <Link href="/explore" data-landing-cta="explore" className={styles.primary}>Explore the community<ArrowRight size={17} aria-hidden="true" /></Link>
            <Link href="/login?mode=join" data-landing-cta="join" className={styles.join}>Join Afghan Hub<ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <p className={styles.note}>Explore listings without an account. Sign in to discover members.</p>
        </div>
        <CommunityHeroMotion className={styles.heroArt} depth={8} scrollDepth><CommunityNetwork /></CommunityHeroMotion>
      </section>

      <div className={styles.signatureBridge}><CommunitySignature /><span>Rooted in British Columbia. Open to the world.</span></div>
      <DiscoveryPanels />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16" aria-labelledby="community-now-heading">
        <div className="mb-10 flex flex-col gap-5 border-b border-border pb-8 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">From the community</p>
            <h2 id="community-now-heading" className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
              What&apos;s happening now
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Current opportunities, gatherings, local businesses and organizations — without repeating the same navigation cards.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:self-auto"
          >
            Browse everything <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {publicKinds.map((kind, index) => (
            <section key={kind} aria-labelledby={`${kind}-heading`} className="grid gap-7 py-10 first:pt-0 last:pb-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
              <div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  {(() => {
                    const Icon = icons[kind];
                    return <Icon aria-hidden="true" className="size-5" />;
                  })()}
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{categoryKicker[kind]}</p>
                <h3 id={`${kind}-heading`} className="mt-2 text-2xl font-semibold tracking-tight">
                  {publicCategories[kind].label}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{publicCategories[kind].description}</p>
                <Link
                  href={`/explore?type=${kind}`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Explore all <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>

              <div className="min-w-0">
                {feeds[index].unavailable ? (
                  <div role="status" aria-live="polite" className="relative min-h-40 overflow-hidden rounded-2xl border border-border/80 bg-card p-6 text-sm text-muted-foreground">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/[0.05] blur-3xl" />
                    <p className="relative font-medium text-foreground">Listings are temporarily unavailable.</p>
                    <p className="relative mt-2 leading-6">Please try again shortly.</p>
                  </div>
                ) : feeds[index].items.length ? (
                  <div
                    className={`grid gap-5 ${
                      feeds[index].items.length === 1
                        ? "grid-cols-1"
                        : feeds[index].items.length === 2
                          ? "md:grid-cols-2"
                          : "md:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {feeds[index].items.map(item => (
                      <div key={item.slug} className={feeds[index].items.length === 1 ? "w-full max-w-2xl" : ""}>
                        <ListingCard item={item} kind={kind} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative flex min-h-40 items-center overflow-hidden rounded-2xl border border-dashed border-border bg-card px-6 py-7 sm:px-8">
                    <div aria-hidden="true" className="absolute -right-10 -top-12 size-32 rounded-full border border-primary/10" />
                    <div aria-hidden="true" className="absolute right-8 top-8 size-12 rounded-full border border-primary/10" />
                    <div className="relative">
                      <p className="text-base font-semibold sm:text-lg">
                        {kind === "events"
                          ? "New gatherings are on the horizon."
                          : kind === "opportunities"
                            ? "The next opportunity starts with someone sharing it."
                            : "Help this part of our community grow."}
                      </p>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        {kind === "events" ? "No upcoming events are listed right now." : "No current listings yet. Check back soon or join to contribute."}
                      </p>
                      <Link href="/login?mode=join" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                        Join and contribute <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className={styles.audience} aria-labelledby="community-audience">
        <p className={styles.eyebrow}>A place for your next chapter</p>
        <h2 id="community-audience">New to a city. Building a career. Growing a business. Bringing people together.</h2>
        <p>Afghan Hub brings professionals, entrepreneurs, organizations and community members into one shared space — rooted in British Columbia and open to Afghans around the world.</p>
      </section>

      <section className="relative overflow-hidden border-t border-primary/10 bg-primary text-primary-foreground">
        <div aria-hidden="true" className="absolute -right-20 -top-32 size-80 rounded-full border border-primary-foreground/10" />
        <div aria-hidden="true" className="absolute -right-4 -top-8 size-48 rounded-full border border-primary-foreground/10" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Your community, your corner</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">You have a place here.</h2>
            <p className="mt-3 max-w-xl leading-7 opacity-85">
              Build your profile, connect with members, and add what is happening around you.
            </p>
          </div>
          <Link
            href="/login?mode=join"
            className="shrink-0 rounded-xl bg-background px-6 py-3.5 font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-background/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Join Afghan Hub
          </Link>
        </div>
      </section>
    </main>
  );
}
