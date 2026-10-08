import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, Landmark, Rocket, UsersRound } from "lucide-react";
import { communityAreas } from "./community-areas";
import styles from "./living-network.module.css";

export const communityIcons = { people: UsersRound, businesses: BriefcaseBusiness, organizations: Landmark, opportunities: Rocket, events: CalendarDays };

export function LivingNetwork() {
  return <nav className={styles.network} aria-label="Explore the five community areas" data-hero-region>
    <svg viewBox="0 0 640 430" className={styles.geometry} fill="none" aria-hidden="true">
      <ellipse cx="327" cy="360" rx="275" ry="52" stroke="#dcd0e9" />
      <path d="M52 354C70 10 584 10 606 354M86 357C100 146 550 146 570 357M160 365C145 266 495 266 512 365" stroke="#e0d3ef" />
      <g className={`${styles.branch} ${styles.people}`}><path d="M323 56C226 86 224 272 226 370M323 56C414 92 416 267 419 372M323 56V389" /><circle cx="323" cy="191" r="2.8" /><circle cx="406" cy="199" r="2.5" /></g>
      <g className={`${styles.branch} ${styles.businesses}`}><path d="M139 140C192 137 244 214 244 375M139 140V375M139 140C386 103 559 213 565 368" /><circle cx="216" cy="190" r="2.6" /><circle cx="490" cy="218" r="2.5" /></g>
      <g className={`${styles.branch} ${styles.organizations}`}><path d="M532 134C501 213 501 292 500 378M532 134C366 99 155 207 151 363M532 134V376" /><circle cx="502" cy="228" r="2.5" /><circle cx="208" cy="247" r="2.7" /></g>
      <g className={`${styles.branch} ${styles.opportunities}`}><path d="M78 266C181 180 467 151 540 365M78 266C178 254 207 325 210 382M78 266V363" /><circle cx="115" cy="251" r="3" /><circle cx="155" cy="283" r="2.5" /></g>
      <g className={`${styles.branch} ${styles.events}`}><path d="M588 267C477 248 444 303 443 382M588 267C359 247 271 266 112 371M588 267V366" /><circle cx="536" cy="293" r="2.8" /><circle cx="429" cy="282" r="2.5" /></g>
      <g fill="#9271b4"><circle cx="213" cy="80" r="3" /><circle cx="443" cy="91" r="3" /><circle cx="578" cy="206" r="2.5" /><circle cx="66" cy="198" r="2.5" /></g>
      <g stroke="#e7ddec"><path d="M0 397Q320 326 640 397M0 411Q320 346 640 411M0 426Q320 365 640 426" /></g>
    </svg>
    {communityAreas.map(area => { const Icon = communityIcons[area.key]; return <Link key={area.key} href={area.href} data-community-node={area.key} aria-label={area.label} aria-describedby={`network-${area.key}-description`} className={`${styles.node} ${styles[area.key]}`}>
      <span className={styles.icon}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span>
      <span className={styles.label}>{area.label}</span>
      <span id={`network-${area.key}-description`} className={styles.description}>{area.description}</span>
    </Link>; })}
  </nav>;
}
