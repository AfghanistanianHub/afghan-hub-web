"use client";

import { useEffect } from "react";

// Progressive enhancement: server content is visible; only below-fold sections fade in once.
export function CommunityStoryMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-community-story]");
    if (!root) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sections = [...root.querySelectorAll<HTMLElement>("section")];
    const reveal = (element: HTMLElement) => {
      element.dataset.storyVisible = "true";
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target as HTMLElement); });
    }, { rootMargin: "0px 0px 48px 0px", threshold: 0 });
    sections.forEach(section => {
      if (section.getBoundingClientRect().top < innerHeight || preference.matches) return;
      section.dataset.storyVisible = "false";
      observer.observe(section);
    });
    const focus = (event: FocusEvent) => {
      const section = (event.target as HTMLElement)?.closest<HTMLElement>("section");
      if (section) reveal(section);
    };
    const reduce = () => { if (preference.matches) sections.forEach(reveal); };
    root.addEventListener("focusin", focus);
    preference.addEventListener("change", reduce);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", focus);
      preference.removeEventListener("change", reduce);
      sections.forEach(section => delete section.dataset.storyVisible);
    };
  }, []);
  return null;
}
