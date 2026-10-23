import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const {chromium}=await import(pathToFileURL(resolve(process.env.AUDIT_PLAYWRIGHT_MODULE??'node_modules/playwright/index.mjs')));
const dir=process.env.LOCAL_QA_DIR;
assert.match(readFileSync(resolve(dir,'supabase/config.toml'),'utf8'),/project_id = "afghan-hub-forensic-20261023"/);
const status=JSON.parse(execFileSync('supabase',['--workdir',dir,'status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
assert.equal(new URL(status.API_URL).origin,'http://127.0.0.1:56321');
const admin=createClient(status.API_URL,status.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
// Behavioral baseline preflight (2026-10-23): has_table_privilege is not a valid
// gate here — public.profiles intentionally holds column-level grants only, and RLS
// policies (not GRANTs) are the enforcing boundary. Verify effective access instead:
// service_role can stage synthetic fixtures AND an authenticated user can read its own
// profile row AND published content is isolated from drafts for anon. The isolated
// container may carry local-only Cloud-equivalent ambient GRANTs (see
// outputs/forensic-local-grants-20261023.sql); repo migrations and Production are untouched.
{
  const probeEmail=`preflight-${randomUUID()}@example.invalid`;
  const probePassword=`Qa-${randomUUID()}-aA1!`;
  const created=await admin.auth.admin.createUser({email:probeEmail,password:probePassword,email_confirm:true});
  assert.ok(created.data?.user?.id,'BLOCKED: isolated auth admin cannot create probe user.');
  try {
    const probeAnon=createClient(status.API_URL,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    const {error:signInError}=await probeAnon.auth.signInWithPassword({email:probeEmail,password:probePassword});
    assert.ok(!signInError,`BLOCKED: isolated password sign-in failed (${signInError?.message}).`);
    const ownProfile=await probeAnon.from('profiles').select('id').eq('id',created.data.user.id).limit(1);
    assert.ok(!ownProfile.error && (ownProfile.data?.length ?? 0) === 1,`BLOCKED: authenticated user cannot read its own profile row (${ownProfile.error?.message ?? '0 rows'}). RLS baseline not reproduced; do not capture recovery/not-found states as intended private-page content.`);
    const publishedProbe=await probeAnon.from('businesses').select('id').eq('status','published').limit(1);
    assert.ok(!publishedProbe.error,`BLOCKED: anon published-content read fails at permission layer (${publishedProbe.error?.message}). RLS baseline not reproduced; do not capture recovery/not-found states as intended private-page content.`);
  } finally {
    await admin.auth.admin.deleteUser(created.data.user.id);
  }
}
const out='docs/evidence/visual-audit-2026-10';mkdirSync(`${out}/private`,{recursive:true});
const password=`QA-${randomUUID()}-aA1!`,stamp=randomUUID().slice(0,8),users=[],rows=[];
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const manifest={base:'http://localhost:3100',fixture:'Only synthetic data in afghan-hub-forensic-20261023 at 127.0.0.1:56321',sourceRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:browser.version(),widths:[320,375,390,430,768,1024,1280,1440,1920],languages:['en','fa','ps'],height:900,startedAt:new Date().toISOString(),cleanup:'PENDING'};
function save(){writeFileSync(`${out}/private-measurements.json`,JSON.stringify({manifest,results:rows},null,2)+'\n');}
async function data(p){const r=await p;if(r.error)throw new Error(`Fixture request failed (${r.error.code??'provider'})`);return r.data;}
const sql=value=>"'"+String(value).replaceAll("'","''")+"'";
function query(statement){return execFileSync('docker',['exec','supabase_db_afghan-hub-forensic-20261023','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-tA','-c',statement],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}
async function persona(label,role='member',onboarded=true){
 const email=`audit-${stamp}-${label}@example.invalid`;
 const {user}=await data(admin.auth.admin.createUser({email,password,email_confirm:true}));users.push(user.id);
 query(`BEGIN; SELECT set_config('request.jwt.claim.role','service_role',true); UPDATE public.profiles SET display_name=${sql(`Synthetic ${label}`)},headline='Synthetic community audit persona',city='Vancouver',country='Canada',bio='Disposable visual audit profile. No real member information.',onboarding_completed=${onboarded},role=${sql(role)} WHERE id=${sql(user.id)}; COMMIT;`);
 return {id:user.id,email};
}
async function login(person,language){
 const c=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce',colorScheme:'light',locale:'en-CA',timezoneId:'America/Vancouver'});
 await c.addInitScript(l=>localStorage.setItem('afghan-hub-site-language',l),language);
 const p=await c.newPage();await p.goto('http://localhost:3100/login',{waitUntil:'networkidle',timeout:90000});
 await p.locator('input[name=email]').fill(person.email);await p.locator('input[name=password]').fill(password);
 await Promise.all([p.waitForURL(u=>u.pathname!=='/login',{timeout:60000}),p.locator('button[type=submit]').click()]);
 return {context:c,page:p};
}
async function measure(page){return page.evaluate(()=>{
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden';};
 const box=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,text:(e.innerText??'').replace(/\s+/g,' ').slice(0,100),x:+r.x.toFixed(2),y:+(r.y+scrollY).toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2),font:s.fontFamily,fontSize:s.fontSize,lineHeight:s.lineHeight,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],gap:s.gap,dir:s.direction};};
 return {lang:document.documentElement.lang,dir:document.documentElement.dir,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,main:document.querySelector('main')?box(document.querySelector('main')):null,headings:[...document.querySelectorAll('main h1,main h2,main h3')].filter(visible).map(box),controls:[...document.querySelectorAll('main input:not([type=hidden]):not([type=file]),main select,main textarea,main button,header select,header button')].filter(visible).map(box),sections:[...document.querySelectorAll('main>section,main>div,main>form')].filter(visible).map(box),overflow:[...document.querySelectorAll('main *,header *')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left< -2||r.right>innerWidth+2;}).slice(0,12).map(box),alerts:[...document.querySelectorAll('main [role=alert],main [role=status]')].filter(visible).map(box)};
});}
async function capture(page,id,path,language,width,state='default'){
 const row={id,route:path,language,width,state,status:'PENDING',screenshots:[]};
 try {
  await page.setViewportSize({width,height:900});
  const response=await page.goto('http://localhost:3100'+path,{waitUntil:'networkidle',timeout:90000});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(120);
  row.httpStatus=response.status();row.finalPath=new URL(page.url()).pathname;
  if(row.finalPath!==new URL(path,'http://localhost').pathname)throw new Error('Route redirected; target layout not verified');
  if(await page.locator('main h1').filter({hasText:/This page isn’t available|Something went wrong/}).count())throw new Error('Recovery/not-found content at target URL; intended private layout not verified');
  row.measurement=await measure(page);
  await page.evaluate(()=>scrollTo(0,0));
  const stem=`private/${id}-${language}-${width}`;
  for(const [suffix,fullPage]of [['full',true],['top',false]]){const f=`${stem}-${suffix}.jpg`;await page.screenshot({path:`${out}/${f}`,fullPage,type:'jpeg',quality:65,animations:'disabled'});row.screenshots.push(f);}
  if(row.measurement.height>1800){for(const [suffix,y]of [['middle',(row.measurement.height-900)/2],['bottom',row.measurement.height-900]]){await page.evaluate(y=>scrollTo(0,y),y);const f=`${stem}-${suffix}.jpg`;await page.screenshot({path:`${out}/${f}`,type:'jpeg',quality:65});row.screenshots.push(f);}}
  row.status='CAPTURED_NOT_SIGNED_OFF';
 }catch(error){row.status='BLOCKED';row.reason=error.message.split('\n')[0];}
 rows.push(row);save();console.log(`${row.status} ${id} ${language} ${width}`);
}
try {
 const owner=await persona('owner'),member=await persona('member'),reviewer=await persona('reviewer','admin'),onboarding=await persona('onboarding','member',false);
 const slugs={};
 for(const table of ['businesses','organizations','opportunities','events']) {
  const slug=`synthetic-${table}-${stamp}`;slugs[table]=slug;
  const description='Synthetic visual audit content. '.repeat(12)+'فارسی و پښتو — community support, collaboration and opportunities.';
  const common={slug,status:'published',city:'Vancouver',country:'Canada',description};
  const fields=table==='businesses'?{...common,owner_id:owner.id,name:'Synthetic community business',category:'Community services',short_description:'Synthetic listing for safe visual review',services:['Community support','Creative collaboration']}:
   table==='organizations'?{...common,owner_id:owner.id,name:'Synthetic community organization',organization_type:'Nonprofit',short_description:'Synthetic nonprofit for safe visual review',mission:'Synthetic community mission',programs:['Community support','Culture']}:
   table==='opportunities'?{...common,author_id:owner.id,title:'Synthetic community opportunity',summary:'Synthetic long-content opportunity for visual review',type:'volunteer',external_url:'https://example.invalid/apply',deadline:'2027-03-01'}:
   {...common,creator_id:owner.id,title:'Synthetic community event',summary:'Synthetic event for safe visual review',starts_at:'2027-02-01T18:00:00Z',ends_at:'2027-02-01T20:00:00Z',capacity:30,venue_name:'Synthetic community venue'};
  console.log(`Preparing synthetic ${table}`);
  const keys=Object.keys(fields),values=Object.values(fields).map(v=>Array.isArray(v)?`ARRAY[${v.map(sql).join(',')}]`:v===null?'NULL':typeof v==='boolean'?String(v):sql(v));
  const inserted={id:query(`INSERT INTO public.${table} (${keys.join(',')}) VALUES (${values.join(',')}) RETURNING id;`).trim().split('\n')[0]};
  if(table==='events')query(`INSERT INTO public.event_rsvps (event_id,profile_id) VALUES (${sql(inserted.id)},${sql(member.id)});`);
 }
 query(`INSERT INTO public.connections (requester_id,recipient_id,status) VALUES (${sql(owner.id)},${sql(member.id)},'accepted');`);
 const conversation={id:randomUUID()};
 query(`INSERT INTO public.conversations (id,created_by) VALUES (${sql(conversation.id)},${sql(owner.id)}); INSERT INTO public.conversation_members (conversation_id,profile_id) VALUES (${sql(conversation.id)},${sql(owner.id)}),(${sql(conversation.id)},${sql(member.id)}); INSERT INTO public.messages (conversation_id,sender_id,body) VALUES (${sql(conversation.id)},${sql(owner.id)},'Synthetic audit message: community collaboration فارسی پښتو'),(${sql(conversation.id)},${sql(member.id)},${sql('Synthetic reply with a longer message to exercise wrapping. '.repeat(8))});`);
 const routes=[...['dashboard','network','search','saved','settings','submissions','messages','profile','events/my'].map(path=>({id:path.replaceAll('/','-'),path:'/'+path})),
 {id:'member-detail',path:'/members/'+member.id},{id:'conversation',path:'/messages/'+conversation.id},
 {id:'event-attendees',path:`/events/${slugs.events}/attendees`},
 ...Object.entries(slugs).flatMap(([kind,slug])=>[{id:kind,path:`/${kind}`},{id:`${kind}-new`,path:`/${kind}/new`},{id:`${kind}-detail`,path:`/${kind}/${slug}`},{id:`${kind}-edit`,path:`/${kind}/${slug}/edit`},{id:`public-${kind}-detail`,path:`/explore/${kind}/${slug}`}]),
 {id:'events-calendar',path:'/events?view=calendar&month=2027-02'},
 {id:'businesses-empty',path:'/businesses?q=zz-forensic-no-match'},
 {id:'search-empty',path:'/search?q=zz-forensic-no-match'},
 ];
 for(const language of manifest.languages){
  const session=await login(owner,language);
  for(const r of routes)for(const width of manifest.widths)await capture(session.page,r.id,r.path,language,width);
  await session.context.close();
  const adminSession=await login(reviewer,language);
  for(const path of ['/moderation','/moderation/team'])for(const width of manifest.widths)await capture(adminSession.page,path.slice(1).replaceAll('/','-'),path,language,width);
  await adminSession.context.close();
  const onboardingSession=await login(onboarding,language);
  for(const width of manifest.widths)await capture(onboardingSession.page,'onboarding','/profile',language,width,'onboarding');
  await onboardingSession.context.close();
 }
}catch(error){rows.push({id:'fixture-or-session',status:'BLOCKED',reason:error.message.split('\n')[0]});console.error('Audit fixture/session failed:',error.message.split('\n')[0]);process.exitCode=1;}
finally {
 await browser.close();
 for(const id of users){const r=await admin.auth.admin.deleteUser(id);if(r.error)manifest.cleanup='FAILED';}
 if(manifest.cleanup!=='FAILED')manifest.cleanup='Synthetic users deleted (cascade relationships); isolated stack must also be stopped without backup.';
 manifest.finishedAt=new Date().toISOString();save();
}
