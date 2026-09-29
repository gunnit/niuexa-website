import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {EVENTS} from '../build/event-content.mjs';
const root=resolve(import.meta.dirname,'..');
// Render the event pages as of a given day into a scratch copy; the committed pages are never touched.
function renderAs(today,{hub}={}){
 const dir=mkdtempSync(join(tmpdir(),'events-'));
 try {
  mkdirSync(join(dir,'eventi-ai-aziende'));
  copyFileSync(join(root,'eventi-ai-aziende/index.html'),join(dir,'eventi-ai-aziende/index.html'));
  if(hub) writeFileSync(join(dir,'eventi-ai-aziende/index.html'),hub(readFileSync(join(dir,'eventi-ai-aziende/index.html'),'utf8')));
  for(const f of ['sitemap.xml','llms.txt']) copyFileSync(join(root,f),join(dir,f));
  execFileSync(process.execPath,['build/render-events.mjs',`--today=${today}`],{cwd:root,env:{...process.env,EVENTS_ROOT:dir},stdio:'pipe'});
 } catch(error) {rmSync(dir,{recursive:true,force:true});throw error;} // a failed render leaves nothing behind
 const read=p=>readFileSync(join(dir,p),'utf8');
 return {dir,read,hub:read('eventi-ai-aziende/index.html'),page:e=>read(`eventi-ai-aziende/${e.slug}/index.html`)};
}
const faqParity=html=>{
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 for(const q of graph.find(n=>n['@type']==='FAQPage').mainEntity) assert.ok(html.includes(`<summary>${q.name}</summary><p>${q.acceptedAnswer.text}</p>`),q.name);
};
// [today, dates still open]: an event stays open for the whole of its day in Milan.
const states=[
 ['2026-09-29',['2026-10-06','2026-10-27','2026-11-17']],
 ['2026-10-06',['2026-10-06','2026-10-27','2026-11-17']],
 ['2026-10-07',['2026-10-27','2026-11-17']],
 ['2026-10-28',['2026-11-17']],
 ['2026-11-18',[]],
];
for(const [today,openDates] of states) test(`as of ${today} the pages offer exactly ${openDates.join(', ')||'no dates'}`,()=>{
 const r=renderAs(today);
 try {
  const options=[...r.hub.match(/<select id="event-date" name="event">([\s\S]*?)<\/select>/)[1].matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(options,openDates);
  const next=EVENTS.find(e=>e.date===openDates[0]);
  const shown=next??EVENTS.at(-1);
  assert.ok(r.hub.includes(`<div class="next-date"><span>${next?'PROSSIMO APPUNTAMENTO':'ULTIMO INCONTRO DEL CICLO'}</span><time datetime="${shown.date}T18:30:00${shown.offset}">${shown.label}</time>`));
  assert.ok(r.hub.includes(`<span id="selected-date">${next?next.label:'Richieste chiuse'}</span>`));
  assert.equal(r.hub.includes('Gli incontri d’autunno<br>si sono conclusi.'),!next);
  faqParity(r.hub);
  for(const e of EVENTS){
   const open=openDates.includes(e.date), html=r.page(e);
   assert.equal(html.includes(`href="/eventi-ai-aziende/?event=${e.date}#registration"`),open,`${e.slug} signup`);
   assert.equal(r.hub.includes(`href="/eventi-ai-aziende/?event=${e.date}#registration"`),open,`${e.slug} hub signup`);
   assert.equal(html.includes('Incontro concluso: le richieste di partecipazione sono chiuse.'),!open,`${e.slug} past note`);
   assert.ok(r.hub.includes(`<time datetime="${e.date}">${e.label}</time> · 18:30 · Libera · Milano${open?'':' · concluso'}</small>`),`${e.slug} calendar row`);
   assert.ok(r.read('llms.txt').includes(`: ${e.label}${open?'':', incontro concluso'}. `),`${e.slug} llms.txt`);
   if(!open) assert.ok(html.includes(next?`<a class="event-cta" href="/eventi-ai-aziende/${next.slug}/">Il prossimo incontro: ${next.label}`:'<a class="event-cta" href="/eventi-ai-aziende/">Tutti gli incontri'),`${e.slug} onward link`);
   // The event itself and its date never change: only the invitation to join does.
   const event=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(n=>n['@type']==='Event');
   assert.equal(event.startDate,`${e.date}T18:30:00${e.offset}`);
   faqParity(html);
  }
  assert.equal(r.read('llm.txt'),r.read('llms.txt'));
 } finally {rmSync(r.dir,{recursive:true,force:true});}
});
test('the render fails instead of skipping a hub block it can no longer find',()=>{
 assert.throws(()=>renderAs('2026-10-07',{hub:h=>h.replace('<div class="next-date">','<div class="next-dates">')}),/no match/);
 assert.throws(()=>renderAs('7 ottobre'),/YYYY-MM-DD/);
});
test('the committed pages are exactly what the renderer produces for the state they are in',()=>{
 // Independent of today's date: find which events the committed pages treat as past, render as of
 // a day in that same state, and require identical output. Catches edits to event-content.mjs that
 // were never rendered, and hand edits to generated pages that the next nightly render would undo.
 const committed=p=>readFileSync(join(root,p),'utf8');
 const past=EVENTS.filter(e=>!committed(`eventi-ai-aziende/${e.slug}/index.html`).includes(`href="/eventi-ai-aziende/?event=${e.date}#registration"`));
 assert.deepEqual(past,EVENTS.slice(0,past.length),'only the earliest dates can be past');
 const dayAfter=d=>new Date(Date.parse(`${d}T12:00:00Z`)+864e5).toISOString().slice(0,10);
 const r=renderAs(past.length?dayAfter(past.at(-1).date):EVENTS[0].date);
 try {
  for(const e of EVENTS) assert.equal(r.page(e),committed(`eventi-ai-aziende/${e.slug}/index.html`),e.slug);
  assert.equal(r.hub,committed('eventi-ai-aziende/index.html'));
  assert.equal(r.read('llms.txt'),committed('llms.txt'));
  assert.equal(r.read('sitemap.xml'),committed('sitemap.xml'));
 } finally {rmSync(r.dir,{recursive:true,force:true});}
});
