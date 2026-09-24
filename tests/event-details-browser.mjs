const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {default:AxeBuilder}=await import(process.env.AXE_MODULE || '@axe-core/playwright');
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {EVENTS,MOVED} from '../build/event-content.mjs';
const base=process.env.EVENT_PREVIEW_URL || 'http://127.0.0.1:8766';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local tests only');
mkdirSync('qa/events',{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[], external=[], failed=[];
try{
 const context=await browser.newContext();
 await context.route('**/*',route=>{
  const req=route.request();
  if(req.url().startsWith(base+'/')) return route.continue();
  external.push(req.url());return route.abort();
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400) failed.push(r.url());});
 for(const e of EVENTS){
  const path=`/eventi-ai-aziende/${e.slug}/`;
  await page.goto(base+'/eventi-ai-aziende/');
  await page.locator(`.calendar-date[href="${path}"]`).click();
  assert.equal(new URL(page.url()).pathname,path);
  assert.equal(await page.locator('h1').innerText(),e.title);
  assert.equal(await page.locator('form').count(),0);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>document.fonts.ready);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${e.slug}: overflow at ${width}`);
   if([390,1440].includes(width)){
    await page.screenshot({path:`qa/events/${e.slug}-${width}.png`,fullPage:true});
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(result.violations,[],`${e.slug}: accessibility ${width}`);
   }
  }
  const ctas=await page.locator('.event-cta').count();assert.equal(ctas,2);
  for(let i=0;i<ctas;i++){
   await page.goto(base+path);
   await page.locator('.event-cta').nth(i).click();
   await page.locator('#registration-fields:not([disabled])').waitFor();
   assert.equal(new URL(page.url()).pathname,'/eventi-ai-aziende/');
   assert.equal(new URL(page.url()).searchParams.get('event'),e.date);
   assert.equal(new URL(page.url()).hash,'#registration');
   assert.equal(await page.locator('#event-date').inputValue(),e.date);
   assert.ok((await page.locator('#event-date option:checked').innerText()).includes(e.title));
  }
  await page.goto(base+'/eventi-ai-aziende/');
  await page.locator(`.topic-actions a[href$="?event=${e.date}#registration"]`).click();
  await page.waitForURL(`${base}/eventi-ai-aziende/?event=${e.date}#registration`);
  await page.locator('#registration-fields:not([disabled])').waitFor();
  assert.equal(await page.locator('#event-date').inputValue(),e.date);
 }
 const nojs=await browser.newContext({javaScriptEnabled:false});
 await nojs.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const staticPage=await nojs.newPage();
 for(const e of EVENTS){await staticPage.goto(`${base}/eventi-ai-aziende/${e.slug}/`);assert.equal(await staticPage.locator('h1').innerText(),e.title);assert.ok(await staticPage.locator('.event-abstract').isVisible());}
 // Retired URLs must land on the renamed page even without JavaScript (meta refresh).
 for(const [from,to] of MOVED){await staticPage.goto(`${base}/eventi-ai-aziende/${from}/`);await staticPage.waitForURL(`${base}/eventi-ai-aziende/${to}/`);assert.equal(await staticPage.locator('h1').innerText(),EVENTS.find(e=>e.slug===to).title);}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);
 console.log('PASS 3 hub-to-detail journeys, all 6 detail CTAs and 3 hub register actions preselect correct date; 4 widths each, 6 axe checks, no-JS abstracts, 3 retired-URL redirects, 6 screenshots; 0 external requests, 0 submissions, 0 browser errors.');
}finally{await browser.close();}
