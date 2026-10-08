"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const NAVIGATOR_JOURNEY_EVENT = "afghan-hub:navigator-journey";

export function NavigatorJourneyLink({ query, title }: { query: string; title: string }) {
  return <Link href={`/?journey=${encodeURIComponent(query)}#ai-navigator`} onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // On other routes, allow the native link to navigate to the homepage.
    // Only intercept when the Navigator is mounted on this page.
    const navigator = document.getElementById("ai-navigator");
    if (!navigator) return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent(NAVIGATOR_JOURNEY_EVENT, { detail: query }));
    navigator.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }}>{title}<ArrowRight size={17} aria-hidden="true" /></Link>;
}
