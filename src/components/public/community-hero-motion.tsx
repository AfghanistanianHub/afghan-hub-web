"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./community-hero-motion.module.css";

// The SVG arrives as server-rendered children; only visibility and pointer input need JS.
export function CommunityHeroMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const reduced = useRef(true);
  const point = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      reduced.current = preference.matches;
      element.dataset.running = String(visible && !document.hidden && !preference.matches);
      if (document.hidden || !visible || preference.matches) {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
        element.style.setProperty("--depth-x", "0px");
        element.style.setProperty("--depth-y", "0px");
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: .05 });
    observer.observe(element);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reduced.current || root.current?.dataset.running !== "true") return;
    point.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const element = root.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (point.current.x - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (point.current.y - bounds.top) / bounds.height * 2 - 1));
      element.style.setProperty("--depth-x", `${(x * 3).toFixed(2)}px`);
      element.style.setProperty("--depth-y", `${(y * 3).toFixed(2)}px`);
    });
  };
  const reset = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    root.current?.style.setProperty("--depth-x", "0px");
    root.current?.style.setProperty("--depth-y", "0px");
  };

  return <div ref={root} className={`${className} ${styles.motion}`} data-community-motion data-landing-hero data-running="false"
    onPointerMove={move} onPointerLeave={reset}>
    {children}
    <noscript><style>{`[data-community-motion] [data-hero-draw], [data-community-motion] [data-hero-reveal], [data-community-motion] [data-hero-accent] { animation:none; opacity:1; stroke-dashoffset:0; }`}</style></noscript>
  </div>;
}
