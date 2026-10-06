import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./landing.module.css";
import { publicCategories, publicKinds } from "@/lib/public-catalog";
import { getPublicListings } from "@/lib/public-content";

const description =
  "A global community for Afghans to find people, opportunities, organizations, businesses and events — and build meaningful connections.";

export const metadata: Metadata = {
  title: "Afghan Hub — People and possibility, connected.",
  description,
  alternates: { canonical: "https://app.apnbc.ca/" },
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
        </div>
      </section>
    </main>
  );
}
