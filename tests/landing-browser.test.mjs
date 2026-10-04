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
  const group = document.querySelector('[aria-labelledby="community-discovery"]');
  const links = [...group.querySelectorAll('[data-discovery-link]')];
  const targets = links.map(link => {
    link.scrollIntoView({block:'center'});
    const r = link.getBoundingClientRect(); const hit = document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
    return {href:link.getAttribute('href'),height:r.height,width:r.width,clickable:!!hit && (hit === link || link.contains(hit))};
  });
  const panels=[...group.querySelectorAll('article')].map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height]});
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,targets,panels,covers:document.querySelectorAll('article').length,people:group.querySelectorAll('[data-person-node]').length};
})()`;

test("geometric landing responsive layout, discovery links and accessibility in sandboxed Chrome", {
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
  // Hero SVG sequence, actual pointer/keyboard feedback, suspension and frame pacing.
  await page.send("Emulation.setScrollbarsHidden",{hidden:true});
  await page.send("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await page.send("Emulation.setTouchEmulationEnabled",{enabled:false});
  await page.send("Emulation.setEmulatedMedia",{features:[]});
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("document.querySelector('[data-community-motion]')?.dataset.running==='true'"),"hero controller hydration");
  await page.evaluate(`window.__heroShifts=0;window.__heroLongTasks=[];new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__heroShifts+=e.value}).observe({type:'layout-shift'});new PerformanceObserver(l=>window.__heroLongTasks.push(...l.getEntries().map(e=>e.duration))).observe({type:'longtask'})`);
  const heroGeometry=await page.evaluate("(()=>{const e=document.querySelector('[data-hero-region]');const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()");
  const stages=await page.evaluate("(()=>{const e=document.querySelector('[data-community-motion]');return ['[data-hero-draw]','[data-hero-reveal]','[data-hero-accent]'].map(s=>e.querySelector(s).getAnimations()[0].effect.getTiming())})()");
  assert.ok(stages[1].delay>=stages[0].duration,"Forms reveal after main path drawing");
  assert.ok(stages[2].delay>=stages[1].delay+stages[1].duration,"Violet accents activate after architectural reveal");
  assert.equal(await page.evaluate("document.querySelectorAll('[data-constellation-person]').length"),4,"Hero constellation remains human-first without invented members");
  assert.ok(await page.evaluate("!!document.querySelector('[data-community-signature]') && !!document.querySelector('[data-environment-contour]')"),"Original geometric signature and environmental contour render");
  assert.equal(await page.evaluate("(()=>{const t=getComputedStyle(document.documentElement).getPropertyValue('--motion-step').trim();return parseFloat(t)*(t.endsWith('ms')?1:1000)})()"),420,"Shared motion timing is consistent");
  const capture=[];const captureTimes=[];const began=Date.now();let phase=0;
  // Use current viewport hit geometry; do not resize the viewport to record a visible hero.
  const depth=[];
  const pointHero = async fraction => {
    const point = await page.evaluate(`(()=>{const e=document.querySelector('[data-community-motion]');const r=e.getBoundingClientRect();const x=r.left+r.width*${fraction};const y=r.top+r.height*.5;return {x,y,hit:e.contains(document.elementFromPoint(x,y)),running:e.dataset.running,hidden:document.hidden,scrollY,viewport:[innerWidth,innerHeight]}})()`);
    console.log(`AFGHAN_HUB_HERO_POINTER_TARGET ${JSON.stringify(point)}`);
    assert.ok(point.hit && point.running==='true' && !point.hidden,'Pointer must hit the visible running hero');
    await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});
    return waitFor(()=>page.evaluate(`(()=>{const t=getComputedStyle(document.querySelector('[data-hero-layer=architecture]')).transform;const x=new DOMMatrix(t).m41;return ${fraction < .5 ? 'x < -1' : 'x > 1'} && t})()`),'actual pointer frame committed');
  };
  while(Date.now()-began<13000) {
    const elapsed=Date.now()-began;
    if(elapsed>=4300&&phase===0){depth.push(await pointHero(.2));phase=1;}
    else if(elapsed>=5200&&phase===1){depth.push(await pointHero(.8));phase=2;}
    else if(elapsed>=6300&&phase===2){await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:10,y:20});phase=3;}
    else if(elapsed>=9500&&phase===3){
      await page.evaluate("document.activeElement?.blur()");
      for(let i=0;i<16;i++) {
        for(const type of ["keyDown","keyUp"])await page.send("Input.dispatchKeyEvent",{type,key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
        if(await page.evaluate("document.activeElement?.dataset.landingCta==='explore'"))break;
      }
      assert.ok(await page.evaluate("document.querySelector('[data-landing-cta=explore]').matches(':focus-visible')"),"Actual primary CTA keyboard focus");
      await delay(220);
      assert.ok(await page.evaluate("parseFloat(getComputedStyle(document.querySelector('[data-hero-focus]')).opacity)>.5"),"Brief CTA connection highlight");
      phase=4;
    }
    else if(elapsed>=11200&&phase===4){assert.ok(await page.evaluate("parseFloat(getComputedStyle(document.querySelector('[data-hero-focus]')).opacity)<.01"),"CTA highlight must settle even while focused");await page.evaluate("document.activeElement.blur()");phase=5;}
    captureTimes.push(Date.now()-began);
    capture.push((await page.send("Page.captureScreenshot",{format:"jpeg",quality:72,captureBeyondViewport:false,clip:{...heroGeometry,scale:1}})).data);
    await delay(Math.max(0,100-(Date.now()-began-elapsed)));
  }
  assert.ok(await page.evaluate("[...document.querySelectorAll('[data-hero-layer=architecture],[data-hero-layer=network],[data-hero-layer=openings]')].every(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return m.m41===0&&m.m42===0})"),"Selected depth layers return to rest after pointer exit");
  assert.equal(phase,5);assert.equal(depth.length,2);assert.notEqual(depth[0],depth[1],"Pointer must move selected layers");
  assert.equal(await page.evaluate("getComputedStyle(document.querySelector('[data-community-motion] svg')).transform"),"none","Never move the whole SVG");
  assert.deepEqual(await page.evaluate("(()=>{const r=document.querySelector('[data-hero-region]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()"),heroGeometry,"Hero frame must remain fixed");
  assert.equal(await page.evaluate("window.__heroShifts"),0,"No animation layout shifts");
  // Screenshot clipping can commit a final visibility/transform frame asynchronously.
  await waitFor(()=>page.evaluate("[...document.querySelector('[data-community-motion]').getAnimations({subtree:true})].filter(a=>a.effect.getTiming().iterations===1).every(a=>a.playState==='finished')"),"Intro and final pointer frame must finish",5000);
  const ambientTimes="[...document.querySelector('[data-community-motion]').getAnimations({subtree:true})].filter(a=>a.effect.getTiming().iterations===Infinity).map(a=>a.currentTime)";
  await page.evaluate("scrollTo(0,document.documentElement.scrollHeight)");
  await waitFor(()=>page.evaluate("document.querySelector('[data-community-motion]').dataset.running==='false'"),"offscreen pause");
  await waitFor(()=>page.evaluate("[...document.querySelector('[data-community-motion]').getAnimations({subtree:true})].filter(a=>a.effect.getTiming().iterations===Infinity).every(a=>a.playState==='paused')"),"offscreen renderer timelines paused");
  await page.evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
  const paused=await page.evaluate(ambientTimes);await delay(350);assert.deepEqual(await page.evaluate(ambientTimes),paused,"Offscreen ambient timeline must stop");
  await page.evaluate("scrollTo(0,0)");await waitFor(()=>page.evaluate("document.querySelector('[data-community-motion]').dataset.running==='true'"),"on-screen resume");
  await delay(150);assert.notDeepEqual(await page.evaluate(ambientTimes),paused,"Visible ambient timeline must resume");
  // Use actual tab visibility rather than dispatching a synthetic visibility event.
  await page.send("Emulation.setFocusEmulationEnabled",{enabled:false});
  const browser = new DevTools();await browser.connect(`ws://127.0.0.1:${debugPort}${portFile.split('\n')[1]}`);
  const other=await browser.send("Target.createTarget",{url:"about:blank"});
  await browser.send("Target.activateTarget",{targetId:other.targetId});
  await waitFor(()=>page.evaluate("document.hidden"),"actual background tab visibility");
  await waitFor(()=>page.evaluate("document.querySelector('[data-community-motion]').dataset.running==='false'"),"hidden-tab pause");
  // Let the renderer apply the paused style before sampling its committed timeline.
  await waitFor(()=>page.evaluate("[...document.querySelectorAll('[data-hero-pulse],[data-hero-node]')].flatMap(e=>e.getAnimations()).every(a=>a.playState==='paused')"),"hidden renderer timelines paused");
  await delay(100);
  const hidden=await page.evaluate(ambientTimes);await delay(350);assert.deepEqual(await page.evaluate(ambientTimes),hidden,"Hidden-tab timeline must stop");
  await browser.send("Target.activateTarget",{targetId:tabs.find(tab=>tab.type==='page').id});
  await browser.send("Target.closeTarget",{targetId:other.targetId});browser.close();
  await page.send("Emulation.setFocusEmulationEnabled",{enabled:true});
  await waitFor(()=>page.evaluate("document.querySelector('[data-community-motion]').dataset.running==='true'"),"visible-tab resume");
  for(const width of [1440,390]) {
    await page.send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:width===390});
    await page.evaluate("document.querySelector('[data-community-motion]').scrollIntoView({block:'center'})");
    await waitFor(()=>page.evaluate("document.querySelector('[data-community-motion]').dataset.running==='true'"),"performance visibility");
    const pacing=await page.evaluate("new Promise(resolve=>{const samples=[];let previous=performance.now();const start=previous;function tick(now){samples.push(now-previous);previous=now;if(now-start<2000)requestAnimationFrame(tick);else{samples.sort((a,b)=>a-b);resolve({frames:samples.length,p95:samples[Math.floor(samples.length*.95)],maximum:samples.at(-1)})}}requestAnimationFrame(tick)})");
    assert.ok(pacing.p95<100,`Sustained animation frame stalls at ${width}: ${JSON.stringify(pacing)}`);
    console.log(`AFGHAN_HUB_HERO_PERFORMANCE ${JSON.stringify({width,...pacing,layoutShifts:await page.evaluate('window.__heroShifts'),longTasks:await page.evaluate('window.__heroLongTasks')})}`);
  }
  // Real mobile scroll advances only selected SVG depth, without moving text or controls.
  await page.evaluate("scrollTo(0,document.querySelector('[data-community-motion]').getBoundingClientRect().top+scrollY+40)");
  await waitFor(()=>page.evaluate("parseFloat(document.querySelector('[data-community-motion]').style.getPropertyValue('--scroll-depth'))>0"),"mobile scroll depth feedback");
  assert.ok(await page.evaluate("[...document.querySelectorAll('[data-community-story] section')].every(e=>getComputedStyle(e).opacity==='1')"),"Scroll entrances never fade readable content");
  await page.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await waitFor(()=>page.evaluate("document.querySelector('[data-community-motion]').dataset.running==='false'"),"reduced motion controller");
  assert.equal(await page.evaluate("document.querySelector('[data-community-motion]').getAnimations({subtree:true}).length"),0,"Reduced motion must disable every hero animation");
  assert.ok(await page.evaluate("[...document.querySelectorAll('[data-hero-layer]')].every(e=>getComputedStyle(e).transform==='none')"),"Reduced motion must disable pointer depth");
  assert.ok(await page.evaluate("[...document.querySelectorAll('[data-hero-draw],[data-hero-reveal],[data-hero-accent]')].every(e=>parseFloat(getComputedStyle(e).opacity)===1)"),"Intentional fully visible static artwork");
  await page.send("Emulation.setEmulatedMedia",{features:[]});
  console.log("AFGHAN_HUB_HERO_VERIFIED staged intro, paused ambient pulses, pointer depth/reset, primary CTA keyboard highlight, actual hidden-tab/offscreen suspension, desktop/mobile pacing, zero layout shifts and static reduced motion passed.");
  if(process.versions.node.startsWith("24.")) {
    console.log(`AFGHAN_HUB_HERO_CAPTURE_TIMES ${JSON.stringify(captureTimes)}`);
    for(let frame=0;frame<capture.length;frame++)emitScreenshot(`hero_${String(frame).padStart(3,'0')}.jpg`,capture[frame]);
  }

  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url: appUrl });
    await waitFor(() => page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-discovery-link]')"), `landing ${width}`);
    await page.evaluate("document.fonts.ready.then(()=>true)");
    await delay(300);
    try {
      const layout = await page.evaluate(layoutExpression);
      assert.ok(layout.scrollWidth <= width + 1, `Horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
      assert.equal(layout.targets.length, 4);
      const networkTargets = await page.evaluate(`(() => [...document.querySelectorAll('[data-community-node]')].map(a => {
        a.scrollIntoView({block:'center'}); const r=a.getBoundingClientRect();
        const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
        a.focus({preventScroll:true});
        const description=document.getElementById(a.getAttribute('aria-describedby'));
        return {key:a.dataset.communityNode, href:a.getAttribute('href'), width:r.width, height:r.height, iconWidth:a.querySelector("svg").getBoundingClientRect().width, iconHeight:a.querySelector("svg").getBoundingClientRect().height,
          clickable:!!hit&&(hit===a||a.contains(hit)), outline:getComputedStyle(a).outlineStyle,
          reasonVisible:getComputedStyle(description).display!=='none'};
      }))()`);
      assert.equal(networkTargets.length, 5);
      assert.ok(networkTargets.every(a=>a.clickable&&a.width>=44&&a.height>=44&&a.iconWidth<=14&&a.iconHeight<=14&&a.outline!=='none'&&a.reasonVisible), `Network pointer/focus targets at ${width}: ${JSON.stringify(networkTargets)}`);
      assert.deepEqual(networkTargets.map(a=>a.href), ['/network','/explore?type=opportunities','/explore?type=organizations','/explore?type=events','/explore?type=businesses']);
      await page.evaluate("document.activeElement.blur()");
      assert.ok(layout.targets.every(target => target.clickable && target.height >= 44 && target.width >= 44), `Blocked/small discovery targets at ${width}`);
      assert.equal(layout.people, 9, "People illustration must retain all nine connected person glyphs");
      assert.ok(layout.covers >= 16, "Four discovery panels and twelve populated listing covers must render");
      await page.evaluate(axeSource);
      const audit = await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})))");
      assert.deepEqual(audit, [], `Accessibility violations at ${width}: ${JSON.stringify(audit)}`);
      await page.evaluate("scrollTo(0,0)");
      await delay(2300);
      const bottom = await page.evaluate("Math.ceil(document.querySelector('[aria-labelledby=community-discovery]').getBoundingClientRect().bottom)");
      const screenshot = await page.send("Page.captureScreenshot", { format: "jpeg", quality: 80, captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: bottom, scale: 1 } });
      screenshots.push({ name: `geometric_${width}.jpg`, data: screenshot.data });
      console.log(`AFGHAN_HUB_BROWSER_RESULT ${JSON.stringify({width,horizontalOverflow:false,discoveryTargets:4,peopleGlyphs:9,axeViolations:0,populatedCovers:true})}`);
    } catch (error) {
      const screenshot = await page.send("Page.captureScreenshot", { format: "jpeg", quality: 75 });
      if (process.versions.node.startsWith("24.")) emitScreenshot(`debug_${width}.jpg`, screenshot.data, true);
      throw error;
    }
  }
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await page.evaluate("document.documentElement.style.fontSize='200%'");
  assert.ok((await page.evaluate(layoutExpression)).scrollWidth <= 1441, "Text resizing must not cause horizontal scrolling");
  await page.evaluate("document.documentElement.style.fontSize=''");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 720, height: 1000, deviceScaleFactor: 2, mobile: false });
  assert.ok((await page.evaluate(layoutExpression)).scrollWidth <= 721, "200% zoom reflow must fit");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await page.send("Page.navigate", { url: appUrl });
  await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-discovery-link]')"),"keyboard landing");
  await delay(300);
  await page.evaluate("document.activeElement?.blur(); scrollTo(0,0)");
  const focused=[];
  for(let i=0;i<24;i++) {
    for(const type of ["keyDown","keyUp"]) await page.send("Input.dispatchKeyEvent",{type,key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    focused.push(await page.evaluate("({href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outlineStyle,key:document.activeElement.dataset.discoveryLink,node:document.activeElement.dataset.communityNode,descriptionVisible:document.activeElement.dataset.communityNode ? getComputedStyle(document.getElementById(document.activeElement.getAttribute('aria-describedby'))).display!=='none' : false})"));
  }
  assert.equal(focused[0].href,"#main-content","Skip link must be first");
  for(const key of ["people","opportunities","organizations","events","businesses"]) assert.ok(focused.some(item=>item.node===key&&item.outline!=="none"&&item.descriptionVisible),`Hero node reachable by Tab: ${key}`);
  for(const key of ["people","organizations","events","opportunities"]) assert.ok(focused.some(item=>item.key===key && item.outline!=="none"),`Visible keyboard focus: ${key}`);
  await page.evaluate("document.activeElement.blur();document.querySelector('[data-discovery-panel=people]').scrollIntoView({block:'center'})");
  const geometry=await page.evaluate("[...document.querySelectorAll('[data-discovery-panel]')].map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})");
  const point=await page.evaluate("(()=>{const r=document.querySelector('[data-discovery-link=people]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
  const before=await page.evaluate("getComputedStyle(document.querySelector('[data-discovery-panel=people]')).borderColor");
  await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",...point});
  await delay(250);
  assert.notEqual(await page.evaluate("getComputedStyle(document.querySelector('[data-discovery-panel=people]')).borderColor"),before,"Subtle hover border must appear");
  assert.deepEqual(await page.evaluate("[...document.querySelectorAll('[data-discovery-panel]')].map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})"),geometry,"Hover must not move panels");
  await page.evaluate("document.querySelector('[data-discovery-link=people]').focus({preventScroll:true})");
  await delay(250);
  screenshots.push({name:"geometric_people_focus.jpg",data:(await page.send("Page.captureScreenshot",{format:"jpeg",quality:80})).data});
  await page.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  assert.equal(await page.evaluate("getComputedStyle(document.querySelector('[data-discovery-link=people] span svg')).transform"),"none","Reduced motion must suppress arrow movement");
  assert.ok(parseFloat(await page.evaluate("getComputedStyle(document.querySelector('[data-discovery-panel=people]')).transitionDuration"))<=0.00001);
  await page.send("Emulation.setEmulatedMedia",{features:[]});
  // Physical mouse presses provide feedback and navigate without changing target bounds.
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-landing-cta]')"),"CTA landing");
  await delay(300);
  const ctaPoint=await page.evaluate("(()=>{const r=document.querySelector('[data-landing-cta=explore]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",...ctaPoint});
  await delay(250);
  const hoverColor=await page.evaluate("getComputedStyle(document.querySelector('[data-landing-cta=explore]')).backgroundColor");
  await page.send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...ctaPoint});
  await delay(250);
  assert.notEqual(await page.evaluate("getComputedStyle(document.querySelector('[data-landing-cta=explore]')).backgroundColor"),hoverColor,"CTA press feedback must be visible");
  await page.send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...ctaPoint});
  await waitFor(()=>page.evaluate("location.pathname==='/explore'"),"Explore CTA click");
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-landing-cta=join]')"),"Join CTA landing");
  await delay(300);
  await page.evaluate("document.querySelector('[data-landing-cta=join]').focus()");
  for(const type of ["keyDown","keyUp"]) await page.send("Input.dispatchKeyEvent",{type,key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await waitFor(()=>page.evaluate("location.pathname==='/login' && new URLSearchParams(location.search).get('mode')==='join'"),"Join CTA keyboard activation");
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-discovery-panel=events]')"),"panel keyboard landing");
  await delay(300);
  await page.evaluate("document.querySelector('[data-discovery-panel=events]').focus()");
  for(const type of ["keyDown","keyUp"]) await page.send("Input.dispatchKeyEvent",{type,key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await waitFor(()=>page.evaluate("location.pathname==='/explore' && location.search==='?type=events'"),"panel keyboard navigation");
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-discovery-panel=organizations]')"),"panel press landing");
  await delay(300);
  await page.evaluate("document.querySelector('[data-discovery-panel=organizations]').scrollIntoView({block:'center'})");
  const panelPoint=await page.evaluate("(()=>{const r=document.querySelector('[data-discovery-panel=organizations]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+80}})()");
  await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",...panelPoint});
  await page.send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...panelPoint});
  assert.ok(await page.evaluate("document.querySelector('[data-discovery-panel=organizations]').matches(':active')"),"Artwork area must activate the whole panel");
  assert.notEqual(await page.evaluate("getComputedStyle(document.querySelector('[data-discovery-panel=organizations]')).outlineStyle"),"none","Panel press feedback must appear");
  await page.send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...panelPoint});
  await waitFor(()=>page.evaluate("location.pathname==='/explore' && location.search==='?type=organizations'"),"panel artwork click");
  // Single physical taps use the real existing destinations, including signed-out member routing.
  await page.send("Emulation.setDeviceMetricsOverride",{width:390,height:1000,deviceScaleFactor:1,mobile:true});
  await page.send("Emulation.setTouchEmulationEnabled",{enabled:true});
  for(const key of ["people","organizations","events","opportunities"]) {
    await page.send("Page.navigate",{url:appUrl});
    await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-discovery-link]')"),"touch landing");
    await delay(300);
    await page.evaluate(`document.querySelector('[data-discovery-link=${key}]').scrollIntoView({block:'center'})`);
    const position=await page.evaluate(`(()=>{const r=document.querySelector('[data-discovery-link=${key}]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await page.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[position]});
    await page.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await waitFor(()=>page.evaluate(key==="people" ? "location.pathname==='/network'||location.pathname==='/login'" : `location.pathname==='/explore' && location.search==='?type=${key}'`),`one-tap ${key}`);
  }
  // Record the actual default → hover → reset frames and validate reversible SVG transitions.
  // Keep Chrome's capture-only scrollbar removal from changing viewport geometry.
  await page.send("Emulation.setScrollbarsHidden",{hidden:true});
  await page.send("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await page.send("Emulation.setTouchEmulationEnabled",{enabled:false});
  await page.send("Emulation.setEmulatedMedia",{features:[]});
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-motion]')"),"illustration motion landing");
  await delay(700);
  const motionState=key=>`(()=>{const e=document.querySelector('[data-discovery-panel=${key}]');return [...e.querySelectorAll('[data-motion]')].map(n=>{const s=getComputedStyle(n);return [s.strokeDashoffset,s.opacity,s.transform,s.stroke,s.fill]})})()`;
  for(const key of ["people","organizations","events","opportunities"]) {
    await page.evaluate(`document.activeElement?.blur();document.querySelector('[data-discovery-panel=${key}]').scrollIntoView({block:'center'})`);
    await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:10,y:20});await delay(650);
    const geometry=await page.evaluate(`(()=>{const r=document.querySelector('[data-discovery-panel=${key}]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const resting=await page.evaluate(motionState(key));
    const recording=[];
    const documentScroll=await page.evaluate("scrollY");
    const point={x:geometry.x+geometry.width/2,y:geometry.y+90};
    const started=Date.now();
    for(let frame=0;frame<48;frame++) {
      if(frame===9) await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",...point});
      if(frame===30) await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:10,y:20});
      const shot=await page.send("Page.captureScreenshot",{format:"jpeg",quality:80,captureBeyondViewport:true,clip:{...geometry,x:geometry.x-7,y:geometry.y+documentScroll-7,width:geometry.width+14,height:geometry.height+14,scale:1}});
      recording.push(shot.data);
      if(frame===18) assert.notDeepEqual(await page.evaluate(motionState(key)),resting,`Visible SVG hover activation: ${key}`);
      await delay(Math.max(0,started+(frame+1)*1000/15-Date.now()));
    }
    assert.deepEqual(await page.evaluate(motionState(key)),resting,`Clean hover reset: ${key}`);
    assert.deepEqual(await page.evaluate(`(()=>{const r=document.querySelector('[data-discovery-panel=${key}]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`),geometry,`Stable hit area: ${key}`);
    await page.evaluate(`document.querySelector('[data-discovery-panel=${key}]').focus({preventScroll:true})`);await delay(650);
    assert.notDeepEqual(await page.evaluate(motionState(key)),resting,`Equivalent focus feedback: ${key}`);
    await page.evaluate("document.activeElement.blur()");await delay(650);
    assert.deepEqual(await page.evaluate(motionState(key)),resting,`Focus reset: ${key}`);
    for(let i=0;i<6;i++) {await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",...point});await delay(45);await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:10,y:20});await delay(45);}
    await delay(650);assert.deepEqual(await page.evaluate(motionState(key)),resting,`No queued motion after rapid reversals: ${key}`);
    await page.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
    await page.evaluate(`document.querySelector('[data-discovery-panel=${key}]').focus({preventScroll:true})`);
    assert.ok(await page.evaluate(`(()=>{const e=document.querySelector('[data-discovery-panel=${key}]');return [...e.querySelectorAll('[data-motion]')].every(n=>getComputedStyle(n).transitionDuration.split(',').every(v=>parseFloat(v)===0)&&getComputedStyle(n).animationName==='none')})()`),`Static reduced motion: ${key}`);
    await page.evaluate("document.activeElement.blur()");
    await page.send("Emulation.setEmulatedMedia",{features:[]});
    console.log(`AFGHAN_HUB_MOTION_RESULT ${key} hover/focus/reset/rapid reversals/reduced motion/stable bounds passed`);
    if(process.versions.node.startsWith("24.")) for(let frame=0;frame<recording.length;frame++) emitScreenshot(`motion_${key}_${String(frame).padStart(3,'0')}.jpg`,recording[frame]);
  }

  // Matching category artwork on each actual public index/detail, not a mockup route.
  const sectionMotion = kind => `(()=>{const e=document.querySelector('[data-category-illustration=${kind}]');return [...e.querySelectorAll('[data-motion]')].map(n=>{const s=getComputedStyle(n);return [s.strokeDashoffset,s.opacity,s.transform,s.stroke,s.fill]})})()`;
  for (const width of [390,1440]) {
    await page.send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:width===390});
    await page.send("Emulation.setTouchEmulationEnabled",{enabled:false});
    for(const kind of ['organizations','events','opportunities','businesses']) {
      await page.send('Emulation.setEmulatedMedia',{features:[]});
      await page.send('Page.navigate',{url:appUrl+'/explore?type='+kind});
      await waitFor(()=>page.evaluate(`document.readyState==='complete'&&!!document.querySelector('[data-category-illustration=${kind}]')`),'animated category '+kind);
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:8,y:8});
      await delay(650);
      const resting=await page.evaluate(sectionMotion(kind));
      const bounds=await page.evaluate(`(()=>{const r=document.querySelector('[data-category-illustration=${kind}]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);
      const point={x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await delay(650);
      assert.notDeepEqual(await page.evaluate(sectionMotion(kind)),resting,`Visible page artwork response ${kind} at ${width}`);
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:bounds.x+20,y:bounds.y+20});await delay(350);
      const near=await page.evaluate(sectionMotion(kind));
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:bounds.x+bounds.width-20,y:bounds.y+bounds.height-20});await delay(350);
      assert.notDeepEqual(await page.evaluate(sectionMotion(kind)),near,`Actual pointer position changes selected illustration layers ${kind}`);
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await delay(350);

      assert.deepEqual(await page.evaluate(`(()=>{const r=document.querySelector('[data-category-illustration=${kind}]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`),bounds,'Stable category illustration bounds');
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:8,y:8});await delay(650);
      assert.deepEqual(await page.evaluate(sectionMotion(kind)),resting,`Page artwork returns to rest ${kind}`);
      await page.evaluate("document.querySelector('nav[aria-label=\"Listing categories\"] a[aria-current=page]').focus({preventScroll:true})");await delay(650);
      assert.notDeepEqual(await page.evaluate(sectionMotion(kind)),resting,`Equivalent category keyboard feedback ${kind}`);
      await page.evaluate('document.activeElement.blur()');await delay(650);
      for(let reversal=0;reversal<4;reversal++){await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await delay(25);await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:8,y:8});await delay(25);}
      await delay(650);assert.deepEqual(await page.evaluate(sectionMotion(kind)),resting,`No queued category animation ${kind}`);
      if(width===1440&&process.versions.node.startsWith('24.')) {
        const clip=await page.evaluate("(()=>{const r=document.querySelector('main > section').getBoundingClientRect();return {x:0,y:Math.max(0,r.y+scrollY),width:innerWidth,height:r.height,scale:1}})()");
        const frames=[];const times=[];const began=Date.now();
        for(let frame=0;frame<24;frame++){
          if(frame===5)await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
          if(frame===15)await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:8,y:8});
          times.push(Date.now()-began);
          const shot=await page.send('Page.captureScreenshot',{format:'jpeg',quality:75,captureBeyondViewport:true,clip});frames.push(shot.data);await delay(85);
        }
        console.log(`AFGHAN_HUB_SECTION_TIMES ${kind} ${JSON.stringify(times)}`);
        for(let frame=0;frame<frames.length;frame++)emitScreenshot(`section_${kind}_${String(frame).padStart(2,'0')}.jpg`,frames[frame]);
      }
      await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await page.evaluate("document.querySelector('nav[aria-label=\"Listing categories\"] a[aria-current=page]').focus({preventScroll:true})");
      assert.ok(await page.evaluate(`(()=>{const e=document.querySelector('[data-category-illustration=${kind}]');return [...e.querySelectorAll('[data-motion]')].every(n=>getComputedStyle(n).transitionDuration.split(',').every(v=>parseFloat(v)===0)&&getComputedStyle(n).animationName==='none')})()`),`Static reduced-motion category ${kind}`);
      // Existing listing link remains the single actionable target; its cover shares the same motion.
      await page.evaluate("document.activeElement.blur();document.querySelector('article h3 a').focus()");
      const card=await page.evaluate(`(()=>{const e=document.querySelector('article');return {href:e.querySelector('h3 a').getAttribute('href'),motions:e.querySelectorAll('[data-motion]').length,focus:e.matches(':focus-within')}})()`);
      assert.equal(card.href,`/explore/${kind}/layout-sample-${kind}-0`);assert.ok(card.motions>0&&card.focus,'Listing cover has semantic link and animated artwork');
      await page.send('Page.navigate',{url:appUrl+card.href});
      await waitFor(()=>page.evaluate(`document.readyState==='complete'&&!!document.querySelector('[data-category-illustration=${kind}]')`),'animated detail '+kind);
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:8,y:8});
      await page.send('Emulation.setEmulatedMedia',{features:[]});await delay(650);
      const detailRest=await page.evaluate(sectionMotion(kind));
      await page.evaluate("[...document.querySelectorAll('a')].find(a=>a.textContent.trim().startsWith('Join Afghan Hub')).focus({preventScroll:true})");await delay(650);
      assert.notDeepEqual(await page.evaluate(sectionMotion(kind)),detailRest,`Detail CTA keyboard feedback ${kind}`);
      assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Animated detail fits viewport');
      await page.evaluate(axeSource);const audit=await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>v.id))");assert.deepEqual(audit,[],`Animated detail accessibility ${kind}`);
      console.log(`AFGHAN_HUB_SECTION_RESULT ${kind} ${width}: index/detail hover/focus/reset/reversals/stable bounds/reduced motion/links/axe passed`);
    }
  }

  // Verify the same identity throughout public navigation, forms and catalogue details.
  for (const width of [320,390,768,1024,1440,1920]) {
    await page.send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:width<640});
    await page.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
    for (const route of ["/explore?type=organizations", "/explore/organizations/layout-sample-organizations-0", "/about", "/login", "/login?mode=join", "/forgot-password", "/support", "/privacy", "/terms"]) {
      await page.send("Page.navigate",{url:appUrl+route});
      await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('h1')"),"public consistency route "+route);
      await delay(150);
      assert.ok(await page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),`No overflow ${route} at ${width}`);
      assert.equal(await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()"),"#624291",`Consistent violet ${route}`);
      await page.evaluate(axeSource);
      const audit = await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))");
      assert.deepEqual(audit,[],`Accessibility ${route} at ${width}: ${JSON.stringify(audit)}`);
      if ([390,1440].includes(width) && ["/explore?type=organizations","/explore/organizations/layout-sample-organizations-0","/about","/login"].includes(route)) {
        const name=route.startsWith('/explore/')?'detail':route.startsWith('/explore?')?'explore':route.slice(1);
        const height=await page.evaluate("Math.ceil(document.querySelector('main').getBoundingClientRect().bottom)");
        const shot=await page.send("Page.captureScreenshot",{format:"jpeg",quality:80,captureBeyondViewport:true,clip:{x:0,y:0,width,height:route.startsWith('/explore')?height:1000,scale:1}});
        screenshots.push({name:`consistency_${name}_${width}.jpg`,data:shot.data});
      }
    }
    console.log(`AFGHAN_HUB_CONSISTENCY_RESULT ${width}: nine public/auth routes, no overflow, zero axe violations, shared violet passed`);
  }
  await page.send("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await page.send("Page.navigate",{url:appUrl+'/explore?type=organizations'});
  await waitFor(()=>page.evaluate("document.readyState==='complete'&&!!document.querySelector('input[name=q]')"),"catalogue interactions");
  assert.equal(await page.evaluate("document.querySelector('nav[aria-label=\"Listing categories\"] a[aria-current=page]').getAttribute('href')"),'/explore?type=organizations#results-heading');
  // Exercise the category controls themselves with real pointer, keyboard and first tap.
  for (const [width,touch] of [[1440,false],[390,true]]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:touch});
    await page.send('Emulation.setTouchEmulationEnabled',{enabled:touch});
    for (const kind of ['opportunities','events','businesses','organizations']) {
      await page.evaluate(`new Promise(resolve => {
        document.querySelector('nav[aria-label="Listing categories"] a[href="/explore?type=${kind}#results-heading"]').scrollIntoView({block:'center',behavior:'instant'});
        requestAnimationFrame(()=>requestAnimationFrame(resolve));
      })`);
      const point=await page.evaluate(`(()=>{const a=document.querySelector('nav[aria-label="Listing categories"] a[href="/explore?type=${kind}#results-heading"]');const r=a.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
      if(touch) {
        await page.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
        await page.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      } else {
        await page.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
        await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
      }
      await waitFor(()=>page.evaluate(`document.readyState==='complete'&&location.search==='?type=${kind}'&&document.querySelector('nav[aria-label="Listing categories"] a[aria-current=page]')?.getAttribute('href')==='/explore?type=${kind}#results-heading'&&document.querySelector('input[name=type]')?.value==='${kind}'`),'actual category navigation '+kind+' at '+width);
      await waitFor(()=>page.evaluate("(()=>{const r=document.querySelector('#results-heading').getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight&&document.activeElement.id==='results-heading'})()"),'Category navigation reveals and focuses results');
    }
  }
  await page.send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await page.evaluate("document.querySelector('nav[aria-label=\"Listing categories\"] a').focus({preventScroll:true})");
  await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await waitFor(()=>page.evaluate("location.search==='?type=opportunities'&&document.querySelector('input[name=type]')?.value==='opportunities'"),'category keyboard navigation');
  await page.send('Page.navigate',{url:appUrl+'/explore?type=organizations'});
  await waitFor(()=>page.evaluate("document.readyState==='complete'&&document.querySelector('input[name=type]')?.value==='organizations'"),'restore category search');
  await page.evaluate("document.querySelector('input[name=q]').value='no-match-verification';document.querySelector('form').requestSubmit()");
  await waitFor(()=>page.evaluate("location.search.includes('no-match-verification')&&document.body.textContent.includes('No listings match your search.')"),"search submits existing GET form");
  await page.evaluate("[...document.querySelectorAll('a')].find(a=>a.textContent.trim()==='Clear search').click()");
  await waitFor(()=>page.evaluate("!location.search.includes('q=')&&!!document.querySelector('article h3 a')"),"clear search restores listings");
  // Clear-search is a streamed navigation: wait for its loading boundary and DOM commit
  // before focusing a link, otherwise a replaced node can swallow the key event.
  await waitFor(()=>page.evaluate("!document.querySelector('main[aria-busy=true]')&&!!document.querySelector('article h3 a')"),"clear-search loading boundary settled");
  await delay(300);
  await page.evaluate("document.querySelector('article h3 a').focus()");
  await delay(50);
  assert.ok(await page.evaluate("document.activeElement===document.querySelector('article h3 a')"),"Listing link retains focus after streamed clear-search");
  await page.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await page.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await waitFor(()=>page.evaluate("location.pathname.includes('layout-sample-organizations-0')&&document.body.textContent.includes('Local browser QA fixture')"),"keyboard detail navigation");
  assert.equal(await page.evaluate("[...document.querySelectorAll('a')].find(a=>a.textContent.trim()==='Open member view').getAttribute('href')"),'/organizations/layout-sample-organizations-0');
  console.log("AFGHAN_HUB_CONSISTENCY_INTERACTION category routes/search/empty state/clear/keyboard detail/member destination passed; auth submissions and authenticated flows not exercised.");
  const navigatorRequests = [];
  let failNextNavigatorRequest = false;
  page.interceptRequest = async event => {
    const body = JSON.parse(event.request.postData);
    navigatorRequests.push(body);
    console.log("AFGHAN_HUB_NAVIGATOR_REQUEST", JSON.stringify(body));
    if (failNextNavigatorRequest) {
      failNextNavigatorRequest = false;
      await page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:503,responseHeaders:[{name:'content-type',value:'application/json'}],body:Buffer.from('{}').toString('base64')});
      return;
    }
    const prior = body.context;
    const eventSearch = /events|رویداد|غونډې/.test(body.query);
    const context = body.query.startsWith('Only ') ? {...prior,city:body.query.slice(5)} : eventSearch ? {...prior,entityType:'event',memberSignal:undefined} : {topic:'film',entityType:'profile',memberSignal:'open_to_mentoring'};
    const fixtureResult = {entityType:eventSearch?'event':'profile',entityId:'qa-fixture',title:eventSearch?'QA fixture film event':'QA fixture film mentor',subtitle:'Browser verification fixture',city:'Vancouver',country:'Canada',href:eventSearch?'/events/qa-fixture':'/members/qa-fixture',rank:1,matchedTopics:eventSearch?[]:['Film']};
    const groups=[{memberSignal:context.memberSignal??null,results:[fixtureResult]}];
    await page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'content-type',value:'application/json'}],body:Buffer.from(JSON.stringify({context,groups,results:[fixtureResult],intent:'find_people',entityType:context.entityType,mode:'read-only'})).toString('base64')});
  };
  await page.send('Fetch.enable',{patterns:[{urlPattern:'*/api/assistant/search',requestStage:'Request'}]});
  for(const width of [320,390,768,1024,1440]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await page.send('Page.navigate',{url:appUrl+'/navigator-qa'});
    await waitFor(()=>page.evaluate("document.readyState==='complete'&&!!document.querySelector('header button[aria-label=\"Community Navigator\"]')"),'member-header fixture');
    assert.ok(await page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),`Integrated member header fits ${width}`);
    const rects=await page.evaluate("[...document.querySelectorAll('header button,header input,header a')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return{label:e.getAttribute('aria-label')||e.textContent,width:r.width,left:r.left,right:r.right};})");
    assert.ok(rects.every(r=>r.left>=-1&&r.right<=width+1),`Header controls remain inside ${width}: ${JSON.stringify(rects)}`);
  }
  for (const width of [1440,390]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await page.send('Page.navigate',{url:appUrl+'/navigator-qa'});
    await waitFor(()=>page.evaluate("document.readyState==='complete'&&!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Community Navigator'))"),'navigator fixture hydration');
    await delay(300);
    const openerPoint=await page.evaluate("(()=>{const r=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Community Navigator')).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
    for(const type of ['mouseMoved','mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,...openerPoint,button:type==='mouseMoved'?'none':'left',clickCount:type==='mouseMoved'?0:1});
    await waitFor(()=>page.evaluate("document.querySelector('dialog')?.open&&document.activeElement.tagName==='INPUT'"),'native drawer initial focus');
    await page.send('Input.insertText',{text:'mentor film'});
    await waitFor(()=>page.evaluate("document.querySelector('dialog form button[type=submit]')?.disabled===false"),'navigator composer state');
    for(const type of ['keyDown','keyUp'])await page.send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await page.evaluate("document.querySelector('dialog form').requestSubmit()");
    await waitFor(()=>navigatorRequests.length>0,"navigator request emitted");
    await waitFor(()=>page.evaluate("document.querySelector('dialog').textContent.includes('QA fixture film mentor')"),'grounded result inside conversation');
    assert.ok(await page.evaluate("document.querySelector('dialog').textContent.includes('Members open to mentoring')"),'Explicit opt-in group label');
    assert.ok(await page.evaluate("document.querySelector('dialog').textContent.includes('not an endorsement')"),'Mentorship preference boundary');
    assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Drawer fits viewport');
    const shot=await page.send('Page.captureScreenshot',{format:'jpeg',quality:80});screenshots.push({name:`navigator_${width}.jpg`,data:shot.data});
    await page.evaluate("document.querySelector('dialog input').focus()");
    await page.send('Input.insertText',{text:'Only Vancouver'});
    for(const type of ['keyDown','keyUp'])await page.send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await page.evaluate("document.querySelector('dialog form').requestSubmit()");
    await waitFor(()=>page.evaluate("document.querySelectorAll('dialog article').length===2&&document.querySelectorAll('dialog article strong').length===2"),'location follow-up');
    assert.equal(navigatorRequests.at(-1).context.topic,'film','Follow-up sends prior topic');
    await page.evaluate("[...document.querySelectorAll('dialog button')].find(b=>b.textContent==='Show me events too').click()");
    await waitFor(()=>page.evaluate("document.querySelector('dialog').textContent.includes('QA fixture film event')"),'category follow-up');
    assert.equal(navigatorRequests.at(-1).context.city,'Vancouver','Category switch preserves city');
    assert.equal(navigatorRequests.at(-1).context.memberSignal,'open_to_mentoring','Server receives explicit preceding search context');
    for(let i=0;i<30;i++) {
      for(const type of ['keyDown','keyUp'])await page.send('Input.dispatchKeyEvent',{type,key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      assert.ok(await page.evaluate("document.querySelector('dialog').contains(document.activeElement)"),'Native dialog contains keyboard focus');
    }
    for(const option of ['دری','پښتو']) {
      await page.evaluate(`[...document.querySelectorAll('dialog button')].find(b=>b.textContent===${JSON.stringify(option)}).click()`);
      assert.equal(await page.evaluate("document.querySelector('dialog').dir"),'rtl');
      assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'RTL drawer fits');
    }
    await page.evaluate("[...document.querySelectorAll('dialog button')].find(b=>b.textContent==='English').click()");
    failNextNavigatorRequest = true;
    await page.evaluate("document.querySelector('dialog input').focus()");
    await page.send('Input.insertText',{text:'mentor film'});
    await waitFor(()=>page.evaluate("document.querySelector('dialog form button[type=submit]')?.disabled===false"),'retry composer state');
    for(const type of ['keyDown','keyUp'])await page.send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await page.evaluate("document.querySelector('dialog form').requestSubmit()");
    await waitFor(()=>page.evaluate("document.querySelector('dialog').textContent.includes('Search is temporarily unavailable')"),'recoverable search failure');
    const failedQuery = navigatorRequests.at(-1).query;
    await page.evaluate("[...document.querySelectorAll('dialog button')].find(b=>b.textContent==='Try again').click()");
    await waitFor(()=>page.evaluate("document.querySelectorAll('dialog article').length===5&&document.querySelectorAll('dialog article strong').length===4"),'retry renders grounded result');
    assert.equal(navigatorRequests.at(-1).query,failedQuery,'Retry resubmits the failed query');
    await page.evaluate(axeSource);
    assert.deepEqual(await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))"),[],`Navigator accessibility ${width}`);
    for(const type of ['keyDown','keyUp'])await page.send('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await waitFor(()=>page.evaluate("!document.querySelector('dialog')"),'Escape closes drawer');
    assert.ok(await page.evaluate("document.activeElement.textContent.includes('Community Navigator')"),'Closing restores launcher focus');
    console.log(`AFGHAN_HUB_NAVIGATOR_RESULT ${width}: real drawer with mocked read-only API, initial focus, conversation, contextual location/category follow-ups, focus containment, RTL, Escape restoration and axe passed; authenticated production retrieval not exercised.`);
  }
  await page.send('Fetch.disable');
  page.interceptRequest = null;
  assert.deepEqual(page.exceptions,[],"No uncaught browser exceptions");
  console.log("AFGHAN_HUB_BROWSER_INTERACTION keyboard/skip/focus, stable hover, reduced motion, text resizing/reflow all four single-tap routes, CTA mouse/keyboard activation, whole-panel artwork click and press feedback passed.");
  if(process.versions.node.startsWith("24.")) for(const screenshot of screenshots) emitScreenshot(screenshot.name,screenshot.data);
});
