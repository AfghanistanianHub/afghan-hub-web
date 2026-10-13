// Anonymous loopback-only browser QA. No secrets, production requests or database writes.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AH_PLAYWRIGHT_MODULE || 'playwright');
const chrome=process.env.AH_CHROME_PATH || ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable'].find(existsSync);
assert.ok(chrome,'A sandboxed Chrome installation is required');
const output='reports/language-entry'; await mkdir(output,{recursive:true});
const fixture=http.createServer((request,response)=>{ response.writeHead(200,{'Content-Type':'application/json','Content-Range':'*/0'});response.end('[]'); });
await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));
const appPort=Number(process.env.AH_QA_PORT || 3187);const origin=`http://localhost:${appPort}`;
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(appPort)],{env:{...process.env,NEXT_PUBLIC_SITE_URL:origin,NEXT_PUBLIC_SUPABASE_URL:`http://127.0.0.1:${fixture.address().port}`,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'anonymous-language-qa-fixture'},stdio:['ignore','pipe','pipe']});
let log='';for(const stream of [app.stdout,app.stderr]) stream.on('data',value=>{log=(log+value).slice(-4000);});
const results=[];let browser;
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log(`PASS ${name}`);}
try {
  for(let i=0;i<100;i++){if(app.exitCode!==null)throw Error(log);try{if((await fetch(origin)).ok)break;}catch{} await delay(300);}
  browser=await chromium.launch({executablePath:chrome,chromiumSandbox:true,headless:true});
  async function context(options={}) {
    const ctx=await browser.newContext({viewport:{width:1440,height:900},...options});
    await ctx.route('**/*',route=>{const host=new URL(route.request().url()).hostname; return ['localhost','127.0.0.1'].includes(host)?route.continue():route.abort();});
    return ctx;
  }
  for(const width of [320,390,768,1440]){
    const ctx=await context({viewport:{width,height:900}});const page=await ctx.newPage();
    await check(`first-root-${width}`,async()=>{
      await page.goto(origin);await page.locator('[data-language-entry]').waitFor();await page.evaluate(()=>document.fonts.ready);
      assert.deepEqual(await page.locator('[data-language-entry] a').allTextContents(),['English','فارسی','پښتو']);
      assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
      assert.equal(await page.locator('[data-locale=fa]').getAttribute('dir'),'rtl');
      assert.equal(await page.locator('header,footer').count(),0);
      assert.ok(await page.locator('head style').allTextContents().then(text=>text.some(value=>value.includes('@view-transition'))));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:`${output}/entry-${width}.png`});
    });
    await check(`keyboard-focus-${width}`,async()=>{
      for(const locale of ['en','fa','ps']){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.locale),locale);}
      await page.screenshot({path:`${output}/focus-${width}.png`});
    });
    await ctx.close();
  }
  // Change Chrome's actual default page zoom through its privileged Settings page.
  // CSS zoom, device scaling and a narrower emulated viewport do not prove this behavior.
  for(const factor of [2,4]){
    const zoom=await chromium.launchPersistentContext('',{executablePath:chrome,chromiumSandbox:true,headless:true,viewport:{width:1280,height:900}});
    try {
      await zoom.route('**/*',route=>{const host=new URL(route.request().url()).hostname;return ['localhost','127.0.0.1'].includes(host)?route.continue():route.abort();});
      const page=zoom.pages()[0] || await zoom.newPage();
      await check(`native-browser-zoom-${factor*100}`,async()=>{
        await page.goto('chrome://settings/appearance');
        await page.evaluate(factor=>new Promise((resolve,reject)=>{
          chrome.settingsPrivate.setDefaultZoom(factor,()=>{
            if(chrome.runtime.lastError) reject(Error(chrome.runtime.lastError.message));
            else chrome.settingsPrivate.getDefaultZoom(value=>Math.abs(value-factor)<1e-6?resolve():reject(Error(`Unexpected zoom ${value}`)));
          });
        }),factor);
        await page.goto(origin);await page.locator('[data-language-entry]').waitFor();await page.evaluate(()=>document.fonts.ready);
        const metrics=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth}));
        assert.ok(Math.abs(metrics.width-1280/factor)<=2,`Native zoom did not change layout viewport: ${JSON.stringify(metrics)}`);
        assert.ok(Math.abs(metrics.dpr-factor)<.02,`Native zoom did not change pixel ratio: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.scrollWidth<=metrics.width,'Horizontal overflow at native zoom');
        for(const locale of ['en','fa','ps']){
          await page.keyboard.press('Tab');
          assert.equal(await page.evaluate(()=>document.activeElement.dataset.locale),locale);
          const box=await page.locator(`[data-locale=${locale}]`).boundingBox();
          assert.ok(box && box.x>=0 && box.x+box.width<=metrics.width && box.y>=0 && box.y<900/factor,`${locale} focus is clipped at ${factor*100}%`);
          await page.screenshot({path:`${output}/zoom-${factor*100}-focus-${locale}.png`});
        }
        await page.keyboard.press('Enter');await page.waitForURL(`${origin}/ps`);
        assert.equal(await page.locator('html').getAttribute('lang'),'ps');
        assert.ok((await zoom.cookies()).some(cookie=>cookie.name==='afghan-hub-language'&&cookie.value==='ps'));
        results.push({name:`native-zoom-metrics-${factor*100}`,status:'passed',metrics});
      });
    } finally {await zoom.close();}
  }
  for(const locale of ['en','fa','ps']){
    const ctx=await context();const page=await ctx.newPage();const errors=[];const transitionAborts=[];
    page.on('pageerror',error=>{
      // Browser-native cross-document cancellation is an expected progressive fallback.
      // Still assert destination/locale/persistence; every other page error fails the suite.
      if(error.message==='Transition was aborted because of invalid state. ViewTransition opt-in disabled') transitionAborts.push(error.message);
      else errors.push(error.message);
    });
    await check(`select-return-${locale}`,async()=>{
      await page.goto(origin);await page.locator(`[data-locale=${locale}]`).click();await page.waitForURL(`${origin}/${locale}`);
      assert.equal(await page.locator('html').getAttribute('lang'),locale);
      assert.equal(await page.locator('html').getAttribute('dir'),locale==='en'?'ltr':'rtl');
      assert.equal(await page.locator('#ai-navigator').getAttribute('lang'),locale);
      await page.locator('#ai-navigator select').selectOption(locale==='ps'?'fa':'ps');
      await page.reload();
      assert.equal(await page.locator('#ai-navigator').getAttribute('lang'),locale==='ps'?'fa':'ps');
      // A site switch synchronizes the separate Navigator preference again.
      await page.goto(`${origin}/language/select?locale=${locale}`);
      await page.waitForURL(`${origin}/${locale}`);
      assert.equal(await page.locator('#ai-navigator').getAttribute('lang'),locale);
      assert.ok((await ctx.cookies()).some(cookie=>cookie.name==='afghan-hub-language'&&cookie.value===locale));
      await page.goto(origin);await page.waitForURL(`${origin}/${locale}`);assert.equal(await page.locator('[data-language-entry]').count(),0);
      await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),locale);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.evaluate(()=>document.fonts.ready);await delay(700);
      await page.screenshot({path:`${output}/homepage-${locale}-1440.png`});
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),`https://app.apnbc.ca/${locale}`);
      assert.equal(await page.locator('link[hreflang=fa]').count(),1);assert.deepEqual(errors,[]);
      if(transitionAborts.length)results.push({name:`native-transition-cancel-${locale}`,status:'passed',fallback:'real destination and persistence verified after browser-native cancellation',count:transitionAborts.length});
    });
    for(const width of [320,390,768])await check(`homepage-${locale}-${width}`,async()=>{
      await page.setViewportSize({width,height:900});await page.reload();await page.evaluate(()=>document.fonts.ready);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${locale} overflow at ${width}`);
      if(width===390){await delay(700);await page.screenshot({path:`${output}/homepage-${locale}-390.png`});
        await page.locator('#community').scrollIntoViewIfNeeded();await delay(700);await page.screenshot({path:`${output}/categories-${locale}-390.png`});}
    });
    await ctx.close();
  }
  const ctx=await context({viewport:{width:1440,height:900},recordVideo:{dir:output,size:{width:1440,height:900}}});const page=await ctx.newPage();
  await check('pointer-focus-selection-recording',async()=>{
    await page.goto(origin);await delay(500);await page.mouse.move(180,300);await delay(300);await page.locator('[data-locale=fa]').hover();await delay(500);
    await page.screenshot({path:`${output}/pointer-1440.png`});await page.keyboard.press('Tab');await delay(450);await page.keyboard.press('Tab');await delay(450);
    await page.keyboard.press('Enter');await page.waitForURL(`${origin}/fa`);await delay(800);
  });
  await check('switch-retains-internal-page-query-fragment',async()=>{
    await page.goto(`${origin}/explore?type=events&q=film#results-heading`);
    await page.locator('.interface-language-switcher summary').click();await page.locator('.interface-language-switcher a[lang=ps]').click();
    await page.waitForURL(url=>url.pathname==='/explore'&&url.searchParams.get('lang')==='ps');
    const url=new URL(page.url());assert.equal(url.searchParams.get('type'),'events');assert.equal(url.searchParams.get('q'),'film');assert.equal(url.hash,'#results-heading');
    assert.equal(await page.locator('html').getAttribute('lang'),'ps');
  });
  await ctx.close();
  const mobile=await context({viewport:{width:390,height:844},hasTouch:true,isMobile:true,recordVideo:{dir:output,size:{width:390,height:844}}});const touch=await mobile.newPage();
  await check('touch-selection',async()=>{await touch.goto(origin);await delay(300);await touch.locator('[data-locale=ps]').tap();await touch.waitForURL(`${origin}/ps`);await delay(800);});await mobile.close();
  for(const options of [{javaScriptEnabled:false},{reducedMotion:'reduce'}]){
    const special=await context(options);const p=await special.newPage();await check(`native-fallback-${JSON.stringify(options)}`,async()=>{await p.goto(origin);await p.locator('[data-locale=fa]').click();await p.waitForURL(`${origin}/fa`);assert.equal(await p.locator('html').getAttribute('lang'),'fa');});await special.close();
  }
  const storage=await context();await storage.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage disabled','SecurityError');}});});const p=await storage.newPage();
  await check('unavailable-browser-storage',async()=>{await p.goto(origin);await p.locator('[data-locale=ps]').click();await p.waitForURL(`${origin}/ps`);await p.goto(origin);await p.waitForURL(`${origin}/ps`);});
  for(const path of ['/explore?type=events','/about','/login','/login?mode=join','/forgot-password','/update-password','/auth/callback?flow=signup','/auth/callback?flow=recovery','/en','/fa','/ps'])await check(`bypass-${path}`,async()=>{await p.goto(origin+path);assert.equal(await p.locator('[data-language-entry]').count(),0);
    if(!/^\/(en|fa|ps)$/.test(new URL(p.url()).pathname))assert.equal(await p.locator('head style').allTextContents().then(text=>text.some(value=>value.includes('@view-transition'))),false);
  });
  for(const path of ['/robots.txt','/sitemap.xml'])await check(`machine-route-${path}`,async()=>{const response=await fetch(origin+path);assert.equal(response.status,200);assert.ok(!(await response.text()).includes('data-language-entry'));});
  await storage.close();
} catch(error){results.push({name:'browser-suite',status:'failed',error:String(error)});throw error;}
finally{await writeFile(`${output}/results.json`,JSON.stringify({commit:process.env.AH_SOURCE_SHA||'local',results},null,2));await browser?.close();app.kill('SIGTERM');fixture.close();}
