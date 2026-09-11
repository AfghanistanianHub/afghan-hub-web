import type { MetadataRoute } from "next";
import { publicKinds } from "@/lib/public-catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  // Keep discovery independent of database availability and member sessions.
  // Published detail pages are reachable through these category pages.
  return ["/", "/about", ...publicKinds.map(kind => `/explore?type=${kind}`)]
    .map(path => ({ url: `https://app.apnbc.ca${path}` }));
}
