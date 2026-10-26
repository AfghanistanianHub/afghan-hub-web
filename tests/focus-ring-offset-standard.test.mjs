import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const src = new URL("../src/", import.meta.url);
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// The audit's standard: 4px by default, 2px inside bordered containers, and an
// inset -2px ring only where a scroll container would clip an outer one.
const allowed = new Set([4, 2, -2]);

function walk(dir) {
  return readdirSync(new URL(dir, src)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(new URL(path, src)).isDirectory() ? walk(path) : [path];
  });
}

function cssOffsets(path) {
  return [...read(`src/${path}`).matchAll(/outline-offset:\s*(-?\d+)px/g)].map((match) => Number(match[1]));
}

function utilityOffsets(path) {
  return [...read(`src/${path}`).matchAll(/outline-offset-(?:\[(-?\d+)px\]|(\d+))/g)].map((match) =>
    Number(match[1] ?? match[2]),
  );
}

test("every focus offset is the shared 4px default or a documented exception", () => {
  const offenders = [];
  for (const file of walk(".")) {
    const offsets = file.endsWith(".css")
      ? cssOffsets(file)
      : /\.(tsx|ts)$/.test(file)
        ? utilityOffsets(file)
        : [];
    for (const offset of offsets) {
      if (!allowed.has(offset)) offenders.push(`${file}: ${offset}px`);
    }
  }
  assert.deepEqual(offenders, [], `focus offsets outside the standard: ${offenders.join(", ")}`);
});

test("the shared ring keeps its 4px default", () => {
  const css = read("src/app/globals.css");
  const base = css.match(/:where\(a, button, input, select, textarea, summary, \[tabindex\]\):focus-visible\s*{([^}]*)}/);
  assert.ok(base, "the shared focus-visible rule is missing");
  assert.match(base[1], /outline:\s*2px solid var\(--primary\)/);
  assert.match(base[1], /outline-offset:\s*4px/);
});
