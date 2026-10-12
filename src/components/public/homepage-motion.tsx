"use client";

import { useEffect } from "react";

// Enhances server-rendered content; no-JS and reduced-motion stay fully visible.
export function HomepageMotion() {
  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-home-step]"));
    const orientation = document.getElementById("how-it-works");
    const finale = document.querySelector<HTMLElement>("[data-home-finale]");
    const reveals = Array.from(finale?.querySelectorAll<HTMLElement>("[data-home-reveal]") ?? []);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const render = () => {
      frame = null;
      if (media.matches) {
        orientation?.removeAttribute("data-motion");
        finale?.removeAttribute("data-motion");
        return;
      }
      const height = window.innerHeight;
      // Batch reads before writes; current bounds also catch upstream layout changes.
      const stepTop = orientation?.getBoundingClientRect().top ?? height;
      const finaleTop = finale?.getBoundingClientRect().top ?? height;
      const progress = clamp((height * .88 - stepTop) / Math.min(320, height * .4));
      steps.forEach((step, index) => {
        const value = clamp(progress * steps.length - index);
        step.style.setProperty("--step-progress", String(value));
      });
      orientation?.setAttribute("data-motion", "true");
      reveals.forEach((element, index) => {
        const value = clamp((height * .92 - finaleTop - index * 28) / 100);
        const eased = value * value * (3 - 2 * value);
        element.style.setProperty("--final-opacity", String(.9 + .1 * eased));
        element.style.setProperty("--final-y", `${10 * (1 - eased)}px`);
      });
      finale?.setAttribute("data-motion", "true");
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(render); };
    const resize = new ResizeObserver(schedule);
    if (orientation?.parentElement) resize.observe(orientation.parentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    render();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      orientation?.removeAttribute("data-motion");
      finale?.removeAttribute("data-motion");
    };
  }, []);
  return null;
}
