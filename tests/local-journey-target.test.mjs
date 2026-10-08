import test from 'node:test';
import assert from 'node:assert/strict';
import {requireLocalTarget} from '../scripts/qa/local-target.mjs';
test('isolated journey harness refuses hosted, production, credentialed and unexpected local targets',()=>{
 for(const value of ['https://yussznmwjsvfvpabmwdc.supabase.co','https://rurgmyiiytesknsfwjjl.supabase.co','http://127.0.0.1:54321','http://user:password@localhost:55321','http://localhost:55321/private','http://localhost.evil.example:55321'])assert.throws(()=>requireLocalTarget(value));
 assert.equal(requireLocalTarget('http://127.0.0.1:55321'),'http://127.0.0.1:55321');
});
