import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { basename, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';
import { createClient } from '@supabase/supabase-js';
import { requireLocalTarget } from './local-target.mjs';
import { DevTools } from './browser-cdp.mjs';

// No hosted target, credential file, injected session or mock API is accepted.
const dir = resolve(process.env.LOCAL_QA_DIR ?? '');
assert.ok(basename(dir).startsWith('afghan-local-journey-'));
assert.match(readFileSync(join(dir, 'supabase/config.toml'), 'utf8'), /project_id = "afghan-hub-local-journey"/);
const status = JSON.parse(execFileSync('supabase', ['status', '-o', 'json'], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
const apiUrl = requireLocalTarget(status.API_URL);
assert.ok(status.ANON_KEY && status.SERVICE_ROLE_KEY);
const appUrl = requireLocalTarget('http://localhost:3100', 3100);
const mailUrl = requireLocalTarget('http://127.0.0.1:55324', 55324);
const admin = createClient(apiUrl, status.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const chromePath = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
assert.ok(chromePath, 'Sandboxed Chrome must be installed');
const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sourceTree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim();
assert.equal(execFileSync('git', ['status', '--porcelain', '--untracked-files=no', '--', 'src', 'tests', 'scripts', 'supabase', '.github', 'public', 'package.json', 'package-lock.json'], {encoding:'utf8'}).trim(), '', 'Acceptance requires a clean tracked source tree');
const reviewImages = [];
const users = [], pages = [], children = [], results = [], listings = [];
const reconnectEvidence = [];
// A real receiver-only network boundary avoids Chrome's localhost exemptions.
const receiverNetwork = { offline:false, sockets:new Set(), responses:new Set(), held:[], forwarded:0 };
function proxyTarget(value) {
  const target=new URL(value);
  assert.ok(['localhost','127.0.0.1'].includes(target.hostname));
  assert.ok(['3100','55321'].includes(target.port));
  assert.ok(['http:','ws:'].includes(target.protocol));
  assert.equal(target.username,''); assert.equal(target.password,'');
  return target;
}
const receiverProxy=http.createServer((request,response)=> {
  const forward=()=> {
    let target;try { target=proxyTarget(request.url); } catch { response.writeHead(403);response.end();return; }
    receiverNetwork.forwarded++;
    const upstream=http.request({hostname:target.hostname,port:target.port,path:target.pathname+target.search,method:request.method,headers:request.headers}, result=> { receiverNetwork.responses.add(result);result.on('end',()=>receiverNetwork.responses.delete(result));response.writeHead(result.statusCode,result.headers);result.pipe(response);if(receiverNetwork.offline)result.pause(); });
    upstream.on('error',()=>{if(!response.headersSent)response.writeHead(502);response.end();});
    request.pipe(upstream);
  };
  if(receiverNetwork.offline)receiverNetwork.held.push(forward);else forward();
});
receiverProxy.on('connect',(request,socket,head)=> {
  if(receiverNetwork.offline){socket.destroy();return;}
  let target;try { target=proxyTarget(`http://${request.url}`); } catch { socket.destroy();return; }
  const transport=net.connect(Number(target.port),target.hostname,()=> {
    receiverNetwork.sockets.add(socket);
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if(head.length)transport.write(head);socket.pipe(transport);transport.pipe(socket);
  });
  socket.on('close',()=>{receiverNetwork.sockets.delete(socket);transport.destroy();});
  transport.on('close',()=>socket.destroy());transport.on('error',()=>socket.destroy());socket.on('error',()=>transport.destroy());
});
receiverProxy.on('upgrade',(request,socket,head)=> {
  if(receiverNetwork.offline){socket.destroy();return;}
  let target;try { target=proxyTarget(request.url); } catch { socket.destroy();return; }
  const upstream=http.request({hostname:target.hostname,port:target.port,path:target.pathname+target.search,headers:request.headers});
  upstream.on('upgrade',(response,transport,upstreamHead)=> {
    receiverNetwork.sockets.add(socket);
    socket.on('close',()=>{receiverNetwork.sockets.delete(socket);transport.destroy();});
    transport.on('close',()=>socket.destroy());
    socket.write(`HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\n`+Object.entries(response.headers).map(([key,value])=>`${key}: ${value}`).join('\r\n')+'\r\n\r\n');
    if(upstreamHead.length)socket.write(upstreamHead);if(head.length)transport.write(head);
    socket.pipe(transport);transport.pipe(socket);
  });
  upstream.on('error',()=>socket.destroy());upstream.end();
});
await new Promise(resolve=>receiverProxy.listen(0,'127.0.0.1',resolve));
const receiverProxyPort=receiverProxy.address().port;
const password = `QA-${randomUUID()}-aA1!`;
const stamp = randomUUID().slice(0, 8);
let browser, profile, fixtureB, conversationId, confirmationLink, step = 'prerequisites', scenario = 'prerequisites', expectedListingPath;
async function data(promise) {
  const result = await promise;
  if (result.error) throw new Error('Local fixture request failed; details withheld');
  return result.data;
}
async function until(fn, label, timeout = 20000) {
  step = label;
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { const value = await fn(); if (value) return value; } catch { /* navigation/readiness */ }
    await delay(100);
  }
  throw new Error(`Timed out: ${label}`);
}
async function check(name, fn) {
  scenario = name;
  step = name;
  await fn();
  results.push({ scenario: name, status: 'pass' });
  console.log(`PASS ${name}`);
}
async function captureState(page, label) {
  if(process.env.LOCAL_QA_VISUAL!=='1') return;
  const visualDir=process.env.LOCAL_QA_VISUAL_DIR ?? 'reports/visual'; mkdirSync(visualDir,{recursive:true});
  for(const width of [1440,768,390,320]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});
    await page.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
    const screenshot=await page.send('Page.captureScreenshot',{format:'png'});
    writeFileSync(`${visualDir}/${label}-${width}.png`,Buffer.from(screenshot.data,'base64'));
    if (process.env.LOCAL_QA_DESIGN_REVIEW==='1' || (width===390 && ['navigator-member-fa-results','navigator-member-ps-results','opportunities-filtered-results','opportunities-empty','businesses-outage'].includes(label)) || (width===1440 && ['submissions-owner-note','businesses-recovered'].includes(label))) {
      const jpg=await page.send('Page.captureScreenshot',{format:'jpeg',quality:65});
      const file=`${visualDir}/${label}-after-${width}.jpg`;writeFileSync(file,Buffer.from(jpg.data,'base64'));if(process.env.LOCAL_QA_DESIGN_REVIEW!=='1') reviewImages.push({label,width,file});
  for(const width of [1440,390]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});
    await page.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
    const screenshot=await page.send('Page.captureScreenshot',{format:'png'});
    writeFileSync(`${visualDir}/${label}-${width}.png`,Buffer.from(screenshot.data,'base64'));
    if ((width===390 && ['navigator-member-fa-results','navigator-member-ps-results','opportunities-filtered-results','opportunities-empty','businesses-outage'].includes(label)) || (width===1440 && ['submissions-owner-note','businesses-recovered'].includes(label))) {
      const jpg=await page.send('Page.captureScreenshot',{format:'jpeg',quality:65});
      const file=`${visualDir}/${label}-${width}.jpg`;writeFileSync(file,Buffer.from(jpg.data,'base64'));reviewImages.push({label,width,file});
    }
  }
  await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
}
function launch(command, args, env) {
  const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
  // Do not retain or publish logs containing cookie/session/provider payloads.
  child.stdout.resume(); child.stderr.resume();
  children.push(child);
  return child;
}
async function page(existingContext, proxied = false) {
  const { browserContextId } = existingContext ? { browserContextId:existingContext } : await browser.send('Target.createBrowserContext',proxied ? {proxyServer:`http://127.0.0.1:${receiverProxyPort}`,proxyBypassList:'<-loopback>'} : {});
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank', browserContextId });
  const connection = new DevTools();
  await connection.connect(`ws://127.0.0.1:${browser.port}/devtools/page/${targetId}`);
  connection.browserContextId = browserContextId;
  connection.targetId = targetId;
  connection.loadedDocuments = new Set();
  connection.activeSockets = new Set();
  connection.activeRefreshes = new Set();
  connection.lastRefreshActivity = Date.now();
  connection.telemetry = { sockets: 0, closes: 0, frames: 0, socketErrors: 0, systems: [], replies: [], changes: 0, authenticatedJoins: 0, anonymousJoins: 0, refreshRequests: 0 };
  connection.socket.addEventListener('message', event => {
    const packet = JSON.parse(event.data);
    if (packet.method === 'Page.lifecycleEvent' && packet.params.name === 'load') connection.loadedDocuments.add(packet.params.loaderId);
    if (packet.method === 'Network.webSocketCreated') { connection.telemetry.sockets++; connection.activeSockets.add(packet.params.requestId); }
    if (packet.method === 'Network.webSocketClosed') { connection.telemetry.closes++; connection.activeSockets.delete(packet.params.requestId); }
    if (packet.method === 'Network.requestWillBeSent' && packet.params.request.url.startsWith(appUrl) && (packet.params.request.url.includes('_rsc=') || packet.params.request.method === 'POST')) { connection.telemetry.refreshRequests++; connection.activeRefreshes.add(packet.params.requestId); connection.lastRefreshActivity=Date.now(); }
    if (['Network.loadingFinished','Network.loadingFailed'].includes(packet.method) && connection.activeRefreshes.delete(packet.params.requestId)) connection.lastRefreshActivity=Date.now();
    if (packet.method === 'Network.webSocketFrameReceived' || packet.method === 'Network.webSocketFrameSent') {
      try {
        const decoded = JSON.parse(packet.params.response.payloadData);
        const frame = Array.isArray(decoded) ? {topic:decoded[2],event:decoded[3],payload:decoded[4]} : decoded;
        if (packet.method === 'Network.webSocketFrameReceived') {
          connection.telemetry.frames++;
          if(frame.event === 'system') connection.telemetry.systems.push({at:Date.now(),stream:frame.topic?.startsWith('realtime:messages:') ? 'messages' : 'other',extension:frame.payload.extension,status:frame.payload.status,permissionError:/permission|unauthoriz/i.test(frame.payload.message ?? ''),databaseError:/database|connect/i.test(frame.payload.message ?? '')});
          if(frame.event === 'phx_reply') connection.telemetry.replies.push(frame.payload.status);
          if(frame.event === 'postgres_changes') connection.telemetry.changes++;
        } else if (frame.event === 'phx_join') {
          const token = frame.payload.access_token;
          let role = '';
          try { role = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).role; } catch { /* Token is never retained */ }
          if(role === 'authenticated') connection.telemetry.authenticatedJoins++; else connection.telemetry.anonymousJoins++;
        }
      } catch { /* Ignore non-JSON frames; never log raw transport data */ }
    }
    if (packet.method === 'Network.webSocketFrameError') connection.telemetry.socketErrors++;
  });
  pages.push(connection);
  await connection.send('Page.enable');
  await connection.send('Page.setLifecycleEventsEnabled', { enabled: true });
  await connection.send('Runtime.enable');
  await connection.send('Network.enable');
  // Hold native socket references only in the synthetic browser. Closing the
  // transport exercises the real SDK reconnect path; no subscription is mocked.
  await connection.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    const NativeSocket = window.WebSocket;
    const sockets = new Set();
    let closes = 0;
    window.WebSocket = class extends NativeSocket {
      constructor(...args) { super(...args); sockets.add(this); this.addEventListener('close', () => { closes++; sockets.delete(this); }); }
    };
    window.__qaTransport = {
      disconnect() { for (const socket of sockets) socket.close(4001, 'Synthetic transport interruption'); },
      state() { return { online: navigator.onLine, closes, open: [...sockets].filter(socket => socket.readyState === NativeSocket.OPEN).length, connecting: [...sockets].filter(socket => socket.readyState === NativeSocket.CONNECTING).length }; }
    };
  })()` });
  await connection.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  return connection;
}
async function visit(page, path) {
  assert.ok(path.startsWith('/') && !path.startsWith('//'));
  const navigation = await page.send('Page.navigate', { url: appUrl + path });
  assert.ok(!navigation.errorText, `Native navigation failed: ${navigation.errorText}`);
  try {
    if (navigation.loaderId) await until(() => page.loadedDocuments.has(navigation.loaderId), 'requested document loaded');
    await until(() => page.evaluate(`location.origin===${JSON.stringify(appUrl)} && document.readyState==='complete'`), 'local page');
  } catch (error) {
    error.navigationState = await page.evaluate(`({requestedPath:${JSON.stringify(path.split('?')[0])},origin:location.origin,path:location.pathname,ready:document.readyState,visible:document.visibilityState,focused:document.hasFocus()})`).catch(()=>({unavailable:true}));
    throw error;
  }
}
async function pathname(page, path) {
  await until(() => page.evaluate(`location.pathname===${JSON.stringify(path)}`), `expected route ${path}`);
async function visit(page, path, timeout = 20000) {
  assert.ok(path.startsWith('/') && !path.startsWith('//'));
  const deadline = Date.now() + timeout;
  const navigation = await page.send('Page.navigate', { url: appUrl + path });
  assert.ok(!navigation.errorText, 'Native document navigation must not report a transport error');
  if (navigation.loaderId) await until(() => page.loadedDocuments.has(navigation.loaderId), 'requested document loaded', Math.max(1, deadline - Date.now()));
  await until(() => page.evaluate(`location.origin===${JSON.stringify(appUrl)} && document.readyState==='complete'`), 'local page', Math.max(1, deadline - Date.now()));
}
async function pathname(page, path) {
  await until(() => page.evaluate(`location.pathname===${JSON.stringify(path)}`), 'expected route');
}
async function fill(page, selector, value) {
  const fieldSelector = (selector.startsWith('form') || selector.startsWith('dialog')) ? selector : `form ${selector}`;
  await until(() => page.evaluate(`!!document.querySelector(${JSON.stringify(fieldSelector)})`), 'form field');
  await page.evaluate(`(() => { const field=document.querySelector(${JSON.stringify(fieldSelector)}); field.focus(); Object.getOwnPropertyDescriptor(field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,'value').set.call(field,${JSON.stringify(value)}); field.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
}
async function typeNavigatorQuery(page, value) {
  const fieldSelector='dialog[open] input';
  await until(()=>page.evaluate(`!!document.querySelector(${JSON.stringify(fieldSelector)})`),'Navigator input');
  await page.evaluate(`document.querySelector(${JSON.stringify(fieldSelector)}).focus()`);
  const modifiers = await page.evaluate(`/Mac/.test(navigator.platform) ? 4 : 2`);
  await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers});
  await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers});
  await page.send('Input.insertText',{text:value});
  await until(()=>page.evaluate(`document.querySelector(${JSON.stringify(fieldSelector)})?.value===${JSON.stringify(value)}`),'native input value');
}
async function actionable(page, selector) {
  // Prefer an element that is laid out, visible and not covered, so a real mouse
  // click at the returned point reaches it. Fall back to any laid-out match.
  return page.evaluate(`(() => {
    let fallback = null;
    for (const target of document.querySelectorAll(${JSON.stringify(selector)})) {
      if (target.disabled || target.getAttribute('aria-hidden')==='true') continue;
      target.scrollIntoView({block:'center'});
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const style = getComputedStyle(target);
      if (style.display==='none' || style.visibility==='hidden' || style.pointerEvents==='none') continue;
      const point = {x:rect.x+rect.width/2, y:rect.y+rect.height/2};
      if (!fallback) fallback = point;
      const hit = document.elementFromPoint(point.x, point.y);
      if (hit && (hit===target || target.contains(hit) || hit.contains(target))) return point;
    }
    return fallback;
  })()`);
}
async function click(page, selector) {
  await page.send('Page.bringToFront');
  const point = await until(() => actionable(page, selector), 'clickable control');
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function openMemberNavigator(page) {
  // The launcher renders in a hydrated header; a click dispatched before it is
  // laid out can be swallowed. Retry until the dialog actually opens.
  const launcher = 'button[aria-haspopup="dialog"][aria-expanded="false"]:has(svg.lucide-compass)';
  await until(() => page.evaluate(`!!document.querySelector(${JSON.stringify(launcher)})`), 'member Navigator launcher');
  for (let attempt = 0; attempt < 3; attempt++) {
    await click(page, launcher);
    const opened = await until(() => page.evaluate(`!!document.querySelector('dialog[open]')`), 'member Navigator dialog', 5000).then(() => true, () => false);
    if (opened) return;
  }
  throw new Error('Member Navigator launcher did not open the dialog');
}
async function select(page, selector, value) {
  await until(() => page.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), 'select field');
  await page.evaluate(`(() => { const field=document.querySelector(${JSON.stringify(selector)}); field.value=${JSON.stringify(value)}; field.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
}
async function eventStart(page) {
  await click(page, 'button[aria-label^="Select start date & time:"]');
  await captureState(page, 'event-calendar-dialog');
  await click(page, '[role=dialog] .rdp-day:not([data-disabled=true]) .rdp-day_button:not([disabled])');
  await select(page, '#starts_at-hour', '11');
  await select(page, '#starts_at-minute', '30');
  await select(page, '#starts_at-period', 'PM');
  await click(page, '[role=dialog] > div:last-child > button:last-child');
  await until(() => page.evaluate(`!!document.querySelector('[name=starts_at]')?.value`), 'selected event start');
}
async function listingRow(table, titleField, title) {
  return until(async () => {
    const rows = await data(admin.from(table).select('*').eq(titleField, title));
    return rows[0];
  }, 'listing persisted');
}
async function login(page, email, secret = password) {
  await visit(page, '/login');
  await fill(page, '[name=email]', email);
  await fill(page, '[name=password]', secret);
  await click(page, '#join button[type=submit]');
}
async function onboard(page, name) {
  await pathname(page, '/profile');
  await captureState(page, 'onboarding');
  await fill(page, '[name=first_name]', 'Synthetic');
  await fill(page, '[name=last_name]', name);
  await fill(page, '[name=city]', 'Vancouver');
  await click(page, 'form:has([name=first_name]) button[type=submit]');
  await until(()=>page.evaluate(`location.pathname==='/dashboard' && document.readyState==='complete' && !!document.querySelector('button[aria-haspopup="dialog"]')`),'onboarding dashboard and Navigator ready');
}
async function deliveredConfirmation(email, type = 'signup', excludedIds = []) {
  const summary = await until(async () => {
    const response = await fetch(`${mailUrl}/api/v1/messages`, {redirect:'error'});
    assert.ok(response.ok);
    const inbox = await response.json();
    return inbox.messages.find(message => !excludedIds.includes(message.ID) && message.To?.some(to => to.Address === email) && (type==='signup' ? !/reset/i.test(message.Subject) : /reset/i.test(message.Subject)));
  }, 'local confirmation email delivered');
  const response = await fetch(`${mailUrl}/api/v1/message/${encodeURIComponent(summary.ID)}`, {redirect:'error'});
  assert.ok(response.ok);
  const message = await response.json();
  assert.ok(message.To.some(to => to.Address === email));
  const links = [...message.HTML.matchAll(/href=["']([^"']+)["']/g)].map(match => match[1].replaceAll('&amp;', '&'));
  const link = links.map(value => new URL(value)).find(url => url.origin === appUrl && url.pathname === '/auth/confirm');
  assert.ok(link, 'Email must contain the loopback application confirmation URL');
  assert.equal(link.searchParams.get('type'), type==='signup' ? 'signup' : 'recovery');
  assert.match(link.searchParams.get('token_hash'), /^[A-Za-z0-9_-]+$/);
  assert.equal(link.searchParams.has('redirect_to'), false);
  assert.equal(link.searchParams.has('next'), false);
  return link.href;
}
async function member(label) {
  const email = `browser-${stamp}-${label}@example.invalid`;
  const { user } = await data(admin.auth.admin.createUser({ email, password, email_confirm: true }));
  users.push(user.id);
  return { id: user.id, email };
}
const message = text => `Synthetic browser ${stamp} ${text}`;
async function send(page, text) {
  await fill(page, 'textarea[name=message]', text);
  await click(page, 'button[aria-label="Send message"]');
  await until(() => page.evaluate(`document.body.innerText.includes(${JSON.stringify(text)}) && document.querySelector('textarea[name=message]')?.value===''`), 'message persisted');
}
try {
  const env = { ...process.env, NEXT_PUBLIC_SITE_URL: appUrl, NEXT_PUBLIC_SUPABASE_URL: apiUrl, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY, NAVIGATOR_MODEL_PROVIDER: 'structured', NAVIGATOR_MODEL_ENABLED: 'false', NEXT_TELEMETRY_DISABLED: '1' };
  const nextCli = resolve('node_modules/next/dist/bin/next');
  const build = launch(process.execPath, [nextCli, 'build'], env);
  const code = await new Promise((resolve, reject) => { build.once('exit', resolve); build.once('error', reject); });
  assert.equal(code, 0, 'Local production build failed; logs withheld');
  launch(process.execPath, [nextCli, 'start', '--hostname', '127.0.0.1', '--port', '3100'], env);
  await until(async () => (await fetch(appUrl)).ok, 'local production server');
  const compareUrl = requireLocalTarget('http://localhost:3102', 3102);
  if (process.env.LOCAL_QA_COMPARE_DIR) {
    const compareDir = resolve(process.env.LOCAL_QA_COMPARE_DIR);
    assert.equal(execFileSync('git',['-C',compareDir,'rev-parse','HEAD'],{encoding:'utf8'}).trim(), 'dad64a27c09aebb32651149b5e33f8bf2534703f', 'Visual baseline must be pinned');
    const baselineBuild=launch(process.execPath,[nextCli,'build',compareDir],env);
    assert.equal(await new Promise((resolve,reject)=>{baselineBuild.once('exit',resolve);baselineBuild.once('error',reject);}),0,'Baseline production build failed');
    assert.ok(existsSync(join(compareDir, '.next/BUILD_ID')), 'Comparison requires a prebuilt baseline checkout');
    launch(process.execPath, [nextCli, 'start', compareDir, '--hostname', '127.0.0.1', '--port', '3102'], env);
    await until(async () => (await fetch(compareUrl)).ok, 'baseline comparison server');
  }
  profile = await fs.mkdtemp(join(tmpdir(), 'afghan-member-browser-'));
  const chrome = launch(chromePath, ['--headless=new', '--enable-automation', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], process.env);
  const portFile = await until(async () => chrome.exitCode === null && await fs.readFile(join(profile, 'DevToolsActivePort'), 'utf8'), 'sandboxed Chrome');
  browser = new DevTools(); browser.port = portFile.split('\n')[0];
  await browser.connect(`ws://127.0.0.1:${browser.port}${portFile.split('\n')[1]}`);
  const a = {email:`browser-${stamp}-signup@example.invalid`}, b = await member('b');
  fixtureB = b.id;
  const pageA = await page(), pageB = await page(undefined,true);
  await check('Chrome renderer sandbox enabled', async () => {
    if (process.platform === 'darwin') {
      const { processInfo } = await browser.send('SystemInfo.getProcessInfo');
      const renderers = processInfo.filter(process => process.type === 'renderer');
      assert.ok(renderers.length);
      for (const renderer of renderers) {
        const command = execFileSync('ps', ['-p', String(renderer.id), '-o', 'command='], { encoding: 'utf8' });
        assert.ok(command.includes('--seatbelt-client='));
        assert.ok(!command.includes('--no-sandbox'));
      }
    } else {
      await pageA.send('Page.navigate', { url: 'chrome://sandbox' });
      await until(() => pageA.evaluate(`/Seccomp-BPF sandbox\\s+Yes/.test(document.body?.innerText ?? '')`), 'renderer sandbox');
    }
  });
  await check('Navigator exposes three languages and migrates legacy Persian preference with RTL', async () => {
    await visit(pageA, '/');
    await pageA.evaluate(`localStorage.removeItem('afghan-hub-site-language'); localStorage.setItem('afghan-hub-navigator-language','fa-AF')`);
    await visit(pageA, '/');
    await until(() => pageA.evaluate(`document.querySelector('#ai-navigator select')?.value==='fa' && document.querySelector('#ai-navigator')?.getAttribute('dir')==='rtl'`), 'legacy preference hydrated');
    assert.deepEqual(await pageA.evaluate(`[...document.querySelectorAll('#ai-navigator select option')].map(node=>node.value)`), ['en','fa','ps']);
    assert.equal(await pageA.evaluate(`localStorage.getItem('afghan-hub-navigator-language')`), 'fa-AF'); // Legacy storage is read-only; the shared preference reader normalizes its value.
    await pageA.evaluate(`localStorage.setItem('afghan-hub-navigator-language','fa-AF')`);
    await visit(pageA, '/');
    await until(() => pageA.evaluate(`document.querySelector('#ai-navigator select')?.value==='fa' && document.querySelector('#ai-navigator')?.getAttribute('dir')==='rtl'`), 'legacy preference hydrated');
    assert.deepEqual(await pageA.evaluate(`[...document.querySelectorAll('#ai-navigator select option')].map(node=>node.value)`), ['en','fa','ps']);
    assert.equal(await pageA.evaluate(`localStorage.getItem('afghan-hub-navigator-language')`), 'fa');
    await select(pageA, '#ai-navigator select', 'ps');
    await until(() => pageA.evaluate(`document.querySelector('#ai-navigator')?.getAttribute('lang')==='ps' && document.querySelector('#ai-navigator')?.getAttribute('dir')==='rtl'`), 'Pashto RTL');
    await select(pageA, '#ai-navigator select', 'en');
  });
  await check('Served callback redirects use configured origin despite upstream Host', async () => {
    const upstream = requireLocalTarget('http://127.0.0.1:3100', 3100);
    for (const flow of ['signup', 'recovery']) {
      const response = await fetch(`${upstream}/auth/callback?flow=${flow}&next=https%3A%2F%2Fexample.invalid`, {redirect:'manual', headers:{host:'upstream.internal:3100'}});
      assert.equal(response.status, 307);
      const destination = new URL(response.headers.get('location'));
      assert.equal(destination.origin, appUrl);
      assert.equal(destination.pathname, flow === 'signup' ? '/login' : '/forgot-password');
      assert.equal(destination.searchParams.has('next'), false);
    }
  });
  await check('Anonymous protected route redirects to sign-in', async () => {
    await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
  });
  await check('Wrong password shows accessible error and preserves auth boundary', async () => {
    await login(pageA, a.email, 'Incorrect-synthetic-password-1!');
    await until(() => pageA.evaluate(`location.pathname==='/login' && !!document.querySelector('[role=alert]')`), 'login error');
  });
  await check('Missing/invalid signup callbacks show accessible errors and reject external destinations', async () => {
    for (const query of ['flow=signup&next=https%3A%2F%2Fexample.invalid', 'flow=signup&code=synthetic-invalid-code&next=%2F%2Fexample.invalid']) {
      await visit(pageA, `/auth/callback?${query}`); await pathname(pageA, '/login');
      await until(() => pageA.evaluate(`location.origin===${JSON.stringify(appUrl)} && !!document.querySelector('[role=alert]') && document.body.innerText.includes('confirmation link is invalid or has expired')`), 'invalid confirmation feedback');
      await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
    }
  });
  await check('Real signup and delivered one-time email establish the browser session', async () => {
  await check('Real signup, local email delivery and PKCE callback establish the browser session', async () => {
    await visit(pageA, '/login?mode=join');
    await fill(pageA, '[name=email]', a.email); await fill(pageA, '[name=password]', password);
    await click(pageA, '#join button[type=submit]');
    await until(() => pageA.evaluate(`location.pathname==='/login' && document.body.innerText.includes('Account created.')`), 'signup confirmation notice');
    const {users:registered} = await data(admin.auth.admin.listUsers());
    const user = registered.find(user => user.email === a.email);
    assert.ok(user); a.id = user.id; users.push(user.id); assert.ok(!user.email_confirmed_at);
    await login(pageA, a.email);
    await until(() => pageA.evaluate(`location.pathname==='/login' && !!document.querySelector('[role=alert]')`), 'unconfirmed sign-in refused');
    confirmationLink = await deliveredConfirmation(a.email);
    await pageA.send('Page.navigate', {url:confirmationLink}); await pathname(pageA, '/profile');
    const confirmed = await data(admin.auth.admin.getUserById(a.id)); assert.ok(confirmed.user.email_confirmed_at);
  });
  await check('Real sign-in and onboarding forms persist both synthetic profiles', async () => {
    for (const [page, user, label] of [[pageA, a, 'MemberA'], [pageB, b, 'MemberB']]) {
      if (user !== a) await login(page, user.email);
      await onboard(page, label);
      const row = await data(admin.from('profiles').select('onboarding_completed,first_name,last_name').eq('id', user.id).single());
      assert.equal(row.onboarding_completed, true); assert.equal(row.last_name, label);
    }
  });
  await visit(pageB,'/submissions');
  await until(()=>pageB.evaluate(`location.pathname==='/submissions' && document.querySelector('main')?.innerText.includes('No submissions yet')`),'empty owner submissions rendered');
  assert.ok(await pageB.evaluate(`document.querySelector('main')?.innerText.includes('No submissions yet')`),'Empty owner submissions must have truthful counts');
  await captureState(pageB,'submissions-empty');
  await check('Empty owner submissions finish rendering with truthful zero counts', async () => {
    await visit(pageB,'/submissions');
    await pathname(pageB,'/submissions');
    await until(() => pageB.evaluate(`document.querySelector('main h2')?.textContent==='No submissions yet'`), 'empty submissions streamed content');
    assert.equal(await pageB.evaluate(`document.querySelectorAll('main article').length`), 0);
    assert.equal(await pageB.evaluate(`!!document.querySelector('main [role=alert]')`), false);
    assert.deepEqual(await pageB.evaluate(`[...document.querySelectorAll('nav[aria-label="Submission categories"] span')].map(node=>node.textContent)`), ['0','0','0','0','0']);
    await captureState(pageB,'submissions-empty');
  });
  await check('Member Navigator exposes the same three languages and RTL without changing profile languages', async () => {
    await openMemberNavigator(pageA);
    await until(() => pageA.evaluate(`document.querySelectorAll('dialog[open] button[aria-pressed]').length===3`), 'member language choices');
    await click(pageA, 'dialog[open] button[aria-pressed]:nth-child(2)');
    await until(() => pageA.evaluate(`document.querySelector('dialog[open]')?.getAttribute('lang')==='fa' && document.querySelector('dialog[open]')?.getAttribute('dir')==='rtl'`), 'member Persian RTL');
    await click(pageA, 'dialog[open] button[aria-pressed]:first-child');
    await click(pageA, 'dialog[open] button[aria-label="Close Community Navigator"]');
  });
  await check('Visible Navigator results and persisted language use real keyboard input', async () => {
    await data(admin.from('profiles').update({profession:'Artist',is_public:true}).eq('id',b.id));
    await visit(pageA,'/network');
    await openMemberNavigator(pageA);
    for(const [index,query,language] of [[1,'I’m an artist looking for collaborators.','en'],[2,'من هنرمند هستم و دنبال همکار می‌گردم','fa'],[3,'زه هنرمند یم او همکار ملګري غواړم','ps']]) {
      await click(pageA,`dialog[open] button[aria-pressed]:nth-child(${index})`);
      await until(()=>pageA.evaluate(`document.querySelector('dialog[open]')?.getAttribute('lang')===${JSON.stringify(language)}`),'member Navigator selected language');
      await typeNavigatorQuery(pageA,query);
      await until(()=>pageA.evaluate(`document.querySelector('dialog[open] input')?.value===${JSON.stringify(query)} && document.querySelector('dialog[open] form button[type=submit]')?.disabled===false`),'controlled Navigator input ready');
      await click(pageA,'dialog[open] form button[type=submit]');
      await until(()=>pageA.evaluate(`(() => {const turn=[...document.querySelectorAll('dialog[open] article')].at(-1);return turn?.innerText.includes(${JSON.stringify(query)}) && !!turn.querySelector('a[href="/members/${b.id}"]') && turn.getAttribute('aria-busy')==='false';})()`),'grounded current artist result in Navigator UI');
      assert.equal(await pageA.evaluate(`document.querySelector('dialog[open] input')?.value`),'','Successful search clears the composer');
      assert.equal(await pageA.evaluate(`document.querySelector('dialog[open] form button[type=submit]')?.disabled`),true,'Empty composer must remain disabled');
      if(language!=='en') assert.equal(await pageA.evaluate(`document.querySelector('dialog[open]')?.getAttribute('dir')`),'rtl');
      await captureState(pageA,`navigator-member-${language}-results`);
    }
    await click(pageA,'dialog[open] button[aria-label="لارښود بند کړئ"]');
    await visit(pageA,'/network');
    await openMemberNavigator(pageA);
    assert.equal(await pageA.evaluate(`document.querySelector('dialog[open]')?.getAttribute('lang')`),'ps','Member language preference must survive reload');
    assert.equal(await pageA.evaluate(`localStorage.getItem('afghan-hub-navigator-language')`),'ps');
    await click(pageA,'dialog[open] button[aria-pressed]:first-child');
    await click(pageA,'dialog[open] button[aria-label="Close Community Navigator"]');
  });
  await check('Cookie sessions survive reload and remain separate', async () => {
    for (const [page, label] of [[pageA, 'MemberA'], [pageB, 'MemberB']]) {
      await visit(page, '/profile'); await page.send('Page.reload');
      await until(() => page.evaluate(`location.pathname==='/profile' && document.readyState==='complete' && document.querySelector('[name=last_name]')?.value===${JSON.stringify(label)}`), 'persisted own-profile identity');
      await visit(page, '/dashboard'); await pathname(page, '/dashboard');
    }
  });
  await check('Unpopulated member directories expose truthful empty states', async () => {
    for(const area of ['businesses','organizations','opportunities','events']) {
      await visit(pageA,`/${area}`);
      assert.ok(await pageA.evaluate(`document.querySelector('main')?.innerText.includes('No ${area} yet')`),`Empty ${area} must be explicit`);
      assert.equal(await pageA.evaluate(`!!document.querySelector('main [role=alert]')`),false);
      await captureState(pageA,`${area}-empty`);
    }
  });
  await check('Two-account connection request and acceptance through real forms', async () => {
    await visit(pageA, `/members/${b.id}`); await click(pageA, 'form:has([name=recipient_id]) button[type=submit]');
    await until(() => pageA.evaluate(`document.body.innerText.includes('Request sent')`), 'pending connection');
    await visit(pageB, '/network'); await click(pageB, 'button[name=decision][value=accepted]');
    await until(() => pageB.evaluate(`document.body.innerText.includes('My connections')`), 'accepted connection');
    await visit(pageA, `/members/${b.id}`); await click(pageA, 'form:has([name=member_id]) button[type=submit]');
    await until(() => pageA.evaluate(`!!document.querySelector('textarea[name=message]')`), 'conversation composer');
  });
  const conversationPath = await pageA.evaluate('location.pathname');
  assert.match(conversationPath, /^\/messages\/[0-9a-f-]{36}$/); conversationId = conversationPath.split('/').at(-1);
  await check('Realtime unread notification and notification navigation', async () => {
    await visit(pageB, '/dashboard');
    const before = await pageB.evaluate(`Number(document.querySelector('button[aria-controls][aria-haspopup=dialog][aria-label^="Notifications"]')?.getAttribute('aria-label')?.match(/([0-9]+) unread/)?.[1] ?? 0)`);
    await until(() => { const other = pageB.telemetry.systems.filter(event => event.stream === 'other'); return other.length > 0 && other.at(-1).status === 'ok'; }, 'receiver notification PostgreSQL stream ready');
    await send(pageA, message('notification'));
    await until(() => pageB.evaluate(`Number(document.querySelector('button[aria-label^="Notifications"]')?.getAttribute('aria-label')?.match(/([0-9]+) unread/)?.[1] ?? 0)>${before}`), 'realtime unread badge');
    await click(pageB, 'button[aria-label^="Notifications"]');
    const rows = await data(admin.from('notifications').select('id').eq('recipient_id', b.id).eq('conversation_id', conversationId)); assert.ok(rows.length);
    await click(pageB, `form:has(input[name=notification_id][value="${rows[0].id}"]) button[type=submit]`); await pathname(pageB, conversationPath);
    await until(() => pageB.evaluate(`document.body.innerText.includes(${JSON.stringify(message('notification'))})`), 'notification conversation');
  });
  await check('Background conversation stays unread and both sender tabs receive the real read receipt', async () => {
    const senderTab = await page(pageA.browserContextId);
    const receiverCover = await page(pageB.browserContextId);
    try {
      await visit(pageA, conversationPath);
      await visit(senderTab, conversationPath);
      await visit(pageB, conversationPath);
      await pageB.send('Page.bringToFront');
      await until(() => pageB.evaluate(`document.visibilityState==='visible' && document.hasFocus()`), 'receiver conversation focused');
      const membership = () => data(admin.from('conversation_members').select('last_read_at').eq('conversation_id',conversationId).eq('profile_id',b.id).single());
      const previousMessage = await data(admin.from('messages').select('created_at').eq('conversation_id',conversationId).eq('body',message('notification')).single());
      await until(async () => new Date((await membership()).last_read_at).getTime() >= new Date(previousMessage.created_at).getTime(), 'previous displayed message acknowledged');
      await receiverCover.send('Page.bringToFront');
      await pageA.send('Page.bringToFront');
      await until(() => pageB.evaluate(`document.visibilityState!=='visible' || !document.hasFocus()`), 'receiver conversation actually backgrounded');
      const baseline = (await membership()).last_read_at;
      const text = message('multi-tab-receipt');
      await send(pageA,text);
      for (const tab of [pageB,senderTab]) {
        await until(() => tab.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(text)})`), 'new message arrives without tab navigation');
      }
      // The message is already rendered above. Background streaming requests
      // need not finish, so observe the actual read boundary over time rather
      // than requiring unrelated RSC traffic to become globally idle.
      for (let observation=0; observation<3; observation++) {
        await delay(500);
        assert.ok(await pageB.evaluate(`document.visibilityState!=='visible' || !document.hasFocus()`),'Receiver must stay backgrounded throughout the unread check');
        assert.equal((await membership()).last_read_at,baseline,'A background conversation must not advance its read watermark');
      }
      const seenExpression = `(() => {const body=[...document.querySelectorAll('main p')].find(node=>node.textContent===${JSON.stringify(text)});return !!body?.parentElement?.querySelector('span')?.textContent.includes('Seen');})()`;
      for (const tab of [pageA,senderTab]) assert.equal(await tab.evaluate(seenExpression),false,'Unread new message must not display Seen');
      const refreshBefore = [pageA,senderTab].map(tab=>tab.telemetry.refreshRequests);
      await pageB.send('Page.bringToFront');
      await until(() => pageB.evaluate(`document.visibilityState==='visible' && document.hasFocus()`), 'receiver conversation foregrounded');
      const sent = await data(admin.from('messages').select('created_at').eq('conversation_id',conversationId).eq('body',text).single());
      await until(async () => new Date((await membership()).last_read_at).getTime() >= new Date(sent.created_at).getTime(), 'foreground receiver acknowledges delivered message');
      for (const [index,tab] of [pageA,senderTab].entries()) {
        await until(() => tab.evaluate(seenExpression), 'Seen receipt appears in each sender tab without reload');
        assert.ok(tab.telemetry.refreshRequests>refreshBefore[index],'Each sender tab must refresh from the receipt update');
        assert.equal(await tab.evaluate('location.pathname'),conversationPath);
      }
    } finally {
      for (const tab of [senderTab,receiverCover]) {
        await browser.send('Target.closeTarget',{targetId:tab.targetId});
        tab.close();
        pages.splice(pages.indexOf(tab),1);
      }
      await pageA.send('Page.bringToFront');
    }
  });
  for (const [table, titleField, ownerField] of [['businesses','name','owner_id'],['organizations','name','owner_id'],['opportunities','title','author_id'],['events','title','creator_id']]) {
    await check(`${table}: owner create/edit, draft privacy and foreign edit boundary through browser`, async () => {
      const title = `Synthetic ${stamp} ${table}`; await visit(pageA, `/${table}/new`); await fill(pageA, `[name=${titleField}]`, title);
      if (table === 'businesses') { await fill(pageA, '[name=category]', 'Professional services'); await fill(pageA, '[name=short_description]', 'Synthetic business summary'); }
      else if (table === 'organizations') await fill(pageA, '[name=short_description]', 'Synthetic organization summary');
      else {
        await fill(pageA, '[name=summary]', 'Synthetic listing summary'); await fill(pageA, '[name=description]', 'Synthetic listing description for isolated browser verification.');
        if (table === 'opportunities') await select(pageA, '[name=type]', 'volunteer'); else await eventStart(pageA);
      }
      await click(pageA, `form:has([name=${titleField}]) button[type=submit]`);
      const row = await listingRow(table, titleField, title); listings.push({table, id:row.id}); assert.equal(row[ownerField], a.id); assert.equal(row.status, 'draft');
      const path = `/${table}/${row.slug}`; await pathname(pageA, path);
      await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(title)})`), 'owner draft detail');
      const unavailableHeading = table === 'organizations' ? 'Organization not found' : table === 'businesses' ? 'Business not found' : 'This page isn’t available.';
      await visit(pageB, path);
      await until(() => pageB.evaluate(`document.querySelector('main h1')?.textContent.trim()===${JSON.stringify(unavailableHeading)} && !document.querySelector('main')?.innerText.includes(${JSON.stringify(title)})`), 'foreign draft hidden');
      await visit(pageB, `${path}/edit`);
      await until(() => pageB.evaluate(`document.querySelector('main h1')?.textContent.trim()===${JSON.stringify(unavailableHeading)} && !document.querySelector(${JSON.stringify(`[name=${titleField}]`)})`), 'foreign edit refused');
      await visit(pageA, `${path}/edit`); const edited = `${title} edited`; await fill(pageA, `[name=${titleField}]`, edited); await click(pageA, `form:has([name=${titleField}]) button[type=submit]`); await pathname(pageA, path);
      const saved = await listingRow(table, titleField, edited); assert.equal(saved.id, row.id); assert.equal(saved.status, 'draft');
      await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(edited)})`), 'edited listing detail');
      // Business/organization deletion needs a product decision; no UI is invented.
      if (['opportunities','events'].includes(table)) {
        const deleteButton = `form:has(input[name=slug][value="${row.slug}"]) button[type=submit]`; let dialogs = 0;
        const handler = event => { const packet = JSON.parse(event.data); if (packet.method === 'Page.javascriptDialogOpening') { dialogs++; void pageA.send('Page.handleJavaScriptDialog', {accept: dialogs > 1}); } };
        pageA.socket.addEventListener('message', handler);
        try {
          await click(pageA, deleteButton); await until(() => dialogs === 1, 'cancel delete confirmation');
          await until(() => pageA.evaluate(`!!document.querySelector(${JSON.stringify(deleteButton)})`), 'cancel leaves owner detail');
          assert.equal((await data(admin.from(table).select('id').eq('id',row.id))).length, 1);
          await click(pageA, deleteButton); await pathname(pageA, `/${table}`); assert.equal(dialogs, 2); assert.equal((await data(admin.from(table).select('id').eq('id',row.id))).length, 0);
        } finally { pageA.socket.removeEventListener('message', handler); }
      }
    });
  }
  await check('Members and anonymous browsers cannot access moderation or admin team controls', async () => {
    for (const route of ['/moderation','/moderation/team']) {
      await visit(pageB, route); await pathname(pageB, '/');
      assert.equal(await pageB.evaluate(`!!document.querySelector('input[name=entity_id]')`), false);
    }
    const anonymous = await page(); await visit(anonymous, '/moderation'); await pathname(anonymous, '/login');
  });
  for (const role of ['admin','moderator']) {
    const reviewer = await member(role);
    // Only IDs created by this run, inside the validated disposable loopback stack.
    assert.match(reviewer.id, /^[0-9a-f-]{36}$/);
    assert.ok(users.includes(reviewer.id));
    execFileSync('docker', ['exec', 'supabase_db_afghan-hub-local-journey', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', `BEGIN; SELECT set_config('request.jwt.claim.role','service_role',true); UPDATE public.profiles SET role='${role}', first_name='Synthetic', last_name='${role}', onboarding_completed=true WHERE id='${reviewer.id}'; COMMIT;`], { stdio: 'ignore' });
    const reviewerPage = await page(); await login(reviewerPage, reviewer.email); await pathname(reviewerPage, '/dashboard');
    await check(`${role}: moderation access respects admin-only team boundary`, async () => {
      await visit(reviewerPage, '/moderation'); await pathname(reviewerPage, '/moderation');
      await captureState(reviewerPage, `${role}-moderation`);
      assert.equal(await reviewerPage.evaluate(`!!document.querySelector('a[href="/moderation/team"]')`), role === 'admin');
      await visit(reviewerPage, '/moderation/team'); await pathname(reviewerPage, role === 'admin' ? '/moderation/team' : '/moderation');
      if (role === 'admin') await captureState(reviewerPage,'admin-team');
      assert.equal(await reviewerPage.evaluate(`!!document.querySelector('a[href="/moderation/team"]')`), role === 'admin');
      await visit(reviewerPage, '/moderation/team'); await pathname(reviewerPage, role === 'admin' ? '/moderation/team' : '/moderation');
    });
    if (role === 'admin') {
      const target = await member('role-target');
      const targetPage = await page();
      await login(targetPage, target.email); await onboard(targetPage, 'RoleTarget');
      const client = createClient(apiUrl, status.ANON_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
      await data(client.auth.signInWithPassword({email:target.email,password}));
      const tokenBefore = (await data(client.auth.getSession())).session.access_token;
      const selector = `form:has(input[name=profile_id][value="${target.id}"])`;
      let actionTemplate;
      await check('Admin role form promotes and demotes a synthetic member with existing-session authorization', async () => {
        for (const requestedRole of ['moderator','admin','member']) {
          await visit(reviewerPage, '/moderation/team');
          await until(() => reviewerPage.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), 'synthetic role form');
          if (!actionTemplate) {
            actionTemplate = await reviewerPage.evaluate(`fetch('/moderation/team').then(response=>response.text()).then(html=>{
              const doc=new DOMParser().parseFromString(html,'text/html');
              return doc.querySelector(${JSON.stringify(selector)})?.outerHTML;
            })`);
            assert.ok(actionTemplate?.includes('$ACTION_'), 'Real server-rendered form must expose its native action fields');
          }
          await select(reviewerPage, `${selector} select[name=role]`, requestedRole);
          await click(reviewerPage, `${selector} button[type=submit]`);
          await until(() => reviewerPage.evaluate(`location.pathname==='/moderation/team' && location.search==='?saved=1' && document.querySelector('main [role=status]')?.textContent.includes('Member role updated.')`), 'role save feedback');
          assert.equal((await data(admin.from('profiles').select('role').eq('id',target.id).single())).role, requestedRole);
          assert.equal((await data(client.auth.getSession())).session.access_token, tokenBefore, 'Authorization must change without replacing the access token');
          assert.equal((await data(client.rpc('get_my_access_context')))[0].role, requestedRole);
          assert.equal(await data(client.rpc('is_admin')), requestedRole==='admin');
          await visit(targetPage, '/moderation/team');
          await pathname(targetPage, requestedRole==='admin' ? '/moderation/team' : requestedRole==='moderator' ? '/moderation' : '/');
          await captureState(reviewerPage, `role-change-${requestedRole}`);
        }
      });
      await check('Demoted member cannot replay role changes through database RPC or real server action', async () => {
        const refused = await client.rpc('set_profile_role',{target_profile_id:b.id,target_role:'admin'});
        assert.ok(refused.error, 'Demoted session must be denied by database');
        await visit(targetPage, '/dashboard');
        await targetPage.evaluate(`(() => {
          const doc=new DOMParser().parseFromString(${JSON.stringify(actionTemplate)},'text/html');
          const form=document.importNode(doc.querySelector('form'),true);
          form.action='/moderation/team'; form.method='post';
          form.querySelector('[name=profile_id]').value=${JSON.stringify(b.id)};
          form.querySelector('[name=role]').value='admin';
          document.body.append(form); form.submit();
        })()`);
        await pathname(targetPage, '/');
        assert.equal((await data(admin.from('profiles').select('role').eq('id',b.id).single())).role, 'member');
        await data(client.auth.refreshSession());
        assert.equal((await data(client.rpc('get_my_access_context')))[0].role, 'member');
        await data(client.auth.signOut({scope:'local'}));
        assert.ok((await client.rpc('set_profile_role',{target_profile_id:b.id,target_role:'admin'})).error);
      });
      for (const persona of ['moderator','anonymous']) {
        await check(`${persona}: real role action and RPC refuse promotion with unchanged database state`, async () => {
          const deniedPage = await page();
          const deniedClient = createClient(apiUrl,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
          if (persona==='moderator') {
            const fixture = await member('role-denied-moderator');
            assert.ok(users.includes(fixture.id)); assert.match(fixture.id,/^[0-9a-f-]{36}$/);
            execFileSync('docker',['exec','supabase_db_afghan-hub-local-journey','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-c',`BEGIN; SELECT set_config('request.jwt.claim.role','service_role',true); UPDATE public.profiles SET role='moderator',onboarding_completed=true WHERE id='${fixture.id}'; COMMIT;`],{stdio:'ignore'});
            await login(deniedPage,fixture.email); await pathname(deniedPage,'/dashboard');
            await data(deniedClient.auth.signInWithPassword({email:fixture.email,password}));
          } else await visit(deniedPage,'/login');
          const before=(await data(admin.from('profiles').select('role').eq('id',b.id).single())).role;
          assert.ok((await deniedClient.rpc('set_profile_role',{target_profile_id:b.id,target_role:'admin'})).error);
          await deniedPage.evaluate(`(() => {
            const doc=new DOMParser().parseFromString(${JSON.stringify(actionTemplate)},'text/html');
            const form=document.importNode(doc.querySelector('form'),true); form.action='/moderation/team'; form.method='post';
            form.querySelector('[name=profile_id]').value=${JSON.stringify(b.id)}; form.querySelector('[name=role]').value='admin';
            document.body.append(form); form.submit();
          })()`);
          await pathname(deniedPage,persona==='anonymous' ? '/login' : '/');
          assert.equal((await data(admin.from('profiles').select('role').eq('id',b.id).single())).role,before);
          await data(deniedClient.auth.signOut({scope:'local'}));
        });
      }
    }
    for (const [table, , ownerField, payload] of [
      ['organizations','organization','owner_id',{name:`Synthetic ${stamp} ${role} organization`}],
      ['opportunities','opportunity','author_id',{title:`Synthetic ${stamp} ${role} opportunity`,description:'Disposable moderation fixture',type:'volunteer'}],
      ['events','event','creator_id',{title:`Synthetic ${stamp} ${role} event`,starts_at:new Date(Date.now()+86400000).toISOString()}],
      ['businesses','business','owner_id',{name:`Synthetic ${stamp} ${role} business`,category:'Professional services'}],
    ]) {
      await check(`${role}: ${table} rejection feedback and approval publication through real forms`, async () => {
        const title = payload.name ?? payload.title;
        const row = await data(admin.from(table).insert({...payload,[ownerField]:a.id,status:'draft',slug:`browser-${stamp}-${role}-${table}`}).select('id,slug').single()); listings.push({table,id:row.id});
        const form = `form:has(input[name=entity_id][value="${row.id}"])`;
        await visit(reviewerPage, '/moderation');
        await click(reviewerPage, `${form} summary`);
        await fill(reviewerPage, `${form} textarea[name=moderation_note]`, 'short');
        await click(reviewerPage, `${form} button[value=reject]`);
        await until(() => reviewerPage.evaluate(`location.search.includes('error=') && document.querySelector('main [role=alert]')?.textContent.includes('between 10 and 1000')`), 'invalid rejection reason refused server-side');
        assert.equal((await data(admin.from(table).select('status').eq('id',row.id).single())).status,'draft');
        await click(reviewerPage, `${form} summary`);
        const reason = `Synthetic ${role} review: please clarify the listing details.`;
        await fill(reviewerPage, `${form} textarea[name=moderation_note]`, reason);
        await click(reviewerPage, `${form} button[value=reject]`);
        await until(() => reviewerPage.evaluate(`location.search==='?success=rejected' && document.querySelector('main [role=status]')?.textContent.includes('rejected')`), 'rejection confirmation');
        const rejected = await data(admin.from(table).select('status,moderation_note,moderated_by').eq('id',row.id).single());
        assert.equal(rejected.status,table === 'opportunities' ? 'closed' : 'suspended'); assert.equal(rejected.moderation_note,reason); assert.equal(rejected.moderated_by,reviewer.id);
        await visit(pageA,'/submissions');
        await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(reason)})`), 'owner rejection feedback');
        if(role==='admin' && table==='opportunities') await captureState(pageA,'submissions-owner-note');
        await visit(pageB,`/${table}/${row.slug}`);
        assert.equal(await pageB.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(title)})`),false);
        // Reset this captured synthetic row to draft solely to exercise approval separately.
        await data(admin.from(table).update({status:'draft'}).eq('id',row.id));
        await visit(reviewerPage,'/moderation'); await click(reviewerPage,`${form} button[value=approve]`);
        await until(() => reviewerPage.evaluate(`location.search==='?success=approved' && document.querySelector('main [role=status]')?.textContent.includes('approved')`), 'approval confirmation');
        const approved = await data(admin.from(table).select('status,moderation_note,moderated_by').eq('id',row.id).single());
        assert.equal(approved.status,'published'); assert.equal(approved.moderation_note,null); assert.equal(approved.moderated_by,reviewer.id);
        await visit(pageB,`/${table}/${row.slug}`);
        await until(() => pageB.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(title)})`), 'published member visibility');
        const anonymous = await page(); await visit(anonymous,`/explore/${table}/${row.slug}`);
        await until(() => anonymous.evaluate(`document.querySelector('main h1')?.textContent.trim()===${JSON.stringify(title)}`), 'published anonymous visibility');
        expectedListingPath = `/${table}/${row.slug}`;
        await visit(pageA,'/submissions');
        await until(() => pageA.evaluate(`document.querySelector(${JSON.stringify(`article:has(a[href="/${table}/${row.slug}"])`)})?.innerText.includes('Published')`), 'owner publication feedback');
      });
    }
  }
  await check('Navigator three-language conversations retrieve permitted records and reset a new goal', async () => {
    await data(admin.from('profiles').update({profession:'Artist',city:'North Vancouver',is_public:true}).eq('id',b.id));
    await data(admin.from('profiles').update({is_public:true}).eq('id',a.id));
    const artEvent=listings.filter(row=>row.table==='events').at(-1);
    const job=listings.filter(row=>row.table==='opportunities').at(-1);
    assert.ok(artEvent && job);
    await data(admin.from('events').update({summary:'Art collaboration gathering',city:'North Vancouver'}).eq('id',artEvent.id));
    await data(admin.from('opportunities').update({type:'job',summary:'Job employment hiring',city:'North Vancouver'}).eq('id',job.id));
    const localArtist=await member('artist-vancouver');
    await data(admin.from('profiles').update({first_name:'Synthetic',last_name:'Artist Vancouver',profession:'Artist',city:'Vancouver',is_public:true,onboarding_completed:true}).eq('id',localArtist.id));
    const languagesBefore=await data(admin.from('profiles').select('id,languages').in('id',[a.id,b.id]).order('id'));
    for(const [language,queries] of [
      ['en',['I’m new in Vancouver and want to meet people.','I’m an artist looking for collaborators.','Only North Vancouver.','Show me events too.','Anywhere.','Actually, I need a job instead.']],
      ['fa',['من در ونکوور تازه هستم و می‌خواهم با افراد آشنا شوم','من هنرمند هستم و دنبال همکار می‌گردم','فقط شمال ونکوور','رویدادها را هم نشان بده','هر جا','در واقع دنبال شغل هستم']],
      ['ps',['زه په ونکوور کې نوی یم او غواړم خلک وپېژنم','زه هنرمند یم او همکار ملګري غواړم','یوازې شمالي ونکوور','غونډې هم را وښیه','هر ځای','په حقیقت کې دنده غواړم']],
    ]) {
      let context;
      for(let index=0;index<queries.length;index++) {
        const result=await pageA.evaluate(`(async()=>{const r=await fetch('/api/assistant/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(${JSON.stringify({query:queries[index],language,context})})});return {status:r.status,data:await r.json()};})()`);
        assert.equal(result.status,200); context=result.data.context;
        const expected=['profile','profile','profile','event','event','opportunity'][index];
        assert.equal(context.entityType,expected);
        if(index===1) {assert.equal(context.city,'Vancouver');assert.ok(result.data.results.some(row=>row.entityId===localArtist.id && row.href===`/members/${localArtist.id}`));}
        if(index===2) assert.ok(result.data.results.some(row=>row.entityId===b.id && row.href===`/members/${b.id}`));
        if(index===2||index===3) assert.equal(context.city,'North Vancouver');
        if(index===3||index===4) assert.ok(result.data.results.some(row=>row.entityId===artEvent.id && row.href.startsWith('/events/')));
        if(index===5) { assert.equal(context.topic,'job');assert.equal(context.city,undefined);assert.ok(result.data.results.some(row=>row.entityId===job.id && row.href.startsWith('/opportunities/'))); }
        assert.ok(result.data.results.every(row=>row.href.startsWith('/members/')||row.href.startsWith('/events/')||row.href.startsWith('/opportunities/')));
      }
    }
    assert.deepEqual(await data(admin.from('profiles').select('id,languages').in('id',[a.id,b.id]).order('id')),languagesBefore);
  });
  await check('Directory filtered states preserve URLs, clear actions and calendar controls', async () => {
    for (const area of ['businesses','organizations','opportunities','events']) {
      await visit(pageA,`/${area}?q=admin`);
      assert.equal(await pageA.evaluate(`document.querySelector('main input[name=q]')?.value`),'admin');
      assert.equal(await pageA.evaluate(`document.querySelectorAll('main a[href^="/${area}/browser-"]').length`),1,'Positive filter must show one permitted fixture');
      await captureState(pageA,`${area}-filtered-results`);
      await visit(pageA, `/${area}?q=No-matching-synthetic-listing`);
      await until(()=>pageA.evaluate(`document.querySelector('main')?.innerText.includes('No ${area === 'events' ? 'matching events' : area + ' match these filters'}')`), 'filtered directory empty state');
      assert.equal(await pageA.evaluate(`document.querySelector('main input[name=q]')?.value`), 'No-matching-synthetic-listing');
      assert.ok(await pageA.evaluate(`!!document.querySelector('main a[href="/${area}"]')`));
      await captureState(pageA,`${area}-filtered-empty`);
    }
    await visit(pageA, '/events?view=calendar');
    assert.ok(await pageA.evaluate(`!!document.querySelector('form input[name=view][value=calendar]')`));
  });
  await check('Member workspaces: category links, permitted inbox search and responsive identity', async () => {
    await visit(pageA, '/submissions');
    const nav = 'nav[aria-label="Submission categories"]';
    assert.equal(await pageA.evaluate(`document.querySelectorAll('${nav} a').length`), 5);
    await click(pageA, `${nav} a[href="/submissions?category=businesses"]`);
    await until(() => pageA.evaluate(`location.search==='?category=businesses'`), 'business submissions category');
    assert.ok(await pageA.evaluate(`document.querySelectorAll('main article').length>0`));
    assert.equal(await pageA.evaluate(`[...document.querySelectorAll('main article')].every(item=>item.innerText.includes('Business'))`), true);
    await visit(pageA, '/messages');
    await until(() => pageA.evaluate(`!!document.querySelector('input[placeholder="Name or latest message"]')`), 'inbox search input');
    const inboxInput='input[placeholder="Name or latest message"]';
    await click(pageA,inboxInput);
    await until(()=>pageA.evaluate(`document.hasFocus() && document.activeElement===document.querySelector(${JSON.stringify(inboxInput)})`),'inbox owns native keyboard focus');
    await pageA.send('Input.insertText', {text:'No-matching-synthetic-conversation'});
    await until(()=>pageA.evaluate(`document.querySelector(${JSON.stringify(inboxInput)})?.value==='No-matching-synthetic-conversation'`),'native inbox search value');
    await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes('No matching conversations')`), 'inbox filtered empty state');
    assert.equal(await pageA.evaluate(`!!document.querySelector(${JSON.stringify(`main a[href="${conversationPath}"]`)})`),false,'Filtered inbox must hide the real conversation');
    await click(pageA, 'input[placeholder="Name or latest message"]');
    await until(() => pageA.evaluate(`document.visibilityState==='visible' && document.hasFocus() && document.activeElement===document.querySelector('input[placeholder="Name or latest message"]')`), 'native inbox input focused');
    await pageA.send('Input.insertText', {text:'No-matching-synthetic-conversation'});
    await until(() => pageA.evaluate(`document.querySelector('input[placeholder="Name or latest message"]')?.value==='No-matching-synthetic-conversation'`), 'native inbox query retained');
    await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes('No matching conversations')`), 'inbox filtered empty state');
    await visit(pageA, conversationPath);
    assert.equal(await pageA.evaluate(`getComputedStyle(document.querySelector('aside[aria-label="Conversation navigation"]')).display!=='none'`), true);
    await pageA.send('Emulation.setDeviceMetricsOverride', { width:390, height:1000, deviceScaleFactor:1, mobile:true });
    assert.equal(await pageA.evaluate(`getComputedStyle(document.querySelector('aside[aria-label="Conversation navigation"]')).display`), 'none');
    await click(pageA, 'a[aria-label="Back to messages"]'); await pathname(pageA, '/messages');
    await visit(pageA, `/members/${b.id}`);
    assert.equal(await pageA.evaluate(`!!document.querySelector('[data-hero-layer="architecture"]') || !!document.querySelector('main svg[data-illustration-kind]')`), false);
    assert.equal(await pageA.evaluate(`document.documentElement.scrollWidth>innerWidth`), false);
    await pageA.send('Emulation.setDeviceMetricsOverride', { width:1440, height:1000, deviceScaleFactor:1, mobile:false });
  });
  if (process.env.LOCAL_QA_VISUAL === '1') {
    await check('Representative pages: desktop/mobile layout, global canvas and Navigator RTL', async () => {
      const memberVisual = await page(pageA.browserContextId);
      const designReviewer=await member('design-reviewer');
      execFileSync('docker',['exec','supabase_db_afghan-hub-local-journey','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-c',`BEGIN; SELECT set_config('request.jwt.claim.role','service_role',true); UPDATE public.profiles SET role='admin',onboarding_completed=true WHERE id='${designReviewer.id}'; COMMIT;`],{stdio:'ignore'});
      const adminVisual=await page(); await login(adminVisual,designReviewer.email); await pathname(adminVisual,'/dashboard');
      const detailRoutes=[];
      for(const table of ['businesses','organizations','opportunities','events']) {
        const fixture=listings.filter(row=>row.table===table).at(-1);
        assert.ok(fixture,`Missing visual fixture: ${table}`);
        const row=await data(admin.from(table).select('slug,status').eq('id',fixture.id).single());
        assert.equal(row.status,'published','Public detail evidence requires a published synthetic fixture');
        detailRoutes.push(`/${table}/${row.slug}`,`/${table}/${row.slug}/edit`,`/explore/${table}/${row.slug}`);
      }
      let visual=memberVisual;
      const findings = [];
      const reviewDetails = [];
      for (const table of ['businesses','organizations','opportunities','events']) {
        const fixture = listings.filter(row=>row.table===table).at(-1);
        if (!fixture) continue;
        const row = await data(admin.from(table).select('slug').eq('id',fixture.id).maybeSingle());
        if (row) reviewDetails.push(`/${table}/${row.slug}`,`/${table}/${row.slug}/edit`,`/explore/${table}/${row.slug}`);
      }
      const visualDir = process.env.LOCAL_QA_VISUAL_DIR ?? 'reports/visual';
      mkdirSync(visualDir, {recursive:true});
      const captureRoutes = ['/login','/login?mode=join','/forgot-password','/update-password','/','/about','/explore','/profile','/dashboard','/search','/saved','/settings','/network',`/members/${b.id}`,'/submissions','/messages',conversationPath,'/businesses','/organizations','/opportunities','/events','/businesses/new','/organizations/new','/opportunities/new','/events/new','/not-a-real-page'];
      for (const phase of process.env.LOCAL_QA_COMPARE_DIR ? ['before','after'] : ['after']) {
        for (const route of captureRoutes) {
          if (phase === 'before') {
            const navigation = await visual.send('Page.navigate', {url:compareUrl+route});
            if(navigation.loaderId) await until(()=>visual.loadedDocuments.has(navigation.loaderId),'baseline visual document');
            await until(()=>visual.evaluate(`location.origin===${JSON.stringify(compareUrl)} && document.readyState==='complete'`),'baseline page loaded');
          } else await visit(visual,route);
          await visual.evaluate('document.fonts.ready.then(()=>true)');
          for (const width of [1440,768,390,320]) {
            await visual.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});
            const state = await visual.evaluate(`({route:location.pathname,overflow:document.documentElement.scrollWidth>innerWidth,canvas:!!document.querySelector('.global-network-background canvas'),heading:!!document.querySelector('main h1')})`);
            if (phase==='after') assert.equal(state.overflow,false,`Horizontal overflow: ${route} at ${width}`);
            findings.push({sourceRevision:phase==='before'?process.env.LOCAL_QA_COMPARE_SHA:sourceRevision,phase,requested:route===conversationPath?'/messages/[id]':route,width,...state});
            const label=route==='/'?'homepage':route===conversationPath?'conversation':route===`/members/${b.id}`?'member':route==='/login?mode=join'?'signup':route.slice(1).replaceAll('/','-');
            const screenshot=await visual.send('Page.captureScreenshot',{format:'png'});
            writeFileSync(`${visualDir}/${label}-${phase}-${width}.png`,Buffer.from(screenshot.data,'base64'));
          }
        }
      }
      writeFileSync(`${visualDir}/layout-checks-${process.env.LOCAL_QA_VISUAL_PHASE ?? 'after'}.json`,JSON.stringify({sourceRevision,sourceTree,zoom:100,findings},null,2)+'\\n');
      for (const phase of process.env.LOCAL_QA_COMPARE_DIR ? ['before','after'] : ['after']) {
        if(phase==='before') {
          const navigation=await visual.send('Page.navigate',{url:compareUrl+'/'});
          if(navigation.loaderId) await until(()=>visual.loadedDocuments.has(navigation.loaderId),'baseline Navigator document');
        } else await visit(visual,'/');
        for (const locale of ['en','fa','ps']) {
          await select(visual,'#ai-navigator select',locale);
          await until(()=>visual.evaluate(`document.querySelector('#ai-navigator')?.getAttribute('lang')===${JSON.stringify(locale)} && document.querySelector('#ai-navigator')?.getAttribute('dir')===${JSON.stringify(locale==='en'?'ltr':'rtl')}`),'visual Navigator language');
          for(const width of [1440,768,390,320]) {
            await visual.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});
            await visual.evaluate(`document.querySelector('#ai-navigator').scrollIntoView({block:'center'})`);
            const screenshot=await visual.send('Page.captureScreenshot',{format:'png'});
            writeFileSync(`${visualDir}/navigator-${locale}-${phase}-${width}.png`,Buffer.from(screenshot.data,'base64'));
            const jpg=await visual.send('Page.captureScreenshot',{format:'jpeg',quality:75});
            writeFileSync(`${visualDir}/navigator-${locale}-${phase}-${width}.jpg`,Buffer.from(jpg.data,'base64'));
            if(phase==='after') {
              assert.equal(await visual.evaluate(`document.documentElement.scrollWidth>innerWidth`),false);
              const size=await visual.evaluate(`getComputedStyle(document.querySelector('#ai-navigator input')).fontSize`);
              assert.ok(parseFloat(size)>=16,'Navigator field text must avoid mobile focus zoom');
            }
          }
        }
      }
      await visit(visual,'/network');
      await visual.send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:true});
      await openMemberNavigator(visual);
      await check('Navigator keyboard focus stays inside the dialog and Escape restores its launcher',async()=> {
        for(let index=0;index<20;index++) {
          await visual.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
          await visual.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
          assert.equal(await visual.evaluate(`document.querySelector('dialog[open]').contains(document.activeElement)`),true);
        }
        await visual.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await visual.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await until(()=>visual.evaluate(`!document.querySelector('dialog[open]') && document.activeElement?.getAttribute('aria-haspopup')==='dialog'`),'Escape returns Navigator focus');
      });
      await visit(visual,'/network');
      await click(visual,'button[aria-label^="Notifications"]');
      await until(()=>visual.evaluate(`!!document.querySelector('[role=dialog][aria-label="Notifications"]')`),'notification panel open');
      await captureState(visual,'notifications-dialog');
      await visual.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await visual.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await check('Reduced-motion Navigator and global canvas stay usable at 320px',async()=> {
        await visual.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
        await visit(visual,'/');
        assert.equal(await visual.evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches`),true);
        await captureState(visual,'homepage-reduced-motion');
        await visual.send('Emulation.setEmulatedMedia',{features:[]});
      });
      writeFileSync(`${visualDir}/layout-checks-${process.env.LOCAL_QA_VISUAL_PHASE ?? 'after'}.json`,JSON.stringify({sourceRevision, sourceTree, zoom:100, findings},null,2)+'\n');
    });
  }
  await check('Directory and submission request failures remain visible without false empty counts', async () => {
    // Sanitized stage evidence: docker exit codes, container states, route timings and
    // HTTP/error names only. It is attached to any failure so the cause stays visible.
    await pageA.send('Page.bringToFront');
    await until(()=>pageA.evaluate(`document.visibilityState==='visible' && document.hasFocus()`),'outage browser is foregrounded');
    const evidence = { stages: [], probes: [], docker: [] };
    const rest = 'supabase_rest_afghan-hub-local-journey';
    const kong = 'supabase_kong_afghan-hub-local-journey';
    const db = 'supabase_db_afghan-hub-local-journey';
    const dockerExit = (args) => { const exit = spawnSync('docker', args, { stdio: 'ignore' }).status; evidence.docker.push({ command: args[0], target: args.at(-1) === rest || args.at(-1) === kong ? args.at(-1).replace('afghan-hub-local-journey', '<project>') : args[1], exit }); return exit; };
    const containerState = (name) => { const r = spawnSync('docker', ['inspect', '-f', '{{.State.Status}}', name], { encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : `inspect-exit-${r.status}`; };
    const probe = async (phase) => {
      const started = Date.now();
      let entry;
      try {
        const response = await fetch(`${apiUrl}/rest/v1/businesses?select=id&limit=0`, { headers: { apikey: status.ANON_KEY, Authorization: `Bearer ${status.ANON_KEY}` }, signal: AbortSignal.timeout(5000) });
        try { await response.arrayBuffer(); } catch {}
        entry = { phase, http: response.status, ms: Date.now() - started };
      } catch (error) {
        entry = { phase, error: error.name, ms: Date.now() - started };
      }
      if (evidence.probes.length < 60) evidence.probes.push(entry);
      return entry.http === 200;
    };
    try {
      evidence.before = { rest: containerState(rest), kong: containerState(kong) };
      assert.equal(dockerExit(['stop', rest]), 0, 'Could not stop the disposable REST service');
      evidence.during = { rest: containerState(rest) };
      await probe('during-outage');
      for (const route of ['/businesses','/organizations','/opportunities','/events','/submissions']) {
        const started = Date.now();
        try {
          await visit(pageA, route);
          // Middleware, access-context and workspace reads each have their own
          // 10-second request deadline. Bound this whole outage navigation too;
          // a 20-second document limit cannot cover those sequential phases.
          await visit(pageA, route, 40000);
          assert.equal(await pageA.evaluate('location.pathname'), route, 'Outage must retain the requested workspace');
        } catch (error) {
          evidence.stages.push({ route, outcome: 'navigation-error', error: error.name, ms: Date.now() - started });
          throw error;
        }
        evidence.stages.push({ route, outcome: 'loaded', ms: Date.now() - started });
        assert.ok(await pageA.evaluate(`!!document.querySelector('main [role=alert]')`), `Load failure must be announced: ${route}`);
        await captureState(pageA,`${route.slice(1)}-outage`);
        if(route==='/submissions') assert.equal(await pageA.evaluate(`document.querySelector('main')?.innerText.includes('No submissions yet')`), false);
      }
    } catch (error) {
      evidence.failedStep = step;
      if(error.navigationState)evidence.navigation=error.navigationState;
      error.evidence = evidence;
      throw error;
    } finally {
      // Restore every service this check touched, even when an assertion above failed.
      const started = dockerExit(['start', rest]);
      // Kong resolves its PostgREST upstream when it starts; a restarted REST container
      // can get a new address that the gateway keeps trying to reach.
      const kongRestarted = dockerExit(['restart', kong]);
      evidence.restore = { startExit: started, kongRestartExit: kongRestarted, rest: containerState(rest), kong: containerState(kong) };
      if (started !== 0 || kongRestarted !== 0) throw new Error('Could not restore the disposable gateway services');
      // PostgREST can sit in schema-cache backoff after a restart; ask the disposable
      // database to reload it and retry the bounded readiness probe.
      await until(async () => {
        dockerExit(['exec', db, 'psql', '-U', 'postgres', '-d', 'postgres', '-c', "NOTIFY pgrst, 'reload schema';"]);
        return probe('recovery');
      }, 'local REST service restored', 90000);
      // Successful teardown must not relabel an earlier navigation failure as
      // a failed health probe. Preserve the actual failing stage in the report.
      if (evidence.failedStep) step = evidence.failedStep;
    }
  });
  await check('Directory and submissions recover with accessible populated content', async () => {
    assert.equal(await pageA.evaluate('location.pathname'),'/submissions');
    await click(pageA,'main button[type=button]');
    await until(()=>pageA.evaluate(`location.pathname==='/submissions' && !document.querySelector('main [role=alert]') && document.querySelector('main')?.innerText.includes('Synthetic')`),'workspace Retry restores truthful submissions');
    for(const route of ['/businesses','/organizations','/opportunities','/events','/submissions']) {
      await visit(pageA,route);
      results.recoveryStates ??= [];
      results.recoveryStates.push(await pageA.evaluate(`({requested:${JSON.stringify(route)},route:location.pathname,heading:document.querySelector('main h1')?.textContent,alert:document.querySelector('main [role=alert]')?.textContent?.slice(0,180)})`));
      await until(()=>pageA.evaluate(`location.pathname===${JSON.stringify(route)} && !document.querySelector('main [role=alert]') && document.querySelector('main')?.innerText.includes('Synthetic')`),`Recovered document finished rendering: ${route}`);
      assert.equal(await pageA.evaluate(`!!document.querySelector('main [role=alert]')`),false,`Recovery must clear outage: ${route}`);
      assert.ok(await pageA.evaluate(`document.querySelector('main')?.innerText.includes('Synthetic')`),`Recovery must show fixtures: ${route}`);
      await captureState(pageA,`${route.slice(1)}-recovered`);
    }
  });
  await check('Live conversation delivery and offline reconnect catch-up without reload', async () => {
    await visit(pageA, conversationPath);
    await visit(pageB, conversationPath);
    pageB.activeRefreshes.clear();
    pageB.lastRefreshActivity=Date.now();
    await send(pageA, message('live'));
    await until(() => pageB.evaluate(`document.body.innerText.includes(${JSON.stringify(message('live'))})`), 'live message');
    await until(() => pageB.telemetry.systems.some(event => event.stream === 'messages' && event.status === 'ok'), 'receiver PostgreSQL stream ready');
    const snapshot = async phase => {
      const transport = await pageB.evaluate(`({...window.__qaTransport.state(), route:location.pathname, missedVisible:document.body.innerText.includes(${JSON.stringify(message('offline'))})})`);
      reconnectEvidence.push({ phase, at: Date.now(), ...transport, cdpActiveSockets:pageB.activeSockets.size, cdpCloses:pageB.telemetry.closes, authenticatedJoins:pageB.telemetry.authenticatedJoins, ready:pageB.telemetry.systems.filter(event=>event.stream==='messages' && event.status==='ok').length, changes:pageB.telemetry.changes, refreshRequests:pageB.telemetry.refreshRequests });
      return transport;
    };
    await snapshot('live');
    const before = { closes:pageB.telemetry.closes, joins:pageB.telemetry.authenticatedJoins, ready:pageB.telemetry.systems.length, changes:pageB.telemetry.changes };
    // Cut the receiver's actual proxy transport, not a browser online flag.
    await until(() => pageB.activeRefreshes.size===0 && Date.now()-pageB.lastRefreshActivity>300, 'receiver refreshes settled before interruption');
    const transportBefore = await pageB.evaluate('window.__qaTransport.state()');
    assert.ok(receiverNetwork.forwarded>0 && receiverNetwork.sockets.size>0,'Receiver must use the real loopback proxy');
    receiverNetwork.offline=true;
    for(const response of receiverNetwork.responses)response.pause();
    for(const socket of receiverNetwork.sockets)socket.destroy();
    await until(async () => (await pageB.evaluate('window.__qaTransport.state()')).closes > transportBefore.closes, 'native receiver socket closed');
    await until(async () => {
      const state = await pageB.evaluate('window.__qaTransport.state()');
      return receiverNetwork.offline && receiverNetwork.sockets.size===0 && state.open === 0 && state.closes > transportBefore.closes;
    }, 'receiver transport genuinely disconnected');
    await snapshot('disconnected');
    const disconnectedChanges=pageB.telemetry.changes;
    await send(pageA, message('offline'));
    const persisted = await data(admin.from('messages').select('id').eq('conversation_id',conversationId).eq('body',message('offline')));
    assert.equal(persisted.length,1,'Missed message must be persisted exactly once');
    reconnectEvidence.push({ phase:'persisted', messageIds:persisted.map(row=>row.id), count:persisted.length });
    assert.equal((await snapshot('missed')).missedVisible, false, 'Offline browser must miss this message before reconnect');
    assert.equal(pageB.telemetry.changes,disconnectedChanges,'Disconnected receiver must not receive PostgreSQL changes');
    receiverNetwork.offline=false;
    for(const response of receiverNetwork.responses)response.resume();
    const held=receiverNetwork.held.splice(0);
    reconnectEvidence.push({phase:'http-restored',pausedRefreshes:held.length});
    for(const forward of held)forward();
    await until(() => pageB.telemetry.authenticatedJoins > before.joins && pageB.telemetry.systems.slice(before.ready).some(event=>event.stream==='messages' && event.status==='ok'), 'authenticated PostgreSQL stream recovered', 35000);
    await snapshot('rejoined');
    await until(() => pageB.evaluate(`location.pathname===${JSON.stringify(conversationPath)} && document.body.innerText.includes(${JSON.stringify(message('offline'))})`), 'reconnect catch-up', 35000);
    await snapshot('caught-up');
  });
  await check('Separate-context signup confirms identity and creates only the receiving browser session', async () => {
  await check('Separate-context signup confirms the identity but PKCE session exchange fails closed without its verifier', async () => {
    const requester=await page(), receiver=await page();
    assert.notEqual(requester.browserContextId,receiver.browserContextId);
    const email=`browser-${stamp}-separate-signup@example.invalid`;
    await visit(requester,'/login?mode=join'); await fill(requester,'[name=email]',email); await fill(requester,'[name=password]',password);
    await click(requester,'#join button[type=submit]');
    await until(()=>requester.evaluate(`document.body.innerText.includes('Account created.')`),'separate signup notice');
    const registered=(await data(admin.auth.admin.listUsers())).users.find(user=>user.email===email);
    assert.ok(registered); users.push(registered.id); assert.ok(!registered.email_confirmed_at);
    const link=await deliveredConfirmation(email);
    const wrongType=new URL(link); wrongType.searchParams.set('type','recovery');
    await receiver.send('Page.navigate',{url:wrongType.href}); await pathname(receiver,'/forgot-password');
    await visit(receiver,'/update-password'); await pathname(receiver,'/login');
    assert.ok(!(await data(admin.auth.admin.getUserById(registered.id))).user.email_confirmed_at,'Changing token type must not confirm the identity');
    const attemptedRedirect=new URL(link); attemptedRedirect.searchParams.set('next','https://example.invalid');
    await receiver.send('Page.navigate',{url:attemptedRedirect.href}); await pathname(receiver,'/profile');
    assert.ok((await data(admin.auth.admin.getUserById(registered.id))).user.email_confirmed_at);
    await onboard(receiver,'SeparateSignup');
    assert.equal((await data(admin.from('profiles').select('last_name').eq('id',registered.id).single())).last_name,'SeparateSignup');
    await visit(receiver,'/dashboard'); await pathname(receiver,'/dashboard');
    await visit(requester,'/dashboard'); await pathname(requester,'/login');
    await captureState(receiver,'separate-signup-confirmed');
    await click(receiver,'button[aria-label="Sign out"]'); await pathname(receiver,'/login');
    await receiver.send('Page.navigate',{url:link}); await pathname(receiver,'/login');
    await until(()=>receiver.evaluate(`!!document.querySelector('[role=alert]')`),'replayed cross-context signup refused');
    await receiver.send('Page.navigate',{url:link}); await pathname(receiver,'/login');
    await until(()=>receiver.evaluate(`!!document.querySelector('[role=alert]')`),'separate-context signup feedback');
    assert.ok((await data(admin.auth.admin.getUserById(registered.id))).user.email_confirmed_at);
    await visit(receiver,'/dashboard'); await pathname(receiver,'/login');
    await login(receiver,email); await pathname(receiver,'/profile'); await onboard(receiver,'SeparateSignup');
    await captureState(receiver,'separate-signup-after-explicit-login');
    await click(receiver,'button[aria-label="Sign out"]'); await pathname(receiver,'/login');
    await receiver.send('Page.navigate',{url:link}); await pathname(receiver,'/login');
    await visit(receiver,'/dashboard'); await pathname(receiver,'/login');
  });
  const recoveryAccount=await member('recovery');
  const recoveryPage=await page();
  let recoveryLink;
  let newPassword=`QA-${randomUUID()}-bB2!`;
  async function requestRecovery() {
    const inbox=await (await fetch(`${mailUrl}/api/v1/messages`,{redirect:'error'})).json();
    const previousIds=inbox.messages.map(message=>message.ID);
    await visit(recoveryPage,'/forgot-password'); await fill(recoveryPage,'[name=email]',recoveryAccount.email);
    await click(recoveryPage,'form button[type=submit]');
    await until(()=>recoveryPage.evaluate(`location.pathname==='/forgot-password' && document.querySelector('[role=status]')?.textContent.includes('If an account exists')`),'reset request notice');
    return deliveredConfirmation(recoveryAccount.email,'recovery',previousIds);
  }
  await check('Real password recovery validates matching passwords, signs out and accepts only the new password', async () => {
    recoveryLink=await requestRecovery();
    await recoveryPage.send('Page.navigate',{url:recoveryLink}); await pathname(recoveryPage,'/update-password');
    await fill(recoveryPage,'[name=password]',newPassword); await fill(recoveryPage,'[name=passwordConfirmation]',password);
    await click(recoveryPage,'form button[type=submit]');
    await until(()=>recoveryPage.evaluate(`document.querySelector('[role=alert]')?.textContent.includes('Passwords do not match')`),'mismatched password refusal');
    await fill(recoveryPage,'[name=password]',newPassword); await fill(recoveryPage,'[name=passwordConfirmation]',newPassword);
    await click(recoveryPage,'form button[type=submit]'); await pathname(recoveryPage,'/login');
    await until(()=>recoveryPage.evaluate(`document.body.innerText.includes('Password updated successfully.')`),'password update confirmation');
    const verifier=createClient(apiUrl,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    assert.ok((await verifier.auth.signInWithPassword({email:recoveryAccount.email,password})).error,'Old password must fail');
    await data(verifier.auth.signInWithPassword({email:recoveryAccount.email,password:newPassword})); await data(verifier.auth.signOut({scope:'local'}));
    await login(recoveryPage,recoveryAccount.email,newPassword); await pathname(recoveryPage,'/profile'); await onboard(recoveryPage,'Recovery');
    await click(recoveryPage,'button[aria-label="Sign out"]'); await pathname(recoveryPage,'/login');
  });
  await check('Missing, invalid and replayed reset links cannot establish signed-out password-change sessions', async () => {
    for(const url of [`${appUrl}/auth/confirm?type=recovery`,`${appUrl}/auth/confirm?type=recovery&token_hash=invalid-synthetic-token`,`${appUrl}/auth/callback?next=/update-password`,`${appUrl}/auth/callback?next=/update-password&code=invalid-synthetic-code`,recoveryLink]) {
      await recoveryPage.send('Page.navigate',{url}); await pathname(recoveryPage,'/forgot-password');
      await until(()=>recoveryPage.evaluate(`!!document.querySelector('[role=alert]')`),'invalid reset feedback');
      await visit(recoveryPage,'/update-password'); await pathname(recoveryPage,'/login');
      await visit(recoveryPage,'/dashboard'); await pathname(recoveryPage,'/login');
    }
  });
  await check('Expired reset email is refused and leaves the existing password and anonymous boundary intact', async () => {
    const expiredLink=await requestRecovery();
    assert.ok(users.includes(recoveryAccount.id)); assert.match(recoveryAccount.id,/^[0-9a-f-]{36}$/);
    execFileSync('docker',['exec','supabase_db_afghan-hub-local-journey','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-c',`UPDATE auth.users SET recovery_sent_at=now()-interval '2 hours' WHERE id='${recoveryAccount.id}';`],{stdio:'ignore'});
    await recoveryPage.send('Page.navigate',{url:expiredLink}); await pathname(recoveryPage,'/forgot-password');
    await until(()=>recoveryPage.evaluate(`!!document.querySelector('[role=alert]')`),'expired reset feedback');
    await visit(recoveryPage,'/update-password'); await pathname(recoveryPage,'/login');
    const verifier=createClient(apiUrl,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    await data(verifier.auth.signInWithPassword({email:recoveryAccount.email,password:newPassword})); await data(verifier.auth.signOut({scope:'local'}));
    await captureState(recoveryPage,'expired-reset-refused');
  });
  await check('A newer reset request invalidates the older email and completes with the current link', async () => {
    const older=await requestRecovery(); await delay(1100);
    const newer=await requestRecovery(); assert.notEqual(newer,older);
    await recoveryPage.send('Page.navigate',{url:older}); await pathname(recoveryPage,'/forgot-password');
    await until(()=>recoveryPage.evaluate(`!!document.querySelector('[role=alert]')`),'superseded reset feedback');
    await visit(recoveryPage,'/update-password'); await pathname(recoveryPage,'/login');
    await recoveryPage.send('Page.navigate',{url:newer}); await pathname(recoveryPage,'/update-password');
    const replacement=`QA-${randomUUID()}-cC3!`;
    await fill(recoveryPage,'[name=password]',replacement); await fill(recoveryPage,'[name=passwordConfirmation]',replacement);
    await click(recoveryPage,'form button[type=submit]'); await pathname(recoveryPage,'/login');
    await until(()=>recoveryPage.evaluate(`document.body.innerText.includes('Password updated successfully.')`),'newest reset changes password');
    const verifier=createClient(apiUrl,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    assert.ok((await verifier.auth.signInWithPassword({email:recoveryAccount.email,password:newPassword})).error);
    await data(verifier.auth.signInWithPassword({email:recoveryAccount.email,password:replacement})); await data(verifier.auth.signOut({scope:'local'}));
    newPassword=replacement;
  });
  await check('Separate-context recovery changes the password and replay cannot restore the signed-out session', async () => {
    const link=await requestRecovery(), receiver=await page();
    assert.notEqual(receiver.browserContextId,recoveryPage.browserContextId);
    const head=await fetch(link,{method:'HEAD',redirect:'manual'}); assert.equal(head.status,405);
    assert.match(head.headers.get('cache-control'),/no-store/);
    const wrongType=new URL(link); wrongType.searchParams.set('type','signup');
    await receiver.send('Page.navigate',{url:wrongType.href}); await pathname(receiver,'/login');
    await visit(receiver,'/update-password'); await pathname(receiver,'/login');
    const maliciousNext=new URL(link); maliciousNext.searchParams.set('next','https://example.invalid');
    await receiver.send('Page.navigate',{url:maliciousNext.href}); await pathname(receiver,'/update-password');
    assert.equal(await receiver.evaluate('location.origin'),appUrl);
    await captureState(receiver,'separate-recovery-password-form');
    const replacement=`QA-${randomUUID()}-dD4!`;
    await fill(receiver,'[name=password]',replacement); await fill(receiver,'[name=passwordConfirmation]',replacement);
    await click(receiver,'form button[type=submit]'); await pathname(receiver,'/login');
    await until(()=>receiver.evaluate(`document.body.innerText.includes('Password updated successfully.')`),'cross-context password update');
    const verifier=createClient(apiUrl,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    assert.ok((await verifier.auth.signInWithPassword({email:recoveryAccount.email,password:newPassword})).error,'Prior password must fail after cross-context recovery');
    await data(verifier.auth.signInWithPassword({email:recoveryAccount.email,password:replacement})); await data(verifier.auth.signOut({scope:'local'}));
    newPassword=replacement;
    await receiver.send('Page.navigate',{url:link}); await pathname(receiver,'/forgot-password');
    await until(()=>receiver.evaluate(`!!document.querySelector('[role=alert]')`),'replayed cross-context recovery refused');
    await visit(receiver,'/update-password'); await pathname(receiver,'/login');
    await visit(recoveryPage,'/dashboard'); await pathname(recoveryPage,'/login');
    await login(receiver,recoveryAccount.email,replacement); await pathname(receiver,'/dashboard');
    await captureState(receiver,'separate-recovery-completed');
    await click(receiver,'button[aria-label="Sign out"]'); await pathname(receiver,'/login');
  await check('Separate-context recovery refuses PKCE exchange without a verifier and cannot change the password', async () => {
    const link=await requestRecovery(), receiver=await page();
    assert.notEqual(receiver.browserContextId,recoveryPage.browserContextId);
    await receiver.send('Page.navigate',{url:link}); await pathname(receiver,'/forgot-password');
    await until(()=>receiver.evaluate(`!!document.querySelector('[role=alert]')`),'separate reset feedback');
    await visit(receiver,'/update-password'); await pathname(receiver,'/login');
    const verifier=createClient(apiUrl,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    await data(verifier.auth.signInWithPassword({email:recoveryAccount.email,password:newPassword})); await data(verifier.auth.signOut({scope:'local'}));
    await captureState(receiver,'separate-recovery-refused');
  });
  await check('Duplicate signup preserves one account and expired confirmation cannot create a session', async () => {
    const requester=await page(), email=`browser-${stamp}-duplicate-signup@example.invalid`;
    await visit(requester,'/login?mode=join'); await fill(requester,'[name=email]',email); await fill(requester,'[name=password]',password);
    await click(requester,'#join button[type=submit]');
    await until(()=>requester.evaluate(`document.body.innerText.includes('Account created.')`),'first duplicate signup notice');
    const row=(await data(admin.auth.admin.listUsers())).users.find(user=>user.email===email); assert.ok(row); users.push(row.id);
    const oldInbox=await (await fetch(`${mailUrl}/api/v1/messages`,{redirect:'error'})).json();
    await delay(1100); // Disposable Auth max_frequency is one second; do not conflate resend throttling with identity duplication.
    await visit(requester,'/login?mode=join'); await fill(requester,'[name=email]',email); await fill(requester,'[name=password]',password);
    await click(requester,'#join button[type=submit]');
    await until(()=>requester.evaluate(`document.body.innerText.includes('Account created.')`),'duplicate signup notice');
    const duplicates=(await data(admin.auth.admin.listUsers())).users.filter(user=>user.email===email);
    assert.equal(duplicates.length,1); assert.equal(duplicates[0].id,row.id);
    const link=await deliveredConfirmation(email,'signup',oldInbox.messages.map(message=>message.ID));
    assert.ok(users.includes(row.id)); assert.match(row.id,/^[0-9a-f-]{36}$/);
    execFileSync('docker',['exec','supabase_db_afghan-hub-local-journey','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-c',`UPDATE auth.users SET confirmation_sent_at=now()-interval '2 hours' WHERE id='${row.id}';`],{stdio:'ignore'});
    await requester.send('Page.navigate',{url:link}); await pathname(requester,'/login');
    await until(()=>requester.evaluate(`!!document.querySelector('[role=alert]')`),'expired signup feedback');
    assert.ok(!(await data(admin.auth.admin.getUserById(row.id))).user.email_confirmed_at);
    await visit(requester,'/dashboard'); await pathname(requester,'/login');
  });
  await check('Sign-out clears browser access while the other account remains signed in', async () => {
    await click(pageA, 'button[aria-label="Sign out"]'); await pathname(pageA, '/login');
    await visit(pageA, '/dashboard'); await pathname(pageA, '/login'); await visit(pageB, '/dashboard'); await pathname(pageB, '/dashboard');
  });
  await check('Replayed confirmation cannot restore a signed-out browser session', async () => {
    await pageA.send('Page.navigate', {url:confirmationLink}); await pathname(pageA, '/login');
    await until(() => pageA.evaluate(`!!document.querySelector('[role=alert]')`), 'used confirmation feedback'); await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
  });
} catch (error) {
  results.push({ scenario, status: 'fail', diagnostic: { step, type: error.name, line: error.stack?.match(/local-member-browser\.mjs:(\d+)/)?.[1], failureInjection: error.evidence } });
  const states = [];
  if(pages[0]) {
    try {results.at(-1).navigator=await pages[0].evaluate(`(() => {const d=document.querySelector('dialog[open]');const t=[...document.querySelectorAll('dialog[open] article')].at(-1);return {open:!!d,language:d?.getAttribute('lang'),inputLength:d?.querySelector('input')?.value.length,submitEnabled:d?.querySelector('button[type=submit]')?.disabled===false,turns:d?.querySelectorAll('article').length,latestText:t?.innerText.slice(0,600),links:[...t?.querySelectorAll('a')??[]].map(a=>a.getAttribute('href')),runtimeErrors:${JSON.stringify(pages[0].exceptions)}};})()`);await captureState(pages[0],'failed-scenario');}catch{}
  }
  if (expectedListingPath) {
    try { results.at(-1).ownerFeedback = await pages[0].evaluate(`({route:location.pathname, cardCount:document.querySelectorAll('main article').length, expectedLink:!!document.querySelector(${JSON.stringify(`a[href="${expectedListingPath}"]`)}), expectedCard:document.querySelector(${JSON.stringify(`article:has(a[href="${expectedListingPath}"])`)})?.innerText.replace(/Synthetic[^\\n]*/g,'[synthetic title]'), unavailable:[...document.querySelectorAll('main [role=status]')].map(node=>node.textContent)})`); } catch { /* Sanitized optional diagnosis */ }
  }
  for (const page of pages) {
    try { states.push({telemetry:page.telemetry,dom:await page.evaluate(`({ready:document.readyState,heading:document.querySelector('main h1')?.textContent?.trim().replace(/Synthetic[^\\n]*/g,'[synthetic title]'),alert:!!document.querySelector('[role=alert]'),moderationForm:!!document.querySelector('[name=entity_id]'),unavailableListing:document.querySelector('main h1')?.textContent.includes('couldn’t load'),notFound:document.querySelector('main h1')?.textContent.includes('available'),route:location.pathname.replace(/browser-[^/]+/g,'[synthetic-slug]'),composer:!!document.querySelector('textarea[name=message]'),errorBoundary:document.body.innerText.includes('Something went wrong')})`)}); } catch { states.push({unavailable:true}); }
  }
  results.at(-1).browserStates = states;
  if (fixtureB && conversationId) {
    try {
      const notifications = await data(admin.from('notifications').select('id,read_at').eq('recipient_id', fixtureB).eq('conversation_id', conversationId));
      const messages = await data(admin.from('messages').select('id').eq('conversation_id', conversationId));
      results.at(-1).databaseState = { notifications: notifications.length, unread: notifications.filter(row=>!row.read_at).length, messages: messages.length };
    } catch { /* Never expose provider payloads */ }
  }
  console.error(`FAIL ${scenario} at ${step}; diagnostic: ${JSON.stringify(results.at(-1).diagnostic)}`); process.exitCode = 1;
} finally {
  receiverNetwork.offline=false;
  for(const socket of receiverNetwork.sockets)socket.destroy();
  receiverProxy.closeAllConnections();receiverProxy.close();
  for (const page of pages) page.close(); browser?.close();
  for (const child of children) if (child.exitCode === null) child.kill();
  await delay(300);
  if (profile) await fs.rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  try {
    for (const {table,id} of [...listings].reverse()) await data(admin.from(table).delete().eq('id',id));
    for (const id of users) await data(admin.auth.admin.deleteUser(id));
    results.push({ scenario: 'Cleanup captured synthetic account IDs', status: 'pass' });
  } catch { results.push({ scenario: 'Cleanup captured synthetic account IDs', status: 'fail' }); process.exitCode = 1; }
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/local-member-browser.json', JSON.stringify({ sourceRevision, sourceTree, environment: 'disposable loopback Supabase and production Next.js server; sandboxed Chrome', results, reconnectEvidence, limitations: ['Email delivery uses disposable local Mailpit and reviewed token-hash templates; external SMTP/deliverability, physical-device compatibility and hosted template activation remain unverified', 'Business and organization deletion UI is absent; native-language review remains pending', ...(results.some(result=>result.scenario==='Background conversation stays unread and both sender tabs receive the real read receipt' && result.status==='pass') ? [] : ['Multi-tab read receipts have not passed in this run']), ...(results.some(row=>row.scenario==='Admin role form promotes and demotes a synthetic member with existing-session authorization' && row.status==='pass') ? [] : ['Admin team role mutations have not passed in this run']), 'No production, hosted test target or model provider calls'] }, null, 2) + '\n');
  writeFileSync('reports/local-member-browser.json', JSON.stringify({ sourceRevision, sourceTree, environment: 'disposable loopback Supabase and production Next.js server; sandboxed Chrome', results, reconnectEvidence, limitations: ['Email delivery uses disposable local Mailpit; external SMTP/deliverability is unverified. Separate-context signup requires explicit sign-in because its PKCE verifier stays with the requesting browser; separate-context recovery fails closed without its PKCE verifier and is not a successful cross-device recovery flow', 'Business and organization deletion UI is absent; native-language review remains pending', ...(results.some(result=>result.scenario==='Background conversation stays unread and both sender tabs receive the real read receipt' && result.status==='pass') ? [] : ['Multi-tab read receipts have not passed in this run']), ...(results.some(row=>row.scenario==='Admin role form promotes and demotes a synthetic member with existing-session authorization' && row.status==='pass') ? [] : ['Admin team role mutations have not passed in this run']), 'No production, hosted test target or model provider calls'] }, null, 2) + '\n');
  console.log(`${results.filter(r => r.status === 'pass').length} passed; ${results.filter(r => r.status === 'fail').length} failed`);
  // Only complete successful disposable runs emit review images; never auth
  // state, provider payloads or hosted-account screenshots. These bytes let
  // reviewers view evidence without relaxing Preview deployment protection.
  console.log('QA_SANITIZED_SUMMARY '+JSON.stringify({sourceRevision,sourceTree,results:results.map(row=>({scenario:row.scenario,status:row.status,diagnostic:row.diagnostic,navigator:row.navigator,browserStates:row.browserStates?.map(state=>state.dom)})),recoveryStates:results.recoveryStates??[]}));
  for(const item of reviewImages) console.log('QA_REVIEW_IMAGE '+JSON.stringify({sourceRevision,sourceTree,acceptanceFailed:results.some(row=>row.status==='fail'),label:item.label,width:item.width,data:readFileSync(item.file).toString('base64')}));
}
