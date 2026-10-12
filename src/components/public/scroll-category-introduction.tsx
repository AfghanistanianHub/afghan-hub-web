"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { communityAreas } from "./community-areas";
import { categoryFrame, categoryLineScale, categoryOrder } from "./category-scroll-progress";
import styles from "./scroll-category-introduction.module.css";

const areas = categoryOrder.map(key => communityAreas.find(area => area.key === key)!);

export function ScrollCategoryIntroduction() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const staticLayout = window.matchMedia("(max-width: 899px), (max-height: 739px), (prefers-reduced-motion: reduce)");
    const icons = Array.from(stage.querySelectorAll<HTMLElement>("[data-category-icon]"));
    const copy = Array.from(stage.querySelectorAll<HTMLElement>("[data-category-copy]"));
    const line = stage.querySelector<HTMLElement>("[data-category-line]");
    let frame: number | null = null;
    let top = 0;
    let runway = 1;
    let width = 0;
    let inView = true;

    const render = () => {
      frame = null;
      if (staticLayout.matches) return;
      const progress = Math.min(1, Math.max(0, (window.scrollY - top) / runway));
      // One geometry read on resize; scroll frames write transforms only.
      icons.forEach((icon, index) => {
        const state = categoryFrame(progress, index, width);
        icon.style.setProperty("--icon-x", `${state.x}px`);
        icon.style.setProperty("--icon-y", `${state.y}px`);
        copy[index].style.setProperty("--copy-opacity", `${state.opacity}`);
        copy[index].style.setProperty("--copy-x", `${state.textX}px`);
      });
      line?.style.setProperty("--line-scale", `${categoryLineScale(progress)}`);
      section.dataset.scrollProgress = progress.toFixed(4);
    };
    const schedule = () => {
      if (frame === null && inView && !staticLayout.matches) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      const sticky = section.querySelector<HTMLElement>("[data-category-sticky]")!;
      top = section.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(sticky).top);
      runway = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      width = stage.clientWidth;
      if (frame !== null) cancelAnimationFrame(frame);
      render();
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(section);
    resizeObserver.observe(stage);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) { measure(); schedule(); }
    });
    visibilityObserver.observe(section);
    staticLayout.addEventListener("change", measure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      staticLayout.removeEventListener("change", measure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return <section ref={sectionRef} id="community" className={styles.section} aria-labelledby="explore-heading" data-category-section>
    <div className={styles.sticky} data-category-sticky>
      <div className={styles.heading}>
        <h2 id="explore-heading">Explore the community</h2>
        <Link href="/explore" className={styles.viewAll}>View all <span aria-hidden="true">↗</span></Link>
      </div>
      <nav ref={stageRef} className={styles.stage} aria-label="Explore Afghan Hub categories">
        <span className={styles.line} data-category-line aria-hidden="true" />
        {areas.map((area, index) => <Link key={area.key} href={area.href} prefetch={false} className={styles.category}
          style={{ "--index": index } as CSSProperties} data-category={area.key}
          aria-label={area.label} aria-describedby={`category-${area.key}-description`}>
          <span className={styles.icon} data-category-icon>
            {/* Keep the supplied SVG bytes, outlines, colors, and stroke weights. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/category-icons/${area.key}.svg`} width={64} height={64} alt="" draggable={false} />
          </span>
          <span className={styles.copy} data-category-copy>
            <span className={styles.title}>{area.label}</span>
            <span id={`category-${area.key}-description`} className={styles.description}>{area.description}</span>
          </span>
        </Link>)}
      </nav>
    </div>
    <noscript><style>{`[data-category-section]{height:auto!important}[data-category-sticky]{position:relative!important;height:auto!important}[data-category-section] nav{height:auto!important}[data-category-section] [data-category]{position:relative!important;display:flex!important;gap:24px;margin:24px 0}[data-category-icon]{position:relative!important;transform:none!important}[data-category-copy]{position:relative!important;inset:auto!important;opacity:1!important;transform:none!important}[data-category-line]{display:none!important}`}</style></noscript>
  </section>;
}
