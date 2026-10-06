import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const phase = process.argv[2] ?? "after";
assert.ok(["before", "after"].includes(phase));
const tabs = await (await fetch("http://127.0.0.1:9227/json/list")).json();
const socket = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map();
const errors = [];
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  clearTimeout(request.timer);
  if (message.error) request.reject(new Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timed out: ${method}`)); }, 30000);
    pending.set(requestId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}
async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
try {
  await send("Page.enable");
  await send("Runtime.enable");
  if (phase === "after") {
    await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.__networkQA={frames:0,mouseLines:0,maxLine:0};const proto=CanvasRenderingContext2D.prototype;const clear=proto.clearRect,move=proto.moveTo,line=proto.lineTo,stroke=proto.stroke;proto.clearRect=function(...a){if(this.canvas.closest('.global-network-background'))window.__networkQA.frames++;return clear.apply(this,a)};proto.moveTo=function(x,y){this.__start=[x,y];return move.call(this,x,y)};proto.lineTo=function(x,y){this.__end=[x,y];return line.call(this,x,y)};proto.stroke=function(){if(this.canvas.closest('.global-network-background')){const q=window.__networkQA;q.maxLine=Math.max(q.maxLine,Math.hypot(this.__start[0]-this.__end[0],this.__start[1]-this.__end[1]));const alpha=Number(this.strokeStyle.match(/[\\d.]+(?=\\))/)?.[0]||0);if(alpha>0.22)q.mouseLines++}return stroke.call(this)}` });
  }
  const results = [];
  for (const [name, route, width, height] of [
    ["home-desktop", "/", 1440, 1000],
    ["public-desktop", "/about", 1440, 1000],
    ["login-desktop", "/login", 1440, 1000],
    ["home-mobile", "/", 390, 844],
    ["login-mobile", "/login", 390, 844],
    ...(process.env.APNBC_MEMBER_FIXTURE === "1" ? [["member-fixture-desktop", "/network-background-qa", 1440, 1000], ["member-fixture-mobile", "/network-background-qa", 390, 844]] : []),
  ]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
    await send("Page.navigate", { url: `http://127.0.0.1:3107${route}` });
    let ready = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      if (await evaluate(`document.readyState === 'complete' && !!document.querySelector('.global-network-background ${phase === "after" ? "canvas" : "svg"}')`)) { ready = true; break; }
      await delay(200);
    }
    assert.ok(ready, `${route} must render the background`);
    await delay(1000);
    const state = await evaluate(`(() => {
      const layer = document.querySelector('.global-network-background');
      const canvas = layer.querySelector('canvas');
      const shell = document.querySelector('.public-shell') || document.querySelector('.app-content > main');
      return {route:location.pathname, layers:document.querySelectorAll('.global-network-background').length, tag:layer.firstElementChild.tagName, pointerEvents:getComputedStyle(layer).pointerEvents, position:getComputedStyle(layer).position, shellBackground:shell && getComputedStyle(shell).backgroundColor, width:canvas?.width, height:canvas?.height, scrollWidth:document.documentElement.scrollWidth, viewport:innerWidth};
    })()`);
    assert.equal(state.layers, 1);
    assert.equal(state.pointerEvents, "none");
    assert.equal(state.position, "fixed");
    assert.ok(state.scrollWidth <= state.viewport, `${name} must not overflow`);
    if (phase === "after") {
      assert.equal(state.tag, "CANVAS");
      assert.equal(state.width, width);
      assert.equal(state.height, height);
      // Read actual canvas pixels: the exact blue particle layer must be nonempty.
      const populated = await evaluate(`(() => {const c=document.querySelector('.global-network-background canvas');const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return p.some((v,i)=>i%4===3 && v>0)})()`);
      assert.ok(populated, `${name}: canvas must draw dots`);
    }
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.floor(width / 2), y: Math.floor(height / 2) });
    if (phase === "after") {
      for (let y = 40; y < height; y += 100) for (let x = 40; x < width; x += 100) {
        await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
        await delay(20);
      }
      const interaction = await evaluate("window.__networkQA");
      assert.ok(interaction.mouseLines > 0, `${name}: real mouse input creates original mouse links`);
      assert.ok(interaction.maxLine <= 160, `${name}: no across-page lines`);
      await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
      await delay(100);
      const frames = await evaluate("window.__networkQA.frames");
      await delay(150);
      assert.equal(await evaluate("window.__networkQA.frames"), frames, "Reduced motion has no animation loop");
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 100, y: 100 });
      assert.ok(await evaluate("window.__networkQA.frames") > frames, "Reduced motion still responds to mouse");
      await send("Emulation.setEmulatedMedia", { features: [] });
      state.interaction = interaction;
    }
    const screenshot = await send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(`docs/evidence/apnbc-background/${phase}-${name}.png`, Buffer.from(screenshot.data, "base64"));
    results.push({ name, ...state });
  }
  assert.deepEqual(errors, [], "No browser runtime exceptions");
  await fs.writeFile(`docs/evidence/apnbc-background/${phase}-browser.json`, JSON.stringify({ results, errors }, null, 2) + "\n");
  console.log(JSON.stringify(results, null, 2));
} finally {
  socket.close();
}
