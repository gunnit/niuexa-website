const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const base = process.env.EVENT_PREVIEW_URL || 'http://127.0.0.1:8766';
if (!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local tests only');
// Which dates the hub offers depends on the day it was rendered, so the hub is rendered
// here as of a fixed day and served in place of the committed one.
const root=resolve(import.meta.dirname,'..');
const hubAsOf=today=>{
 const dir=mkdtempSync(join(tmpdir(),'hub-'));
 try {
  mkdirSync(join(dir,'eventi-ai-aziende'));
  for(const f of ['eventi-ai-aziende/index.html','sitemap.xml','llms.txt']) copyFileSync(join(root,f),join(dir,f));
  execFileSync(process.execPath,['build/render-events.mjs',`--today=${today}`],{cwd:root,env:{...process.env,EVENTS_ROOT:dir},stdio:'pipe'});
  return readFileSync(join(dir,'eventi-ai-aziende/index.html'),'utf8');
 } finally {rmSync(dir,{recursive:true,force:true});}
};
const fullCalendar=hubAsOf('2026-09-29');
const errors=[], external=[]; let sent=[], response={success:true}, httpStatus=200, delay=0;
// Intercept every remote request. A regression cannot submit real PII.
const guard=hub=>async route=>{
 const req=route.request();
 if(req.url().startsWith(base+'/eventi-ai-aziende/?')||req.url()===base+'/eventi-ai-aziende/') return route.fulfill({contentType:'text/html; charset=utf-8',body:hub});
 if(req.url().startsWith(base+'/')) return route.continue();
 if(req.url()==='https://api.web3forms.com/submit') {
  sent.push(JSON.parse(req.postData()));
  await new Promise(r=>setTimeout(r,delay));
  return route.fulfill({status:httpStatus,contentType:'application/json',body:JSON.stringify(response)});
 }
 external.push(req.url()); return route.abort();
};
const browser=await chromium.launch({headless:true});
// Which dates are open also depends on today's date in Milan, so every page pins its clock.
const at=async(when,hub=fullCalendar,options={})=>{const p=await browser.newPage(options);p.on('pageerror',e=>errors.push(e.message));await p.clock.setFixedTime(new Date(when));await p.route('**/*',guard(hub));return p;};
const page=await at('2026-09-29T10:00:00+02:00',fullCalendar,{viewport:{width:1440,height:1050}});
const options=p=>p.locator('#event-date option').evaluateAll(o=>o.map(x=>x.value));
const data={firstName:'Ada',lastName:'Esempio',company:'TEST NON ISCRIZIONE',email:'qa@example.com',mobile:'+39 000 000 0000'};
const fill=async(p=page)=>{for(const [k,v] of Object.entries(data)) await p.locator('#'+k).fill(v);};
try {
 await page.goto(base+'/eventi-ai-aziende/');
 await page.locator('#registration-fields:not([disabled])').waitFor();
 assert.deepEqual(await options(page),['2026-11-03','2026-11-17','2026-11-24']);
 assert.match(await page.title(),/Eventi AI per aziende/);
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://niuexa.ai/eventi-ai-aziende/');
 await page.locator('#submit-registration').click();
 assert.equal(await page.locator('[aria-invalid=true]').count(),5);
 assert.equal(sent.length,0);
 await fill(); delay=300;
 await page.locator('#submit-registration').click();
 assert.equal(await page.locator('#event-date').isDisabled(),true);
 assert.equal(await page.locator('#registration-form').getAttribute('aria-busy'),'true');
 await page.waitForFunction(()=>document.querySelector('#form-status').textContent.includes('Richiesta ricevuta'));
 assert.equal(sent.length,1); assert.equal(sent[0].event_date,'2026-11-03');
 assert.equal(await page.locator('#firstName').inputValue(),'');
 assert.match(await page.locator('#form-status').innerText(),/non conferma/);
 assert.equal(await page.locator('#submit-registration').isDisabled(),true);
 await page.locator('#event-date').selectOption('2026-11-24');
 assert.equal(await page.locator('#submit-registration').isDisabled(),false);
 await fill(); response={success:'true'}; delay=0;
 await page.locator('#submit-registration').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('error'));
 assert.equal(await page.locator('#firstName').inputValue(),'Ada');
 assert.equal(await page.locator('#submit-registration').isDisabled(),false);
 response={success:true};
 await page.locator('#submit-registration').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('success'));
 assert.equal(sent.at(-1).event_date,'2026-11-24');
 await page.goto(base+'/eventi-ai-aziende/?event=2026-11-17');
 assert.equal(await page.locator('#event-date').inputValue(),'2026-11-17');
 await fill(); await page.locator('#botcheck').evaluate(el=>el.value='spam');
 const before=sent.length;
 await page.locator('#submit-registration').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('error'));
 assert.equal(sent.length,before);
 await page.goto(base+'/eventi-ai-aziende/?event=unknown');
 assert.equal(await page.locator('#submit-registration').isDisabled(),true);
 await page.locator('#event-date').selectOption('2026-11-17');
 assert.equal(await page.locator('#submit-registration').isDisabled(),false);
 // The served page may predate today's render: the form must still drop dates that have passed.
 const eve=await at('2026-11-03T22:30:00Z'); // 23:30 in Milan: the 3 November date is still open
 await eve.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(eve),['2026-11-03','2026-11-17','2026-11-24']);
 const after=await at('2026-11-03T23:30:00Z'); // 00:30 on 4 November in Milan, still 3 November in UTC
 await after.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(after),['2026-11-17','2026-11-24']);
 assert.equal(await after.locator('#event-date').inputValue(),'2026-11-17');
 assert.equal(await after.locator('#selected-date').innerText(),'17 novembre 2026');
 assert.equal(await after.locator('#submit-registration').isDisabled(),false);
 await after.goto(base+'/eventi-ai-aziende/?event=2026-11-03');
 assert.match(await after.locator('#form-status').innerText(),/3 novembre 2026 si è già svolto/);
 assert.equal(await after.locator('#submit-registration').isDisabled(),true);
 await after.locator('#event-date').selectOption('2026-11-17');
 assert.equal(await after.locator('#submit-registration').isDisabled(),false);
 const closed=await at('2026-11-25T09:00:00+01:00');
 await closed.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(closed),['']);
 assert.equal(await closed.locator('#event-date').isDisabled(),true);
 assert.equal(await closed.locator('#submit-registration').isDisabled(),true);
 assert.match(await closed.locator('#form-status').innerText(),/si sono conclusi/);
 // A device clock running late must not reopen a date that the served page has already closed.
 const late=await at('2026-11-03T22:00:00Z',hubAsOf('2026-11-04')); // 23:00 on 3 November in Milan
 await late.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(late),['2026-11-17','2026-11-24']);
 assert.equal(await late.locator('#event-date').inputValue(),'2026-11-17');
 await late.goto(base+'/eventi-ai-aziende/?event=2026-11-03');
 assert.deepEqual(await options(late),['','2026-11-17','2026-11-24']);
 assert.match(await late.locator('#form-status').innerText(),/La data richiesta non è disponibile/);
 assert.equal(await late.locator('#submit-registration').isDisabled(),true);
 // A tab left open past midnight must not send the date that has just closed.
 const overnight=await at('2026-11-03T22:50:00Z'); // 23:50 on 3 November in Milan
 await overnight.goto(base+'/eventi-ai-aziende/?event=2026-11-03');
 await fill(overnight);
 await overnight.clock.setFixedTime(new Date('2026-11-03T23:05:00Z')); // 00:05 on 4 November
 let count=sent.length;
 await overnight.locator('#submit-registration').click();
 // Wait for the outcome before counting, so a request sent late would still be caught.
 await overnight.waitForFunction(()=>/si è già svolto|Richiesta ricevuta|Non possiamo verificare/.test(document.querySelector('#form-status').textContent));
 assert.match(await overnight.locator('#form-status').innerText(),/3 novembre 2026 si è già svolto\. Scegli/);
 assert.equal(sent.length,count);
 assert.deepEqual(await options(overnight),['','2026-11-17','2026-11-24']);
 assert.equal(await overnight.locator('#selected-date').innerText(),'Scegli una data');
 assert.equal(await overnight.locator('#submit-registration').isDisabled(),true);
 await overnight.locator('#event-date').selectOption('2026-11-17');
 await overnight.locator('#submit-registration').click();
 await overnight.waitForFunction(()=>document.querySelector('#form-status').classList.contains('success'));
 assert.equal(sent.at(-1).event_date,'2026-11-17');
 const lastNight=await at('2026-11-24T22:50:00Z'); // 23:50 on 24 November in Milan
 await lastNight.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(lastNight),['2026-11-24']);
 await fill(lastNight);
 await lastNight.clock.setFixedTime(new Date('2026-11-24T23:05:00Z')); // 00:05 on 25 November
 count=sent.length;
 await lastNight.locator('#submit-registration').click();
 await lastNight.waitForFunction(()=>/si è già svolto|Richiesta ricevuta|Non possiamo verificare/.test(document.querySelector('#form-status').textContent));
 assert.match(await lastNight.locator('#form-status').innerText(),/24 novembre 2026 si è già svolto\. Per informazioni/);
 assert.equal(sent.length,count);
 assert.deepEqual(await options(lastNight),['']);
 assert.equal(await lastNight.locator('#event-date').isDisabled(),true);
 assert.equal(await lastNight.locator('#selected-date').innerText(),'Richieste chiuse');
 assert.equal(await lastNight.locator('#submit-registration').innerText(),'Richieste chiuse');
 await page.goto(base+'/eventi-ai-aziende/');
 for(const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${width}`);
  if([390,1440].includes(width)) await page.screenshot({path:`qa/events/production-${width}.png`,fullPage:true});
 }
 const nojs=await at('2026-09-29T10:00:00+02:00',fullCalendar,{javaScriptEnabled:false});
 await nojs.goto(base+'/eventi-ai-aziende/');
 assert.equal(await nojs.locator('#submit-registration').isDisabled(),true);
 // Registered after the guard, so it runs first for the module (Playwright runs the latest route first).
 const broken=await at('2026-09-29T10:00:00+02:00'); await broken.route('**/event-registration.mjs',r=>r.abort());
 await broken.goto(base+'/eventi-ai-aziende/');
 assert.equal(await broken.locator('#submit-registration').isDisabled(),true);
 assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
 console.log('PASS mocked production form: validation, loading, strict success, duplicate guard, false-success retry, honeypot, date payload/deep links, invalid date, past dates dropped at Milan midnight, late device clock, tab left open past midnight, closed series, 4 widths, no-JS/module safety; no external network, 0 page errors.');
} finally {await browser.close();}
