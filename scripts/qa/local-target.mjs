import assert from 'node:assert/strict';
export function requireLocalTarget(value,port=55321){
 const url=new URL(value);assert.equal(url.protocol,'http:');assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Only a loopback QA target is allowed');assert.equal(url.port,String(port));assert.equal(url.username,'');assert.equal(url.password,'');assert.equal(url.pathname,'/');return url.origin;
}
