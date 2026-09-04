export function getUtcDateKey(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

export function hasOpportunityDeadlinePassed(
  deadline: string | null,
  today: string,
) {
  return Boolean(deadline && deadline.slice(0, 10) < today);
}

export function formatOpportunityDeadline(deadline: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(deadline));
}
