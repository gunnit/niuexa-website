import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistration, validate } from '../event-registration-core.mjs';
import { EVENTS, REGISTRATION } from '../event-registration-config.mjs';
const valid = { firstName: ' Ada ', lastName: 'Esempio', company: 'TEST NON ISCRIZIONE', email: 'qa@example.com', mobile: '+39 000 000 0000' };

test('validation trims, checks every required field, lengths and malformed contact details',()=>{
 assert.equal(validate(valid).data.firstName,'Ada');
 for(const key of Object.keys(valid)) {
  assert.ok(validate({...valid,[key]:'  '}).errors[key]);
  assert.ok(validate({...valid,[key]:'x'.repeat(300)}).errors[key]);
 }
 for(const email of ['wrong','a@b','a b@example.com']) assert.ok(validate({...valid,email}).errors.email);
 for(const mobile of ['123','abc123456789','+1234567890123456']) assert.ok(validate({...valid,mobile}).errors.mobile);
});
test('provider failures never succeed; errors release lock for a deliberate retry',async()=>{
 for(const scenario of ['false','string','missing','http','json','network']) {
  let calls=0;
  const flow=createRegistration({fetchImpl:async()=>{
   calls++;
   if(calls>1) return {ok:true,json:async()=>({success:true})};
   if(scenario==='network') throw Error('network');
   return {ok:scenario!=='http',json:async()=>{
    if(scenario==='json') throw Error('json');
    return scenario==='missing'?{}:{success:scenario==='string'?'true':scenario==='http'};
   }};
  }});
  await assert.rejects(flow.submit('2026-10-06',valid));
  assert.equal((await flow.submit('2026-10-06',valid)).status,'received');
 }
});
test('invalid event, invalid data and spam do not call provider; concurrent and repeat submits blocked',async()=>{
 let calls=0,release;
 const flow=createRegistration({fetchImpl:()=>{calls++;return new Promise(r=>release=()=>r({ok:true,json:async()=>({success:true})}));}});
 await assert.rejects(flow.submit('2026-10-07',valid),/EVENT/);
 await assert.rejects(flow.submit('2026-10-06',{}),/VALIDATION/);
 await assert.rejects(flow.submit('2026-10-06',{...valid,botcheck:'bot'}),/SPAM/);
 assert.equal(calls,0);
 const pending=flow.submit('2026-10-06',valid);
 await assert.rejects(flow.submit('2026-10-06',valid),/BUSY/);
 release();await pending;
 await assert.rejects(flow.submit('2026-10-06',valid),/DUPLICATE/);
 assert.equal(calls,1);
});
test('request timeout aborts transport without false receipt or automatic retry',async()=>{
 let calls=0;
 const flow=createRegistration({timeoutMs:5,fetchImpl:async(url,{signal})=>{
  calls++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout'))));
 }});
 await assert.rejects(flow.submit('2026-10-06',valid),/timeout/);
 assert.equal(calls,1);
 await assert.rejects(flow.submit('2026-10-06',valid),/timeout/);
 assert.equal(calls,2);
});
test('approved dates share 18:30 Europe/Rome and verified Bebit Milano venue; no invented speakers or prices',()=>{
 assert.deepEqual(EVENTS.map(e=>e.date),['2026-10-06','2026-11-17','2026-12-02']);
 for(const e of EVENTS) {
  assert.equal(e.time,'18:30');
  assert.equal(e.timezone,'Europe/Rome');
  assert.equal(e.venue,'Ufficio Bebit, Via Rutilia 10, 20141 Milano');
  for(const k of ['title','agenda','speakers','price']) assert.equal(e[k],null);
  assert.equal(e.format,'in-person');
 }
 assert.equal('legalApproved' in REGISTRATION,false);
});

test('production transport sends approved date, trimmed fields and existing provider key, only true acknowledges', async () => {
 let payload;
 const flow = createRegistration({fetchImpl: async (url, options) => {
  assert.equal(url, 'https://api.web3forms.com/submit');
  payload=JSON.parse(options.body);
  return {ok:true, json:async()=>({success:true})};
 }});
 const receipt=await flow.submit('2026-11-17',valid);
 assert.equal(receipt.status,'received');
 assert.equal(payload.firstName,'Ada');
 assert.equal(payload.event_date,'2026-11-17');
 assert.equal(payload.event_label,'17 novembre 2026');
 assert.equal(payload.access_key,REGISTRATION.accessKey);
 assert.ok(payload.access_key);
 assert.equal(payload.botcheck,'');
 assert.equal(payload.subject,'Richiesta partecipazione NIUEXA | 17 novembre 2026');
 assert.equal(payload.replyto,valid.email);
 assert.equal(payload.source,'https://niuexa.ai/eventi-ai-aziende/');
 assert.ok(!('redirect' in payload));
 await assert.rejects(flow.submit('2026-11-17',valid),/DUPLICATE/);
});
