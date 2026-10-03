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
    <main id="main-content" data-community-story>
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

      <div className="mx-auto max-w-7xl space-y-12 px-5 py-16 sm:space-y-14 sm:px-8 sm:py-20">
        {publicKinds.map((kind, index) => (
          <section key={kind} aria-labelledby={`${kind}-heading`} className="relative">
            <div className={`grid gap-7 lg:items-start lg:grid-cols-[0.28fr_0.72fr] lg:gap-10 ${index % 2 ? "lg:grid-cols-[0.72fr_0.28fr]" : ""}`}>
              <div className={index % 2 ? "lg:order-2" : ""}>
                <div className="sticky top-24 rounded-3xl border border-border/80 bg-muted/45 p-6 sm:p-7">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                    {(() => {
                      const Icon = icons[kind];
                      return <Icon aria-hidden="true" className="size-5.5" />;
                    })()}
                  </span>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{categoryKicker[kind]}</p>
                  <h2 id={`${kind}-heading`} className="mt-2 text-2xl font-semibold tracking-tight">
                    {publicCategories[kind].label}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{publicCategories[kind].description}</p>
                  <Link
                    href={`/explore?type=${kind}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    Explore all <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>

              <div className={index % 2 ? "lg:order-1" : ""}>
                {feeds[index].unavailable ? (
                  <div role="status" aria-live="polite" className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 text-sm text-muted-foreground shadow-[0_10px_30px_rgb(15_23_42/0.03)]"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/[0.05] blur-3xl"/><p className="relative font-medium text-foreground">Listings are temporarily unavailable.</p><p className="relative mt-2 leading-6">Please try again shortly.</p></div>
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
                      <div
                        key={item.slug}
                        className={
                          feeds[index].items.length === 1
                            ? `w-full max-w-md ${index % 2 ? "lg:ml-auto" : "lg:mr-auto"}`
                            : ""
                        }
                      >
                        <ListingCard item={item} kind={kind} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-card p-8 sm:p-10">
                    <div aria-hidden="true" className="absolute -right-12 -top-12 size-40 rounded-full border border-primary/10" />
                    <div aria-hidden="true" className="absolute right-8 top-8 size-16 rounded-full border border-primary/10" />
                    <p className="relative text-lg font-semibold">
                      {kind === "events"
                        ? "New gatherings are on the horizon."
                        : kind === "opportunities"
                          ? "The next opportunity starts with someone sharing it."
                          : "Help this part of our community grow."}
                    </p>
                    <p className="relative mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                      {kind === "events" ? "No upcoming events are listed right now." : "No current listings yet. Check back soon or join to contribute."}
                    </p>
                    <Link href="/login?mode=join" className="relative mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                      Join and contribute <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

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
