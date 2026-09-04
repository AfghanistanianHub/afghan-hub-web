export function getUtcDateKey(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

export function hasOpportunityDeadlinePassed(
  deadline: string | null,
  today: string,
) {
  return Boolean(deadline && deadline.slice(0, 10) < today);
}
