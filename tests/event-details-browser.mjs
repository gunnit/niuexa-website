const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {default:AxeBuilder}=await import(process.env.AXE_MODULE || '@axe-core/playwright');
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,copyFileSync,existsSync,readFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {EVENTS,MOVED} from '../build/event-content.mjs';
const base=process.env.EVENT_PREVIEW_URL || 'http://127.0.0.1:8766';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local tests only');
mkdirSync('qa/events',{recursive:true});
// Every journey below needs all dates open, so the event pages are rendered as of 29 September
// and served in place of the committed ones, with the clock pinned to the same day.
const root=resolve(import.meta.dirname,'..');
const rendered=mkdtempSync(join(tmpdir(),'events-'));
mkdirSync(join(rendered,'eventi-ai-aziende'));
for(const f of ['eventi-ai-aziende/index.html','sitemap.xml','llms.txt']) copyFileSync(join(root,f),join(rendered,f));
execFileSync(process.execPath,['build/render-events.mjs','--today=2026-09-29'],{cwd:root,env:{...process.env,EVENTS_ROOT:rendered},stdio:'pipe'});
const serve=route=>{
 const url=new URL(route.request().url());
 if(url.origin!==new URL(base).origin) return false;
 const file=join(rendered,decodeURIComponent(url.pathname),'index.html');
 if(!url.pathname.startsWith('/eventi-ai-aziende/')||!url.pathname.endsWith('/')||!existsSync(file)) return false;
 route.fulfill({contentType:'text/html; charset=utf-8',body:readFileSync(file,'utf8')});
 return true;
};
const day=new Date('2026-09-29T10:00:00+02:00');
const browser=await chromium.launch({headless:true});
const errors=[], external=[], failed=[], tags=[];
try{
 const context=await browser.newContext();
 await context.clock.setFixedTime(day);
 await context.route('**/*',route=>{
  const req=route.request();
  if(serve(route)) return;
  if(req.url().startsWith(base+'/')) return route.continue();
  // GTM is expected: it is recorded and answered with an empty script, so no tag fires.
  if(new URL(req.url()).hostname==='www.googletagmanager.com'){tags.push(req.url());return route.fulfill({contentType:'text/javascript',body:''});}
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
 await nojs.route('**/*',r=>serve(r)||(r.request().url().startsWith(base+'/')?r.continue():r.abort()));
 const staticPage=await nojs.newPage();
 for(const e of EVENTS){await staticPage.goto(`${base}/eventi-ai-aziende/${e.slug}/`);assert.equal(await staticPage.locator('h1').innerText(),e.title);assert.ok(await staticPage.locator('.event-abstract').isVisible());}
 // Retired URLs must land on the renamed page even without JavaScript (meta refresh).
 for(const [from,to] of MOVED){await staticPage.goto(`${base}/eventi-ai-aziende/${from}/`);await staticPage.waitForURL(`${base}/eventi-ai-aziende/${to}/`);assert.equal(await staticPage.locator('h1').innerText(),EVENTS.find(e=>e.slug===to).title);}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);
 assert.ok(tags.some(url=>url.startsWith('https://www.googletagmanager.com/gtm.js?id=GTM-KG9S42S4')),'GTM loads');
 console.log('PASS 3 hub-to-detail journeys, all 6 detail CTAs and 3 hub register actions preselect correct date; 4 widths each, 6 axe checks, no-JS abstracts, 3 retired-URL redirects, 6 screenshots; 0 external requests, 0 submissions, 0 browser errors.');
}finally{await browser.close();rmSync(rendered,{recursive:true,force:true});}
