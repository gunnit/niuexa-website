const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { default: AxeBuilder } = await import(process.env.AXE_MODULE || '@axe-core/playwright');
import assert from 'node:assert/strict';
const base=process.env.EVENT_PREVIEW_URL || 'http://127.0.0.1:8766';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local tests only');
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext();
 const page=await context.newPage();
 await page.route('https://**/*',r=>r.abort());
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
