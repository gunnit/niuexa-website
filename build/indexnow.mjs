// Tell IndexNow engines (Bing, and through it Copilot and ChatGPT search) which
// published pages a push changed. Run after package-pages.mjs, once the deploy
// is live:
//
//   node build/indexnow.mjs <before-sha> <after-sha>          # submit
//   node build/indexnow.mjs <before-sha> <after-sha> --dry-run # print only
//
// Only indexable pages are sent: noindex pages, redirect stubs and 404.html are
// skipped. The key file at the site root proves ownership of niuexa.ai.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { urlFor } from './package-cloudflare.mjs';

const HOST = 'niuexa.ai';
const KEY = '59d901b42caac9fceecf85148888c406';
const root = resolve(import.meta.dirname, '..');
const site = join(root, '_site');
const [before, after] = process.argv.slice(2);
const dryRun = process.argv.includes('--dry-run');

if (!before || !after || /^0+$/.test(before)) {
  console.log('No previous commit to compare with; nothing to submit.');
  process.exit(0);
}
if (readFileSync(join(root, `${KEY}.txt`), 'utf8').trim() !== KEY) throw new Error('IndexNow key file does not match KEY');

const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', before, after], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(f => f.endsWith('.html') && f !== '404.html');
const urls = changed.filter(file => {
  const published = join(site, file);
  if (!existsSync(published)) return false;
  const html = readFileSync(published, 'utf8');
  return !/<meta\s+name=["']robots["'][^>]*noindex/i.test(html) && !/<meta\s+http-equiv=["']refresh["']/i.test(html);
}).map(file => `https://${HOST}${urlFor(file)}`);

if (!urls.length) {
  console.log('No indexable pages changed.');
  process.exit(0);
}
console.log(`${dryRun ? 'Would submit' : 'Submitting'} ${urls.length} URL(s):\n  ${urls.join('\n  ')}`);
if (dryRun) process.exit(0);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow answered ${res.status} ${res.statusText}`);
// 200 and 202 both mean accepted; anything else is worth a look but must not fail the deploy.
if (res.status !== 200 && res.status !== 202) process.exitCode = 1;
