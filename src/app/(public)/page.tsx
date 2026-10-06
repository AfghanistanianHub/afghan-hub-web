import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Store,
  UsersRound,
} from "lucide-react";
import { ListingCard } from "@/components/public/listing-card";
import { publicCategories, publicKinds } from "@/lib/public-catalog";
import { getPublicListings } from "@/lib/public-content";
import styles from "./landing.module.css";

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

const coreAreas = [
  {
    label: "People",
    href: "/network",
    index: "01",
    description: "Find people by experience, place, interests, and the work they are building.",
    icon: UsersRound,
  },
  {
    label: "Businesses",
    href: "/explore?type=businesses",
    index: "02",
    description: "Discover Afghan-owned and Afghan-serving businesses across communities.",
    icon: Store,
  },
  {
    label: "Organizations",
    href: "/explore?type=organizations",
    index: "03",
    description: "Connect with groups, initiatives, nonprofits, and community institutions.",
    icon: Building2,
  },
  {
    label: "Opportunities",
    href: "/explore?type=opportunities",
    index: "04",
    description: "Find jobs, programs, funding, volunteering, and pathways to grow.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Events",
    href: "/explore?type=events",
    index: "05",
    description: "See gatherings, workshops, cultural programs, and community moments.",
    icon: CalendarDays,
  },
] as const;

