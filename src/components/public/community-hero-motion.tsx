"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./community-hero-motion.module.css";

// The SVG arrives as server-rendered children; only visibility and pointer input need JS.
export function CommunityHeroMotion({ children, className, depth = 3, scrollDepth = false }: { children: ReactNode; className: string; depth?: number; scrollDepth?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const reduced = useRef(true);
  const point = useRef({ x: 0, y: 0 });
  const pausedNarrative = useRef<Animation[]>([]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let scrollFrame: number | null = null;
    const scroll = () => {
      if (!scrollDepth || scrollFrame !== null) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;
        const distance = visible && !document.hidden && !preference.matches ? Math.min(16, Math.max(0, -element.getBoundingClientRect().top * .035)) : 0;
        element.style.setProperty("--scroll-depth", `${distance.toFixed(2)}px`);
      });
    };
    const update = () => {
      reduced.current = preference.matches;
      scroll();
      const running = visible && !document.hidden && !preference.matches;
      element.dataset.running = String(running);

      if (!running) {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
        element.style.setProperty("--depth-x", "0px");
        element.style.setProperty("--depth-y", "0px");

        if (!preference.matches) {
          pausedNarrative.current = element
            .getAnimations({ subtree: true })
            .filter((animation) => animation.effect?.getTiming().iterations === 1 && animation.playState === "running");
          pausedNarrative.current.forEach((animation) => animation.pause());
        }
      } else if (pausedNarrative.current.length > 0) {
        pausedNarrative.current.forEach((animation) => {
          if (animation.playState === "paused") animation.play();
        });
        pausedNarrative.current = [];
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: .05 });
    observer.observe(element);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    if (scrollDepth) window.addEventListener("scroll", scroll, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      pausedNarrative.current = [];
    };
  }, [scrollDepth]);

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
      element.style.setProperty("--depth-x", `${(x * depth).toFixed(2)}px`);
      element.style.setProperty("--depth-y", `${(y * depth).toFixed(2)}px`);
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
