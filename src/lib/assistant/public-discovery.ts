import { inferAssistantIntent } from "./intents";
import { resolveNavigatorContext } from "./conversation";
import type { PublicKind } from "../public-catalog";

export type DiscoveryFilters = { goal?: string; topic?: string; location?: string };
export const discoveryKinds: PublicKind[] = ["businesses", "organizations", "opportunities", "events"];
const typeToKind = { business: "businesses", organization: "organizations", opportunity: "opportunities", event: "events" } as const;

// Reuse member intent parsing; never infer a person's private preferences.
// Multiple explicit areas stay a multi-area search rather than first-match wins.
export function planPublicDiscovery(query: string, filters: DiscoveryFilters = {}) {
  const context = resolveNavigatorContext(query);
  const goal = filters.goal ?? query;
  const inferred = inferAssistantIntent(goal);
  const explicit = discoveryKinds.filter(kind => inferAssistantIntent(kind).entityType &&
    new RegExp(`\\b${kind}\\b`, "i").test(goal));
  const entity = inferred.entityType;
  const kinds: PublicKind[] = explicit.length > 1 ? explicit : entity && entity !== "profile" ? [typeToKind[entity]] : [...discoveryKinds];
  const people = entity === "profile" || /\b(?:artists?|creatives?|meet people)\b/iu.test(goal);
  let topic = filters.topic ?? context.topic;
  topic = topic.replace(/\b(?:i want to|i need|help me|connect with|meet|show|grow my|my|this month|community|afghan[- ]owned|what's next|and|please|looking for)\b/giu, " ").replace(/\s+/g, " ").trim();
  if (/^(?:i'm still exploring|i m still exploring|explore|work or|arts & culture|artists & creatives)$/iu.test(topic)) topic = /arts|artists/iu.test(topic) ? "arts" : "";
  const location = (filters.location ?? context.city ?? "").trim();
  return { kinds, people, topic: topic.slice(0, 80), location: location.slice(0, 60), thisMonth: /\bthis month\b/iu.test(query) };
}

export function discoveryTerms(topic: string) {
  if (/^(?:arts?|artists?|arts & culture|artists? & creatives?)$/iu.test(topic)) return ["art", "creative", "music", "photograph", "design", "writer", "film", "perform"];
  if (/^(?:technology|tech)$/iu.test(topic)) return ["technology", "tech", "software", "engineering"];
  return topic.toLocaleLowerCase().split(/\s+/u).filter(term => term.length > 1).slice(0, 8);
}

export function rankDiscoveryListing(item: { title: string; summary: string | null; description?: string | null; category: string; location: string; date: string | null }, topic: string, location: string, thisMonth: boolean, kind: PublicKind, now = new Date()) {
  const place = item.location.toLocaleLowerCase();
  if (location && !place.includes(location.toLocaleLowerCase()) && place !== "remote" && place !== "online") return 0;
  if (thisMonth && kind === "events") {
    if (!item.date) return 0;
    const date = new Date(item.date);
    if (date.getUTCMonth() !== now.getUTCMonth() || date.getUTCFullYear() !== now.getUTCFullYear()) return 0;
  }
  const terms = discoveryTerms(topic);
  if (!terms.length) return 1;
  const title = item.title.toLocaleLowerCase();
  const text = `${item.summary ?? ""} ${item.description ?? ""} ${item.category}`.toLocaleLowerCase();
  return terms.reduce((rank, term) => rank + (title.includes(term) ? 3 : text.includes(term) ? 1 : 0), 0);
}