export default async function PublicHome() {
  const feeds = await Promise.all(
    publicKinds.map(kind => getPublicListings(kind, { limit: 3 })),
  );

  const feedRows = publicKinds.map((kind, index) => ({ kind, feed: feeds[index] }));
  const opportunityFeed = feedRows.find(({ kind }) => kind === "opportunities")?.feed;
  const eventFeed = feedRows.find(({ kind }) => kind === "events")?.feed;
  const discoveryRows = feedRows.filter(
    ({ kind, feed }) =>
      kind !== "opportunities" &&
      kind !== "events" &&
      (feed.unavailable || feed.items.length > 0),
  );

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroMeta}>
          <p>Afghan Hub / Global community network</p>
          <p>People · Business · Community · Opportunity · Culture</p>
        </div>

        <div className={styles.heroStatement}>
          <p className={styles.eyebrow}>For Afghans, wherever life takes you.</p>
          <h1 id="landing-title">
            A shared place for
            <span>what comes next.</span>
          </h1>
        </div>

        <div className={styles.heroLower}>
          <p className={styles.heroIntro}>
            Afghan Hub brings people, businesses, organizations, opportunities, and events
            into one connected public network — built for discovery first, and meaningful
            connection after.
          </p>
          <div className={styles.heroActions}>
            <Link href="/explore" className={styles.primaryAction}>
              Explore Afghan Hub <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/login?mode=join" className={styles.textAction}>
              Join the network <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <div className={styles.patternRail} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className={styles.core} aria-labelledby="core-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>Five connected areas</p>
          <h2 id="core-heading">One network. Five ways in.</h2>
          <p>
            Start with the part of community life you need today. Everything remains connected
            to the same wider network.
          </p>
        </div>

        <div className={styles.indexList}>
          {coreAreas.map(area => {
            const Icon = area.icon;
            return (
              <Link key={area.label} href={area.href} className={styles.indexRow}>
                <span className={styles.indexNumber}>{area.index}</span>
                <span className={styles.indexTitle}>{area.label}</span>
                <span className={styles.indexDescription}>{area.description}</span>
                <span className={styles.indexIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <ArrowUpRight aria-hidden="true" className={styles.indexArrow} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.peopleFeature} aria-labelledby="people-heading">
        <div className={styles.peopleHeadline}>
          <p className={styles.kicker}>People</p>
          <h2 id="people-heading">The network begins with who is in it.</h2>
        </div>
        <div className={styles.peopleBody}>
          <p>
            Find founders, professionals, students, creators, community builders, newcomers,
            mentors, and collaborators. Public discovery stays simple; member connections
            become richer after sign-in.
          </p>
          <div className={styles.peopleTags} aria-label="Examples of people you can discover">
            <span>Founders</span>
            <span>Professionals</span>
            <span>Students</span>
            <span>Creators</span>
            <span>Community builders</span>
            <span>Newcomers</span>
          </div>
          <Link href="/network" className={styles.inlineLink}>
            Discover people <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      <section className={styles.liveSection} aria-labelledby="live-heading">
        <div className={styles.liveHeader}>
          <div>
            <p className={styles.kicker}>Live from the community</p>
            <h2 id="live-heading">What is moving right now.</h2>
          </div>
          <Link href="/explore" className={styles.inlineLink}>
            Browse all listings <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className={styles.dualFeed}>
          <FeedColumn
            title="Opportunities"
            href="/explore?type=opportunities"
            feed={opportunityFeed}
            kind="opportunities"
          />
          <FeedColumn
            title="Events"
            href="/explore?type=events"
            feed={eventFeed}
            kind="events"
          />
        </div>
      </section>

      {discoveryRows.length > 0 ? (
        <section className={styles.discovery} aria-labelledby="discovery-heading">
          <div className={styles.discoveryLead}>
            <p className={styles.kicker}>Community directory</p>
            <h2 id="discovery-heading">Built by the people already doing the work.</h2>
            <p>
              Browse current businesses and organizations without turning the homepage into a
              wall of cards.
            </p>
          </div>

          <div className={styles.discoveryRows}>
            {discoveryRows.map(({ kind, feed }) => (
              <div key={kind} className={styles.discoveryRow}>
                <div className={styles.discoveryLabel}>
                  <span>{publicCategories[kind].label}</span>
                  <Link href={`/explore?type=${kind}`} aria-label={`Explore all ${publicCategories[kind].label}`}>
                    View all <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
                <div className={styles.discoveryCards}>
                  {feed.unavailable ? (
                    <p className={styles.unavailable}>Listings are temporarily unavailable.</p>
                  ) : (
                    feed.items.slice(0, 2).map(item => (
                      <ListingCard key={item.slug} item={item} kind={kind} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.impact} aria-labelledby="impact-heading">
        <div className={styles.impactStatement}>
          <p className={styles.kicker}>Why Afghan Hub</p>
          <h2 id="impact-heading">A digital commons for a community spread across the world.</h2>
        </div>
        <div className={styles.impactGrid}>
          <article>
            <p className={styles.impactNumber}>01</p>
            <h3>Discoverable</h3>
            <p>Public listings make useful community information easier to find and share.</p>
          </article>
          <article>
            <p className={styles.impactNumber}>02</p>
            <h3>Connected</h3>
            <p>People, organizations, businesses, opportunities, and events live in one system.</p>
          </article>
          <article>
            <p className={styles.impactNumber}>03</p>
            <h3>Global by design</h3>
            <p>Rooted in British Columbia, but structured for Afghan communities everywhere.</p>
          </article>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-heading">
        <div>
          <p className={styles.kicker}>Your place in the network</p>
          <h2 id="cta-heading">Bring what you know. Find what you need.</h2>
        </div>
        <div className={styles.ctaActions}>
          <Link href="/login?mode=join" className={styles.primaryAction}>
            Join Afghan Hub <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="/explore" className={styles.textAction}>
            Explore first <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeedColumn({
  title,
  href,
  feed,
  kind,
}: {
  title: string;
  href: string;
  feed: Awaited<ReturnType<typeof getPublicListings>> | undefined;
  kind: "opportunities" | "events";
}) {
  return (
    <article className={styles.feedColumn}>
      <div className={styles.feedTitle}>
        <h3>{title}</h3>
        <Link href={href} aria-label={`View all ${title}`}>
          View all <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className={styles.feedCards}>
        {!feed || feed.unavailable ? (
          <p className={styles.unavailable}>Listings are temporarily unavailable.</p>
        ) : feed.items.length ? (
          feed.items.slice(0, 2).map(item => (
            <ListingCard key={item.slug} item={item} kind={kind} />
          ))
        ) : (
          <p className={styles.unavailable}>The first community listing is still waiting to be added.</p>
        )}
      </div>
    </article>
  );
}
