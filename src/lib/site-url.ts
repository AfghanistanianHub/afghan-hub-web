export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  // Vercel Preview builds run with NODE_ENV=production, so use the platform
  // deployment host (not a request header) before falling back to production.
  const previewHost = process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_URL?.trim() : "";

  if (previewHost) {
    return `https://${previewHost.replace(/\/+$/, "")}`;
  }

  return process.env.NODE_ENV === "production"
    ? "https://app.apnbc.ca"
    : "http://localhost:3000";
}
