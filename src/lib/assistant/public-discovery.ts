import { inferAssistantIntent } from "./intents";
import { resolveNavigatorContext } from "./conversation";
import type { PublicKind } from "../public-catalog";
import type { DiscoveryPlan } from "./public-discovery-contract";
import { canonicalDiscoveryLocation, discoveryLocationTerms } from "./discovery-location";

export type DiscoveryFilters = { goal?: string; topic?: string; location?: string };
export const discoveryKinds: PublicKind[] = ["businesses", "organizations", "opportunities", "events"];
const typeToKind = { business: "businesses", organization: "organizations", opportunity: "opportunities", event: "events" } as const;

// Reuse member intent parsing; never infer a person's private preferences.
// Multiple explicit areas stay a multi-area search rather than first-match wins.
export function planPublicDiscovery(query: string, filters: DiscoveryFilters = {}, previous?: DiscoveryPlan): DiscoveryPlan {
  const refinement = /^(?:only|just|anywhere|all locations|فقط|تنها|یوازې|هر جا|هر ځای)(?:\s|$)|(?:\b(?:too|also|as well)\b|(?:^|\s)هم(?:\s|$))/iu.test(query);
  const previousEntity = previous?.kinds.length === 1 ? ({businesses:"business",organizations:"organization",opportunities:"opportunity",events:"event"} as const)[previous.kinds[0]] : undefined;
  const context = resolveNavigatorContext(query, refinement && previous ? { topic: previous.topic, city: previous.location || undefined, entityType: previousEntity } : undefined);
  const goal = filters.goal ?? query;
  const inferred = inferAssistantIntent(goal);
  const explicit = discoveryKinds.filter(kind => inferAssistantIntent(kind).entityType &&
    new RegExp(`\\b${kind}\\b`, "i").test(goal));
  const entity = refinement ? context.entityType : inferred.entityType;
  const kinds: PublicKind[] = explicit.length > 1 ? explicit : entity && entity !== "profile" ? [typeToKind[entity]] : refinement && previous ? previous.kinds : [...discoveryKinds];
  const people = entity === "profile" || /\b(?:artists?|creatives?|meet people)\b|هنرمندان|خلاقان|نوښتګر/iu.test(goal);
  let topic = filters.topic ?? context.topic;
  topic = topic.replace(/\b(?:i want to|want to|want|i need|need|help me|connect with|meet|show|grow my|my|this month|community|afghan[- ]owned|what's next|and|or|please|looking for)\b/giu, " ").replace(/\s+/g, " ").trim();
  if (/^(?:arts?|artists?|creatives?|arts & culture|artists & creatives)$/iu.test(topic)) topic = "arts";
  if (/^(?:i'm still exploring|i m still exploring|explore|work or|arts & culture|artists & creatives)$/iu.test(topic)) topic = /arts|artists/iu.test(topic) ? "arts" : "";
  // Deterministic multilingual aliases make the development fallback useful.
  const nativePlace = query.match(/(?:^|\s)در\s+(ونکوور|بریتیش کلمبیا)(?:\s|$)/u)?.[1]
    ?? query.match(/(?:^|\s)په\s+(ونکوور|بریټش کولمبیا)(?:\s|$)/u)?.[1];
  const location = canonicalDiscoveryLocation(filters.location ?? context.city ?? nativePlace ?? "");
  const aliases: [RegExp, string][] = [[/^(?:technology|tech)$/iu,"technology"], [/فناوری|تکنالوژی|ټکنالوژ[يۍ]/u,"technology"], [/هنرمندان|خلاقان|هنرمند|نوښتګر|هنر/u,"arts"], [/آموزش|زده کړه/u,"education"], [/تازه‌واردان|نویو راغلو/u,"newcomer"]];
  const alias = aliases.find(([pattern]) => pattern.test(topic));
  if (alias) topic = alias[1];
  const thisMonth = /\bthis month\b|این ماه|دې میاشتې/iu.test(query);
  if (thisMonth) topic = topic.replace(/این ماه|دې میاشتې|\bthis month\b/giu, " ").trim();
  if (nativePlace) topic = topic.replace(nativePlace, " ").trim();
  const exclusiveArea = /^(?:only|just|فقط|تنها|یوازې)\s/iu.test(query) && !!inferred.entityType && inferred.entityType !== "profile";
  return { kinds, people: people || (!!previous?.people && refinement && !exclusiveArea), topic: topic.slice(0, 80), location: location.slice(0, 60), thisMonth: thisMonth || (!!previous?.thisMonth && refinement) };
}

export function discoveryTerms(topic: string) {
  if (/^(?:arts?|artists?|arts & culture|artists? & creatives?)$/iu.test(topic)) return ["art", "creative", "music", "photograph", "design", "writer", "film", "perform"];
  if (/^(?:technology|tech)$/iu.test(topic)) return ["technology", "tech", "software", "engineering"];
  return topic.toLocaleLowerCase().split(/\s+/u).filter(term => term.length > 1).slice(0, 8);
}

export function rankDiscoveryListing(item: { title: string; summary: string | null; description?: string | null; category: string; location: string; region?: string | null; date: string | null }, topic: string, location: string, thisMonth: boolean, kind: PublicKind, now = new Date()) {
  const place = item.location.toLocaleLowerCase();
  const places = `${place},${item.region ?? ""}`.toLocaleLowerCase().split(",").map(value => value.trim());
  if (location && !discoveryLocationTerms(location).some(term => places.some(value => value === term.toLocaleLowerCase() || (term.length > 3 && value.includes(term.toLocaleLowerCase())))) && place !== "remote" && place !== "online") return 0;
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
