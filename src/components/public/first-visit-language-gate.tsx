"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { saveSiteLanguagePreference, siteLanguagePreferenceKey, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "./first-visit-language-gate.module.css";

const languages: { code: SiteLanguage; name: string; direction: "ltr" | "rtl" }[] = [
  { code: "en", name: "English", direction: "ltr" },
  { code: "fa", name: "فارسی", direction: "rtl" },
  { code: "ps", name: "پښتو", direction: "rtl" },
];

/** Gate only the root home page. Deep links must never be intercepted. */
export function FirstVisitLanguageGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [needsChoice, setNeedsChoice] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      setNeedsChoice(false);
      return;
    }
    try {
      // A legacy Navigator preference represents an intentional prior language choice.
      const saved = window.localStorage.getItem(siteLanguagePreferenceKey);
      const legacy = window.localStorage.getItem("afghan-hub-navigator-language");
      setNeedsChoice(saved === null && legacy === null);
    } catch {
      // Storage may be disabled. Allow explicit selection in this browsing session.
      setNeedsChoice(true);
    }
  }, [pathname]);

  if (needsChoice === null) return <div className={styles.loading} aria-label="Loading" />;
  if (!needsChoice) return <>{children}</>;

  function choose(language: SiteLanguage) {
    saveSiteLanguagePreference(language);
    setNeedsChoice(false);
  }

  return (
    <main id="main-content" className={styles.entrance}>
      <section className={styles.panel} aria-label="Choose your language">
        <div className={styles.mark} aria-hidden="true"><span /><span /><span /><span /></div>
        <div className={styles.brand}>AFGHAN <span>HUB</span></div>
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
