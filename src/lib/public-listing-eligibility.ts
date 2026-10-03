const placeholderText = new Set(["n/a", "na", "test", "testing"]);

export function hasPublicListingTitle(value: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return Boolean(normalized) && !placeholderText.has(normalized);
}

export function currentOpportunityFilter(dateKey: string) {
  return `deadline.is.null,deadline.gte.${dateKey}`;
}

export function currentEventFilter(nowIso: string) {
  return `ends_at.gte.${nowIso},and(ends_at.is.null,starts_at.gte.${nowIso})`;
}
