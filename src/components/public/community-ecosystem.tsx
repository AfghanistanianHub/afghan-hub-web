import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Building2, UsersRound } from "lucide-react";
import styles from "./community-ecosystem.module.css";

// Shared photo-free artwork for hero cards and listing covers.
export function CommunityPattern({ variant = "indigo" }: { variant?: "indigo" | "coral" | "gold" | "blue" }) {
  return <div aria-hidden="true" className={`${styles.pattern} ${styles[variant]}`}><svg viewBox="0 0 320 120" fill="none" preserveAspectRatio="xMidYMid slice"><path d="M-40 120 80 0l120 120L320 0l120 120M-40 60 80-60 200 60 320-60 440 60" stroke="currentColor" strokeWidth="24"/><circle cx="160" cy="60" r="43" stroke="currentColor" strokeWidth="2"/><path d="m160 18 42 42-42 42-42-42Z" stroke="currentColor" strokeWidth="2"/></svg></div>;
}

const cards = [
  { key: "organizations", label: "Organizations", text: "Build something together", Icon: Building2, variant: "indigo" as const },
  { key: "events", label: "Events", text: "Find your next gathering", Icon: CalendarDays, variant: "coral" as const },
  { key: "opportunities", label: "Opportunities", text: "Open a new door", Icon: BriefcaseBusiness, variant: "gold" as const },
];

export function CommunityEcosystem() {
  return <div className={styles.ecosystem} role="group" aria-label="People connected to organizations, events, and opportunities">
    <svg aria-hidden="true" className={styles.connections} viewBox="0 0 540 510" fill="none"><circle cx="270" cy="255" r="190" stroke="currentColor" strokeDasharray="4 9"/><path d="M140 275 140 100M140 275 400 275M140 275 140 450M140 275 400 450" stroke="currentColor" strokeWidth="2"/><circle cx="140" cy="275" r="75" stroke="currentColor"/></svg>
    <div className={styles.people}><div aria-hidden="true" className={styles.avatars}><span/><span/><span/></div><UsersRound aria-hidden="true" size={18}/><strong>People at the heart</strong><span>A community of possibilities</span></div>
    {cards.map(({key, label, text, Icon, variant}) => <Link key={key} href={`/explore?type=${key}`} className={`${styles.card} ${styles[key]}`}><CommunityPattern variant={variant}/><div className={styles.cardBody}><span className={styles.cardLabel}><Icon aria-hidden="true" size={16}/><span>{label}</span><ArrowUpRight aria-hidden="true" size={16}/></span><strong>{text}</strong></div></Link>)}
    <Link href="/explore?type=businesses" className={styles.businesses}><Building2 aria-hidden="true" size={18}/><span>Discover Afghan businesses</span><ArrowUpRight aria-hidden="true" size={16}/></Link>
    <span aria-hidden="true" className={styles.spark}>✳</span>
  </div>;
}
