import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

// Uses the existing Linux CI image and lockfile. Never disables Chrome's sandbox,
// contacts production, loads real credentials, or changes a workflow/dependency.
const chromePath = ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/opt/google/chrome/chrome"].find(existsSync);
const enabled = process.env.CI === "true" && process.platform === "linux";
const root = path.resolve(new URL("..", import.meta.url).pathname);
const require = createRequire(import.meta.url);

function launch(command, args, env) {
  const child = spawn(command, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  for (const stream of [child.stdout, child.stderr]) stream.on("data", data => { output = (output + data).slice(-12000); });
  child.on("error", error => { output += error.message; });
  return { child, output: () => output };
}
async function waitFor(fn, label, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { const value = await fn(); if (value) return value; } catch { /* readiness polling */ }
    await delay(100);
  }
  throw new Error(`Timed out: ${label}`);
}
async function listen(server) {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return server.address().port;
}
class DevTools {
  async connect(url) {
    this.socket = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
    this.exceptions = [];
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.method === "Runtime.exceptionThrown") this.exceptions.push(message.params.exceptionDetails.text);
      const pending = this.pending.get(message.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      }
    });
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }
  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`DevTools timeout: ${method}`)); }, 15000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  }
  close() { this.socket?.close(); }
}
function emitScreenshot(name, data, debug = false) {
  console.log(`AFGHAN_HUB_${debug ? "DEBUG_" : ""}SCREENSHOT_START ${name}`);
  for (let i = 0; i < data.length; i += 4096) console.log(data.slice(i, i + 4096));
  console.log("AFGHAN_HUB_SCREENSHOT_END");
}
const layoutExpression = `(() => {
  const group = document.querySelector('[role="group"][aria-label^="People connected"]');
  const links = [...group.querySelectorAll('a')];
  const rect = element => { const r = element.getBoundingClientRect(); return {left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height}; };
  const people = [...group.querySelectorAll('strong')].find(el => el.textContent === 'People at the heart').parentElement;
  const peopleRect = rect(people);
  const overlaps = links.filter(link => { const r = rect(link); return Math.min(r.right,peopleRect.right)-Math.max(r.left,peopleRect.left)>1 && Math.min(r.bottom,peopleRect.bottom)-Math.max(r.top,peopleRect.top)>1; }).map(link=>link.textContent.trim());
  const targets = links.map(link => {
    link.scrollIntoView({block:'center'});
    const r = rect(link); const hit = document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
    return {href:link.getAttribute('href'),height:r.height,clickable:!!hit && (hit === link || link.contains(hit))};
  });
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overlaps,targets,covers:document.querySelectorAll('article').length};
})()`;

