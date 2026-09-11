import type { MetadataRoute } from "next";
import { publicHref, publicKinds } from "@/lib/public-catalog";
import { getPublicSitemapItems } from "@/lib/public-sitemap";

const origin = "https://app.apnbc.ca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static discovery must remain available even if the public data source is temporarily unavailable.
  const staticEntries = ["/", "/about", ...publicKinds.map(kind => `/explore?type=${kind}`)]
    .map(path => ({ url: `${origin}${path}` }));

  const detailEntries = (await getPublicSitemapItems())
    .map(({ kind, slug }) => ({ url: `${origin}${publicHref(kind, slug)}` }));

  return [...staticEntries, ...detailEntries];
}
