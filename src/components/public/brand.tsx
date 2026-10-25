import Link from "next/link";
import type { SiteLanguage } from "@/lib/i18n/site-language";
import styles from "./public-navigation.module.css";

const homeLabels: Record<SiteLanguage, string> = {
  en: "Afghan Hub home",
  fa: "صفحهٔ اصلی افغان هاب",
  ps: "د افغان هب کورپاڼه",
};

export function Brand({ language = "en" }: { language?: SiteLanguage }) {
  return <Link href="/" aria-label={homeLabels[language]} className={styles.brand}>
    <span className={styles.brandMark} aria-hidden="true"> <i /> </span>
    <span>Afghan Hub</span>
  </Link>;
}
