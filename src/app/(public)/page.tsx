import type { Metadata } from "next";
import { PublicHomeContent } from "@/components/public/public-home-content";

const description = "Afghan Hub connects people, businesses, organizations, opportunities, and events — creating space for meaningful connections, collaboration, and shared progress.";
export const metadata: Metadata = {
  title: "One network. Many ways to belong.", description,
  alternates: { canonical: "https://app.apnbc.ca/" },
  openGraph: { title: "Afghan Hub — One network. Many ways to belong.", description, url: "https://app.apnbc.ca/", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Afghan Hub community network" }] },
  twitter: { card: "summary_large_image", title: "Afghan Hub — One network. Many ways to belong.", description, images: ["/opengraph-image"] },
};



export default async function PublicHome() {
  return <PublicHomeContent initialLanguage="en" />;
}
