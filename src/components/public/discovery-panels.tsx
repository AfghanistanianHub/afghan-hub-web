import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PeopleIllustration, OrganizationsIllustration, EventsIllustration, OpportunitiesIllustration } from "./community-illustrations";
import styles from "./discovery-panels.module.css";

const destinations = [
  { key: "people", title: "People", description: "Find people who share your interests.", link: "Find your people", href: "/network", Illustration: PeopleIllustration },
  { key: "organizations", title: "Organizations", description: "Discover Afghan-led organizations and businesses.", link: "Explore organizations", href: "/explore?type=organizations", Illustration: OrganizationsIllustration },
  { key: "events", title: "Events", description: "Find your next gathering.", link: "Discover events", href: "/explore?type=events", Illustration: EventsIllustration },
  { key: "opportunities", title: "Opportunities", description: "Discover your next opportunity.", link: "Find opportunities", href: "/explore?type=opportunities", Illustration: OpportunitiesIllustration },
] as const;

export function DiscoveryPanels() {
  return (
    <section className={styles.discovery} aria-labelledby="community-discovery">
      <div className={styles.heading}><h2 id="community-discovery">Find your place in the community</h2><p>Four ways to begin.</p></div>
      <div className={styles.panels}>
        {destinations.map(({ key, title, description, link, href, Illustration }) => (
          <article className={styles.panel} key={key} data-discovery-panel={key}>
            <div className={styles.art}><Illustration /></div>
            <h3>{title}</h3><p id={`discovery-${key}-description`}>{description}</p>
            <Link href={href} prefetch={false} aria-describedby={`discovery-${key}-description`} data-discovery-link={key}>{link}<ArrowRight size={17} aria-hidden="true" /></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
