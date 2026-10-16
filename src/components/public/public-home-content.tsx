import { HomepageMotion } from "@/components/public/homepage-motion";
import { ScrollCategoryIntroduction } from "@/components/public/scroll-category-introduction";
import { LocalizedHomepageHero } from "@/components/public/localized-homepage-hero";
import { LocalizedHomepageSteps } from "@/components/public/localized-homepage-steps";
import { LocalizedHomepagePaths } from "@/components/public/localized-homepage-paths";
import { LocalizedHomepageValue } from "@/components/public/localized-homepage-value";
import { LocalizedHomepageFinal } from "@/components/public/localized-homepage-final";
import { HomepageNavigator } from "@/components/assistant/homepage-navigator";
import type { SiteLanguage } from "@/lib/i18n/site-language";
import styles from "@/app/(public)/landing.module.css";

export function PublicHomeContent({ initialLanguage = "en" }: { initialLanguage?: SiteLanguage }) {
  return <main id="main-content" className={styles.page}>
    <HomepageMotion />
    <LocalizedHomepageHero initialLanguage={initialLanguage} />
    <HomepageNavigator initialLanguage={initialLanguage} />
    <LocalizedHomepageSteps initialLanguage={initialLanguage} />
    <ScrollCategoryIntroduction initialLanguage={initialLanguage} />
    <LocalizedHomepagePaths initialLanguage={initialLanguage} />
    <LocalizedHomepageValue initialLanguage={initialLanguage} />
    <LocalizedHomepageFinal initialLanguage={initialLanguage} />
  </main>;
}
