// Build a public static artifact without mutating the checkout.
// --review is local QA ONLY, never the uploaded _site directory.
import { readdir, mkdir, copyFile, rm } from 'node:fs/promises';
import { resolve, join, extname, relative } from 'node:path';

import { EVENTS } from './event-content.mjs';
const eventPages=new Set(['eventi-ai-aziende/index.html',...EVENTS.map(e=>`eventi-ai-aziende/${e.slug}/index.html`)]);
const root=resolve(import.meta.dirname,'..');
const review=process.argv.includes('--review');
const output=join(root,review?'_site-review':'_site');
await rm(output,{recursive:true,force:true});

const rootExtensions=new Set(['.html','.css','.js','.mjs']);
const rootFiles=new Set(['CNAME','sitemap.xml','robots.txt','llms.txt','llm.txt','site.webmanifest','BingSiteAuth.xml','59d901b42caac9fceecf85148888c406.txt']);
const publicDirs=new Set(['img','assets','includes','en','books','downloads','quiz-data','ai-consulting','eventi-ai-aziende']);
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
console.log(`Packaged ${count} public files into ${relative(root,output)}${review?' (LOCAL REVIEW ONLY)':''}.`);
