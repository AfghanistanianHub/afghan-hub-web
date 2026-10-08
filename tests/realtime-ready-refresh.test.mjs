import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

for (const [file,component,props] of [
 ['messages/realtime-read-receipt-refresh.tsx','RealtimeReadReceiptRefresh',{conversationId:'conversation-a'}],
 ['dashboard/notification-bell.tsx','NotificationBell',{currentUserId:'member-a',notifications:[],unreadCount:0}],
]) test(`${component} catches up only when PostgreSQL is ready and removes its channel`,()=>{
 const listeners=[];let refreshes=0,cleanup,removed=false;
 const channel={on(type,filter,callback){listeners.push({type,filter,callback});return this;},subscribe(){return this;}};
 const exports={};
 vm.runInNewContext(ts.transpileModule(readFileSync(`src/components/${file}`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require(name){
   if(name==='react')return {useEffect(effect){const result=effect();if(result)cleanup=result;},useRef:()=>({current:null}),useId:()=> 'test-id',useState:initial=>[initial,()=>{}]};
   if(name==='react/jsx-runtime')return {jsx:()=>null,jsxs:()=>null};
   if(name==='next/navigation')return {useRouter:()=>({refresh(){refreshes++;}})};
   if(name==='@/lib/supabase/client')return {createClient:()=>({channel:()=>channel,removeChannel(value){assert.equal(value,channel);removed=true;}})};
   if(name==='@/lib/supabase/member-realtime')return {subscribeMemberChannel(client,channel){channel.subscribe();return ()=>client.removeChannel(channel);}};
   if(name.endsWith('.css'))return {default:{}};
   return {};
 }});
 exports[component](props);
 const ready=listeners.find(x=>x.type==='system').callback;
 ready({extension:'broadcast',status:'ok'});ready({extension:'postgres_changes',status:'error'});assert.equal(refreshes,0);
 ready({extension:'postgres_changes',status:'ok'});ready({extension:'postgres_changes',status:'ok'});assert.equal(refreshes,2,'initial readiness and rejoin catch up server state');
 cleanup();assert.equal(removed,true);
});
