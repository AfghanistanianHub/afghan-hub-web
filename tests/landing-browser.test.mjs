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
      assert.ok(layout.targets.every(target => target.clickable && target.height >= 44 && target.width >= 44), `Blocked/small discovery targets at ${width}`);
      assert.equal(layout.people, 9, "People illustration must retain all nine connected person glyphs");
      assert.ok(layout.covers >= 16, "Four discovery panels and twelve populated listing covers must render");
      await page.evaluate(axeSource);
      const audit = await page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})))");
      assert.deepEqual(audit, [], `Accessibility violations at ${width}: ${JSON.stringify(audit)}`);
      await page.evaluate("scrollTo(0,0)");
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
  for(let i=0;i<18;i++) {
    for(const type of ["keyDown","keyUp"]) await page.send("Input.dispatchKeyEvent",{type,key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    focused.push(await page.evaluate("({href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outlineStyle,key:document.activeElement.dataset.discoveryLink})"));
  }
  assert.equal(focused[0].href,"#main-content","Skip link must be first");
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
  await page.send("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await page.send("Emulation.setTouchEmulationEnabled",{enabled:false});
  await page.send("Emulation.setEmulatedMedia",{features:[]});
  await page.send("Page.navigate",{url:appUrl});
  await waitFor(()=>page.evaluate("document.readyState==='complete' && !!document.querySelector('[data-motion]')"),"illustration motion landing");
  const intro=await page.evaluate("(()=>{const s=getComputedStyle(document.querySelector('[data-landing-hero] svg'));return {name:s.animationName,duration:s.animationDuration,iterations:s.animationIterationCount}})()");
  assert.notEqual(intro.name,"none");assert.equal(intro.duration,"0.55s");assert.equal(intro.iterations,"1");
  await delay(700);
  assert.ok(await page.evaluate("document.querySelector('[data-landing-hero] svg').getAnimations().every(a=>a.playState==='finished')"),"Hero must settle after one intro");
  await page.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  assert.equal(await page.evaluate("getComputedStyle(document.querySelector('[data-landing-hero] svg')).animationName"),"none");
  await page.send("Emulation.setEmulatedMedia",{features:[]});
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

  assert.deepEqual(page.exceptions,[],"No uncaught browser exceptions");
  console.log("AFGHAN_HUB_BROWSER_INTERACTION keyboard/skip/focus, stable hover, reduced motion, text resizing/reflow all four single-tap routes, CTA mouse/keyboard activation, whole-panel artwork click and press feedback passed.");
  if(process.versions.node.startsWith("24.")) for(const screenshot of screenshots) emitScreenshot(screenshot.name,screenshot.data);
});
