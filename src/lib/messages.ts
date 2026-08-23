export function getTotalUnreadMessageCount(
  counts: Map<string, number>,
) {
  return [...counts.values()].reduce(
    (total, count) => total + count,
    0,
  );
}
