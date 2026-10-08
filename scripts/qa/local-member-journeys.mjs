import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {resolve,basename} from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {requireLocalTarget} from './local-target.mjs';

// Never accepts hosted URL/keys. Status comes from a fresh, named local stack.
const dir=resolve(process.env.LOCAL_QA_DIR ?? '');
assert.ok(basename(dir).startsWith('afghan-local-journey-'),'Run prepare-local-journey first');
assert.match(readFileSync(resolve(dir,'supabase/config.toml'),'utf8'),/project_id = "afghan-hub-local-journey"/);
const status=JSON.parse(execFileSync('supabase',['status','-o','json'],{cwd:dir,encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const url=requireLocalTarget(status.API_URL);
assert.ok(status.ANON_KEY && status.SERVICE_ROLE_KEY,'Missing local stack credentials');
const admin=createClient(url,status.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const makeClient=()=>createClient(url,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const anon=makeClient(),users=[],clients=[],channels=[],connections=[],conversations=[],content=[],results=[];
const password=`QA-${randomUUID()}-aA1!`;
const stamp=randomUUID().slice(0,8);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let step='start';
const note=value=>{step=value;};
const data=async promise=>{const r=await promise;if(r.error){const error=new Error('Database request failed; details withheld');error.code=r.error.code;throw error;}return r.data;};
async function check(scenario,expected,fn){
 try{step='start';await fn();results.push({scenario,expected,status:'pass',actual:expected});console.log(`PASS ${scenario}`);}
 catch(error){const code=/^[A-Z0-9_]{3,30}$/.test(error.code??'')?error.code:error.name;const line=error.stack?.split('\n').find(value=>value.includes('local-member-journeys.mjs:'))?.match(/:(\d+):\d+\)?$/)?.[1];const diagnostic={step,code,line};results.push({scenario,expected,status:'fail',actual:'Assertion failed; sensitive provider details withheld',diagnostic});console.error(`FAIL ${scenario} ${JSON.stringify(diagnostic)}`);}
}
async function member(label,signup=false){
 const email=`journey-${stamp}-${label}@example.invalid`; const client=makeClient();clients.push(client);
 let id;
 if(signup){const r=await client.auth.signUp({email,password});assert.ifError(r.error);id=r.data.user?.id;assert.match(id,uuid);users.push(id);assert.equal(r.data.session,null);
   assert.ok((await client.auth.signInWithPassword({email,password})).error,'Unconfirmed registration must not sign in');
   const link=await admin.auth.admin.generateLink({type:'signup',email,password});assert.ifError(link.error);
   const confirmed=await client.auth.verifyOtp({token_hash:link.data.properties.hashed_token,type:'signup'});assert.ifError(confirmed.error);
 }else{const r=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(r.error);id=r.data.user.id;assert.match(id,uuid);users.push(id);}
 assert.match(id,uuid);
 await data(client.auth.signInWithPassword({email,password}));
 const r=await client.auth.getUser();assert.ifError(r.error);assert.equal(r.data.user.id,id);
 return {client,id,email};
}
let a,b,c,moderator,conversationId;
try{
 await check('A: registration and token confirmation','Unconfirmed sign-in refused; confirmation and password sign-in succeed',async()=>{a=await member('a',true);});
 assert.ok(a,'Cannot continue without registration');
 b=await member('b');c=await member('c');moderator=await member('moderator');
 await check('A: onboarding/profile update','Own profile is created and updated; onboarding access state changes',async()=>{
   for(const user of [a,b,c,moderator])await data(user.client.from('profiles').update({display_name:'Synthetic QA member',city:'Vancouver',is_public:user!==c,onboarding_completed:true}).eq('id',user.id));
   const state=await data(a.client.rpc('get_my_access_context'));assert.equal(state[0].onboarding_completed,true);
   await data(a.client.from('profiles').update({headline:'Synthetic QA update'}).eq('id',a.id));
 });
 await check('A: session refresh/sign-out/sign-in','Refreshed session belongs to same user; local sign-out clears session; sign-in succeeds',async()=>{
   assert.equal((await data(a.client.auth.refreshSession())).user.id,a.id);await data(a.client.auth.signOut({scope:'local'}));assert.equal((await data(a.client.auth.getSession())).session,null);await data(a.client.auth.signInWithPassword({email:a.email,password}));
 });
 await check('A: profile visibility and role tampering','Private profile hidden from other members; anonymous directory hidden; role escalation refused',async()=>{
   assert.equal((await data(a.client.from('profiles').select('id').eq('id',c.id))).length,0);
   const anonymousRead=await anon.from('profiles').select('id');
   if(anonymousRead.error)assert.equal(anonymousRead.error.code,'42501');else assert.equal(anonymousRead.data.length,0);
   await a.client.from('profiles').update({role:'admin'}).eq('id',a.id);assert.equal(await data(a.client.rpc('is_admin')),false);
   assert.equal((await data(a.client.from('profiles').select('id').eq('id',b.id))).length,1);
 });
 await check('B: request/cancel/decline/accept/disconnect','Each connection transition respects actor and recipient',async()=>{
   let id=await data(a.client.rpc('send_connection_request',{target_recipient_id:b.id}));connections.push(id);
   await data(a.client.from('connections').delete().eq('id',id));assert.equal((await data(b.client.from('connections').select('id').eq('id',id))).length,0);
   id=await data(a.client.rpc('send_connection_request',{target_recipient_id:b.id}));connections.push(id);
   await data(b.client.rpc('respond_connection_request',{target_connection_id:id,target_decision:'declined'}));
   assert.equal((await data(a.client.from('connections').select('id').eq('id',id))).length,0);
   await data(a.client.from('connections').delete().eq('id',id));
   id=await data(a.client.rpc('send_connection_request',{target_recipient_id:b.id}));connections.push(id);
   assert.equal(await data(c.client.rpc('respond_connection_request',{target_connection_id:id,target_decision:'accepted'})),false);
   assert.equal((await data(a.client.from('connections').select('status').eq('id',id)))[0].status,'pending');
   await data(b.client.rpc('respond_connection_request',{target_connection_id:id,target_decision:'accepted'}));
   assert.equal((await data(a.client.from('connections').select('status').eq('id',id)))[0].status,'accepted');
   await data(a.client.from('connections').delete().eq('id',id));
   id=await data(a.client.rpc('send_connection_request',{target_recipient_id:b.id}));connections.push(id);await data(b.client.rpc('respond_connection_request',{target_connection_id:id,target_decision:'accepted'}));
 });
 await check('B: invalid and unrelated actions','Self requests and unrelated connection reads are rejected/hidden',async()=>{
   assert.ok((await a.client.rpc('send_connection_request',{target_recipient_id:a.id})).error);
   assert.equal((await data(c.client.from('connections').select('id').in('id',connections))).length,0);
 });
 await check('C: direct conversation and messages','Connected members create a conversation, send and retrieve a real message',async()=>{
   conversationId=await data(a.client.rpc('start_direct_conversation',{target_member_id:b.id}));conversations.push(conversationId);
   await data(a.client.from('messages').insert({conversation_id:conversationId,sender_id:a.id,body:'Synthetic integration message'}));
   const rows=await data(b.client.from('messages').select('id,body').eq('conversation_id',conversationId));assert.equal(rows[0].body,'Synthetic integration message');
 });
 await check('C: membership and invalid recipient boundaries','Unrelated member cannot read/send messages or conversations; invalid recipient refused',async()=>{
   assert.equal((await data(c.client.from('messages').select('id').eq('conversation_id',conversationId))).length,0);
   assert.equal((await data(c.client.from('conversations').select('id').eq('id',conversationId))).length,0);
   assert.ok((await c.client.from('messages').insert({conversation_id:conversationId,sender_id:c.id,body:'Forbidden'})).error);
   assert.ok((await a.client.rpc('start_direct_conversation',{target_member_id:'00000000-0000-0000-0000-000000000000'})).error);
   assert.ok((await a.client.from('messages').insert({conversation_id:conversationId,sender_id:b.id,body:'Forged sender'})).error);
 });
 await check('D: notification creation/read/privacy/idempotence','Generated notification belongs to recipient; unrelated read/mark refused; repeated read is safe',async()=>{
   const rows=await data(b.client.from('notifications').select('id,read_at,conversation_id').eq('conversation_id',conversationId));assert.ok(rows.length);const id=rows[0].id;
   assert.equal((await data(c.client.from('notifications').select('id').eq('id',id))).length,0);
   await c.client.rpc('mark_notification_read',{target_notification_id:id});assert.equal((await data(b.client.from('notifications').select('read_at').eq('id',id)))[0].read_at,null);
   await data(b.client.rpc('mark_notification_read',{target_notification_id:id}));await data(b.client.rpc('mark_notification_read',{target_notification_id:id}));assert.ok((await data(b.client.from('notifications').select('read_at').eq('id',id)))[0].read_at);
 });
 await check('C/D: realtime delivery and reconnection','Messages and notification changes arrive after subscription and resubscription',async()=>{
   await b.client.realtime.setAuth((await data(b.client.auth.getSession())).session.access_token);
   for(let cycle=0;cycle<2;cycle++){
     note(`subscribe cycle ${cycle}`);
     const seen=new Set(),systems=[];const channel=b.client.channel(`qa-${stamp}-${cycle}`).on('system',{},payload=>systems.push({status:payload.status,extension:payload.extension})).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${conversationId}`},()=>seen.add('message')).on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`recipient_id=eq.${b.id}`},()=>seen.add('notification'));channels.push({client:b.client,channel});
     await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Subscription timeout')),10000);channel.subscribe(state=>{if(state==='SUBSCRIBED'){clearTimeout(timer);resolve();}if(state==='CHANNEL_ERROR'){clearTimeout(timer);reject(new Error('Subscription error'));}});});
     const readiness=Date.now();while(!systems.some(value=>value.extension==='postgres_changes'&&value.status==='ok')&&Date.now()-readiness<10000)await new Promise(r=>setTimeout(r,100));
     assert.ok(systems.some(value=>value.extension==='postgres_changes'&&value.status==='ok'),'PostgreSQL stream must become ready');
     console.log(`Realtime system statuses: ${JSON.stringify(systems)}`);
     note(`send cycle ${cycle}`);await data(a.client.from('messages').insert({conversation_id:conversationId,sender_id:a.id,body:`Synthetic realtime ${cycle}`}));
     const start=Date.now();while(seen.size<2&&Date.now()-start<10000)await new Promise(r=>setTimeout(r,100));note(`delivery cycle ${cycle}: ${[...seen].sort().join(',') || 'none'}`);
     if(seen.size!==2){
       const metadata=execFileSync('docker',['exec','supabase_db_afghan-hub-local-journey','psql','-U','postgres','-d','postgres','-tA','-c',"select json_build_object('publication_tables',(select count(*) from pg_publication_tables where pubname='supabase_realtime'),'authenticated_subscriptions',(select count(*) from realtime.subscription where claims->>'role'='authenticated'))"],{encoding:'utf8',stdio:['ignore','pipe','pipe']});console.log(`Realtime metadata: ${metadata.trim()}`);
       const log=execFileSync('docker',['logs','--tail','100','supabase_realtime_afghan-hub-local-journey'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
       console.log('Realtime error categories: '+JSON.stringify({permission:/permission denied/i.test(log),replication:/replication.*error|replication.*fail/i.test(log),tenant:/tenant.*not found/i.test(log),errorCount:(log.match(/\[error\]/g)||[]).length}));
     }
     assert.equal(seen.size,2);
     await b.client.removeChannel(channel);
   }
 });
 // Only the newly created local fixture receives moderation privilege.
 assert.match(moderator.id,uuid);
 await data(admin.from('profiles').update({role:'moderator'}).eq('id',moderator.id));
 assert.equal(await data(moderator.client.rpc('can_moderate')),true,'Local moderator fixture must be correctly provisioned');
 for(const [table,owner,payload,rpc,param] of [
   ['organizations','owner_id',{name:'Synthetic QA organization'},'moderate_organization','target_organization_id'],
   ['opportunities','author_id',{title:'Synthetic QA opportunity',description:'Disposable QA description',type:'job'},'moderate_opportunity','target_opportunity_id'],
   ['events','creator_id',{title:'Synthetic QA event',starts_at:new Date(Date.now()+86400000).toISOString()},'moderate_event','target_event_id'],
 ])await check(`E: ${table} ownership/moderation/CRUD`,'Owner can create/update/delete; outsiders cannot modify drafts; moderator publishes',async()=>{
   note('create owner draft');const row=await data(a.client.from(table).insert({...payload,[owner]:a.id,status:'draft',slug:`qa-${table}-${stamp}`}).select('id,status').single());content.push({table,id:row.id});assert.equal(row.status,'draft');
   note('anonymous visibility');assert.equal((await data(anon.from(table).select('id').eq('id',row.id))).length,0);
   const edit=table==='organizations'?{name:'Synthetic QA edited organization'}:{title:'Synthetic QA edited listing'};
   note('outsider update');assert.equal((await data(c.client.from(table).update(edit).eq('id',row.id).select('id'))).length,0);
   note('outsider moderation');assert.ok((await c.client.rpc(rpc,{[param]:row.id,target_decision:'approve',target_note:null})).error);
   note('owner update');await data(a.client.from(table).update(edit).eq('id',row.id));
   note('moderator approval');await data(moderator.client.rpc(rpc,{[param]:row.id,target_decision:'approve',target_note:null}));
   note('published visibility');assert.equal((await data(anon.from(table).select('status').eq('id',row.id)))[0].status,'published');
   note('owner delete');await data(a.client.from(table).delete().eq('id',row.id));assert.equal((await data(anon.from(table).select('id').eq('id',row.id))).length,0);
 });
}catch{results.push({scenario:'Harness prerequisite',expected:'All local fixtures prepared',status:'fail',actual:'Prerequisite failed; provider details withheld'});console.error('FAIL harness prerequisite');}
finally{
 for(const {client,channel} of channels)await client.removeChannel(channel);
 for(const client of clients){await client.auth.signOut({scope:'local'});await client.realtime.disconnect();}
 await check('Cleanup: captured local fixtures','Only fixture IDs created by this run are deleted',async()=>{
   for(const item of content)await data(admin.from(item.table).delete().eq('id',item.id));
   if(conversations.length)await data(admin.from('conversations').delete().in('id',conversations));
   if(connections.length)await data(admin.from('connections').delete().in('id',connections));
   for(const id of users)await data(admin.auth.admin.deleteUser(id));
 });
 mkdirSync('reports',{recursive:true});writeFileSync('reports/local-member-journeys.json',JSON.stringify({environment:'fresh local Supabase; synthetic accounts only',results,limitations:['API/RLS integration, not browser UI E2E','Confirmation token tested; email delivery and confirmation redirect UI not verified','Realtime resubscription tested; network-level transport interruption not simulated','Unread badge UI and navigation not covered by this API suite']},null,2)+'\n');
 console.log(`${results.filter(r=>r.status==='pass').length} passed; ${results.filter(r=>r.status==='fail').length} failed`);
 if(results.some(r=>r.status==='fail'))process.exitCode=1;
}
