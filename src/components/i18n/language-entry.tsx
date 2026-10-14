"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import nav from "@/components/public/public-navigation.module.css";
import styles from "./language-entry.module.css";
const languages = [{ locale: "en", label: "English" }, { locale: "fa", label: "فارسی" }, { locale: "ps", label: "پښتو" }] as const;
export function LanguageEntry() {
  const surface = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = surface.current;
    if (!node) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0; let x = 0; let y = 0;
    const render = () => { frame = 0; node.style.setProperty("--drift-x", `${x}px`); node.style.setProperty("--drift-y", `${y}px`); };
    const move = (event: PointerEvent) => {
      if (reduced.matches || document.hidden || event.pointerType !== "mouse") return;
      x = (event.clientX / innerWidth - .5) * 14; y = (event.clientY / innerHeight - .5) * 10;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const reset = () => { x = y = 0; if (frame) cancelAnimationFrame(frame); render(); };
    node.addEventListener("pointermove", move); node.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", reset); reduced.addEventListener("change", reset);
    return () => { node.removeEventListener("pointermove", move); node.removeEventListener("pointerleave", reset); document.removeEventListener("visibilitychange", reset); reduced.removeEventListener("change", reset); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <main ref={surface} id="main-content" className={styles.entry} dir="ltr" data-language-entry>
    <span className={`${nav.brandMark} ${styles.brand}`} role="img" aria-label="Afghan Hub"><i /></span>
    <div className={styles.constellation} aria-hidden="true">
      <svg viewBox="0 0 1000 720" fill="none"><g className={styles.filaments}>
        <path d="M180 280 480 165 800 380 560 580 180 280M480 165 560 580M180 280 800 380" />
        <path d="M70 440 180 280 160 95M480 165 680 60M800 380 930 210M560 580 820 650" />
      </g>{[[180,280],[480,165],[800,380],[560,580],[70,440],[160,95],[680,60],[930,210],[820,650],[340,490],[650,280]].map(([cx,cy],index)=><circle key={index} cx={cx} cy={cy} r={index<4?3:2} />)}</svg>
    </div>
    <nav className={styles.nodes} aria-label="Choose language / انتخاب زبان / ژبه غوره کړئ">
      {languages.map(({ locale, label }, index) => <a key={locale} className={styles.node} data-locale={locale} style={{ "--arrival": `${index * 65}ms` } as CSSProperties} href={`/language/select?locale=${locale}`} lang={locale} dir={locale === "en" ? "ltr" : "rtl"} onPointerDown={event => { event.currentTarget.dataset.pressed = "true"; }} onPointerUp={event => { delete event.currentTarget.dataset.pressed; }} onPointerCancel={event => { delete event.currentTarget.dataset.pressed; }} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.currentTarget.dataset.pressed = "true"; surface.current?.setAttribute("data-selected", locale); } }}>
        <span className={styles.halo} aria-hidden="true" /><span className={styles.dot} aria-hidden="true" /><span className={styles.label}>{label}</span>
      </a>)}
    </nav>
  </main>;
}
