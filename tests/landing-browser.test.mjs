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
  const env = { ...process.env, NAVIGATOR_MODEL_PROVIDER: "structured", NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${fixturePort}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "layout-fixture-public-key" };
  const build = launch(process.execPath, [nextCli, "build"], env);
  t.after(() => build.child.kill());
  const buildCode = await new Promise(resolve => build.child.on("exit", resolve));
  assert.equal(buildCode, 0, build.output());
  const portProbe = http.createServer();
  const appPort = await listen(portProbe);
  await new Promise(resolve => portProbe.close(resolve));
  const app = launch(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(appPort)], env);
  t.after(() => app.child.kill());
  // Next normalizes loopback request URLs to localhost; keep browser Origin identical.
  const appUrl = `http://localhost:${appPort}`;
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
  // Approved living network: meaningful destinations, stable bounds and reduced motion.
  await page.send("Emulation.setScrollbarsHidden", {hidden:true});
  for (const width of [320,390,768,1024,1280,1440]) {
    await page.send("Emulation.setDeviceMetricsOverride", {width,height:1000,deviceScaleFactor:1,mobile:false});
    await page.send("Page.navigate", {url:appUrl});
    await waitFor(() => page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-community-node]')"), `landing ${width}`);
    await page.evaluate("document.fonts.ready.then(()=>true)");
    await delay(950);
    const layout = await page.evaluate(layoutExpression);
    assert.ok(layout.scrollWidth <= width + 1, `Horizontal overflow at ${width}`);
    assert.equal(layout.targets.length, 5);
    assert.ok(layout.targets.every(target => target.clickable && target.height >= 44 && target.width >= 44));
    assert.equal(layout.covers,5,"Five real discovery modules without fabricated members");
    await page.evaluate(axeSource);
    assert.deepEqual(await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))"),[],`Homepage accessibility at ${width}`);
    await page.evaluate("scrollTo(0,0)");
    if ([390,1440].includes(width)) screenshots.push({name:`approved_homepage_${width}.jpg`,data:(await page.send("Page.captureScreenshot",{format:"jpeg",quality:80,captureBeyondViewport:true})).data});
    console.log(`AFGHAN_HUB_BROWSER_RESULT ${width}: five usable destinations, no overflow, zero axe violations`);
  }
  await page.send("Emulation.setDeviceMetricsOverride", {width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("!!document.querySelector('[data-community-node]')"),"network focus");
  await delay(950);
  const bounds = await page.evaluate("document.querySelector('[data-hero-region]').getBoundingClientRect().toJSON()");
  await page.evaluate("document.querySelector('[data-community-node=people]').focus()");
  await delay(200);
  assert.ok(await page.evaluate("document.querySelector('[data-community-node=people]').matches(':focus-visible')"));
  assert.deepEqual(await page.evaluate("document.querySelector('[data-hero-region]').getBoundingClientRect().toJSON()"),bounds);
  await page.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await waitFor(()=>page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches && document.querySelector('[data-hero-region]').getAnimations({subtree:true}).filter(a=>a.playState==='running').length===0"),"network reduced-motion resting state");
  assert.equal(await page.evaluate("document.querySelector('[data-hero-region]').getAnimations({subtree:true}).filter(a=>a.playState==='running').length"),0);
  await page.send("Emulation.setEmulatedMedia",{features:[]});
  // Public guided discovery is exercised against the isolated published-listing fixture.
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent.includes('Not sure where')).click()");
  await waitFor(()=>page.evaluate("document.querySelector('#ai-navigator h3')?.textContent.includes('What brings')"),"guided start");
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Explore events').click()");
  await waitFor(()=>page.evaluate("document.querySelector('#ai-navigator h3')?.textContent.includes('Which area')"),"guided topic");
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Skip').click()");
  await waitFor(()=>page.evaluate("document.querySelector('#ai-navigator h3')?.textContent.includes('attend events')"),"adaptive event question");
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Find my path').click()");
  await waitFor(()=>page.evaluate("document.querySelector('#ai-navigator article')?.textContent.includes('Your next steps')"),"public retrieval");
  assert.ok(await page.evaluate("!!document.querySelector('#ai-navigator article a[href^=\"/explore/events/\"]')"),"Grounded public result links");
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Restart').click()");
  await waitFor(()=>page.evaluate("document.querySelectorAll('#ai-navigator article').length===0"),"Navigator restart clears conversation");
  assert.equal(await page.evaluate("document.querySelectorAll('#ai-navigator article').length"),0);

  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent.includes('Not sure where')).click()");
  await page.evaluate("document.querySelector('#navigator-guide-input').focus()");
  await page.send("Input.insertText",{text:"Organizations in Vancouver"});
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Continue').click()");
  await waitFor(()=>page.evaluate("document.querySelector('#ai-navigator h3')?.textContent.includes('Which area') && document.querySelector('#ai-navigator').textContent.includes('2 / 2')"),"known city reduces guided questions");
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Back').click()");
  await waitFor(()=>page.evaluate("document.querySelector('#navigator-guide-input')?.value==='Organizations in Vancouver'"),"Back preserves free-text answer");
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Continue').click()");
  await page.evaluate("[...document.querySelectorAll('#ai-navigator button')].find(b=>b.textContent==='Skip').click()");
  await waitFor(()=>page.evaluate("!!document.querySelector('#ai-navigator article a[href^=\"/explore/organizations/\"]')"),"adaptive guided public result");
  assert.equal(await page.evaluate("document.querySelector('[data-discovery-engine]')?.dataset.discoveryEngine"),"structured-search");

  // Single physical taps use the hero's real destinations, including signed-out member routing.
  await page.send("Emulation.setDeviceMetricsOverride",{width:390,height:1000,deviceScaleFactor:1,mobile:true});
  await page.send("Emulation.setTouchEmulationEnabled",{enabled:true});
  for(const key of ["people","organizations","businesses","events","opportunities"]) {
    await page.send("Page.navigate",{url:appUrl});
    await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-community-node]')"),"touch landing");
    await delay(300);
    await page.evaluate(`document.querySelector('[data-community-node=${key}]').scrollIntoView({block:'center'})`);
    const position=await page.evaluate(`(()=>{const r=document.querySelector('[data-community-node=${key}]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await page.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[position]});
    await page.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await waitFor(()=>page.evaluate(key==="people" ? "location.pathname==='/network'||location.pathname==='/login'" : `location.pathname==='/explore' && location.search==='?type=${key}'`),`one-tap hero ${key}`);
  }
  await page.send("Emulation.setTouchEmulationEnabled",{enabled:false});

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
    assert.deepEqual(await page.evaluate("[...document.querySelectorAll('dialog button')].map(b=>b.textContent).filter(label=>['English','فارسی / Persian','پښتو / Pashto','دری'].includes(label))"),['English','فارسی / Persian','پښتو / Pashto'],'Navigator exposes exactly the consolidated languages');
    for(const [option, language] of [['فارسی / Persian','fa'],['پښتو / Pashto','ps']]) {
      await page.evaluate(`[...document.querySelectorAll('dialog button')].find(b=>b.textContent===${JSON.stringify(option)}).click()`);
      assert.equal(await page.evaluate("document.querySelector('dialog').lang"),language);
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
