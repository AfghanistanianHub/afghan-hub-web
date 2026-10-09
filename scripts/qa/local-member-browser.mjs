import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { execFileSync, spawn } from 'node:child_process';
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
const chromePath = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome'].find(existsSync);
assert.ok(chromePath, 'The Linux CI runner must provide sandboxed Chrome');
const users = [], pages = [], children = [], results = [], listings = [];
const password = `QA-${randomUUID()}-aA1!`;
const stamp = randomUUID().slice(0, 8);
let browser, profile, fixtureB, conversationId, confirmationLink, step = 'prerequisites', scenario = 'prerequisites';
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
async function page() {
  const { browserContextId } = await browser.send('Target.createBrowserContext');
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank', browserContextId });
  const connection = new DevTools();
  await connection.connect(`ws://127.0.0.1:${browser.port}/devtools/page/${targetId}`);
  connection.telemetry = { sockets: 0, frames: 0, socketErrors: 0, systems: [], replies: [], changes: 0, authenticatedJoins: 0, anonymousJoins: 0 };
  connection.socket.addEventListener('message', event => {
    const packet = JSON.parse(event.data);
    if (packet.method === 'Network.webSocketCreated') connection.telemetry.sockets++;
    if (packet.method === 'Network.webSocketFrameReceived' || packet.method === 'Network.webSocketFrameSent') {
      try {
        const decoded = JSON.parse(packet.params.response.payloadData);
        const frame = Array.isArray(decoded) ? {event:decoded[3],payload:decoded[4]} : decoded;
        if (packet.method === 'Network.webSocketFrameReceived') {
          connection.telemetry.frames++;
          if(frame.event === 'system') connection.telemetry.systems.push({extension:frame.payload.extension,status:frame.payload.status,permissionError:/permission|unauthoriz/i.test(frame.payload.message ?? ''),databaseError:/database|connect/i.test(frame.payload.message ?? '')});
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
  await connection.send('Runtime.enable');
  await connection.send('Network.enable');
  await connection.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  return connection;
}
async function visit(page, path) {
  assert.ok(path.startsWith('/') && !path.startsWith('//'));
  const navigation = await page.send('Page.navigate', { url: appUrl + path });
  if (navigation.loaderId) await until(() => page.loadedDocuments.has(navigation.loaderId), 'requested document loaded');
  await page.send('Page.navigate', { url: appUrl + path });
  await until(() => page.evaluate(`location.origin===${JSON.stringify(appUrl)} && document.readyState==='complete'`), 'local page');
}
async function pathname(page, path) {
  await until(() => page.evaluate(`location.pathname===${JSON.stringify(path)}`), 'expected route');
}
async function fill(page, selector, value) {
  const fieldSelector = selector.startsWith('form') ? selector : `form ${selector}`;
  const fieldSelector = `form ${selector}`;
  await until(() => page.evaluate(`!!document.querySelector(${JSON.stringify(fieldSelector)})`), 'form field');
  await page.evaluate(`(() => { const field=document.querySelector(${JSON.stringify(fieldSelector)}); field.focus(); Object.getOwnPropertyDescriptor(field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,'value').set.call(field,${JSON.stringify(value)}); field.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
}
async function click(page, selector) {
  await page.send('Page.bringToFront');
  const point = await until(() => page.evaluate(`(() => { const target=document.querySelector(${JSON.stringify(selector)}); if(!target || target.disabled)return null; target.scrollIntoView({block:'center'}); const r=target.getBoundingClientRect(); return r.width && r.height ? {x:r.x+r.width/2,y:r.y+r.height/2}:null; })()`), 'clickable control');
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function select(page, selector, value) {
  await until(() => page.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), 'select field');
  await page.evaluate(`(() => { const field=document.querySelector(${JSON.stringify(selector)}); field.value=${JSON.stringify(value)}; field.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
}
async function eventStart(page) {
  await click(page, 'button[aria-label^="Select start date & time:"]');
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
  await fill(page, '[name=first_name]', 'Synthetic');
  await fill(page, '[name=last_name]', name);
  await fill(page, '[name=city]', 'Vancouver');
  await click(page, 'form:has([name=first_name]) button[type=submit]');
  await pathname(page, '/dashboard');
}
async function deliveredConfirmation(email) {
  const summary = await until(async () => {
    const response = await fetch(`${mailUrl}/api/v1/messages`, {redirect:'error'});
    assert.ok(response.ok);
    const inbox = await response.json();
    return inbox.messages.find(message => message.To?.some(to => to.Address === email));
  }, 'local confirmation email delivered');
  const response = await fetch(`${mailUrl}/api/v1/message/${encodeURIComponent(summary.ID)}`, {redirect:'error'});
  assert.ok(response.ok);
  const message = await response.json();
  assert.ok(message.To.some(to => to.Address === email));
  const links = [...message.HTML.matchAll(/href=["']([^"']+)["']/g)].map(match => match[1].replaceAll('&amp;', '&'));
  const link = links.map(value => new URL(value)).find(url => url.origin === apiUrl && url.pathname === '/auth/v1/verify');
  assert.ok(link, 'Email must contain the loopback Auth verification URL');
  assert.equal(link.searchParams.get('type'), 'signup');
  assert.equal(link.searchParams.get('redirect_to'), `${appUrl}/auth/callback?next=/dashboard&flow=signup`);
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
    await pageA.evaluate(`localStorage.setItem('afghan-hub-navigator-language','fa-AF')`);
    await visit(pageA, '/');
    await until(() => pageA.evaluate(`document.querySelector('#ai-navigator select')?.value==='fa' && document.querySelector('#ai-navigator')?.getAttribute('dir')==='rtl'`), 'legacy preference hydrated');
    assert.deepEqual(await pageA.evaluate(`[...document.querySelectorAll('#ai-navigator select option')].map(node=>node.value)`), ['en','fa','ps']);
    assert.equal(await pageA.evaluate(`localStorage.getItem('afghan-hub-navigator-language')`), 'fa');
    await select(pageA, '#ai-navigator select', 'ps');
    await until(() => pageA.evaluate(`document.querySelector('#ai-navigator')?.getAttribute('lang')==='ps' && document.querySelector('#ai-navigator')?.getAttribute('dir')==='rtl'`), 'Pashto RTL');
    await select(pageA, '#ai-navigator select', 'en');
  const pageA = await page(), pageB = await page();
  await check('Chrome renderer sandbox enabled', async () => {
    await pageA.send('Page.navigate', { url: 'chrome://sandbox' });
    await until(() => pageA.evaluate(`/Seccomp-BPF sandbox\\s+Yes/.test(document.body?.innerText ?? '')`), 'renderer sandbox');
  });
  await check('Served callback redirects use configured origin despite upstream Host', async () => {
    const upstream = requireLocalTarget('http://127.0.0.1:3100', 3100);
    for (const flow of ['signup', 'recovery']) {
      const response = await fetch(`${upstream}/auth/callback?flow=${flow}&next=https%3A%2F%2Fexample.invalid`, {redirect:'manual', headers:{host:'upstream.internal:3100'}});
      const response = await fetch(`${upstream}/auth/callback?flow=${flow}&next=https%3A%2F%2Fexample.invalid`, {
        redirect:'manual', headers:{host:'upstream.internal:3100'},
      });
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
      await visit(pageA, `/auth/callback?${query}`);
      await pathname(pageA, '/login');
      await until(() => pageA.evaluate(`location.origin===${JSON.stringify(appUrl)} && !!document.querySelector('[role=alert]') && document.body.innerText.includes('confirmation link is invalid or has expired')`), 'invalid confirmation feedback');
      await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
    }
  });
  await check('Real signup, local email delivery and PKCE callback establish the browser session', async () => {
    await visit(pageA, '/login?mode=join');
    await fill(pageA, '[name=email]', a.email); await fill(pageA, '[name=password]', password);
    await fill(pageA, '[name=email]', a.email);
    await fill(pageA, '[name=password]', password);
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
    assert.ok(user); a.id = user.id; users.push(user.id);
    assert.ok(!user.email_confirmed_at);
    await login(pageA, a.email);
    await until(() => pageA.evaluate(`location.pathname==='/login' && !!document.querySelector('[role=alert]')`), 'unconfirmed sign-in refused');
    confirmationLink = await deliveredConfirmation(a.email);
    // Navigate the authentic delivered link in the registering browser, which
    // retains the PKCE verifier cookie; never fabricate a session or auth link.
    await pageA.send('Page.navigate', {url:confirmationLink});
    await pathname(pageA, '/profile');
    const confirmed = await data(admin.auth.admin.getUserById(a.id));
    assert.ok(confirmed.user.email_confirmed_at);
  });
  await check('Real sign-in and onboarding forms persist both synthetic profiles', async () => {
    for (const [page, user, label] of [[pageA, a, 'MemberA'], [pageB, b, 'MemberB']]) {
      if (user !== a) await login(page, user.email);
      await onboard(page, label);
      const row = await data(admin.from('profiles').select('onboarding_completed,first_name,last_name').eq('id', user.id).single());
      assert.equal(row.onboarding_completed, true); assert.equal(row.last_name, label);
    }
  });
  await check('Member Navigator exposes the same three languages and RTL without changing profile languages', async () => {
    await click(pageA, 'button[aria-haspopup="dialog"][aria-expanded="false"]:has(svg.lucide-compass)');
    await until(() => pageA.evaluate(`document.querySelectorAll('dialog[open] button[aria-pressed]').length===3`), 'member language choices');
    await click(pageA, 'dialog[open] button[aria-pressed]:nth-child(2)');
    await until(() => pageA.evaluate(`document.querySelector('dialog[open]')?.getAttribute('lang')==='fa' && document.querySelector('dialog[open]')?.getAttribute('dir')==='rtl'`), 'member Persian RTL');
    await click(pageA, 'dialog[open] button[aria-pressed]:first-child');
    await click(pageA, 'dialog[open] button[aria-label="Close Community Navigator"]');
  });
  await check('Cookie sessions survive reload and remain separate', async () => {
    for (const [page, label] of [[pageA, 'MemberA'], [pageB, 'MemberB']]) {
      await visit(page, '/profile'); await page.send('Page.reload');
  await check('Cookie sessions survive reload and remain separate', async () => {
    for (const [page, label] of [[pageA, 'MemberA'], [pageB, 'MemberB']]) {
      await visit(page, '/profile');
      await page.send('Page.reload');
      await until(() => page.evaluate(`location.pathname==='/profile' && document.readyState==='complete' && document.querySelector('[name=last_name]')?.value===${JSON.stringify(label)}`), 'persisted own-profile identity');
      await visit(page, '/dashboard'); await pathname(page, '/dashboard');
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
    await visit(pageA, `/members/${b.id}`);
    await click(pageA, 'form:has([name=recipient_id]) button[type=submit]');
    await until(() => pageA.evaluate(`document.body.innerText.includes('Request sent')`), 'pending connection');
    await visit(pageB, '/network');
    await click(pageB, 'button[name=decision][value=accepted]');
    await until(() => pageB.evaluate(`document.body.innerText.includes('My connections')`), 'accepted connection');
    await visit(pageA, `/members/${b.id}`);
    await click(pageA, 'form:has([name=member_id]) button[type=submit]');
    await until(() => pageA.evaluate(`!!document.querySelector('textarea[name=message]')`), 'conversation composer');
  });
  const conversationPath = await pageA.evaluate('location.pathname');
  assert.match(conversationPath, /^\/messages\/[0-9a-f-]{36}$/);
  conversationId = conversationPath.split('/').at(-1);
  await check('Realtime unread notification and notification navigation', async () => {
    await visit(pageB, '/dashboard');
    const before = await pageB.evaluate(`Number(document.querySelector('button[aria-controls][aria-haspopup=dialog][aria-label^="Notifications"]')?.getAttribute('aria-label')?.match(/([0-9]+) unread/)?.[1] ?? 0)`);
    await send(pageA, message('notification'));
    await until(() => pageB.evaluate(`Number(document.querySelector('button[aria-label^="Notifications"]')?.getAttribute('aria-label')?.match(/([0-9]+) unread/)?.[1] ?? 0)>${before}`), 'realtime unread badge');
    await click(pageB, 'button[aria-label^="Notifications"]');
    const rows = await data(admin.from('notifications').select('id').eq('recipient_id', b.id).eq('conversation_id', conversationId)); assert.ok(rows.length);
    await click(pageB, `form:has(input[name=notification_id][value="${rows[0].id}"]) button[type=submit]`); await pathname(pageB, conversationPath);
    await until(() => pageB.evaluate(`document.body.innerText.includes(${JSON.stringify(message('notification'))})`), 'notification conversation');
  });
  for (const [table, titleField, ownerField] of [['organizations','name','owner_id'],['opportunities','title','author_id'],['events','title','creator_id']]) {
    await check(`${table}: owner create/edit, draft privacy and foreign edit boundary through browser`, async () => {
      const title = `Synthetic ${stamp} ${table}`; await visit(pageA, `/${table}/new`); await fill(pageA, `[name=${titleField}]`, title);
      if (table === 'organizations') await fill(pageA, '[name=short_description]', 'Synthetic organization summary');
      else {
        await fill(pageA, '[name=summary]', 'Synthetic listing summary'); await fill(pageA, '[name=description]', 'Synthetic listing description for isolated browser verification.');
        if (table === 'opportunities') await select(pageA, '[name=type]', 'volunteer'); else await eventStart(pageA);
      }
      await click(pageA, `form:has([name=${titleField}]) button[type=submit]`);
      const row = await listingRow(table, titleField, title); listings.push({table, id:row.id}); assert.equal(row[ownerField], a.id); assert.equal(row.status, 'draft');
      const path = `/${table}/${row.slug}`; await pathname(pageA, path);
    const rows = await data(admin.from('notifications').select('id').eq('recipient_id', b.id).eq('conversation_id', conversationPath.split('/').at(-1)));
    assert.ok(rows.length);
    await click(pageB, `form:has(input[name=notification_id][value="${rows[0].id}"]) button[type=submit]`);
    await pathname(pageB, conversationPath);
    await until(() => pageB.evaluate(`document.body.innerText.includes(${JSON.stringify(message('notification'))})`), 'notification conversation');
  });
  await check('Live conversation delivery and offline reconnect catch-up without reload', async () => {
    await send(pageA, message('live'));
    await until(() => pageB.evaluate(`document.body.innerText.includes(${JSON.stringify(message('live'))})`), 'live message');
    await pageB.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await delay(500);
    await send(pageA, message('offline'));
    await delay(500);
    assert.equal(await pageB.evaluate(`document.body.innerText.includes(${JSON.stringify(message('offline'))})`), false, 'Offline browser must miss this message before reconnect');
    await pageB.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await until(() => pageB.evaluate(`document.body.innerText.includes(${JSON.stringify(message('offline'))})`), 'reconnect catch-up', 35000);
  });
  for (const [table, titleField, ownerField] of [
    ['organizations', 'name', 'owner_id'],
    ['opportunities', 'title', 'author_id'],
    ['events', 'title', 'creator_id'],
  ]) {
    await check(`${table}: owner create/edit, draft privacy and foreign edit boundary through browser`, async () => {
      const title = `Synthetic ${stamp} ${table}`;
      await visit(pageA, `/${table}/new`);
      await fill(pageA, `[name=${titleField}]`, title);
      if (table === 'organizations') await fill(pageA, '[name=short_description]', 'Synthetic organization summary');
      else {
        await fill(pageA, '[name=summary]', 'Synthetic listing summary');
        await fill(pageA, '[name=description]', 'Synthetic listing description for isolated browser verification.');
        if (table === 'opportunities') await select(pageA, '[name=type]', 'volunteer');
        else await eventStart(pageA);
      }
      await click(pageA, `form:has([name=${titleField}]) button[type=submit]`);
      const row = await listingRow(table, titleField, title);
      listings.push({table, id:row.id});
      assert.equal(row[ownerField], a.id); assert.equal(row.status, 'draft');
      const path = `/${table}/${row.slug}`;
      await pathname(pageA, path);
      await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(title)})`), 'owner draft detail');
      const unavailableHeading = table === 'organizations' ? 'Organization not found' : 'This page isn’t available.';
      await visit(pageB, path);
      await until(() => pageB.evaluate(`document.querySelector('main h1')?.textContent.trim()===${JSON.stringify(unavailableHeading)} && !document.querySelector('main')?.innerText.includes(${JSON.stringify(title)})`), 'foreign draft hidden');
      await visit(pageB, `${path}/edit`);
      await until(() => pageB.evaluate(`document.querySelector('main h1')?.textContent.trim()===${JSON.stringify(unavailableHeading)} && !document.querySelector(${JSON.stringify(`[name=${titleField}]`)})`), 'foreign edit refused');
      await visit(pageA, `${path}/edit`); const edited = `${title} edited`; await fill(pageA, `[name=${titleField}]`, edited); await click(pageA, `form:has([name=${titleField}]) button[type=submit]`); await pathname(pageA, path);
      const saved = await listingRow(table, titleField, edited); assert.equal(saved.id, row.id); assert.equal(saved.status, 'draft');
      await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(edited)})`), 'edited listing detail');
      // Organizations have no delete UI; API deletion is covered separately.
      if (table !== 'organizations') {
        const deleteButton = `form:has(input[name=slug][value="${row.slug}"]) button[type=submit]`; let dialogs = 0;
        const handler = event => { const packet = JSON.parse(event.data); if (packet.method === 'Page.javascriptDialogOpening') { dialogs++; void pageA.send('Page.handleJavaScriptDialog', {accept: dialogs > 1}); } };
        pageA.socket.addEventListener('message', handler);
        try {
          await click(pageA, deleteButton); await until(() => dialogs === 1, 'cancel delete confirmation');
          await until(() => pageA.evaluate(`!!document.querySelector(${JSON.stringify(deleteButton)})`), 'cancel leaves owner detail');
          assert.equal((await data(admin.from(table).select('id').eq('id',row.id))).length, 1);
          await click(pageA, deleteButton); await pathname(pageA, `/${table}`); assert.equal(dialogs, 2); assert.equal((await data(admin.from(table).select('id').eq('id',row.id))).length, 0);
      await visit(pageA, `${path}/edit`);
      const edited = `${title} edited`;
      await fill(pageA, `[name=${titleField}]`, edited);
      await click(pageA, `form:has([name=${titleField}]) button[type=submit]`);
      await pathname(pageA, path);
      const saved = await listingRow(table, titleField, edited);
      assert.equal(saved.id, row.id); assert.equal(saved.status, 'draft');
      await until(() => pageA.evaluate(`document.querySelector('main')?.innerText.includes(${JSON.stringify(edited)})`), 'edited listing detail');
      // Organizations have no delete UI; API deletion is covered separately.
      if (table !== 'organizations') {
        const deleteButton = `form:has(input[name=slug][value="${row.slug}"]) button[type=submit]`;
        let dialogs = 0;
        const handler = event => {
          const packet = JSON.parse(event.data);
          if (packet.method === 'Page.javascriptDialogOpening') {
            dialogs++;
            void pageA.send('Page.handleJavaScriptDialog', {accept: dialogs > 1});
          }
        };
        pageA.socket.addEventListener('message', handler);
        try {
          await click(pageA, deleteButton);
          await until(() => dialogs === 1, 'cancel delete confirmation');
          await until(() => pageA.evaluate(`!!document.querySelector(${JSON.stringify(deleteButton)})`), 'cancel leaves owner detail');
          assert.equal((await data(admin.from(table).select('id').eq('id',row.id))).length, 1);
          await click(pageA, deleteButton);
          await pathname(pageA, `/${table}`);
          assert.equal(dialogs, 2);
          assert.equal((await data(admin.from(table).select('id').eq('id',row.id))).length, 0);
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
      assert.equal(await reviewerPage.evaluate(`!!document.querySelector('a[href="/moderation/team"]')`), role === 'admin');
      await visit(reviewerPage, '/moderation/team'); await pathname(reviewerPage, role === 'admin' ? '/moderation/team' : '/moderation');
    });
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
  if (process.env.LOCAL_QA_VISUAL === '1') {
    await check('Representative pages: desktop/mobile layout, global canvas and Navigator RTL', async () => {
      const visual = await page(pageA.browserContextId);
      const findings = [];
      mkdirSync('reports/visual', {recursive:true});
      for (const route of ['/login','/login?mode=join','/forgot-password','/update-password','/about','/profile','/dashboard','/network','/messages',conversationPath,'/businesses','/organizations','/opportunities','/events','/businesses/new','/organizations/new','/opportunities/new','/events/new','/not-a-real-page']) {
        await visit(visual,route);
        for (const width of [1440,390]) {
          await visual.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});
          const state = await visual.evaluate(`({route:location.pathname,overflow:document.documentElement.scrollWidth>innerWidth,canvas:!!document.querySelector('.global-network-background canvas'),rejectedArt:!!document.querySelector('[data-hero-layer="architecture"]'),heading:!!document.querySelector('main h1')})`);
          assert.equal(state.overflow,false,`Horizontal overflow: ${route} at ${width}`);
          assert.equal(state.canvas,true); assert.equal(state.rejectedArt,false);
          findings.push({requested:route===conversationPath?'/messages/[id]':route,width,...state,route:state.route.replace(/[0-9a-f-]{36}/g,'[id]')});
          const label=route===conversationPath?'conversation':route==='/login?mode=join'?'signup':route.slice(1).replaceAll('/','-');
          const screenshot=await visual.send('Page.captureScreenshot',{format:'png'});
          writeFileSync(`reports/visual/${label}-after-${width}.png`,Buffer.from(screenshot.data,'base64'));
        }
      }
      await visit(visual,'/');
      for (const locale of ['fa','ps']) {
        await select(visual,'#ai-navigator select',locale);
        await until(()=>visual.evaluate(`document.querySelector('#ai-navigator')?.getAttribute('lang')===${JSON.stringify(locale)} && document.querySelector('#ai-navigator')?.getAttribute('dir')==='rtl'`),'visual Navigator RTL');
        for(const width of [1440,390]) {
          await visual.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});
          await visual.evaluate(`document.querySelector('#ai-navigator').scrollIntoView({block:'center'})`);
          const screenshot=await visual.send('Page.captureScreenshot',{format:'png'});
          writeFileSync(`reports/visual/navigator-${locale}-after-${width}.png`,Buffer.from(screenshot.data,'base64'));
        }
      }
      writeFileSync('reports/visual/layout-checks.json',JSON.stringify(findings,null,2)+'\n');
    });
  }
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
  await check('Sign-out clears browser access while the other account remains signed in', async () => {
    await click(pageA, 'button[aria-label="Sign out"]'); await pathname(pageA, '/login');
    await visit(pageA, '/dashboard'); await pathname(pageA, '/login'); await visit(pageB, '/dashboard'); await pathname(pageB, '/dashboard');
  });
  await check('Replayed confirmation cannot restore a signed-out browser session', async () => {
    await pageA.send('Page.navigate', {url:confirmationLink}); await pathname(pageA, '/login');
    await until(() => pageA.evaluate(`!!document.querySelector('[role=alert]')`), 'used confirmation feedback'); await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
  await check('Sign-out clears browser access while the other account remains signed in', async () => {
    await click(pageA, 'button[aria-label="Sign out"]');
    await pathname(pageA, '/login');
    await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
    await visit(pageB, '/dashboard'); await pathname(pageB, '/dashboard');
  });
  await check('Replayed confirmation cannot restore a signed-out browser session', async () => {
    await pageA.send('Page.navigate', {url:confirmationLink});
    await pathname(pageA, '/login');
    await until(() => pageA.evaluate(`!!document.querySelector('[role=alert]')`), 'used confirmation feedback');
    await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
  });
} catch (error) {
  results.push({ scenario, status: 'fail', diagnostic: { step, type: error.name, line: error.stack?.match(/local-member-browser\.mjs:(\d+)/)?.[1] } });
  const states = [];
  if (expectedListingPath) {
    try { results.at(-1).ownerFeedback = await pages[0].evaluate(`({route:location.pathname, cardCount:document.querySelectorAll('main article').length, expectedLink:!!document.querySelector(${JSON.stringify(`a[href="${expectedListingPath}"]`)}), expectedCard:document.querySelector(${JSON.stringify(`article:has(a[href="${expectedListingPath}"])`)})?.innerText.replace(/Synthetic[^\\n]*/g,'[synthetic title]'), unavailable:[...document.querySelectorAll('main [role=status]')].map(node=>node.textContent)})`); } catch { /* Sanitized optional diagnosis */ }
  }
  for (const page of pages) {
    try { states.push({telemetry:page.telemetry,dom:await page.evaluate(`({ready:document.readyState,alert:!!document.querySelector('[role=alert]'),moderationForm:!!document.querySelector('[name=entity_id]'),unavailableListing:document.querySelector('main h1')?.textContent.includes('couldn’t load'),notFound:document.querySelector('main h1')?.textContent.includes('available'),route:location.pathname.replace(/browser-[^/]+/g,'[synthetic-slug]'),composer:!!document.querySelector('textarea[name=message]'),errorBoundary:document.body.innerText.includes('Something went wrong')})`)}); } catch { states.push({unavailable:true}); }
  for (const page of pages) {
    try { states.push({telemetry:page.telemetry,dom:await page.evaluate(`({width:innerWidth,ready:document.readyState,header:!!document.querySelector('header'),profileForm:!!document.querySelector('[name=last_name]'),loginForm:!!document.querySelector('#join'),errorBoundary:document.body.innerText.includes('Something went wrong'),applicationError:document.body.innerText.includes('Application error'),alert:!!document.querySelector('[role=alert]'),composer:!!document.querySelector('textarea[name=message]'),composerEmpty:document.querySelector('textarea[name=message]')?.value==='',messagePresent:document.body.textContent.includes(${JSON.stringify(message('notification'))}),bells:[...document.querySelectorAll('button[aria-label^=Notifications]')].map(node=>node.getAttribute('aria-label'))})`)}); } catch { states.push({unavailable:true}); }
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
      console.log('Fixture database counts: '+JSON.stringify(results.at(-1).databaseState));
    } catch { /* Never expose provider payloads */ }
  }
  console.error(`FAIL ${scenario} at ${step}; sanitized browser states: ${JSON.stringify(states)}`);
  process.exitCode = 1;
} finally {
  for (const page of pages) page.close();
  browser?.close();
  for (const child of children) if (child.exitCode === null) child.kill();
  await delay(300);
  if (profile) await fs.rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  try {
    for (const {table,id} of [...listings].reverse()) await data(admin.from(table).delete().eq('id',id));
    for (const id of users) await data(admin.auth.admin.deleteUser(id));
    results.push({ scenario: 'Cleanup captured synthetic account IDs', status: 'pass' });
  } catch { results.push({ scenario: 'Cleanup captured synthetic account IDs', status: 'fail' }); process.exitCode = 1; }
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/local-member-browser.json', JSON.stringify({ environment: 'disposable loopback Supabase and production Next.js server; sandboxed Chrome', results, reconnectEvidence, limitations: ['Email delivery is verified only with disposable local Mailpit; external SMTP/deliverability and cross-device confirmation remain untested', 'Organization deletion UI is absent; native-language review and multi-tab read receipts remain pending', 'Admin team role mutations are not tested; no production, hosted test target or model provider calls'] }, null, 2) + '\n');
  writeFileSync('reports/local-member-browser.json', JSON.stringify({ environment: 'disposable loopback Supabase and production Next.js server; sandboxed Chrome', results, limitations: ['Email delivery is verified only with disposable local Mailpit; external SMTP/deliverability and cross-device confirmation remain untested', 'Organization deletion UI is absent; moderator forms, native-language review and multi-tab read receipts remain pending', 'No production, hosted test target or model provider calls'] }, null, 2) + '\n');
  console.log(`${results.filter(r => r.status === 'pass').length} passed; ${results.filter(r => r.status === 'fail').length} failed`);
}
