export const categoryOrder = ["people", "organizations", "businesses", "opportunities", "events"] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (from: number, to: number, t: number) => from + (to - from) * t;

// Pure geometry: no clock, spring, or entrance trigger. The clear travel lane
// between icons and copy prevents later icons crossing already revealed text.
export function categoryFrame(progress: number, index: number, width: number) {
  const start = 0.04 + index * 0.17;
  const travel = clamp((progress - start) / 0.13);
  const initialX = 32 + (4 - index) * (Math.max(0, width - 96) / 4);
  const finalY = 144 + index * 80;
  let x = initialX;
  let y = 0;
  // Rightmost first. Travel below the waiting horizontal row before moving
  // left, then descend in the clear lane beside the revealed descriptions.
  if (index === 4) {
    if (travel < 0.2) x = mix(initialX, 128, ease(travel / 0.2));
    else if (travel < 0.8) { x = 128; y = finalY * ease((travel - 0.2) / 0.6); }
    else { x = mix(128, 32, ease((travel - 0.8) / 0.2)); y = finalY; }
  } else if (travel < 0.2) {
    y = 72 * ease(travel / 0.2);
  } else if (travel < 0.5) {
    x = mix(initialX, 128, ease((travel - 0.2) / 0.3));
    y = 72;
  } else if (travel < 0.8) {
    x = 128;
    y = mix(72, finalY, ease((travel - 0.5) / 0.3));
  } else {
    x = mix(128, 32, ease((travel - 0.8) / 0.2));
    y = finalY;
  }
  const opacity = ease((progress - start - 0.13) / 0.035);
  return { x, y, opacity, textX: 12 * (1 - opacity) };
}

export function categoryLineScale(progress: number) {
  return mix(0.025, 1, clamp((progress - 0.04) / 0.845));
}
