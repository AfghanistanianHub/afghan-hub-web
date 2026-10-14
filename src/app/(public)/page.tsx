import type { Metadata } from "next";
import { HomepageMotion } from "@/components/public/homepage-motion";
import { ScrollCategoryIntroduction } from "@/components/public/scroll-category-introduction";
import { LocalizedHomepageHero } from "@/components/public/localized-homepage-hero";
import { LocalizedHomepageSteps } from "@/components/public/localized-homepage-steps";
import { LocalizedHomepagePaths } from "@/components/public/localized-homepage-paths";
import { LocalizedHomepageValue } from "@/components/public/localized-homepage-value";
import { LocalizedHomepageFinal } from "@/components/public/localized-homepage-final";
import { HomepageNavigator } from "@/components/assistant/homepage-navigator";
import styles from "./landing.module.css";

const description = "Afghan Hub connects people, businesses, organizations, opportunities, and events — creating space for meaningful connections, collaboration, and shared progress.";
export const metadata: Metadata = {
  title: "One network. Many ways to belong.", description,
  alternates: { canonical: "https://app.apnbc.ca/" },
  openGraph: { title: "Afghan Hub — One network. Many ways to belong.", description, url: "https://app.apnbc.ca/", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Afghan Hub community network" }] },
  twitter: { card: "summary_large_image", title: "Afghan Hub — One network. Many ways to belong.", description, images: ["/opengraph-image"] },
};



export default async function PublicHome() {
  return <main id="main-content" className={styles.page}>
    <HomepageMotion />
    <LocalizedHomepageHero />

    <HomepageNavigator />

    <LocalizedHomepageSteps />

    <ScrollCategoryIntroduction />

    <LocalizedHomepagePaths />

    <LocalizedHomepageValue />

    <LocalizedHomepageFinal />
  </main>;
}
