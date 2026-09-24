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
 for(const date of ['2026-10-06','2026-10-27','2026-11-17']) assert.ok(html.includes(date));
 assert.ok(!html.includes('2026-12-02'),'retired 2 December date');
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
 assert.match(html,/SIGNALS – Decifrare il futuro/);
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
test('same existing public key, CSP restricts network and every local asset/link resolves',()=>{
 const old=read('landing-niuexa.html').match(/name="access_key" value="([^"]+)"/)[1];
 assert.ok(REGISTRATION.accessKey===old,'Existing public key parity (values redacted)');
 assert.match(html,/connect-src https:\/\/api.web3forms.com; form-action 'none'/);
 for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if(!url.startsWith('/')) continue;
  const target=decodeURIComponent(url.split('#')[0].split('?')[0]);
  assert.ok(existsSync(resolve(root,'.'+target+(target.endsWith('/')?'index.html':''))),target);
 }
 assert.ok(!/google-analytics|googletagmanager|localStorage|sessionStorage/.test(read('event-registration.mjs')));
});
