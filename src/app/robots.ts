import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Permit crawling so page-level noindex directives can be read.
    // Authentication and RLS remain the access controls for member content.
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://app.apnbc.ca/sitemap.xml",
  };
}
