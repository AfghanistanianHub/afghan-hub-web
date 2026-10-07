import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./landing.module.css";
import { publicCategories, publicKinds } from "@/lib/public-catalog";
import { getPublicListings } from "@/lib/public-content";
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
import { CommunitySignature } from "@/components/public/community-signature";
import { CommunityStoryMotion } from "@/components/public/community-story-motion";
import { ListingDate } from "@/components/public/listing-card";
import { publicCategories, publicHref, publicKinds, type PublicKind } from "@/lib/public-catalog";
import { getPublicListings, type PublicListing } from "@/lib/public-content";
import styles from "./landing.module.css";

const description =
  "A global community for Afghans to find people, opportunities, organizations, businesses and events — and build meaningful connections.";

export const metadata: Metadata = {
  title: "Afghan Hub — People and possibility, connected.",
  description,
  alternates: { canonical: "https://app.apnbc.ca/" },
  openGraph: {
    title: "Afghan Hub — Your Afghan community, connected",
    description,
    url: "https://app.apnbc.ca/",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Afghan Hub — community, opportunities, organizations, businesses, and events" }],
  },
  twitter: { card: "summary_large_image", title: "Afghan Hub — Your Afghan community, connected", description, images: ["/opengraph-image"] },
};

const index = [
  { label: "People", href: "/network", note: "Meet the community" },
  { label: "Businesses", href: "/explore?type=businesses", note: "Find what Afghans are building" },
  { label: "Organizations", href: "/explore?type=organizations", note: "Discover groups doing the work" },
  { label: "Opportunities", href: "/explore?type=opportunities", note: "Move your next chapter forward" },
  { label: "Events", href: "/explore?type=events", note: "Know where people are gathering" },
] as const;

