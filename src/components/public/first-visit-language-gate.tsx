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
      <section className={styles.panel} aria-label="Choose your language">
        <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true"><i /></span><span>Afghan Hub</span></div>
        <h1 className={styles.srOnly}>Choose your language · زبان خود را انتخاب کنید · خپله ژبه وټاکئ</h1>
        <div className={styles.choices} role="group" aria-label="Choose your language">
          {languages.map(({ code, name, direction }) => (
            <button key={code} type="button" lang={code} dir={direction}
              className={styles.choice} onClick={() => choose(code)}>
              <span>{name}</span><span className={styles.arrow} aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
