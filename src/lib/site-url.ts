export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return process.env.NODE_ENV === "production"
    ? "https://app.apnbc.ca"
    : "http://localhost:3000";
}
