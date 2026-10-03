import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CommunityIllustration } from "./community-illustrations";
import styles from "./community-network.module.css";

const nodes = [
  { key: "people", title: "People", href: "/network", detail: "Find professionals and members. Sign in to connect." },
  { key: "opportunities", title: "Opportunities", href: "/explore?type=opportunities", detail: "Discover work, volunteering and ways to grow." },
  { key: "organizations", title: "Organizations", href: "/explore?type=organizations", detail: "Meet the groups bringing our community together." },
  { key: "events", title: "Events", href: "/explore?type=events", detail: "Find upcoming gatherings and shared experiences." },
  { key: "businesses", title: "Businesses", href: "/explore?type=businesses", detail: "Discover Afghan businesses and services." },
];

export function CommunityNetwork() {
  return (
    <div className={styles.network}>
      <CommunityIllustration />
      <nav aria-label="Explore the Afghan Hub community" className={styles.nodes}>
        {nodes.map(node => (
          <Link key={node.key} href={node.href} prefetch={false} className={styles.node}
            data-community-node={node.key} aria-describedby={`network-${node.key}`}>
            <span aria-hidden="true" className={styles.dot} /><span className={styles.nodeText}>{node.title}<span aria-hidden="true" className={styles.mobileDetail}>{node.detail}</span></span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <p className={styles.caption}>
        <span className={styles.defaultCaption}>One community. Many ways forward.</span>
        {nodes.map(node => <span key={node.key} id={`network-${node.key}`} data-community-description={node.key} className={styles.preview}>{node.detail}</span>)}
      </p>
    </div>
  );
}
