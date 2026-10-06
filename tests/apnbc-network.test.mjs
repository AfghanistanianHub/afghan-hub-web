import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const original = fs.readFileSync("docs/evidence/apnbc-background/source/apnbc-network.js", "utf8");
const port = ts.transpileModule(fs.readFileSync("src/components/visual/apnbc-network.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function target() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    dispatch(name, event = {}) { for (const fn of listeners.get(name) ?? []) fn(event); },
    count() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); },
  };
}
function setup(width = 1440, height = 1000, reduced = false, source = false) {
  const calls = [];
  const context = new Proxy({}, {
    get(object, key) { return object[key] ?? ((...args) => calls.push([key, ...args])); },
    set(object, key, value) { calls.push([key, value]); object[key] = value; return true; },
  });
  const canvas = { style: {}, dataset: {}, getContext: () => context, getBoundingClientRect: () => ({ left: 0, top: 0 }) };
  const section = { ...target(), offsetWidth: width, offsetHeight: height, children: [{ classList: { contains: () => true } }], getBoundingClientRect: canvas.getBoundingClientRect };
  const motion = { ...target(), matches: reduced };
  const frames = new Map();
  let frameId = 0;
  const window = { ...target(), innerWidth: width, innerHeight: height, devicePixelRatio: 2, matchMedia: () => motion,
    requestAnimationFrame(fn) { const id = ++frameId; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  const document = { ...target(), hidden: false, readyState: "complete", documentElement: target(), getElementById: id => id === "apnbc-hero-section" ? section : canvas };
  let seed = 12345;
  const math = Object.create(Math);
  math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const sandbox = { window, document, Math: math, exports: {}, requestAnimationFrame: window.requestAnimationFrame, setTimeout: () => {} };
  vm.createContext(sandbox);
  vm.runInContext(source ? original : port, sandbox);
  const cleanup = source ? () => {} : sandbox.exports.mountAPNBCNetwork(canvas);
  function tick() { const queued = [...frames.values()]; frames.clear(); queued.forEach(fn => fn()); }
  return { calls, canvas, section, motion, window, document, frames, cleanup, tick };
}

for (const width of [1440, 390]) {
  test(`exact APNBC draw-call parity at ${width}px, including mouse and resize`, () => {
    const reference = setup(width, 1000, false, true);
    const actual = setup(width);
    assert.deepEqual(actual.calls, reference.calls);
    assert.equal(actual.calls.filter(call => call[0] === "arc").length, width < 768 ? 28 : 48);
    for (let i = 0; i < 10; i++) {
      reference.section.dispatch("mousemove", { clientX: 300, clientY: 400 });
      actual.window.dispatch("mousemove", { clientX: 300, clientY: 400 });
      reference.tick(); actual.tick();
    }
    assert.deepEqual(actual.calls, reference.calls, "Moving particles and mouse links match the real source exactly");
    reference.section.dispatch("mouseleave"); actual.document.documentElement.dispatch("mouseleave");
    reference.tick(); actual.tick();
    assert.deepEqual(actual.calls, reference.calls);
    actual.cleanup();
  });
}

test("visibility suspension, reduced-motion interaction, resize/DPR and complete cleanup", () => {
  const state = setup(1440, 1000, true);
  assert.equal(state.frames.size, 0);
  const first = state.calls.filter(call => call[0] === "arc");
  state.calls.length = 0;
  const [dot] = first;
  state.window.dispatch("mousemove", { clientX: dot[1], clientY: dot[2] });
  assert.deepEqual(state.calls.filter(call => call[0] === "arc"), first, "Reduced motion keeps dots static");
  assert.ok(state.calls.some(call => call[0] === "strokeStyle" && call[1] === "rgba(79,125,240,0.35)"), "Mouse connection uses the original alpha");
  state.motion.matches = false; state.motion.dispatch("change");
  assert.equal(state.frames.size, 1);
  state.document.hidden = true; state.document.dispatch("visibilitychange");
  assert.equal(state.frames.size, 0);
  state.document.hidden = false; state.document.dispatch("visibilitychange");
  assert.equal(state.frames.size, 1);
  state.window.innerWidth = 390; state.window.innerHeight = 844; state.window.devicePixelRatio = 3;
  state.calls.length = 0; state.window.dispatch("resize");
  assert.equal(state.canvas.width, 1170); assert.equal(state.canvas.height, 2532);
  assert.equal(state.calls.filter(call => call[0] === "arc").length, 28);
  assert.equal(state.frames.size, 1, "Resize never duplicates animation loops");
  for (const call of state.calls.filter(call => call[0] === "lineTo")) assert.ok(Number.isFinite(call[1]) && Number.isFinite(call[2]));
  state.cleanup();
  assert.equal(state.frames.size, 0);
  for (const eventTarget of [state.window, state.document, state.document.documentElement, state.motion]) assert.equal(eventTarget.count(), 0);
  // React strict-mode remount must not retain a previous loop/listener.
  const remount = setup(); remount.cleanup(); assert.equal(remount.frames.size, 0);
});

test("one global, aria-hidden canvas with no labels or SVG background", () => {
  const component = fs.readFileSync("src/components/visual/global-network-background.tsx", "utf8");
  const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  assert.equal((layout.match(/<GlobalNetworkBackground\s*\/>/g) ?? []).length, 1);
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /<canvas ref=\{canvas\}/);
  assert.doesNotMatch(component, /<svg|<text|Community|Businesses|Events/);
  assert.doesNotMatch(css, /global-network-cluster|constellation-drift|isolated-breathe/);
  assert.match(css, /\.global-network-background\s*\{[^}]*pointer-events: none/s);
});
