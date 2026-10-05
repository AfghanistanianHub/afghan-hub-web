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
  businesses: "Support community",
  organizations: "Find your people",
};

export default async function PublicHome() {
  const feeds = await Promise.all(
    publicKinds.map(kind => getPublicListings(kind, { limit: 3 })),
  );
  const feedRows = publicKinds.map((kind, index) => ({ kind, feed: feeds[index] }));
  const visibleRows = feedRows.filter(({ feed }) => feed.unavailable || feed.items.length > 0);
  const emptyKinds = feedRows.filter(({ feed }) => !feed.unavailable && feed.items.length === 0).map(({ kind }) => kind);

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
        <CommunityHeroMotion className={styles.heroArt} depth={10} scrollDepth><CommunityNetwork /></CommunityHeroMotion>
      </section>

      <div className={styles.signatureBridge}><CommunitySignature /><span>Rooted in British Columbia. Open to the world.</span></div>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14" aria-labelledby="community-now-heading">
        <div className="mb-8 flex flex-col gap-5 border-b border-border pb-6 sm:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">From the community</p>
            <h2 id="community-now-heading" className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
              What&apos;s happening now
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Browse current opportunities, gatherings, community businesses and organizations in one clear view.
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
          {visibleRows.map(({ kind, feed }) => (
            <section key={kind} aria-labelledby={`${kind}-heading`} className="grid gap-6 py-8 first:pt-0 last:pb-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{categoryKicker[kind]}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    {(() => {
                      const Icon = icons[kind];
                      return <Icon aria-hidden="true" className="size-4.5" />;
                    })()}
                  </span>
                  <h3 id={`${kind}-heading`} className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {publicCategories[kind].label}
                  </h3>
                </div>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{publicCategories[kind].description}</p>
                <Link
                  href={`/explore?type=${kind}`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Explore all <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>

              <div className="min-w-0">
                {feed.unavailable ? (
                  <div role="status" aria-live="polite" className="relative min-h-32 overflow-hidden rounded-2xl border border-border/80 bg-card p-6 text-sm text-muted-foreground">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/[0.05] blur-3xl" />
                    <p className="relative font-medium text-foreground">Listings are temporarily unavailable.</p>
                    <p className="relative mt-2 leading-6">Please try again shortly.</p>
                  </div>
                ) : feed.items.length ? (
                  <div
                    className={`grid gap-5 ${
                      feed.items.length === 1
                        ? "grid-cols-1"
                        : feed.items.length === 2
                          ? "md:grid-cols-2"
                          : "md:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {feed.items.map(item => (
                      <div key={item.slug} className={feed.items.length === 1 ? "w-full max-w-xl" : ""}>
                        <ListingCard item={item} kind={kind} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        {emptyKinds.length > 0 ? (
          <div className="mt-9 flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Some community sections are still waiting for their first listing.</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {emptyKinds.map(kind => publicCategories[kind].label).join(" · ")}
              </p>
            </div>
            <Link
              href="/login?mode=join"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:self-auto"
            >
              Add something <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        ) : null}
      </section>

      <section className={styles.audience} aria-labelledby="community-audience">
        <div className={styles.audienceCopy}>
          <p className={styles.eyebrow}>A place for your next chapter</p>
          <h2 id="community-audience">New to a city. Building a career. Growing a business. Bringing people together.</h2>
          <p className={styles.audienceText}>Afghan Hub brings professionals, entrepreneurs, organizations and community members into one shared space — rooted in British Columbia and open to Afghans around the world.</p>
        </div>
        <div className={styles.audienceAction}>
          <p className={styles.audiencePrompt}>Build your profile, connect with members, and contribute what is happening around you.</p>
          <Link
            href="/login?mode=join"
            className={styles.audienceButton}
          >
            Join Afghan Hub <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
