// Build a public static artifact without mutating the checkout.
// --review is local QA ONLY, never the uploaded _site directory.
import { readdir, mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
import { resolve, join, extname, relative } from 'node:path';

import { EVENTS, MOVED } from './event-content.mjs';
import { RENAMED } from './package-cloudflare.mjs';
const eventPages=new Set(['eventi-ai-aziende/index.html',...EVENTS.map(e=>`eventi-ai-aziende/${e.slug}/index.html`),...MOVED.map(([from])=>`eventi-ai-aziende/${from}/index.html`)]);
const root=resolve(import.meta.dirname,'..');
const review=process.argv.includes('--review');
const output=join(root,review?'_site-review':'_site');
await rm(output,{recursive:true,force:true});

const rootExtensions=new Set(['.html','.css','.js','.mjs']);
const rootFiles=new Set(['CNAME','sitemap.xml','robots.txt','llms.txt','llm.txt','site.webmanifest','BingSiteAuth.xml','59d901b42caac9fceecf85148888c406.txt']);
const publicDirs=new Set(['img','assets','includes','en','books','downloads','ai-consulting','eventi-ai-aziende']);
const publicExceptions=new Set(['en/llms.txt','en/sitemap.xml','en/robots.txt','img/ufficibebitmilano.2jpg']);
const assetExtensions=new Set([...rootExtensions,'.png','.jpg','.jpeg','.webp','.gif','.svg','.ico','.avif','.ttf','.woff','.woff2','.pdf','.epub','.json','.mp4','.webm','.mp3','.ogg','.webmanifest']);
let count=0;
async function copyTree(dir='') {
 for(const entry of await readdir(join(root,dir),{withFileTypes:true})) {
  const name=entry.name;
  if(name.startsWith('.') || entry.isSymbolicLink()) continue;
  const path=join(dir,name);
  if(entry.isDirectory()) {if(dir || publicDirs.has(name)) await copyTree(path);continue;}
  if(!entry.isFile() || name==='event-registration.html') continue;
  // Event content is static HTML only: never recursively publish drafts or QA data.
  if(path.startsWith('eventi-ai-aziende/') && !eventPages.has(path)) continue;
  const allowed=dir ? publicExceptions.has(path) || assetExtensions.has(extname(name).toLowerCase()) || (dir==='assets/event-fonts' && name.endsWith('OFL.txt')) : rootExtensions.has(extname(name)) || rootFiles.has(name);
  if(!allowed) continue;
  const destination=join(output,path);
  await mkdir(resolve(destination,'..'),{recursive:true});
  await copyFile(join(root,path),destination);count++;
 }
}
await copyTree();
// A renamed page keeps its old URL as a redirect stub written into the artifact only.
for(const [from,to] of RENAMED){
 const url='/'+to;
 await writeFile(join(output,from),`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${url}"><meta name="robots" content="noindex, follow"><link rel="canonical" href="https://niuexa.ai${url}"><title>Pagina spostata</title></head><body><p>Questa pagina è stata spostata. <a href="${url}">Vai alla nuova pagina</a>.</p></body></html>\n`);count++;
}
console.log(`Packaged ${count} public files into ${relative(root,output)}${review?' (LOCAL REVIEW ONLY)':''}.`);
