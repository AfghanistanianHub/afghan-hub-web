import type { PublicDiscoveryResponse } from "./public-discovery-contract";

type NoticeCopy = { searching: string; rate: string; error: string; partial: string; results: string; empty: string };
// Derive interface announcements in the current locale, including when the
// language changes while a request is in flight. Provider text stays original.
export function navigatorNotice(pending: boolean, latest: { data?: PublicDiscoveryResponse; failed?: "busy" | "unavailable" } | undefined, copy: NoticeCopy) {
  if (pending) return copy.searching;
  if (latest?.failed) return latest.failed === "busy" ? copy.rate : copy.error;
  const data = latest?.data;
  if (!data) return "";
  return data.clarification || (data.unavailable.length ? copy.partial : data.results.length ? `${copy.results}: ${data.results.length}` : copy.empty);
}
