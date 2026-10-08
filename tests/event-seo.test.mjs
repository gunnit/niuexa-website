import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {REGISTRATION} from '../event-registration-config.mjs';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('eventi-ai-aziende/index.html');
test('canonical, title, indexability, clean URL and static direct answers are consistent',()=>{
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/<title>Eventi AI per aziende: incontri 2026 \| NIUEXA<\/title>/);
 assert.match(html,/<link rel="canonical" href="https:\/\/niuexa.ai\/eventi-ai-aziende\/">/);
 assert.match(html,/<meta property="og:url" content="https:\/\/niuexa.ai\/eventi-ai-aziende\/">/);
 assert.ok(!/noindex|demo|anteprima locale|iscrizioni non ancora aperte/i.test(html));
 for(const date of ['2026-11-03','2026-11-17','2026-11-24']) assert.ok(html.includes(date));
 for(const date of ['2026-12-02','2026-10-06','2026-10-27']) assert.ok(!html.includes(date),`retired date ${date}`);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.ok(!schema['@graph'].some(n=>n['@type']==='Event'));
 assert.deepEqual(schema['@graph'].map(n=>n['@type']),['Organization','WebPage','FAQPage']);
 const faq=schema['@graph'].find(n=>n['@type']==='FAQPage');
 for(const q of faq.mainEntity) {
  assert.ok(html.includes(`<summary>${q.name}</summary>`));
  assert.ok(html.includes(`<p>${q.acceptedAnswer.text}</p>`));
 }
 assert.ok(read('sitemap.xml').includes('<loc>https://niuexa.ai/eventi-ai-aziende/</loc>'));
 assert.ok(read('eventi.html').includes('href="/eventi-ai-aziende/"'));
 assert.equal(read('llm.txt'),read('llms.txt'));
});
test('approved logistics and chosen series topics are visible for all dates',()=>{
 assert.match(html,/Ufficio Libera/);
 assert.match(html,/Via Rutilia 10\/8, 20141 Milano/);
 assert.ok(!/Bebit/.test(html),'stale venue');
 // Roberto's 6 October 2026 email dropped the SIGNALS name ("confonde") and the marketing paragraph.
 assert.match(html,/Decifrare il futuro/);
 assert.ok(!/SIGNALS/i.test(html.replace(/signal-dot/g,'')),'SIGNALS series name');
 assert.ok(!/Nessuna adesione al marketing/.test(html));
 assert.match(html,/Europe\/Rome/);
 const rows=[...html.matchAll(/class="calendar-date">([\s\S]*?)<\/a>/g)];
 assert.equal(rows.length,3);
 for(const [,row] of rows) {
  assert.match(row,/18:30/);
  assert.match(row,/Libera · Milano/);
 }
 assert.match(html,/Dalla visibilità<br>al lavoro quotidiano/);
 assert.ok(!/Programma proposto|da confermare/.test(html));
 for(const topic of ['La SEO va in pensione, benvenuta AEO/GEO','AI Agent – Come rendere efficienti i processi aziendali','AI Marketing Agent – Come semplificare ed efficientare i processi di marketing']) assert.ok(html.includes(topic));
 assert.ok(!/Sede, orario.*non.*pubblicati/.test(html));
 assert.ok(!/Sede, orario.*non.*pubblicati/.test(read('llms.txt')));
 assert.match(html,/Web3Forms/);
 assert.match(html,/13489560014/);
 assert.match(html,/accesso.*rettifica.*cancellazione/);
 assert.ok(!/legalApproved|approvat[ao] dal legale/i.test(html));
});
test('same existing public key, CSP blocks native submission and every local asset/link resolves',()=>{
 const old=read('landing-niuexa.html').match(/name="access_key" value="([^"]+)"/)[1];
 assert.ok(REGISTRATION.accessKey===old,'Existing public key parity (values redacted)');
 // GTM loads Google, HubSpot and Apollo scripts, so the CSP no longer restricts fetches.
 assert.match(html,/<meta http-equiv="Content-Security-Policy" content="form-action 'none'; object-src 'none'; base-uri 'none'">/);
 for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if(!url.startsWith('/')) continue;
  const target=decodeURIComponent(url.split('#')[0].split('?')[0]);
  assert.ok(existsSync(resolve(root,'.'+target+(target.endsWith('/')?'index.html':''))),target);
 }
 assert.ok(!/google-analytics|googletagmanager|localStorage|sessionStorage/.test(read('event-registration.mjs')));
});
test('hub and topic pages load GTM after the consent defaults, with the cookie banner',()=>{
 const pages=['eventi-ai-aziende/index.html',...['seo-in-pensione-aeo-geo','ai-agent-processi-aziendali','ai-marketing-agent'].map(slug=>`eventi-ai-aziende/${slug}/index.html`)];
 for(const page of pages){
  const text=read(page);
  const consent=text.search(/gtag\('consent', 'default'/), loader=text.indexOf("'https://www.googletagmanager.com/gtm.js?id='");
  assert.ok(consent!==-1&&loader!==-1&&consent<loader,`${page}: consent defaults must come before gtm.js`);
  assert.match(text,/\}\)\(window,document,'script','dataLayer','GTM-KG9S42S4'\);<\/script>/,page);
  assert.match(text,/<body[^>]*>\n<!-- Google Tag Manager \(noscript\) -->\n<noscript><iframe src="https:\/\/www.googletagmanager.com\/ns.html\?id=GTM-KG9S42S4"/,page);
  assert.match(text,/<script src="\/cookie-banner.js\?v=\d+"><\/script>\n<\/body>/,page);
 }
 // The request is reported only once the provider has accepted it.
 assert.match(read('event-registration.mjs'),/if \(receipt.status !== 'received'\) throw new Error\('PROVIDER'\);\s*completed.add\(event.id\);\s*trackRequest\(event\);/);
});
