import assert from 'node:assert/strict';
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
const admin = createClient(apiUrl, status.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const chromePath = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome'].find(existsSync);
assert.ok(chromePath, 'The Linux CI runner must provide sandboxed Chrome');
const users = [], pages = [], children = [], results = [], listings = [];
const password = `QA-${randomUUID()}-aA1!`;
const stamp = randomUUID().slice(0, 8);
let browser, profile, fixtureB, conversationId, step = 'prerequisites', scenario = 'prerequisites';
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
  await connection.send('Runtime.enable');
  await connection.send('Network.enable');
  await connection.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  return connection;
}
async function visit(page, path) {
  assert.ok(path.startsWith('/') && !path.startsWith('//'));
  await page.send('Page.navigate', { url: appUrl + path });
  await until(() => page.evaluate(`location.origin===${JSON.stringify(appUrl)} && document.readyState==='complete'`), 'local page');
}
async function pathname(page, path) {
  await until(() => page.evaluate(`location.pathname===${JSON.stringify(path)}`), 'expected route');
}
async function fill(page, selector, value) {
  const fieldSelector = `form ${selector}`;
  await until(() => page.evaluate(`!!document.querySelector(${JSON.stringify(fieldSelector)})`), 'form field');
  await page.evaluate(`(() => { const field=document.querySelector(${JSON.stringify(fieldSelector)}); field.focus(); Object.getOwnPropertyDescriptor(field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,'value').set.call(field,${JSON.stringify(value)}); field.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
}
async function click(page, selector) {
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
  const a = await member('a'), b = await member('b');
  fixtureB = b.id;
  const pageA = await page(), pageB = await page();
  await check('Chrome renderer sandbox enabled', async () => {
    await pageA.send('Page.navigate', { url: 'chrome://sandbox' });
    await until(() => pageA.evaluate(`/Seccomp-BPF sandbox\\s+Yes/.test(document.body?.innerText ?? '')`), 'renderer sandbox');
  });
  await check('Anonymous protected route redirects to sign-in', async () => {
    await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
  });
  await check('Wrong password shows accessible error and preserves auth boundary', async () => {
    await login(pageA, a.email, 'Incorrect-synthetic-password-1!');
    await until(() => pageA.evaluate(`location.pathname==='/login' && !!document.querySelector('[role=alert]')`), 'login error');
  });
  await check('Real sign-in and onboarding forms persist both synthetic profiles', async () => {
    for (const [page, user, label] of [[pageA, a, 'MemberA'], [pageB, b, 'MemberB']]) {
      await login(page, user.email); await onboard(page, label);
      const row = await data(admin.from('profiles').select('onboarding_completed,first_name,last_name').eq('id', user.id).single());
      assert.equal(row.onboarding_completed, true); assert.equal(row.last_name, label);
    }
  });
  await check('Cookie sessions survive reload and remain separate', async () => {
    for (const [page, label] of [[pageA, 'MemberA'], [pageB, 'MemberB']]) {
      await visit(page, '/profile');
      await page.send('Page.reload');
      await until(() => page.evaluate(`location.pathname==='/profile' && document.readyState==='complete' && document.querySelector('[name=last_name]')?.value===${JSON.stringify(label)}`), 'persisted own-profile identity');
      await visit(page, '/dashboard'); await pathname(page, '/dashboard');
    }
  });
  await check('Two-account connection request and acceptance through real forms', async () => {
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
  await check('Sign-out clears browser access while the other account remains signed in', async () => {
    await click(pageA, 'button[aria-label="Sign out"]');
    await pathname(pageA, '/login');
    await visit(pageA, '/dashboard'); await pathname(pageA, '/login');
    await visit(pageB, '/dashboard'); await pathname(pageB, '/dashboard');
  });
} catch (error) {
  results.push({ scenario, status: 'fail', diagnostic: { step, type: error.name, line: error.stack?.match(/local-member-browser\.mjs:(\d+)/)?.[1] } });
  const states = [];
  for (const page of pages) {
    try { states.push({telemetry:page.telemetry,dom:await page.evaluate(`({width:innerWidth,ready:document.readyState,header:!!document.querySelector('header'),profileForm:!!document.querySelector('[name=last_name]'),loginForm:!!document.querySelector('#join'),errorBoundary:document.body.innerText.includes('Something went wrong'),applicationError:document.body.innerText.includes('Application error'),alert:!!document.querySelector('[role=alert]'),composer:!!document.querySelector('textarea[name=message]'),composerEmpty:document.querySelector('textarea[name=message]')?.value==='',messagePresent:document.body.textContent.includes(${JSON.stringify(message('notification'))}),bells:[...document.querySelectorAll('button[aria-label^=Notifications]')].map(node=>node.getAttribute('aria-label'))})`)}); } catch { states.push({unavailable:true}); }
  }
  results.at(-1).browserStates = states;
  if (fixtureB && conversationId) {
    try {
      const notifications = await data(admin.from('notifications').select('id,read_at').eq('recipient_id', fixtureB).eq('conversation_id', conversationId));
      const messages = await data(admin.from('messages').select('id').eq('conversation_id', conversationId));
      results.at(-1).databaseState = { notifications: notifications.length, unread: notifications.filter(row=>!row.read_at).length, messages: messages.length };
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
  writeFileSync('reports/local-member-browser.json', JSON.stringify({ environment: 'disposable loopback Supabase and production Next.js server; sandboxed Chrome', results, limitations: ['Signup email delivery/callback not covered; fixtures are preconfirmed', 'Organization deletion UI is absent; moderator forms, native-language review and multi-tab read receipts remain pending', 'No production, hosted test target or model provider calls'] }, null, 2) + '\n');
  console.log(`${results.filter(r => r.status === 'pass').length} passed; ${results.filter(r => r.status === 'fail').length} failed`);
}
