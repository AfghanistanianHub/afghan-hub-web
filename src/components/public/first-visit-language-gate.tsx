"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { saveSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "./first-visit-language-gate.module.css";

const languages: { code: SiteLanguage; label: string; native?: string }[] = [
  { code: "en", label: "English" },
  { code: "fa", label: "Farsi", native: "فارسی" },
  { code: "ps", label: "Pashto", native: "پښتو" },
];

/** Only the root homepage is gated. All deep links bypass the entrance. */
export function FirstVisitLanguageGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The root URL is the language entrance on every visit, even if a
  // language preference is saved. Locale deep links keep their own routing.
  if (pathname !== "/") return <>{children}</>;

  return (
    <main id="main-content" className={styles.entrance}>
      <div className={styles.stage}>
        <header className={styles.brand} aria-label="Afghan Hub">
          <span className={styles.brandMark} aria-hidden="true"><i /></span>
          <span className={styles.brandName}>Afghan Hub</span>
        </header>

        <div className={styles.content}>
          <div className={styles.editorial}>
            <h1 className={styles.headline}>One network.<br /><em>Many voices.</em></h1>
            <p className={styles.subtitle}>Choose your language to explore Afghan Hub.</p>
            <nav aria-label="Choose your language">
              <ul className={styles.languages}>
                {languages.map(({ code, label, native }, index) => (
                  <li key={code}>
                    <a
                      className={`${styles.language} ${code === "en" ? styles.english : code === "fa" ? styles.farsi : styles.pashto}`}
                      href={`/${code}`}
                      hrefLang={code}
                      onClick={() => saveSiteLanguagePreference(code)}
                    >
                      <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.names}>
                        <span className={styles.latin}>{label}</span>
                        {native && <span className={styles.native} lang={code} dir="rtl">{native}</span>}
                      </span>
                      <span className={styles.arrow} aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={styles.livingType} aria-hidden="true">
            <div className={`${styles.message} ${styles.messageEnglish}`}>You <em>belong</em> here.</div>
            <div className={`${styles.message} ${styles.messageFarsi}`} lang="fa" dir="rtl">اینجا جای توست</div>
            <div className={`${styles.message} ${styles.messagePashto}`} lang="ps" dir="rtl">دلته ستا ځای دی</div>
          </div>
        </div>
      </div>
    </main>
  );
}