export default async function PublicHome() {
  const feeds = await Promise.all(publicKinds.map(kind => getPublicListings(kind, { limit: 3 })));
  const rows = publicKinds.map((kind, i) => ({ kind, feed: feeds[i] }));

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <p className={styles.kicker}>A global network for Afghan people and possibility.</p>
        <h1 id="landing-title" className={styles.display} aria-label="Afghan Hub">
          <span className={styles.afghan}>AFGHAN</span>
          <span className={styles.hub}>HUB</span>
        </h1>
        <div className={styles.heroAside}>
          <p>Find each other. Share what you&apos;re building. Discover what comes next.</p>
          <Link href="/explore">Enter the community <ArrowRight aria-hidden="true" /></Link>
        </div>
        <p className={styles.heroFoot}>Rooted in British Columbia <span>—</span> open to the world.</p>
      </section>

      <nav className={styles.index} aria-label="Explore Afghan Hub">
        {index.map((item, i) => (
          <Link href={item.href} key={item.label} className={styles.indexRow}>
            <span className={styles.number}>0{i + 1}</span>
            <span className={styles.indexLabel}>{item.label}</span>
            <span className={styles.indexNote}>{item.note}</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <section className={styles.statement} aria-labelledby="statement-title">
        <p className={styles.sectionMark}>One shared space</p>
        <h2 id="statement-title">Distance changes where we live.<br /><em>Not what we can build together.</em></h2>
        <p className={styles.statementBody}>Afghan Hub brings community, work, ideas and gatherings into one public network — designed to make useful connections easier to find.</p>
      </section>

      <section className={styles.live} aria-labelledby="live-title">
        <header className={styles.liveHeader}>
          <p className={styles.sectionMark}>Live index / 2026</p>
          <h2 id="live-title">From the community</h2>
          <Link href="/explore">View everything <ArrowRight aria-hidden="true" /></Link>
        </header>
        <div className={styles.feedRows}>
          {rows.map(({ kind, feed }, rowIndex) => (
            <section className={styles.feedRow} key={kind} aria-labelledby={`${kind}-title`}>
              <div className={styles.feedTitle}>
                <span>0{rowIndex + 2}</span>
                <h3 id={`${kind}-title`}>{publicCategories[kind].label}</h3>
                <p>{publicCategories[kind].description}</p>
              </div>
              <div className={styles.feedItems}>
                {feed.unavailable ? <p className={styles.empty}>Temporarily unavailable.</p> : feed.items.length ? feed.items.map(item => (
                  <Link key={item.slug} href={`/explore/${kind}/${item.slug}`} className={styles.feedItem}>
                    <span>{item.title}</span><ArrowRight aria-hidden="true" />
                  </Link>
                )) : <p className={styles.empty}>Waiting for the first community listing.</p>}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className={styles.story} aria-labelledby="story-title">
        <p className={styles.sectionMark}>Community / not audience</p>
        <h2 id="story-title">New city.<br />New work.<br /><em>Same network.</em></h2>
        <div className={styles.storyCopy}>
          <p>For the professional looking for a collaborator. The newcomer looking for a first connection. The business looking for customers. The organization looking for people. The community member looking for somewhere to belong.</p>
          <Link href="/login?mode=join">Make your place in it <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-title">
        <p>AFGHAN HUB / GLOBAL COMMUNITY NETWORK</p>
        <h2 id="cta-title">Find your people.<br /><span>Build what&apos;s next.</span></h2>
        <div className={styles.finalLinks}>
          <Link href="/login?mode=join">Join Afghan Hub <ArrowRight aria-hidden="true" /></Link>
          <Link href="/explore">Explore first</Link>
function ListingModule({ item, kind, className = "" }: { item?: PublicListing; kind: PublicKind; className?: string }) {
  const Icon = icons[kind];
  const meta = publicCategories[kind];
  return (
    <article className={`${styles.module} ${styles[kind]} ${className}`}>
      <div className={styles.moduleTop}>
        <span className={styles.moduleKind}><Icon size={15} aria-hidden="true" />{meta.label}</span>
        <ArrowUpRight size={17} aria-hidden="true" />
      </div>
      {item ? (
        <>
          <p className={styles.moduleCategory}>{item.category}</p>
          <h2><Link href={publicHref(kind, item.slug)}>{item.title}</Link></h2>
          <p className={styles.moduleSummary}>{item.summary || meta.description}</p>
          <div className={styles.moduleMeta}>
            <span><MapPin size={13} aria-hidden="true" />{item.location}</span>
            {item.date ? <span><ListingDate item={item} kind={kind} /></span> : null}
          </div>
        </>
      ) : (
        <>
          <p className={styles.moduleCategory}>Community directory</p>
          <h2>{meta.label}</h2>
          <p className={styles.moduleSummary}>{meta.description}</p>
          <Link className={styles.textLink} href={`/explore?type=${kind}`}>Explore {meta.label.toLowerCase()} <ArrowRight size={15} aria-hidden="true" /></Link>
        </>
      )}
    </article>
  );
}

export default async function PublicHome() {
  const feeds = await Promise.all(publicKinds.map(kind => getPublicListings(kind, { limit: 3 })));
  const byKind = Object.fromEntries(publicKinds.map((kind, index) => [kind, feeds[index]])) as Record<PublicKind, (typeof feeds)[number]>;
  const primary = (kind: PublicKind) => byKind[kind].items[0];

  return (
    <main id="main-content" className={styles.page} data-community-story>
      <CommunityStoryMotion />

      <section className={styles.board} aria-labelledby="landing-title">
        <div className={styles.statement}>
          <p className={styles.eyebrow}><Sparkles size={13} aria-hidden="true" /> A living Afghan network</p>
          <h1 id="landing-title">Find your people.<span>Build what’s next.</span></h1>
          <p className={styles.intro}>One shared place for Afghan people, businesses, organizations, opportunities and events — across cities and borders.</p>
          <div className={styles.actions}>
            <Link href="/explore" className={styles.primary}>Explore the community <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link href="/login?mode=join" className={styles.secondary}>Join Afghan Hub</Link>
          </div>
        </div>

        <Link href="/login?mode=join" className={`${styles.module} ${styles.people}`}>
          <div className={styles.moduleTop}><span className={styles.moduleKind}><UsersRound size={15} aria-hidden="true" />People</span><ArrowUpRight size={17} aria-hidden="true" /></div>
          <div className={styles.peopleGlyphs} aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <p className={styles.moduleCategory}>Member network</p>
          <h2>Meet people who can move an idea forward.</h2>
          <p className={styles.moduleSummary}>Profiles are available to signed-in members, keeping community discovery inside the network.</p>
        </Link>

        <ListingModule kind="opportunities" item={primary("opportunities")} className={styles.opportunityFeature} />
        <ListingModule kind="events" item={primary("events")} className={styles.eventFeature} />
        <ListingModule kind="businesses" item={primary("businesses")} className={styles.businessFeature} />
        <ListingModule kind="organizations" item={primary("organizations")} className={styles.organizationFeature} />

        <div className={styles.boardRail} aria-label="Afghan Hub community areas">
          <span>People</span><span>Businesses</span><span>Organizations</span><span>Opportunities</span><span>Events</span>
        </div>
      </section>

      <div className={styles.signatureBridge}><CommunitySignature /><span>Rooted in British Columbia · open to the world</span></div>

      <section className={styles.live} aria-labelledby="live-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Live from the community</p>
          <h2 id="live-heading">Different things are happening at the same time.</h2>
          <p>Not a row of identical cards. A changing view of what people can discover, join and build through Afghan Hub.</p>
        </div>
        <div className={styles.liveGrid}>
          {publicKinds.map((kind, kindIndex) =>
            byKind[kind].items.slice(1).map((item, itemIndex) => (
              <ListingModule key={`${kind}-${item.slug}`} kind={kind} item={item} className={(kindIndex + itemIndex) % 3 === 0 ? styles.wide : ""} />
            ))
          )}
          <Link href="/explore" className={styles.exploreModule}>
            <span>Explore everything</span>
            <strong>One directory.<br />Many ways in.</strong>
            <ArrowRight size={26} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className={styles.manifesto} aria-labelledby="manifesto-heading">
        <div>
          <p className={styles.eyebrow}>A community utility, not a feed</p>
          <h2 id="manifesto-heading">New to a city. Growing a business. Looking for work. Organizing an event. Finding collaborators.</h2>
        </div>
        <div className={styles.manifestoAction}>
          <p>Afghan Hub is designed to make the distance between “I’m looking” and “I found it” shorter — while giving community work a place to be visible.</p>
          <Link href="/login?mode=join" className={styles.primary}>Create your place in the network <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
