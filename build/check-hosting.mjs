// Check a Cloudflare deployment of _site against what it should serve.
//
//   node build/check-hosting.mjs <base-url>
//   node build/check-hosting.mjs <base-url> --compare https://niuexa.ai
//
// Without --compare it verifies every file, every _redirects rule, the 404 page
// and the headers against the local _site (run the two package scripts first).
// With --compare it also fetches every URL from a reference host (GitHub Pages
// before cutover) and fails if any URL that worked there now ends somewhere with
// different content. Byte-level comparison also catches edge features that
// rewrite HTML, such as Cloudflare's email obfuscation.
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const site = join(root, '_site');
const args = process.argv.slice(2);
const base = args[0]?.replace(/\/$/, '');
const reference = args.includes('--compare') ? args[args.indexOf('--compare') + 1]?.replace(/\/$/, '') : null;
if (!base || (args.includes('--compare') && !reference)) {
  console.error('usage: node build/check-hosting.mjs <base-url> [--compare <reference-url>]');
  process.exit(2);
}
const isPreviewHost = new URL(base).hostname.endsWith('.workers.dev');

const sha = buf => createHash('sha256').update(buf).digest('hex');
const REFRESH = /<meta\s+http-equiv=["']refresh["']\s+content=["']\s*0\s*;\s*url=([^"']+)["']/i;

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(path));
    else out.push(relative(site, path).split('\\').join('/'));
  }
  return out;
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }));
  return results;
}

async function get(origin, path, method = 'GET') {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(origin + path, { method, redirect: 'manual' });
      const body = method === 'GET' ? Buffer.from(await res.arrayBuffer()) : null;
      return { status: res.status, headers: res.headers, body };
    } catch (err) {
      if (attempt >= 2) return { status: 0, headers: new Headers(), body: null, error: String(err) };
    }
  }
}

// Follow up to five redirects and report where a URL finally lands.
async function land(origin, path) {
  const hops = [];
  let current = path;
  for (let i = 0; i < 5; i++) {
    const res = await get(origin, current);
    hops.push(`${res.status} ${current}`);
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      const next = new URL(location, origin + current);
      if (next.origin !== new URL(origin).origin) return { status: res.status, path: next.href, hash: null, hops };
      current = next.pathname + next.search;
      continue;
    }
    return { status: res.status, path: current, hash: res.body ? sha(res.body) : null, body: res.body, hops };
  }
  return { status: 'loop', path: current, hash: null, hops };
}

const failures = [];
const fail = (what, detail) => failures.push(`${what}: ${detail}`);

const files = (await listFiles(site)).filter(f => f !== '_redirects' && f !== '_headers').sort();
const rules = (await readFile(join(site, '_redirects'), 'utf8')).split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .map(line => { const [from, to, status] = line.trim().split(/\s+/); return { from, to, status: Number(status) }; });
const ruleFor = new Map(rules.map(r => [r.from, r]));
const hashes = new Map();
for (const f of files) hashes.set(f, sha(await readFile(join(site, f))));
const fileForPath = path => decodeURIComponent(path.replace(/^\//, '')) || 'index.html';

// 1. Every redirect and rewrite rule.
await pool(rules, 8, async rule => {
  const res = await get(base, rule.from);
  if (res.status !== rule.status) return fail(rule.from, `expected ${rule.status}, got ${res.status}`);
  if (rule.status === 301) {
    const location = new URL(res.headers.get('location') || '', base + rule.from);
    if (location.pathname !== rule.to) fail(rule.from, `redirects to ${location.pathname}, expected ${rule.to}`);
  } else if (sha(res.body) !== hashes.get(fileForPath(rule.to))) {
    fail(rule.from, `body differs from ${rule.to}`);
  }
});

// 2. Every file at its own path, unless a rule deliberately takes that path over.
await pool(files.filter(f => !ruleFor.has('/' + f)), 8, async file => {
  const path = '/' + file.split('/').map(encodeURIComponent).join('/');
  const html = file.endsWith('.html');
  const res = await get(base, path, html ? 'GET' : 'HEAD');
  if (res.status !== 200) return fail(path, `expected 200, got ${res.status}`);
  if (html && sha(res.body) !== hashes.get(file)) fail(path, 'body differs from _site');
  const type = res.headers.get('content-type') || '';
  if (html && !type.startsWith('text/html')) fail(path, `content-type ${type}`);
  if (/\.(html|txt|css|js|mjs)$/.test(file) && !/charset=utf-8/i.test(type)) fail(path, `content-type "${type}" has no charset=utf-8`);
  if (/\.(css|js|mjs)$/.test(file) && res.headers.get('cache-control') !== 'public, max-age=600') fail(path, `cache-control ${res.headers.get('cache-control')}`);
  const robots = res.headers.get('x-robots-tag') || '';
  if (isPreviewHost !== robots.includes('noindex')) fail(path, `x-robots-tag "${robots}" on ${isPreviewHost ? 'a preview' : 'the production'} host`);
  if (res.headers.get('x-content-type-options') !== 'nosniff') fail(path, 'missing X-Content-Type-Options');
});

// 3. Unknown URLs get the 404 page with a 404 status.
{
  const res = await get(base, '/__hosting-check-missing__');
  if (res.status !== 404) fail('404', `expected 404, got ${res.status}`);
  else if (sha(res.body) !== hashes.get('404.html')) fail('404', 'body is not 404.html');
}

// 4. Parity with the reference host for every URL either host could be asked for.
let compared = 0;
if (reference) {
  const sitemapUrls = [];
  for (const map of ['sitemap.xml', 'en/sitemap.xml']) {
    const xml = await readFile(join(site, map), 'utf8').catch(() => '');
    for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.push(new URL(loc).pathname);
  }
  const paths = [...new Set([...rules.map(r => r.from), ...files.map(f => '/' + f), ...sitemapUrls])].sort();
  await pool(paths, 6, async path => {
    const [ours, theirs] = await Promise.all([land(base, path), land(reference, path)]);
    // An unreachable or erroring reference proves nothing; never count it as parity.
    if (theirs.status === 0 || theirs.status === 429 || theirs.status >= 500 || theirs.status === 'loop') {
      return fail(path, `reference answered ${theirs.status} (${theirs.hops.join(' -> ')})`);
    }
    compared++;
    if (theirs.status !== 200) return;
    if (ours.status !== 200) return fail(path, `reference serves 200, we end at ${ours.hops.join(' -> ')}`);
    // A reference page that only meta-refreshes is matched by a real redirect to its target.
    const refresh = theirs.body?.toString('utf8').match(REFRESH);
    if (refresh && new URL(refresh[1], reference + theirs.path).pathname === ours.path) return;
    if (ours.hash !== theirs.hash) fail(path, `content differs from reference (${ours.hops.join(' -> ')} vs ${theirs.hops.join(' -> ')})`);
  });
}

if (reference && !compared) fail('--compare', `no URL could be compared with ${reference}`);
console.log(`Checked ${rules.length} rules and ${files.length} files on ${base}${reference ? `; compared ${compared} URLs with ${reference}` : ''}.`);
if (failures.length) {
  console.error(`${failures.length} problem(s):\n  ${failures.slice(0, 200).join('\n  ')}`);
  process.exit(1);
}
console.log('All hosting checks passed.');
