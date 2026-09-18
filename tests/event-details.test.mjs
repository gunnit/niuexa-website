import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const cases=[['farsi-trovare-era-ai','2026-10-06','Farsi trovare nell’era dell’AI','+02:00'],['dall-ai-ai-risultati','2026-11-17','Dall’AI ai risultati','+01:00'],['agenti-ai-in-azienda','2026-12-02','Agenti AI in azienda','+01:00']];
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
  assert.equal(event.location.name,'Ufficio Bebit'); assert.equal(event.location.address.streetAddress,'Via Rutilia 10');
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
test('existing registration transport, config, styling and five-field form remain byte-identical',()=>{
 const hashes={
  'event-registration.mjs':'0c70c918eb00b1bd9c910f8c1cd96354366127a4918429f7bde9521aea68f020',
  'event-registration-core.mjs':'c1fd9773f202aa683afcc2e7d9982e260eae834d4ba07a3f3151258c0e2d0ae0',
  'event-registration-config.mjs':'860c8a5ccaa35ceafea8eab826cfcb7fb427b96d25f58111887f074c5ffb1302',
  'event-registration.css':'37079e0499c716739fd967723409c511b7180af7a40ad5b1870d4fb145766a7e'
 };
 const hash=s=>createHash('sha256').update(s).digest('hex');
 for(const [file,expected] of Object.entries(hashes)) assert.equal(hash(read(file)),expected,file);
 assert.equal(hash(read('eventi-ai-aziende/index.html').match(/<form[\s\S]*?<\/form>/)[0]),'807b1c426af42a518a27764addcf1b6c380cb9d0e42cd4ed8fe2c8974da5a5ae');
});
