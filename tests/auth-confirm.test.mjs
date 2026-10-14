import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function confirm({error=null, session={access_token:'synthetic'}, user={id:'synthetic'}, throws=false}={}) {
  const exports={}, calls=[];
  class NextResponse {
    constructor(body,init={}) {this.body=body;this.status=init.status;this.headers=new Headers(init.headers);}
    static redirect(url,status) {const response=new NextResponse(null,{status});response.headers.set('Location',url.toString());return response;}
  }
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/app/auth/confirm/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {
    exports, URL, URLSearchParams,
    require(name) {
      if(name==='next/server')return {NextResponse};
      if(name==='@/lib/site-url')return {getSiteUrl:()=> 'https://configured.example'};
      if(name==='@/lib/supabase/server')return {createClient:async()=>({auth:{verifyOtp:async input=>{calls.push(input);if(throws)throw Error('sensitive provider details');return {data:{user,session},error};}}})};
      throw Error(name);
    },
  });
  return {...exports,calls};
}
const request=query=>({nextUrl:new URL('/auth/confirm?'+query,'https://untrusted-upstream.example')});
function assertPrivate(response) {
  assert.equal(response.status,303);
  assert.match(response.headers.get('Cache-Control'),/private.*no-store/);
  assert.equal(response.headers.get('Referrer-Policy'),'no-referrer');
  const destination=new URL(response.headers.get('Location'));
  assert.equal(destination.origin,'https://configured.example');
  for(const key of ['token_hash','type','next','redirect_to'])assert.equal(destination.searchParams.has(key),false);
  return destination;
}
test('email and recovery tokens verify on the server with fixed destinations and private redirects',async()=>{
  for(const [type,path] of [['email','/dashboard'],['recovery','/update-password']]) {
    const route=confirm();const response=await route.GET(request(`type=${type}&token_hash=synthetic-token&next=https://evil.example&redirect_to=//evil.example`));
    assert.equal(assertPrivate(response).pathname,path);
    assert.equal(route.calls.length,1);assert.equal(route.calls[0].type,type);assert.equal(route.calls[0].token_hash,'synthetic-token');
  }
});
test('missing, malformed, ambiguous and unsupported verification inputs do not call Auth',async()=>{
  for(const query of ['', 'type=recovery', 'token_hash=synthetic', 'type=invite&token_hash=synthetic', 'type=email&token_hash=', 'type=email&token_hash=x&token_hash=y', 'type=email&type=recovery&token_hash=x', 'type=email&token_hash=%0Ax', 'type=email&token_hash='+ 'x'.repeat(513)]) {
    const route=confirm();const response=await route.GET(request(query));
    assert.ok(['/login','/forgot-password'].includes(assertPrivate(response).pathname));assert.equal(route.calls.length,0);
  }
});
test('expired, replayed, missing-session and upstream-error results never redirect into a protected flow',async()=>{
  for(const options of [{error:{message:'expired token synthetic'}},{session:null},{user:null},{throws:true}]) {
    for(const type of ['email','recovery']) {
      const route=confirm(options);const destination=assertPrivate(await route.GET(request(`type=${type}&token_hash=synthetic-token`)));
      assert.equal(destination.pathname,type==='email'?'/login':'/forgot-password');
      assert.match(destination.searchParams.get('error'),/invalid or has expired/);
      assert.ok(!destination.toString().includes('synthetic'));
    }
  }
});
test('HEAD does not consume a verification token',async()=>{
  const route=confirm();const response=await route.HEAD(request('type=recovery&token_hash=synthetic-token'));
  assert.equal(response.status,405);assert.equal(route.calls.length,0);assert.equal(response.headers.get('Allow'),'GET');assert.match(response.headers.get('Cache-Control'),/no-store/);
});
test('reviewed email templates use the configured site and one-time tokens, without arbitrary redirects',()=>{
  for(const [file,type] of [['confirmation','email'],['recovery','recovery']]) {
    const html=fs.readFileSync(new URL(`../supabase/templates/${file}.html`,import.meta.url),'utf8');
    assert.ok(html.includes(`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=${type}`));
    assert.ok(!html.includes('.RedirectTo'));assert.ok(!html.includes('.Data'));
  }
});
