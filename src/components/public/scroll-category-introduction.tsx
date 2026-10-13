"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { communityAreas } from "./community-areas";
import { categoryRevealFrame, categoryOrder } from "./category-scroll-progress";
import styles from "./scroll-category-introduction.module.css";

const areas = categoryOrder.map(key => communityAreas.find(area => area.key === key)!);

export function ScrollCategoryIntroduction() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rows = Array.from(stage.querySelectorAll<HTMLElement>("[data-category]"));
    const line = stage.querySelector<HTMLElement>("[data-category-line]");
    let frame: number | null = null;
    let offsets: number[] = [];
    let inView = true;

    const render = () => {
      frame = null;
      if (reducedMotion.matches) {
        section.dataset.reveal = "false";
        return;
      }
      // One batched geometry read catches upstream Navigator/font layout changes.
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const viewportHeight = window.innerHeight;
      let total = 0;
      rows.forEach((row, index) => {
        const state = categoryRevealFrame(window.scrollY, stageTop + offsets[index], viewportHeight);
        row.dataset.revealVisible = String(state.opacity > 0);
        row.style.setProperty("--reveal-opacity", String(state.opacity));
        row.style.setProperty("--reveal-y", `${state.y}px`);
        total += state.opacity;
      });
      line?.style.setProperty("--line-scale", String(total / rows.length));
      // Visible SSR/no-JS fallback. Set after measuring and writing all values.
      section.dataset.reveal = "true";
    };
    const schedule = () => {
      if (frame === null && inView && !reducedMotion.matches) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      // offsetTop is layout geometry, independent of the reveal transforms.
      offsets = rows.map(row => row.offsetTop);
      if (frame !== null) cancelAnimationFrame(frame);
      render();
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(stage);
    if (section.parentElement) resizeObserver.observe(section.parentElement);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) measure();
    }, { rootMargin: "100px" });
    visibilityObserver.observe(section);
    reducedMotion.addEventListener("change", measure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotion.removeEventListener("change", measure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return <section ref={sectionRef} id="community" className={styles.section} aria-labelledby="explore-heading" data-category-section>
    <div className={styles.heading}>
      <h2 id="explore-heading">Explore the community</h2>
      <Link href="/explore" className={styles.viewAll}>View all <span aria-hidden="true">↗</span></Link>
    </div>
    <nav ref={stageRef} className={styles.stage} aria-label="Explore Afghan Hub categories">
      <span className={styles.line} data-category-line aria-hidden="true" />
      {areas.map(area => <Link key={area.key} href={area.href} prefetch={false} className={styles.category}
        data-category={area.key} aria-label={area.label} aria-describedby={`category-${area.key}-description`}>
        <span className={styles.icon} data-category-icon>
          {/* Supplied SVG artwork remains unchanged, including colored outlines. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/category-icons/${area.key}.svg`} width={64} height={64} alt="" draggable={false} />
        </span>
        <span className={styles.copy} data-category-copy>
          <span className={styles.title}>{area.label}</span>
          <span id={`category-${area.key}-description`} className={styles.description}>{area.description}</span>
        </span>
      </Link>)}
    </nav>
  </section>;
}
