import { mkdirSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const {chromium}=await import(pathToFileURL(resolve(process.env.AUDIT_PLAYWRIGHT_MODULE??'node_modules/playwright/index.mjs')));
const out='docs/evidence/visual-audit-2026-10';
mkdirSync(`${out}/screenshots`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const results=[];
try {
 for(const language of ['en','fa','ps']) for(const width of [320,375,390,430,768,1024,1280,1440,1920]) {
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,locale:'en-CA',timezoneId:'America/Vancouver',colorScheme:'light',reducedMotion:'reduce'});
  await context.addInitScript(lang=>localStorage.setItem('afghan-hub-site-language',lang),language);
  await context.route('**/*',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort('blockedbyclient'));
  const page=await context.newPage();
  try {
   await page.goto(`https://app.apnbc.ca/${language}`,{waitUntil:'networkidle',timeout:45000});await page.evaluate(()=>document.fonts.ready);
   const save=async(id,extra={})=>{
    const measurement=await page.evaluate(()=>{
     const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
     const selector=document.querySelector('header select'),menu=document.querySelector('header summary');
     const a=selector?.getBoundingClientRect(),b=menu?.getBoundingClientRect();
     const overlap=a&&b?Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)):0;
     return {lang:document.documentElement.lang,dir:document.documentElement.dir,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,headerSelector:rect(selector),menu:rect(menu),headerOverlap:overlap,navigation:rect(document.querySelector('header details[open] nav')),navigator:rect(document.querySelector('#ai-navigator')),input:rect(document.querySelector('#navigator-guide-input')),focus:{tag:document.activeElement?.tagName,outline:getComputedStyle(document.activeElement).outlineStyle},headingText:document.querySelector('h1')?.textContent};
    });
    const screenshot=`screenshots/state-${id}-${language}-${width}.jpg`;
    await page.screenshot({path:`${out}/${screenshot}`,type:'jpeg',quality:75,animations:'disabled'});
    results.push({id,language,width,status:'EXERCISED',screenshot,measurement,...extra});
    writeFileSync(`${out}/interaction-states.json`,JSON.stringify({browser:browser.version(),base:'https://app.apnbc.ca',results},null,2)+'\n');
   };
   if(width<=768){
    await page.locator('header summary').click();await save('menu-open');
    await page.keyboard.press('Escape');
    await save('menu-escape',{closed:!(await page.locator('header details').evaluate(e=>e.open)),focusReturned:await page.locator('header summary').evaluate(e=>e===document.activeElement)});
   }
   await page.locator('#ai-navigator button').nth(1).click();
   await page.locator('#navigator-guide-input').waitFor();
   await page.locator('#ai-navigator').scrollIntoViewIfNeeded();await save('navigator-guide');
   const guideChoice=page.locator('#ai-navigator [class*="choices"] button').first();
   await guideChoice.click();await save('navigator-topic');
   await page.locator('#navigator-guide-input').fill(language==='en'?'Technology and community support '.repeat(2):language==='fa'?'فرصت‌های همکاری و حمایت از جامعه '.repeat(2):'د ټولنې ملاتړ او د همکاریو فرصتونه '.repeat(2));
   await save('navigator-long-input');
   // 200% text-only stress: explicit computed doubling, not claimed browser zoom.
   if([320,390,768,1440].includes(width)) {
    await page.evaluate(()=>{const all=[...document.querySelectorAll('body *')];const sizes=all.map(e=>getComputedStyle(e).fontSize);all.forEach((e,i)=>{if(e instanceof HTMLElement)e.style.fontSize=`${parseFloat(sizes[i])*2}px`;});scrollTo(0,0);});
    await save('text-200-percent',{method:'Double each element computed font-size; text-only stress, not native browser text scaling'});
   }
  }catch(error){results.push({id:'interaction',language,width,status:'BLOCKED',reason:error.message.split('\n')[0]});writeFileSync(`${out}/interaction-states.json`,JSON.stringify({results},null,2)+'\n');}
  finally {await context.close();}
  console.log(`Interaction ${language} ${width}`);
 }
 // Desktop browser-zoom equivalent geometry: 1440 physical CSS area at 2x
 // exposes 720 layout CSS px. This is viewport emulation, NOT native zoom.
 const c=await browser.newContext({viewport:{width:720,height:450},deviceScaleFactor:2,reducedMotion:'reduce'});
 await c.addInitScript(()=>localStorage.setItem('afghan-hub-site-language','en'));
 const p=await c.newPage();await p.goto('https://app.apnbc.ca/en',{waitUntil:'networkidle'});
 const screenshot='screenshots/zoom-equivalent-en-1440-200.jpg';await p.screenshot({path:`${out}/${screenshot}`,type:'jpeg'});
 results.push({id:'zoom-equivalent',language:'en',width:1440,status:'EXERCISED',screenshot,method:'720x450 layout viewport at DPR2; native browser zoom NOT TESTED'});await c.close();
}finally {writeFileSync(`${out}/interaction-states.json`,JSON.stringify({browser:browser.version(),results},null,2)+'\n');await browser.close();}
