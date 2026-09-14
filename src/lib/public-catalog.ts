export const publicCategories = {
  opportunities: { label: "Opportunities", singular: "Opportunity", description: "Jobs, scholarships, volunteer roles, and ways to grow." },
  events: { label: "Events", singular: "Event", description: "Gatherings, workshops, and conversations that bring us together." },
  businesses: { label: "Businesses", singular: "Business", description: "Discover Afghan businesses and the people building them." },
  organizations: { label: "Organizations", singular: "Organization", description: "Meet the groups creating opportunities for our community." },
} as const;

export type PublicKind = keyof typeof publicCategories;
export const publicKinds = Object.keys(publicCategories) as PublicKind[];
export function isPublicKind(value: string): value is PublicKind {
  return Object.hasOwn(publicCategories, value);
}
export function publicHref(kind: PublicKind, slug: string) {
  return `/explore/${kind}/${encodeURIComponent(slug)}`;
}
export function publicPageNumber(value?: string | string[]) {
  if (typeof value !== "string" || !/^[1-9]\d{0,3}$/.test(value)) return 1;
  return Number(value);
}

export function isPublicPath(pathname: string) {
  return pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname === "/" || pathname === "/about" || pathname === "/privacy" || pathname === "/terms" || pathname === "/support" || pathname === "/explore" || pathname.startsWith("/explore/");
}
