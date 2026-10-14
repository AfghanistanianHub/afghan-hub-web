import { getLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChartNoAxesColumnIncreasing, Globe2, Search, Share2, UsersRound } from "lucide-react";
import { HomepageMotion } from "@/components/public/homepage-motion";
import { ScrollCategoryIntroduction } from "@/components/public/scroll-category-introduction";
import { LivingNetwork } from "@/components/public/living-network";
import { NavigatorJourneyLink } from "@/components/assistant/navigator-journey-link";
import { HomepageNavigator } from "@/components/assistant/homepage-navigator";
import styles from "@/app/(public)/landing.module.css";

const description = "Afghan Hub connects people, businesses, organizations, opportunities, and events — creating space for meaningful connections, collaboration, and shared progress.";
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
  const locale = await getLocale();
  const t = (text: string) => translate(locale, text);
  return <main id="main-content" className={styles.page}>
    <HomepageMotion />
    <section className={styles.hero} aria-labelledby="landing-title">
      <div className={styles.statement}>
        <p className={styles.eyebrow}>{t("A MORE CONNECTED AFGHAN FUTURE")}</p>
        <h1 id="landing-title">{t("One network.")}<br />{t("Many ways to ")}<em>{t("belong.")}</em></h1>
        <p className={styles.intro}>{t(description)}</p>
        <div className={styles.actions}><Link href="/login?mode=join" data-landing-cta="join" className={styles.primary}>{t("Join the community")} <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/explore" data-landing-cta="explore" className={styles.secondary}>{t("Explore the network")} <ArrowRight size={17} aria-hidden="true" /></Link></div>
      </div>
      <LivingNetwork />
    </section>

    <HomepageNavigator />

    <section id="how-it-works" className={styles.orientation} aria-labelledby="how-heading">
      <div><h2 id="how-heading">{t("How Afghan Hub works")}</h2><p>{t("A simple path to meaningful connections.")}</p></div>
      <ol className={styles.steps}>{steps.map(({ title, description, icon: Icon }) => <li key={t(title)} data-home-step><span className={styles.stepIcon}><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span><div><h3>{t(title)}</h3><p>{t(description)}</p></div></li>)}</ol>
    </section>

    <ScrollCategoryIntroduction />

    <section className={styles.paths} aria-labelledby="paths-heading"><div><p className={styles.eyebrow}>{t("START WITH YOUR GOAL")}</p><h2 id="paths-heading">{t("Your next step starts here.")}</h2><p>{t("There\u2019s more than one way into the network.")}<br />{t("Let the Navigator help you find yours.")}</p></div><div className={styles.pathLinks}>{paths.map(path => <NavigatorJourneyLink key={path.title} query={path.query} title={t(path.title)} />)}</div></section>

    <section className={styles.value} aria-labelledby="value-heading"><div><h2 id="value-heading">{t("A stronger, more connected")}<br />{t("Afghan community")}</h2><p>{t("A shared space to make community work visible, exchange knowledge, and build relationships that open new possibilities.")}</p></div><div className={styles.valuePoints}><div data-home-benefit><UsersRound size={24} strokeWidth={1.5} aria-hidden="true" /><h3>{t("Greater visibility")}</h3><p>{t("Give your work a place to be discovered.")}</p></div><div data-home-benefit><Share2 size={24} strokeWidth={1.5} aria-hidden="true" /><h3>{t("Stronger connections")}</h3><p>{t("Find common ground and move forward together.")}</p></div><div data-home-benefit><Globe2 size={24} strokeWidth={1.5} aria-hidden="true" /><h3>{t("More possibilities")}</h3><p>{t("Share opportunities and collaborate across communities.")}</p></div></div></section>

    <section className={styles.final} data-home-finale aria-labelledby="join-heading"><div><h2 data-home-reveal id="join-heading">{t("Be part of what's next.")}</h2><p data-home-reveal>{t("Join Afghan Hub and help build a more connected, supportive, and vibrant community.")}</p></div><div className={styles.actions} data-home-reveal><Link href="/login?mode=join" className={styles.primary}>{t("Get started")} <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/explore" className={styles.secondary}>{t("Explore the platform")} <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
  </main>;
}
