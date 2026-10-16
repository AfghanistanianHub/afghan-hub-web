"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { saveSiteLanguagePreference, siteLanguagePreferenceKey, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "./first-visit-language-gate.module.css";

const languages: { code: SiteLanguage; name: string; direction: "ltr" | "rtl" }[] = [
  { code: "en", name: "English", direction: "ltr" },
  { code: "fa", name: "فارسی", direction: "rtl" },
  { code: "ps", name: "پښتو", direction: "rtl" },
];

/** Gate only the root home page. Deep links must never be intercepted. */
export function FirstVisitLanguageGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [chosenThisSession, setChosenThisSession] = useState(false);
  const selection = useSyncExternalStore(
    subscribeSiteLanguagePreference,
    () => {
      try {
        const saved = window.localStorage.getItem(siteLanguagePreferenceKey);
        const legacy = window.localStorage.getItem("afghan-hub-navigator-language");
        return saved === null && legacy === null ? "unselected" : "selected";
      } catch {
        return "unselected";
      }
    },
    () => "loading",
  );

  // Only the root is gated; deep links never require a language selection.
  if (pathname !== "/") return <>{children}</>;
  if (selection === "loading") return <div className={styles.loading} aria-label="Loading" />;
  if (selection === "selected" || chosenThisSession) return <>{children}</>;

  function choose(language: SiteLanguage) {
    saveSiteLanguagePreference(language);
    setChosenThisSession(true);
  }

  return (
    <main id="main-content" className={styles.entrance}>
      <svg className={styles.network} viewBox="0 0 1000 720" fill="none" aria-hidden="true"><path d="M180 280 480 165 800 380 560 580 180 280M480 165 560 580M180 280 800 380M70 440 180 280 160 95M480 165 680 60M800 380 930 210M560 580 820 650" />{[[180,280],[480,165],[800,380],[560,580],[70,440],[160,95],[680,60],[930,210],[820,650]].map(([cx,cy],index) => <circle key={index} cx={cx} cy={cy} r={index < 4 ? 3 : 2} />)}</svg>
      <section className={styles.panel} aria-label="Choose your language">
        <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true"><i /></span><span>Afghan Hub</span></div>
        <h1 className={styles.srOnly}>Choose your language · زبان خود را انتخاب کنید · خپله ژبه وټاکئ</h1>
        <div className={styles.choices} role="group" aria-label="Choose your language">
          {languages.map(({ code, name, direction }) => (
            <button key={code} type="button" lang={code} dir={direction}
              className={styles.choice} onClick={() => choose(code)}>
              <span className={styles.halo} aria-hidden="true" /><span className={styles.dot} aria-hidden="true" /><span>{name}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
