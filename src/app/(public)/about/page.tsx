import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "Our mission",
  description: "Afghan Hub brings people, opportunities, businesses, and organizations together in one shared community space.",
  alternates: { canonical: "https://app.apnbc.ca/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
