const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { default: AxeBuilder } = await import(process.env.AXE_MODULE || '@axe-core/playwright');
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const base=process.env.EVENT_PREVIEW_URL || 'http://127.0.0.1:8766';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local tests only');
// The form states below need an open date: serve the hub as rendered on 29 September, clock pinned.
const root=resolve(import.meta.dirname,'..');
const rendered=mkdtempSync(join(tmpdir(),'hub-'));
mkdirSync(join(rendered,'eventi-ai-aziende'));
for(const f of ['eventi-ai-aziende/index.html','sitemap.xml','llms.txt']) copyFileSync(join(root,f),join(rendered,f));
execFileSync(process.execPath,['build/render-events.mjs','--today=2026-09-29'],{cwd:root,env:{...process.env,EVENTS_ROOT:rendered},stdio:'pipe'});
const hub=readFileSync(join(rendered,'eventi-ai-aziende/index.html'),'utf8');
rmSync(rendered,{recursive:true,force:true});
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext();
 await context.clock.setFixedTime(new Date('2026-09-29T10:00:00+02:00'));
 const page=await context.newPage();
 await page.route('https://**/*',r=>r.abort());
 await page.route(base+'/eventi-ai-aziende/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:hub}));
 for(const width of [390,1440]) {
  await page.setViewportSize({width,height:1000});
  await page.goto(base+'/eventi-ai-aziende/');
  await page.locator('#registration-fields:not([disabled])').waitFor();
  for(const state of ['initial','errors','faq-open']) {
   if(state==='errors') await page.locator('#submit-registration').click();
   if(state==='faq-open') await page.locator('details').evaluateAll(els=>els.forEach(e=>e.open=true));
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   console.log(JSON.stringify({width,state,violations:result.violations,incomplete:result.incomplete.map(i=>i.id)}));
   assert.equal(result.violations.length,0);
  }
 }
} finally {await browser.close();}
