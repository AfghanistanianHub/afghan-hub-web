"use client";

import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { ArrowUpRight, Building2, CalendarDays, BriefcaseBusiness, UsersRound } from "lucide-react";
import styles from "./circular-discovery.module.css";

const destinations = [
  { key: "people", title: "People", description: "Find people who share your interests.", href: "/network", Icon: UsersRound, angle: 225 },
  { key: "organizations", title: "Organizations", description: "Discover Afghan-led organizations and businesses.", href: "/explore?type=organizations", Icon: Building2, angle: 315 },
  { key: "events", title: "Events", description: "Find your next gathering.", href: "/explore?type=events", Icon: CalendarDays, angle: 45 },
  { key: "opportunities", title: "Opportunities", description: "Discover your next opportunity.", href: "/explore?type=opportunities", Icon: BriefcaseBusiness, angle: 135 },
] as const;
type Destination = (typeof destinations)[number]["key"];

function point(radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return [250 + radius * Math.cos(radians), 250 + radius * Math.sin(radians)];
}
function geometry(angle: number) {
  const start = angle - 41;
  const end = angle + 41;
  const outerStart = point(238, start), outerEnd = point(238, end);
  const innerEnd = point(143, end), innerStart = point(143, start);
  const points = [
    ...Array.from({ length: 25 }, (_, i) => point(246, start + (end - start) * i / 24)),
    ...Array.from({ length: 25 }, (_, i) => point(136, end - (end - start) * i / 24)),
  ];
  return {
    path: `M${outerStart} A238 238 0 0 1 ${outerEnd} L${innerEnd} A143 143 0 0 0 ${innerStart} Z`,
    clip: `polygon(${points.map(([x, y]) => `${x / 5}% ${y / 5}%`).join(",")})`,
    label: point(190, angle),
    offset: point(3, angle).map(value => value - 250),
  };
}
const segments = destinations.map(destination => ({ ...destination, ...geometry(destination.angle) }));

export function CircularDiscovery() {
  const id = useId();
  const [hovered, setHovered] = useState<Destination | null>(null);
  const [focused, setFocused] = useState<Destination | null>(null);
  const active = focused ?? hovered;
  const selected = destinations.find(destination => destination.key === active);
  const Icon = selected?.Icon;

  return (
    <nav className={styles.discovery} aria-label="Discover Afghan Hub">
      <div className={styles.composition} data-discovery-active={active ?? "default"}
        onPointerLeave={() => setHovered(null)}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null); }}>
        <svg className={styles.detail} viewBox="0 0 500 500" fill="none" aria-hidden="true">
          <circle cx="250" cy="250" r="126" stroke="currentColor" strokeDasharray="2 9" />
          <path d="m250 114 7 7-7 7-7-7Z m0 258 7 7-7 7-7-7Z" fill="currentColor" />
        </svg>
        <div className={styles.center} aria-live="off">
          {Icon ? <div className={styles.community}><Icon size={28} aria-hidden="true" /></div> : <div className={styles.community} aria-hidden="true"><span /><span /><span /></div>}
          <strong>{selected?.title ?? "A community of possibilities"}</strong>
          <p>{selected?.description ?? "Connect. Belong. Grow together."}</p>
        </div>
        {segments.map(({ key, title, description, href, Icon: SectionIcon, path, clip, label, offset }) => (
          <Link key={key} href={href} prefetch={false} aria-describedby={`${id}-${key}`}
            className={`${styles.segment} ${styles[key]}`} data-discovery-link={key} data-emphasized={active === key}
            style={{ "--clip": clip, "--x": `${label[0] / 5}%`, "--y": `${label[1] / 5}%`, "--dx": `${offset[0]}px`, "--dy": `${offset[1]}px` } as CSSProperties}
            onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(key); }}
            onPointerLeave={() => setHovered(previous => previous === key ? null : previous)}
            onFocus={() => setFocused(key)}>
            <svg className={styles.surface} viewBox="0 0 500 500" aria-hidden="true"><path d={path} /></svg>
            <span className={styles.label}><SectionIcon size={20} aria-hidden="true" /><span>{title}</span><ArrowUpRight className={styles.arrow} size={15} aria-hidden="true" /></span>
            <span className="sr-only" id={`${id}-${key}`}>{description}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
