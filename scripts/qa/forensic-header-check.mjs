import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {chromium}=await import(pathToFileURL(resolve(process.env.AUDIT_PLAYWRIGHT_MODULE??'node_modules/playwright/index.mjs')));
mkdirSync('docs/evidence/visual-audit-2026-10/screenshots',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const results=[];
try {
 for(const language of ['en','fa','ps']) {
  const c=await browser.newContext({viewport:{width:320,height:900},deviceScaleFactor:1,reducedMotion:'reduce',colorScheme:'light',locale:'en-CA',timezoneId:'America/Vancouver'});
  await c.addInitScript(l=>localStorage.setItem('afghan-hub-site-language',l),language);
  const p=await c.newPage();await p.goto(`http://localhost:3100/${language}`,{waitUntil:'networkidle',timeout:90000});await p.evaluate(()=>document.fonts.ready);
  for(const width of [320,375,390,430,768,1024,1280,1440,1920]) {
   await p.setViewportSize({width,height:900});await p.evaluate(()=>scrollTo(0,0));
   const closed=await p.evaluate(()=>{
    const a=document.querySelector('header select').getBoundingClientRect(),b=document.querySelector('header summary').getBoundingClientRect();
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,selector:{x:a.x,width:a.width,right:a.right},menu:{x:b.x,width:b.width,right:b.right},overlap:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))};
   });
   assert.ok(closed.scrollWidth<=width+1,`Closed overflow ${language} ${width}`);
   if(width<=960) {
    assert.equal(closed.overlap,0,`Control overlap ${language} ${width}`);
    await p.locator('header summary').click();
    const open=await p.locator('header details nav').evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,scrollWidth:document.documentElement.scrollWidth,links:[...e.querySelectorAll('a')].map(a=>({height:a.getBoundingClientRect().height,width:a.getBoundingClientRect().width}))};});
    assert.ok(open.x>=-1&&open.right<=width+1,`Panel outside viewport ${language} ${width}`);
    assert.ok(open.width>=width-1,`Collapsed menu ${language} ${width}`);
    assert.ok(open.scrollWidth<=width+1,`Open overflow ${language} ${width}`);
    assert.ok(open.links.every(l=>l.height>=44&&l.width>200));
    const screenshot=`screenshots/fixed-menu-${language}-${width}.jpg`;
    await p.screenshot({path:`docs/evidence/visual-audit-2026-10/${screenshot}`,type:'jpeg',quality:75});
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('header details').evaluate(e=>e.open),false);
    assert.equal(await p.locator('header summary').evaluate(e=>e===document.activeElement),true);
    results.push({language,width,status:'PASS',closed,open,screenshot,escapeFocusReturned:true});
   }else results.push({language,width,status:'PASS',closed,desktop:true});
  }
  await c.close();
 }
}finally {
 await browser.close();writeFileSync('docs/evidence/visual-audit-2026-10/header-fix-verification.json',JSON.stringify({base:'http://localhost:3100',browser:browser.version(),cssSha256:createHash('sha256').update(readFileSync('src/components/public/public-navigation.module.css')).digest('hex'),results},null,2)+'\n');
}
console.log(`${results.length} header geometry/interaction cases passed`);
