import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
function luminance(token) {
  const match = css.match(new RegExp(`--${token}:\\s*(#[0-9a-f]{3,6});`, 'i'));
  assert.ok(match, `Missing sRGB color token: ${token}`);
  let hex = match[1].slice(1);
  if (hex.length === 3) hex = [...hex].map(value => value.repeat(2)).join('');
  const rgb = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

for (const [foreground, background, minimum] of [
  ['foreground', 'background', 4.5],
  ['muted-foreground', 'card', 4.5],
  ['primary-foreground', 'primary', 4.5],
  ['input', 'background', 3],
  ['input', 'card', 3],
  ['destructive', 'background', 4.5],
  ['destructive', 'card', 4.5],
]) {
  test(`${foreground} remains distinguishable against ${background}`, () => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    const ratio = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(ratio >= minimum, `${foreground}/${background}: ${ratio} must be at least ${minimum}`);
  });
}
