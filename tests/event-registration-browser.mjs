const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const base = process.env.EVENT_PREVIEW_URL || 'http://127.0.0.1:8766';
if (!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local tests only');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
// Which dates are open depends on today's date in Milan, so every page pins its clock.
await page.clock.setFixedTime(new Date('2026-09-29T10:00:00+02:00'));
const errors=[], external=[]; let sent=[], response={success:true}, httpStatus=200, delay=0;
page.on('pageerror',e=>errors.push(e.message));
// Intercept every remote request. A regression cannot submit real PII.
await page.route('**/*',async route=>{
 const req=route.request();
 if(req.url().startsWith(base+'/')) return route.continue();
 if(req.url()==='https://api.web3forms.com/submit') {
  sent.push(JSON.parse(req.postData()));
  await new Promise(r=>setTimeout(r,delay));
  return route.fulfill({status:httpStatus,contentType:'application/json',body:JSON.stringify(response)});
 }
 external.push(req.url()); return route.abort();
});
const data={firstName:'Ada',lastName:'Esempio',company:'TEST NON ISCRIZIONE',email:'qa@example.com',mobile:'+39 000 000 0000'};
const fill=async()=>{for(const [k,v] of Object.entries(data)) await page.locator('#'+k).fill(v);};
try {
 await page.goto(base+'/eventi-ai-aziende/');
 await page.locator('#registration-fields:not([disabled])').waitFor();
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
 assert.equal(sent.length,1); assert.equal(sent[0].event_date,'2026-10-06');
 assert.equal(await page.locator('#firstName').inputValue(),'');
 assert.match(await page.locator('#form-status').innerText(),/non conferma/);
 assert.equal(await page.locator('#submit-registration').isDisabled(),true);
 await page.locator('#event-date').selectOption('2026-11-17');
 assert.equal(await page.locator('#submit-registration').isDisabled(),false);
 await fill(); response={success:'true'}; delay=0;
 await page.locator('#submit-registration').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('error'));
 assert.equal(await page.locator('#firstName').inputValue(),'Ada');
 assert.equal(await page.locator('#submit-registration').isDisabled(),false);
 response={success:true};
 await page.locator('#submit-registration').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('success'));
 assert.equal(sent.at(-1).event_date,'2026-11-17');
 await page.goto(base+'/eventi-ai-aziende/?event=2026-10-27');
 assert.equal(await page.locator('#event-date').inputValue(),'2026-10-27');
 await fill(); await page.locator('#botcheck').evaluate(el=>el.value='spam');
 const before=sent.length;
 await page.locator('#submit-registration').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('error'));
 assert.equal(sent.length,before);
 await page.goto(base+'/eventi-ai-aziende/?event=unknown');
 assert.equal(await page.locator('#submit-registration').isDisabled(),true);
 await page.locator('#event-date').selectOption('2026-10-27');
 assert.equal(await page.locator('#submit-registration').isDisabled(),false);
 // The served page may predate today's render: the form must still drop dates that have passed.
 const at=async when=>{const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.clock.setFixedTime(new Date(when));return p;};
 const options=p=>p.locator('#event-date option').evaluateAll(o=>o.map(x=>x.value));
 const eve=await at('2026-10-06T21:30:00Z'); // 23:30 in Milan: the 6 October date is still open
 await eve.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(eve),['2026-10-06','2026-10-27','2026-11-17']);
 const after=await at('2026-10-06T22:30:00Z'); // 00:30 on 7 October in Milan, still 6 October in UTC
 await after.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(after),['2026-10-27','2026-11-17']);
 assert.equal(await after.locator('#event-date').inputValue(),'2026-10-27');
 assert.equal(await after.locator('#selected-date').innerText(),'27 ottobre 2026');
 assert.equal(await after.locator('#submit-registration').isDisabled(),false);
 await after.goto(base+'/eventi-ai-aziende/?event=2026-10-06');
 assert.match(await after.locator('#form-status').innerText(),/6 ottobre 2026 si è già svolto/);
 assert.equal(await after.locator('#submit-registration').isDisabled(),true);
 await after.locator('#event-date').selectOption('2026-10-27');
 assert.equal(await after.locator('#submit-registration').isDisabled(),false);
 const closed=await at('2026-11-18T09:00:00+01:00');
 await closed.goto(base+'/eventi-ai-aziende/');
 assert.deepEqual(await options(closed),['']);
 assert.equal(await closed.locator('#event-date').isDisabled(),true);
 assert.equal(await closed.locator('#submit-registration').isDisabled(),true);
 assert.match(await closed.locator('#form-status').innerText(),/si sono conclusi/);
 await page.goto(base+'/eventi-ai-aziende/');
 for(const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${width}`);
  if([390,1440].includes(width)) await page.screenshot({path:`qa/events/production-${width}.png`,fullPage:true});
 }
 const nojs=await browser.newPage({javaScriptEnabled:false});
 await nojs.goto(base+'/eventi-ai-aziende/');
 assert.equal(await nojs.locator('#submit-registration').isDisabled(),true);
 const broken=await browser.newPage(); await broken.route('**/event-registration.mjs',r=>r.abort());
 await broken.goto(base+'/eventi-ai-aziende/');
 assert.equal(await broken.locator('#submit-registration').isDisabled(),true);
 assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
 console.log('PASS mocked production form: validation, loading, strict success, duplicate guard, false-success retry, honeypot, date payload/deep links, invalid date, past dates dropped at Milan midnight, closed series, 4 widths, no-JS/module safety; no external network, 0 page errors.');
} finally {await browser.close();}
