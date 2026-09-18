import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { EVENTS } from '../build/event-content.mjs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
test('Pages builds the actual allowlisted release artifact without asserting legal approval',()=>{
 execFileSync(process.execPath,['build/package-pages.mjs'],{cwd:root});
 const included=['index.html','eventi-ai-aziende/index.html','event-registration.mjs','assets/event-fonts/hanken-regular.ttf','assets/event-fonts/Hanken-OFL.txt','sitemap.xml','CNAME','en/llms.txt','en/sitemap.xml','en/robots.txt','img/ufficibebitmilano.2jpg','ai-metric-contract.html','img/landing/niuexa-session-milano-800.webp'];
 const excluded=['qa','tests','build','content','.git','.github','.claude','EVENT-QA.md','EVENT-IMPLEMENTATION-BRIEF.md','linkedin-posts.csv','event-registration.html','roberto-draft.json'];
 for(const output of ['_site','_site-review']) {
  if(output==='_site-review') execFileSync(process.execPath,['build/package-pages.mjs','--review'],{cwd:root});
  for(const f of included) {
   assert.ok(existsSync(resolve(root,output,f)),f);
   assert.deepEqual(readFileSync(resolve(root,output,f)),readFileSync(resolve(root,f)),f);
  }
  for(const f of excluded) assert.equal(existsSync(resolve(root,output,f)),false,f);
 }
 const workflow=readFileSync(resolve(root,'.github/workflows/github-pages.yml'),'utf8');
 assert.match(workflow,/node build\/package-pages.mjs/);
 assert.match(workflow,/path: '_site'/);
 console.log('Verified release/review packages, source parity, upstream assets and excluded private/QA paths.');
});
test('nested event package allows only known pages, resolves links and rejects private JSON/HTML',()=>{
 const fixtures=['eventi-ai-aziende/qa-private.json','eventi-ai-aziende/qa-private.html','eventi-ai-aziende/farsi-trovare-era-ai/qa-private.json'];
 try {
  for(const p of fixtures) {assert.ok(!existsSync(resolve(root,p)));writeFileSync(resolve(root,p),'PRIVATE TEST FIXTURE');}
  execFileSync(process.execPath,['build/package-pages.mjs'],{cwd:root});
  for(const p of fixtures) assert.ok(!existsSync(resolve(root,'_site',p)),p);
  for(const event of EVENTS){
   const path=`eventi-ai-aziende/${event.slug}/index.html`;
   const html=readFileSync(resolve(root,'_site',path),'utf8');
   assert.equal(html,readFileSync(resolve(root,path),'utf8'));
   for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(!url.startsWith('/')) continue;
    let target=decodeURIComponent(url.split(/[?#]/)[0]);
    if(target.endsWith('/')) target+='index.html';
    assert.ok(existsSync(resolve(root,'_site','.'+target)),`${path} -> ${url}`);
   }
  }
 } finally {for(const p of fixtures) if(existsSync(resolve(root,p))) unlinkSync(resolve(root,p));}
});
