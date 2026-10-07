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
      if (message.method === "Fetch.requestPaused" && this.interceptRequest) {
        void this.interceptRequest(message.params).catch(error => this.exceptions.push(error.message));
      }
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
  const group = document.querySelector('[data-hero-region]');
  const links = [...group.querySelectorAll('[data-community-node]')];
  const targets = links.map(link => {
    link.scrollIntoView({block:'center'});
    const r = link.getBoundingClientRect(); const hit = document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
    return {href:link.getAttribute('href'),height:r.height,width:r.width,clickable:!!hit && (hit === link || link.contains(hit))};
  });
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,targets,covers:document.querySelectorAll('main article').length,people:group.querySelectorAll('[data-constellation-person]').length};
})()`;

test("geometric landing responsive layout, hero wayfinding and accessibility in sandboxed Chrome", {
  skip: enabled ? false : "Browser QA executes in existing Linux CI; local browser verification is not implied.",
  timeout: 420000,
}, async t => {
  assert.ok(chromePath, "Linux CI must provide Chrome for browser verification");
  // This temporary local QA route is removed before the final release build.
  // It mounts the real drawer without impersonating a production login.
  const qaDirectory = path.join(root, "src/app/navigator-qa");
  assert.ok(!existsSync(qaDirectory), "QA route must never overwrite application code");
  await fs.mkdir(qaDirectory);
  await fs.writeFile(path.join(qaDirectory, "page.tsx"), 'import { Header } from "@/components/dashboard/header"; export default function Page(){return <div className="flex"><aside aria-hidden="true" className="hidden w-64 shrink-0 lg:block" /><div className="min-w-0 flex-1"><Header canModerate={false} currentUserId="00000000-0000-4000-8000-000000000001" displayName="A deliberately long QA member display name" email="qa@example.invalid" notifications={[]} pendingModerationCount={0} unreadNotificationCount={0} unreadMessageCount={0} /><main><h1>Navigator browser QA fixture</h1></main></div></div>;}');
  t.after(() => fs.rm(qaDirectory, {recursive:true,force:true}));
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
    let selected = rows[kind];
    const slug = url.searchParams.get("slug");
    if (slug?.startsWith("eq.")) selected = selected.filter(row => row.slug === slug.slice(3));
    const pattern = url.searchParams.get("title") ?? url.searchParams.get("name");
    if (pattern?.startsWith("ilike.")) {
      const keyword = pattern.slice(6).replaceAll("%", "").toLowerCase();
      selected = selected.filter(row => (row.title + " " + row.name).toLowerCase().includes(keyword));
    }
    response.end(JSON.stringify(selected));
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
  // Validate the current modular landing, not the retired SVG hero controller.
  for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
    await page.send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url: appUrl });
    await waitFor(() => page.evaluate("document.readyState==='complete' && !!document.querySelector('#landing-title')"), `modular landing ${width}`);
    await page.evaluate("document.fonts.ready.then(()=>true)");
    const layout = await page.evaluate(`(() => {
      const main=document.querySelector('main#main-content');
      const title=document.querySelector('#landing-title');
      const modules=[...main.querySelectorAll('article')];
      const links=[...main.querySelectorAll('a[href]')];
      return { scrollWidth:document.documentElement.scrollWidth, width:innerWidth,
        titleVisible:!!title && title.getBoundingClientRect().width>0,
        modules:modules.length, links:links.length,
        hasExplore:links.some(a=>a.getAttribute('href')==='/explore'),
        hasJoin:links.some(a=>a.getAttribute('href')==='/login?mode=join'),
        kinds:['People','Businesses','Organizations','Opportunities','Events'].every(k=>main.textContent.includes(k)),
        brokenLinks:links.filter(a=>a.getBoundingClientRect().width===0).map(a=>a.getAttribute('href'))
      };
    })()`);
    assert.ok(layout.scrollWidth <= width+1, `Horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.titleVisible && layout.modules>=4 && layout.links>=5, `Missing homepage content at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.hasExplore && layout.hasJoin && layout.kinds, `Missing discovery paths at ${width}: ${JSON.stringify(layout)}`);
    assert.deepEqual(layout.brokenLinks,[],`Invisible links at ${width}`);
    await page.evaluate(axeSource);
    const violations=await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))");
    assert.deepEqual(violations,[],`Landing accessibility at ${width}`);
    console.log(`AFGHAN_HUB_MODULAR_LANDING_VERIFIED ${width}: layout, navigation, community areas, accessibility`);
  }
  await page.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  assert.ok(await page.evaluate("!!document.querySelector('#landing-title')"),"Reduced-motion mode preserves content");
  assert.deepEqual(page.exceptions,[],"No uncaught browser exceptions");
});
