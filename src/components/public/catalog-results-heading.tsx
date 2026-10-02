"use client";

import { useEffect, useRef } from "react";

// Streaming can deliver this anchor after the browser's initial fragment lookup.
export function CatalogResultsHeading({ title }: { title: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (location.hash !== "#results-heading") return;
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    heading.current?.focus({ preventScroll: true });
  }, []);
  return <h2 ref={heading} id="results-heading" tabIndex={-1} className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>;
}
