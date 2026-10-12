import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChartNoAxesColumnIncreasing, Globe2, Search, Share2, UsersRound } from "lucide-react";
import { HomepageMotion } from "@/components/public/homepage-motion";
import { ScrollCategoryIntroduction } from "@/components/public/scroll-category-introduction";
import { LivingNetwork } from "@/components/public/living-network";
import { NavigatorJourneyLink } from "@/components/assistant/navigator-journey-link";
import { HomepageNavigator } from "@/components/assistant/homepage-navigator";
import styles from "./landing.module.css";

const description = "Afghan Hub connects people, businesses, organizations, opportunities, and events — creating space for meaningful connections, collaboration, and shared progress.";
export const metadata: Metadata = {
  title: "One network. Many ways to belong.", description,
  alternates: { canonical: "https://app.apnbc.ca/" },
  openGraph: { title: "Afghan Hub — One network. Many ways to belong.", description, url: "https://app.apnbc.ca/", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Afghan Hub community network" }] },
  twitter: { card: "summary_large_image", title: "Afghan Hub — One network. Many ways to belong.", description, images: ["/opengraph-image"] },
};
const steps = [
  { title: "Discover", description: "Find people, businesses, organizations, opportunities, and events.", icon: Search },
  { title: "Connect", description: "Build meaningful relationships across communities.", icon: Share2 },
  { title: "Participate", description: "Join events, pursue opportunities, and collaborate.", icon: CalendarDays },
  { title: "Grow", description: "Create visibility, strengthen relationships, and increase impact.", icon: ChartNoAxesColumnIncreasing },
];
const paths = [
  { title: "Find my community", query: "Meet people" },
  { title: "Grow my business", query: "Grow my work or business" },
  { title: "Discover opportunities", query: "Find opportunities" },
  { title: "Connect with organizations", query: "Connect with organizations" },
  { title: "Explore arts and culture", query: "Artists & Creatives" },
  { title: "Attend or host events", query: "Explore events" },
];

export default async function PublicHome() {
  return <main id="main-content" className={styles.page}>
    <HomepageMotion />
    <section className={styles.hero} aria-labelledby="landing-title">
      <div className={styles.statement}>
        <p className={styles.eyebrow}>A MORE CONNECTED AFGHAN FUTURE</p>
        <h1 id="landing-title">One network.<br />Many ways to <em>belong.</em></h1>
        <p className={styles.intro}>{description}</p>
        <div className={styles.actions}><Link href="/login?mode=join" data-landing-cta="join" className={styles.primary}>Join the community <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/explore" data-landing-cta="explore" className={styles.secondary}>Explore the network <ArrowRight size={17} aria-hidden="true" /></Link></div>
      </div>
      <LivingNetwork />
    </section>

    <HomepageNavigator />

    <section id="how-it-works" className={styles.orientation} aria-labelledby="how-heading">
      <div><h2 id="how-heading">How Afghan Hub works</h2><p>A simple path to meaningful connections.</p></div>
      <ol className={styles.steps}>{steps.map(({ title, description, icon: Icon }) => <li key={title} data-home-step><span className={styles.stepIcon}><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
    </section>

    <ScrollCategoryIntroduction />

    <section className={styles.paths} aria-labelledby="paths-heading"><div><p className={styles.eyebrow}>START WITH YOUR GOAL</p><h2 id="paths-heading">Your next step starts here.</h2><p>There’s more than one way into the network.<br />Let the Navigator help you find yours.</p></div><div className={styles.pathLinks}>{paths.map(path => <NavigatorJourneyLink key={path.title} query={path.query} title={path.title} />)}</div></section>

    <section className={styles.value} aria-labelledby="value-heading"><div><h2 id="value-heading">A stronger, more connected<br />Afghan community</h2><p>A shared space to make community work visible, exchange knowledge, and build relationships that open new possibilities.</p></div><div className={styles.valuePoints}><div><UsersRound size={24} strokeWidth={1.5} aria-hidden="true" /><h3>Greater visibility</h3><p>Give your work a place to be discovered.</p></div><div><Share2 size={24} strokeWidth={1.5} aria-hidden="true" /><h3>Stronger connections</h3><p>Find common ground and move forward together.</p></div><div><Globe2 size={24} strokeWidth={1.5} aria-hidden="true" /><h3>More possibilities</h3><p>Share opportunities and collaborate across communities.</p></div></div></section>

    <section className={styles.final} data-home-finale aria-labelledby="join-heading"><div><h2 data-home-reveal id="join-heading">Be part of what&apos;s next.</h2><p data-home-reveal>Join Afghan Hub and help build a more connected, supportive, and vibrant community.</p></div><div className={styles.actions} data-home-reveal><Link href="/login?mode=join" className={styles.primary}>Get started <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/explore" className={styles.secondary}>Explore the platform <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
  </main>;
}
