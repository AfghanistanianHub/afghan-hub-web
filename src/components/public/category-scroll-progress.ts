export const categoryOrder = ["people", "organizations", "businesses", "opportunities", "events"] as const;

// Each already-positioned row reveals as it passes through the lower viewport.
// No clock, sticky runway, horizontal movement, or animation between layouts.
export function categoryRevealFrame(scrollY: number, rowTop: number, viewportHeight: number) {
  const distance = Math.max(1, Math.min(96, viewportHeight * 0.2));
  const progress = Math.min(1, Math.max(0, (scrollY + viewportHeight * 0.9 - rowTop) / distance));
  const opacity = progress * progress * (3 - 2 * progress);
  return { opacity, y: 12 * (1 - opacity) };
}
