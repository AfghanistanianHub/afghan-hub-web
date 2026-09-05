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


export function normalizeOpportunityDeadline(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const normalized = new Date(`${value}T12:00:00.000Z`);

  if (
    Number.isNaN(normalized.getTime()) ||
    normalized.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return normalized.toISOString();
}