test("landing responsive layout, keyboard and accessibility in sandboxed Chrome", {
  skip: enabled ? false : "Browser QA executes in existing Linux CI; local browser verification is not implied.",
  timeout: 300000,
}, async t => {
  assert.ok(chromePath, "Linux CI must provide Chrome for browser verification");
  const nextCli = path.join(root, "node_modules/next/dist/bin/next");
  const future = new Date(Date.now() + 30 * 86400000).toISOString();
  const rows = Object.fromEntries(["opportunities", "events", "businesses", "organizations"].map(kind => [kind, Array.from({ length: 3 }, (_, i) => ({
    slug: `layout-sample-${kind}-${i}`, title: i === 2 ? "A longer community listing title that must wrap without squeezing neighboring cards" : "Community gathering and new possibilities",
    name: i === 2 ? "A longer community organization name that must remain readable" : "Community network",
    summary: "Sample public content for layout verification.", short_description: "Sample public content for layout verification.",
    description: "Local browser QA fixture; not a real published listing.", type: "volunteer", category: "Community", organization_type: "Community organization",
    city: "Vancouver", country: "Canada", is_remote: false, is_online: false, deadline: future.slice(0, 10), starts_at: future, ends_at: future,
  }))]));
  const fixture = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const kind = url.pathname.replace("/rest/v1/", "");
    if (request.method !== "GET" || !rows[kind] || url.searchParams.get("status") !== "eq.published") { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "Content-Type": "application/json", "Content-Range": "0-2/3" });
    response.end(JSON.stringify(rows[kind]));
  });
  t.after(() => new Promise(resolve => fixture.close(resolve)));
  const fixturePort = await listen(fixture);
  const env = { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${fixturePort}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "layout-fixture-public-key" };
  const build = launch(process.execPath, [nextCli, "build"], env);
  t.after(() => build.child.kill());
  const buildCode = await new Promise(resolve => build.child.on("exit", resolve));
  assert.equal(buildCode, 0, build.output());
  const portProbe = http.createServer();
  const appPort = await listen(portProbe);
  await new Promise(resolve => portProbe.close(resolve));
  const app = launch(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(appPort)], env);
  t.after(() => app.child.kill());
  const appUrl = `http://127.0.0.1:${appPort}`;
  await waitFor(async () => (await fetch(appUrl)).ok, "local production server");
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), "afghan-browser-"));
  const chrome = launch(chromePath, ["--headless=new", "--enable-automation", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], process.env);
  t.after(async () => { chrome.child.kill(); await delay(300); await fs.rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); });
  const portFile = await waitFor(async () => {
    if (chrome.child.exitCode !== null) throw new Error(chrome.output());
    return await fs.readFile(path.join(profile, "DevToolsActivePort"), "utf8");
  }, "sandboxed Chrome startup").catch(error => { throw new Error(`${error.message}\n${chrome.output()}`); });
  const debugPort = portFile.split("\n")[0];
  const tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const page = new DevTools();
  await page.connect(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
  t.after(() => page.close());
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.send("Page.navigate", { url: "chrome://sandbox" });
  const sandbox = await waitFor(() => page.evaluate("document.body?.innerText.includes('Seccomp') && document.body.innerText"), "sandbox status");
  assert.match(sandbox, /Seccomp-BPF sandbox\s+Yes/, "Renderer sandbox must be enabled");
  console.log("AFGHAN_HUB_SANDBOX_VERIFIED Seccomp-BPF enabled; no sandbox-disabling launch flags.");
  const axeSource = require("axe-core").source;
  const screenshots = [];
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url: appUrl });
    await waitFor(() => page.evaluate("document.readyState==='complete' && !!document.querySelector('article')"), `landing ${width}`);
    await page.evaluate("document.fonts.ready.then(()=>true)");
    await delay(300);
    try {
      const layout = await page.evaluate(layoutExpression);
      assert.ok(layout.scrollWidth <= width + 1, `Horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
      assert.deepEqual(layout.overlaps, [], `People hidden by cards at ${width}`);
      assert.equal(layout.targets.length, 4);
      assert.ok(layout.targets.every(target => target.clickable && target.height >= 44), `Blocked/small hero targets at ${width}`);
      assert.ok(layout.covers >= 12, "Populated listing covers must render");
      await page.evaluate(axeSource);
      const audit = await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})))");
      assert.deepEqual(audit, [], `Accessibility violations at ${width}: ${JSON.stringify(audit)}`);
      await page.evaluate("scrollTo(0,0)");
      const heroBottom = await page.evaluate("Math.ceil(document.querySelector('main > section').getBoundingClientRect().bottom)");
      const screenshot = await page.send("Page.captureScreenshot", { format: "jpeg", quality: 75, captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.min(heroBottom, 1600), scale: 1 } });
      screenshots.push({ name: `landing_${width}.jpg`, data: screenshot.data });
      console.log(`AFGHAN_HUB_BROWSER_RESULT ${JSON.stringify({width,horizontalOverflow:false,peopleOccluded:false,heroTargets:4,axeViolations:0,populatedCovers:true})}`);
    } catch (error) {
      const screenshot = await page.send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
      if (process.versions.node.startsWith("24.")) emitScreenshot(`debug_${width}.jpg`, screenshot.data, true);
      throw error;
    }
  }
  // 200% text resizing at desktop, plus the 720px reflow equivalent of a 1440px page at 200% zoom.
  await page.evaluate("document.documentElement.style.fontSize='200%'");
  const resized = await page.evaluate(layoutExpression);
  assert.ok(resized.scrollWidth <= 1441, "Text resizing must not cause horizontal scrolling");
  assert.deepEqual(resized.overlaps, [], "Text resizing must not hide people behind cards");
  await page.evaluate("document.documentElement.style.fontSize=''");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 720, height: 1000, deviceScaleFactor: 2, mobile: false });
  assert.ok((await page.evaluate(layoutExpression)).scrollWidth <= 721, "200% zoom reflow must fit");
  await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  assert.ok(parseFloat(await page.evaluate("getComputedStyle(document.querySelector('[role=group] a')).transitionDuration")) <= 0.00001, "Reduced motion must suppress transitions");
  await page.send("Page.navigate", { url: appUrl });
  await waitFor(() => page.evaluate("document.readyState==='complete' && !!document.querySelector('article')"), "keyboard page");
  await page.evaluate("document.activeElement?.blur(); scrollTo(0,0)");
  const focused = [];
  for (let i = 0; i < 14; i++) {
    for (const type of ["keyDown", "keyUp"]) await page.send("Input.dispatchKeyEvent", { type, key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    focused.push(await page.evaluate("({href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outlineStyle})"));
  }
  assert.equal(focused[0].href, "#main-content", "Skip link must be the first keyboard target");
  for (const kind of ["organizations", "events", "opportunities", "businesses"]) assert.ok(focused.some(item => item.href === `/explore?type=${kind}` && item.outline !== "none"), `Keyboard focus missing: ${kind}`);
  await page.evaluate("document.querySelector('[role=group] a[href*=events]').click()");
  await waitFor(() => page.evaluate("location.pathname==='/explore' && location.search==='?type=events' && !!document.querySelector('article')"), "event category navigation");
  assert.deepEqual(page.exceptions, [], "No uncaught browser exceptions");
  console.log("AFGHAN_HUB_BROWSER_INTERACTION keyboard, skip link, visible focus, reduced motion, 200% text/reflow and event navigation passed.");
  if (process.versions.node.startsWith("24.")) for (const screenshot of screenshots) emitScreenshot(screenshot.name, screenshot.data);
});
