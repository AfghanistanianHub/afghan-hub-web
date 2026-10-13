"use client";

import { useEffect } from "react";

// Enhances server-rendered content; no-JS and reduced-motion stay fully visible.
export function HomepageMotion() {
  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-home-step]"));
    const orientation = document.getElementById("how-it-works");
    const finale = document.querySelector<HTMLElement>("[data-home-finale]");
    const reveals = Array.from(finale?.querySelectorAll<HTMLElement>("[data-home-reveal]") ?? []);
    const benefits = Array.from(document.querySelectorAll<HTMLElement>("[data-home-benefit]"));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const render = () => {
      frame = null;
      if (media.matches) {
        benefits.forEach(element => element.removeAttribute("data-motion"));
        orientation?.removeAttribute("data-motion");
        finale?.removeAttribute("data-motion");
        return;
      }
      const height = window.innerHeight;
      // Batch reads before writes; current bounds also catch upstream layout changes.
      const stepTop = orientation?.getBoundingClientRect().top ?? height;
      const finaleTop = finale?.getBoundingClientRect().top ?? height;
      const benefitTops = benefits.map(element => element.getBoundingClientRect().top);
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
      benefits.forEach((element,index) => {
        const value = clamp((height * .9 - benefitTops[index] - index * 24) / 100);
        const eased = value * value * (3 - 2 * value);
        element.style.setProperty("--benefit-scale", String(.88 + .12 * eased));
        element.setAttribute("data-motion", "true");
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
      benefits.forEach(element => element.removeAttribute("data-motion"));
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      orientation?.removeAttribute("data-motion");
      finale?.removeAttribute("data-motion");
    };
  }, []);
  return null;
}
