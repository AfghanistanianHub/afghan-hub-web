import assert from 'node:assert/strict';
import {execFile,execFileSync} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

assert.equal(process.env.CI,'true','This disposable Docker fixture is only for CI');
assert.equal(process.platform,'linux');
const exports={};
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/assistant/discovery-budget.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:()=>({})});
const name=`afghan-budget-qa-${randomUUID()}`;
let container;
const run=promisify(execFile);
const results=[];
try {
 container=execFileSync('docker',['run','--detach','--network','none','--name',name,'mirror.gcr.io/library/redis:7.4-alpine'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 assert.match(container,/^[a-f0-9]{64}$/);
 const redis=async(...args)=>(await run('docker',['exec',container,'redis-cli','--raw',...args],{encoding:'utf8'})).stdout.trim();
 for(let attempt=0;attempt<30;attempt++) {try{if(await redis('PING')==='PONG')break;}catch{}if(attempt===29)throw Error('Disposable Redis startup failed');await new Promise(r=>setTimeout(r,100));}
 const claim=()=>redis('EVAL',exports.budgetScript,'2','qa:minute','qa:day');
 const concurrent=await Promise.all(Array.from({length:30},claim));
 assert.equal(concurrent.filter(value=>value==='1').length,10);assert.equal(concurrent.filter(value=>value==='0').length,20);
 assert.equal(await redis('GET','qa:day'),'10');
 assert.ok(Number(await redis('TTL','qa:minute'))>0);assert.ok(Number(await redis('TTL','qa:minute'))<=60);
 assert.ok(Number(await redis('TTL','qa:day'))>0);assert.ok(Number(await redis('TTL','qa:day'))<=86400);
 results.push({scenario:'Atomic concurrent minute ceiling and expirations',status:'pass',actual:'Exactly 10 of 30 concurrent reservations accepted; fixed TTLs set'});
 await redis('DEL','qa:minute');await redis('SET','qa:day','199','EX','30');
 assert.equal(await claim(),'1');assert.equal(await claim(),'0');assert.equal(await redis('GET','qa:day'),'200');assert.ok(Number(await redis('TTL','qa:day'))<=30);
 results.push({scenario:'Daily ceiling without resetting an existing expiration',status:'pass',actual:'199 to 200 accepted; next reservation denied and day TTL retained'});
 console.log('PASS 2 shared-budget Redis integration scenarios (disposable container; no provider calls)');
} finally {
 if(container)execFileSync('docker',['rm','--force',container],{stdio:'ignore'});
 mkdirSync('reports',{recursive:true});writeFileSync('reports/local-model-budget.json',JSON.stringify({environment:'disposable Redis 7.4; no network or public ports',results,limitations:['Upstash HTTP transport tested with stubs; live service unconfigured','No live model calls or measured provider costs']},null,2)+'\n');
}
