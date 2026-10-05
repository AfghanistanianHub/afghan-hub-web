import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PeopleIllustration, OrganizationsIllustration, EventsIllustration, OpportunitiesIllustration, BusinessesIllustration } from "./community-illustrations";
import styles from "./discovery-panels.module.css";
import motion from "./illustration-motion.module.css";

const destinations = [
  { key: "people", title: "People", description: "Find people who share your interests.", link: "Find your people", href: "/network", Illustration: PeopleIllustration },
  { key: "organizations", title: "Organizations", description: "Discover Afghan-led organizations and community groups.", link: "Explore organizations", href: "/explore?type=organizations", Illustration: OrganizationsIllustration },
  { key: "businesses", title: "Businesses", description: "Find Afghan businesses, services and the people building them.", link: "Explore businesses", href: "/explore?type=businesses", Illustration: BusinessesIllustration },
  { key: "events", title: "Events", description: "Find your next gathering.", link: "Discover events", href: "/explore?type=events", Illustration: EventsIllustration },
  { key: "opportunities", title: "Opportunities", description: "Discover your next opportunity.", link: "Find opportunities", href: "/explore?type=opportunities", Illustration: OpportunitiesIllustration },
] as const;

export function DiscoveryPanels() {
  return (
    <section className={styles.discovery} aria-labelledby="community-discovery">
      <div className={styles.heading}><h2 id="community-discovery">Start with what you need</h2><p>Quick paths — live community updates follow below.</p></div>
      <div className={styles.panels}>
        {destinations.map(({ key, title, description, link, href, Illustration }) => (
          <article className={styles.panelWrapper} key={key}>
            <Link className={styles.panel} href={href} prefetch={false}
              aria-labelledby={`discovery-${key}-title`} aria-describedby={`discovery-${key}-description`}
              data-illustration-trigger data-discovery-panel={key} data-discovery-link={key}>
              <div className={`${styles.art} ${motion.art}`}><Illustration /></div>
              <h3 id={`discovery-${key}-title`}>{title}</h3><p id={`discovery-${key}-description`}>{description}</p>
              <span className={styles.destination}>{link}<ArrowRight size={17} aria-hidden="true" /></span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
