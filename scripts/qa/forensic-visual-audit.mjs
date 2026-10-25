import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

// Reuse the repository QA's Playwright installation; never install into the app.
const { chromium } = await import(pathToFileURL(resolve(process.env.AUDIT_PLAYWRIGHT_MODULE ?? 'node_modules/playwright/index.mjs')));
const base = process.env.AUDIT_BASE_URL ?? 'https://app.apnbc.ca';
if (!['https://app.apnbc.ca', 'http://127.0.0.1:3100'].includes(base)) throw new Error('Unapproved audit target');
const out = 'docs/evidence/visual-audit-2026-10';
mkdirSync(`${out}/screenshots`, { recursive: true });
const widths = [320,375,390,430,768,1024,1280,1440,1920];
const locales = ['en','fa','ps'];
const sha = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
function walk(dir) { return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]); }
const files = walk('src/app');
const inventory = files.filter(f=>/(?:page\.tsx|route\.ts|loading\.tsx|(?:global-)?error\.tsx|not-found\.tsx|(?:robots|sitemap)\.ts|opengraph-image\.tsx)$/.test(f)).map(source=>{
 const route = '/' + relative('src/app',source).split('/').slice(0,-1).filter(s=>!s.startsWith('(')).join('/');
 const boundary = /(?:loading|error|not-found)\.tsx$/.test(source);
 const api = /route\.ts$/.test(source);
 const member = source.includes('(dashboard)') || route==='/profile' || route==='/update-password';
 return {source,route,kind:boundary?'boundary':api?'handler':/page\.tsx$/.test(source)?'page':'metadata',access:member?'authenticated':'public',status:member?'BLOCKED':'PENDING',reason:member?'Disposable authenticated personas unavailable: Docker daemon not running. Signed-out redirects do not verify private page layouts.':null};
});
writeFileSync(`${out}/route-inventory.json`,JSON.stringify(inventory,null,2)+'\n');
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const results=[];
const manifest={base,sourceRevision:sha,productionRevision:'bd5f04fd8ef8abd68c4a4590b145744996ec7494',latestPreviewRevision:'2bd2c33053dea5a5fb6b116e06ac0bfd7be4bd60',browser:browser.version(),playwright:JSON.parse(readFileSync(resolve(process.env.AUDIT_PLAYWRIGHT_MODULE ?? 'node_modules/playwright/index.mjs','../package.json'),'utf8')).version,platform:process.platform,node:process.version,viewportHeight:900,deviceScaleFactor:1,colorScheme:'light',reducedMotion:'reduce',locale:'en-CA',timezoneId:'America/Vancouver',startedAt:new Date().toISOString(),widths,locales};
function save(){writeFileSync(`${out}/measurements.json`,JSON.stringify({manifest,results},null,2)+'\n');}
async function context(language,width,fresh=false) {
 const c=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,locale:'en-CA',timezoneId:'America/Vancouver',colorScheme:'light',reducedMotion:'reduce',serviceWorkers:'block'});
 // Anonymous sessions only. Allow reads and prevent accidental mutation/provider use.
 await c.route('**/*',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort('blockedbyclient'));
 if(!fresh) await c.addInitScript(lang=>localStorage.setItem('afghan-hub-site-language',lang),language);
 return c;
}
const states=[
 {id:'entrance',path:'/',fresh:true},
 {id:'home',path:lang=>`/${lang}`},
 ...['about','support','privacy','terms','login','forgot-password'].map(id=>({id,path:`/${id}`})),
 {id:'signup',path:'/login?mode=join'},
 ...['opportunities','businesses','organizations','events'].map(kind=>({id:`catalog-${kind}`,path:`/explore?type=${kind}`})),
 {id:'catalog-empty',path:'/explore?type=businesses&q=zz-forensic-no-match-20261023'},
 {id:'not-found',path:'/forensic-audit-not-found-20261023'},
 {id:'confirmation-invalid',path:'/auth/confirm'},
 {id:'recovery-invalid',path:'/auth/confirm?type=recovery'},
 {id:'callback-invalid',path:'/auth/callback'},
 {id:'listing-not-found',path:'/explore/businesses/forensic-audit-missing-20261023'},
];
// Discover one actual published detail per category without member/session data.
const discovery=await context('en',1440);
const discoveryPage=await discovery.newPage();
for(const kind of ['opportunities','businesses','organizations','events']) {
 await discoveryPage.goto(`${base}/explore?type=${kind}`,{waitUntil:'networkidle',timeout:45000});
 const href=await discoveryPage.locator(`a[href^="/explore/${kind}/"]`).first().getAttribute('href').catch(()=>null);
 if(href) states.push({id:`detail-${kind}`,path:href});
 else results.push({id:`detail-${kind}`,route:`/explore/${kind}/[slug]`,status:'BLOCKED',reason:'No published listing link available in current public catalogue; synthetic fixture required.'});
}
await discovery.close();
async function measure(page) {
 return page.evaluate(()=>{
 const box=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,role:e.getAttribute('role'),text:(e.innerText??'').replace(/\s+/g,' ').slice(0,90),x:+r.x.toFixed(2),y:+(r.y+scrollY).toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2),font:s.fontFamily,fontSize:s.fontSize,lineHeight:s.lineHeight,direction:s.direction,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],gap:s.gap,radius:s.borderRadius};};
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
 const main=document.querySelector('main');
 const controls=[...document.querySelectorAll('main input:not([type=hidden]),main select,main textarea,main button,header select,header summary')].filter(visible).map(box);
 const headings=[...document.querySelectorAll('h1,h2,h3')].filter(visible).map(box);
 const sections=[...document.querySelectorAll('main > section,main > div,main aside,footer')].filter(visible).map(box);
 const overflow=[...document.querySelectorAll('main *,header *')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left< -2||r.right>innerWidth+2;}).slice(0,15).map(box);
 const clipped=[...document.querySelectorAll('h1,h2,h3,button,label,select')].filter(visible).filter(e=>e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX!=='visible').map(box);
 const footer=document.querySelector('footer');
 return {lang:document.documentElement.lang,dir:document.documentElement.dir,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,main:main?box(main):null,headings,controls,sections,overflow,clipped,footerGap:main&&footer?+(footer.getBoundingClientRect().top-main.getBoundingClientRect().bottom).toFixed(2):null,fontStatus:document.fonts.status};
 });
}
async function capture(page,record,suffix='') {
 const stem=`${record.id}-${record.language}-${record.width}${suffix}`;
 await page.evaluate(()=>scrollTo(0,0));
 record.screenshots??=[];
 for(const [label,fullPage] of [['full',true],['top',false]]) {
  const path=`screenshots/${stem}-${label}.jpg`;
  await page.screenshot({path:`${out}/${path}`,fullPage,type:'jpeg',quality:70,animations:'disabled'});
  record.screenshots.push(path);
 }
 if(record.measurement.height>1800) {
  for(const [label,y] of [['middle',(record.measurement.height-900)/2],['bottom',record.measurement.height-900]]) {
   await page.evaluate(y=>scrollTo(0,y),y); await page.waitForTimeout(80);
   const path=`screenshots/${stem}-${label}.jpg`;
   await page.screenshot({path:`${out}/${path}`,type:'jpeg',quality:70,animations:'disabled'});record.screenshots.push(path);
  }
 }
}
try {
 for(const state of states) for(const language of locales) {
  const c=await context(language,390,state.fresh);const page=await c.newPage();
  const errors=[];page.on('pageerror',()=>errors.push('client exception (payload withheld)'));
  for(const width of widths) {
   const path=typeof state.path==='function'?state.path(language):state.path;
   const record={id:state.id,route:path,language,width,state:'default',status:'PENDING',screenshots:[]};
   try {
    await page.setViewportSize({width,height:900});
    const response=await page.goto(`${base}${path}`,{waitUntil:'networkidle',timeout:45000});
    await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
    record.httpStatus=response.status();record.finalRoute=new URL(page.url()).pathname+new URL(page.url()).search;
    record.measurement=await measure(page);record.clientErrors=[...errors];
    await capture(page,record);record.status='CAPTURED_NOT_SIGNED_OFF';
   } catch(error){record.status='BLOCKED';record.reason=String(error.message).split('\n')[0].replace(/https?:\/\/\S+/g,'[URL]');}
   results.push(record);save();console.log(`${record.status} ${state.id} ${language} ${width}`);
  }
  await c.close();
 }
 // Private routes are never treated as passed after a redirect to login.
 const c=await context('en',390);const page=await c.newPage();
 for(const row of inventory.filter(r=>r.kind==='page'&&r.access==='authenticated')) {
  const path=row.route.replace('[slug]','forensic-missing').replace('[id]','00000000-0000-0000-0000-000000000000').replace('[conversationId]','00000000-0000-0000-0000-000000000000');
  try {const r=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});row.signedOutProbe={httpStatus:r.status(),finalPath:new URL(page.url()).pathname};}catch {row.signedOutProbe={status:'BLOCKED',reason:'Navigation failed'};}
 }
 await c.close();
} finally {
 manifest.finishedAt=new Date().toISOString();save();writeFileSync(`${out}/route-inventory.json`,JSON.stringify(inventory,null,2)+'\n');await browser.close();
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
writeFileSync(`${out}/index.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Afghan Hub forensic evidence</title><style>body{font:15px/1.5 system-ui;margin:24px;background:#faf6ee;color:#262239}select{padding:8px;margin:8px}article{border-top:1px solid #aaa;padding:16px 0}img{max-width:100%;max-height:420px;object-fit:contain;object-position:top}figure{display:inline-block;vertical-align:top;width:30%;margin:1%}code{overflow-wrap:anywhere}</style><h1>Afghan Hub — anonymous forensic evidence</h1><p>Source ${sha}; Chrome ${manifest.browser}; DPR 1; 900px height. CAPTURED is not PASS. Private pages and unvisited states remain blocked. Read measurements.json for exact boxes.</p><label>Language <select id="language"><option>all</option>${locales.map(l=>`<option>${l}</option>`).join('')}</select></label><label>Width <select id="width"><option>all</option>${widths.map(w=>`<option>${w}</option>`).join('')}</select></label>${results.map(r=>`<article data-language="${r.language}" data-width="${r.width}"><h2>${esc(r.id)} · ${esc(r.language??'')} · ${esc(r.width??'')}px</h2><p><code>${esc(r.route)}</code> — ${r.status}</p>${(r.screenshots??[]).map(s=>`<figure><a href="${esc(s)}"><img loading="lazy" src="${esc(s)}" alt="${esc(r.id)} ${esc(s.split('-').at(-1))}"></a><figcaption>${esc(s)}</figcaption></figure>`).join('')}${r.reason?`<p>${esc(r.reason)}</p>`:''}</article>`).join('')}<script>for(const s of document.querySelectorAll('select'))s.onchange=()=>{for(const a of document.querySelectorAll('article'))a.hidden=['language','width'].some(k=>document.getElementById(k).value!=='all'&&a.dataset[k]!==document.getElementById(k).value)}</script></html>`);
console.log(JSON.stringify({records:results.length,captured:results.filter(r=>r.status==='CAPTURED_NOT_SIGNED_OFF').length,blocked:results.filter(r=>r.status==='BLOCKED').length}));
