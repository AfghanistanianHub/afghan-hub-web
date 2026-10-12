export const categoryOrder = ["people", "organizations", "businesses", "opportunities", "events"] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (from: number, to: number, t: number) => from + (to - from) * t;

// Pure geometry: no clock, spring, or entrance trigger. Each icon follows
// exactly two axes: horizontal to the left column, then vertical to its row.
export function categoryFrame(progress: number, index: number, width: number) {
  const start = 0.04 + index * 0.17;
  const travel = clamp((progress - start) / 0.13);
  const initialX = 32 + (4 - index) * (Math.max(0, width - 96) / 4);
  const finalY = 144 + index * 80;
  let x = initialX;
  let y = 0;
  if (travel <= 0.55) {
    x = mix(initialX, 32, ease(travel / 0.55));
  } else {
    x = 32;
    y = finalY * ease((travel - 0.55) / 0.45);
  }
  const opacity = ease((progress - start - 0.13) / 0.035);
  return { x, y, opacity, textX: 12 * (1 - opacity) };
}

export function categoryLineScale(progress: number) {
  return mix(0.025, 1, clamp((progress - 0.04) / 0.845));
}

// The requested shared-row/shared-column path intentionally crosses stationary
// icons. Keep one pointer target at a crossing without moving or duplicating them.
export function categoryInteractionFrame(progress: number, width: number) {
  const frames = categoryOrder.map((_, index) => categoryFrame(progress, index, width));
  const movingIndex = categoryOrder.findIndex((_, index) => {
    const start = 0.04 + index * 0.17;
    return progress > start && progress < start + 0.13;
  });
  const moving = frames[movingIndex];
  const interactive = frames.map((frame, index) => !moving || index === movingIndex || !(
    frame.x < moving.x + 64 && frame.x + 64 > moving.x &&
    frame.y < moving.y + 64 && frame.y + 64 > moving.y
  ));
  return { frames, movingIndex, interactive };
}
