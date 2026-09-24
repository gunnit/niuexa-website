import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
// 27 Oct is after the 25 Oct 2026 switch to CET, hence +01:00.
const cases=[['seo-in-pensione-aeo-geo','2026-10-06','La SEO va in pensione, benvenuta AEO/GEO','+02:00'],['ai-agent-processi-aziendali','2026-10-27','AI Agent – Come rendere efficienti i processi aziendali','+01:00'],['ai-marketing-agent','2026-11-17','AI Marketing Agent – Come semplificare ed efficientare i processi di marketing','+01:00']];
const moved=[['farsi-trovare-era-ai','seo-in-pensione-aeo-geo'],['dall-ai-ai-risultati','ai-agent-processi-aziendali'],['agenti-ai-in-azienda','ai-marketing-agent']];
test('three crawlable topic pages lead to the sole signup with correct event metadata',()=>{
 const titles=new Set(), descriptions=new Set();
 for(const [slug,date,title,offset] of cases){
  const path=`eventi-ai-aziende/${slug}/index.html`;
  assert.ok(existsSync(resolve(root,path)),`Missing topic page ${path}`);
  const html=read(path), url=`https://niuexa.ai/eventi-ai-aziende/${slug}/`;
  assert.ok(html.includes(`<h1 id="event-title">${title}</h1>`));
  titles.add(html.match(/<title>(.*?)<\/title>/)[1]);
  descriptions.add(html.match(/name="description" content="([^"]+)"/)[1]);
  assert.ok(html.includes(`rel="canonical" href="${url}"`));
  assert.ok(html.includes(`property="og:url" content="${url}"`));
  assert.ok(html.includes(`href="/eventi-ai-aziende/?event=${date}#registration"`));
  assert.ok(!/<form\b/.test(html));
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const event=graph.find(n=>n['@type']==='Event');
  assert.equal(event.name,title); assert.equal(event.startDate,`${date}T18:30:00${offset}`);
  assert.equal(event.location.name,'Ufficio Libera'); assert.equal(event.location.address.streetAddress,'Via Rutilia 10/8');
  assert.ok(!/Bebit/.test(html),`${slug}: stale venue`);
  assert.equal(event.organizer.name,'NIUEXA');
  for(const k of ['offers','performer','endDate']) assert.equal(event[k],undefined);
  const abstract=html.match(/<div class="event-abstract">([\s\S]*?)<\/div>/)[1].replace(/<[^>]+>/g,' ').trim();
  assert.ok(abstract.split(/\s+/).length>=100); assert.ok(abstract.split(/\s+/).length<=160);
  assert.equal((html.match(/class="learning-item"/g)||[]).length,3);
  for(const q of graph.find(n=>n['@type']==='FAQPage').mainEntity){assert.ok(html.includes(`<summary>${q.name}</summary>`));assert.ok(html.includes(`<p>${q.acceptedAnswer.text}</p>`));}
  assert.ok(read('sitemap.xml').includes(`<loc>${url}</loc>`));
  assert.ok(read('eventi-ai-aziende/index.html').includes(`href="/eventi-ai-aziende/${slug}/"`));
 }
 assert.equal(titles.size,3); assert.equal(descriptions.size,3);
});
test('retired topic URLs redirect to their renamed pages and leave the sitemap and hub',()=>{
 const sitemap=read('sitemap.xml'), hub=read('eventi-ai-aziende/index.html');
 for(const [from,to] of moved){
  const html=read(`eventi-ai-aziende/${from}/index.html`);
  assert.match(html,/<meta name="robots" content="noindex, follow">/);
  assert.ok(html.includes(`<link rel="canonical" href="https://niuexa.ai/eventi-ai-aziende/${to}/">`),from);
  assert.ok(html.includes(`<meta http-equiv="refresh" content="0;url=/eventi-ai-aziende/${to}/">`),from);
  assert.ok(html.includes(`<a href="/eventi-ai-aziende/${to}/">`),from);
  assert.ok(!sitemap.includes(`/eventi-ai-aziende/${from}/`),from);
  assert.ok(!hub.includes(`/eventi-ai-aziende/${from}/`),from);
 }
});
test('existing registration transport, config, styling and five-field form remain byte-identical',()=>{
 const hashes={
  'event-registration.mjs':'0c70c918eb00b1bd9c910f8c1cd96354366127a4918429f7bde9521aea68f020',
  'event-registration-core.mjs':'c1fd9773f202aa683afcc2e7d9982e260eae834d4ba07a3f3151258c0e2d0ae0',
  // Re-pinned for the dates/venue in Roberto's 20 September email.
  'event-registration-config.mjs':'6e4047ba273d8fd16e97e2b4fd3d2bbf9159db7e1615fce037db4c3042ee233e',
  'event-registration.css':'37079e0499c716739fd967723409c511b7180af7a40ad5b1870d4fb145766a7e'
 };
 const hash=s=>createHash('sha256').update(s).digest('hex');
 for(const [file,expected] of Object.entries(hashes)) assert.equal(hash(read(file)),expected,file);
 assert.equal(hash(read('eventi-ai-aziende/index.html').match(/<form[\s\S]*?<\/form>/)[0]),'807b1c426af42a518a27764addcf1b6c380cb9d0e42cd4ed8fe2c8974da5a5ae');
});
