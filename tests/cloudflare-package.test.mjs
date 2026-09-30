import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { MOVED } from '../build/event-content.mjs';
import { rulesFor, urlFor } from '../build/package-cloudflare.mjs';

const root = resolve(import.meta.dirname, '..');
const site = join(root, '_site');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [relative(site, join(dir, e.name)).split('\\').join('/')]);

test('Cloudflare config serves exact paths from the packaged _site', () => {
  const config = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, ''));
  assert.equal(config.assets.directory, './_site');
  // "auto-trailing-slash" would 307 every canonical .html URL to its extensionless form.
  assert.equal(config.assets.html_handling, 'none');
  assert.equal(config.assets.not_found_handling, '404-page');
  assert.equal(config.main, undefined, 'assets-only: no Worker script');
  // Production: the apex is the Worker's only Custom Domain (www redirects in a Cloudflare rule).
  // wrangler treats a non-empty list as the complete set, so an edit here changes the live site.
  assert.deepEqual(config.routes, [{ pattern: 'niuexa.ai', custom_domain: true }]);
});

test('rules cover every URL shape GitHub Pages resolved', () => {
  assert.deepEqual(rulesFor('index.html', ''), [['/', '/index.html', 200], ['/index', '/', 301]]);
  assert.deepEqual(rulesFor('en/index.html', ''), [['/en', '/en/', 301], ['/en/', '/en/index.html', 200], ['/en/index', '/en/', 301]]);
  assert.deepEqual(rulesFor('consulting.html', ''), [['/consulting', '/consulting.html', 301]]);
  assert.deepEqual(rulesFor('old.html', '<meta http-equiv="refresh" content="0; url=/en/learn.html">'), [['/old.html', '/en/learn.html', 301], ['/old', '/en/learn.html', 301]]);
  assert.equal(urlFor('eventi-ai-aziende/index.html'), '/eventi-ai-aziende/');
});

test('the packaged bundle has a route for every page and real redirects for retired ones', () => {
  execFileSync(process.execPath, ['build/package-pages.mjs'], { cwd: root });
  execFileSync(process.execPath, ['build/package-cloudflare.mjs'], { cwd: root });
  const rules = new Map(readFileSync(join(site, '_redirects'), 'utf8').split('\n')
    .filter(l => l && !l.startsWith('#')).map(l => { const [from, to, status] = l.split(' '); return [from, { to, status }]; }));
  assert.ok(rules.size <= 2000, 'Cloudflare allows 2,000 static redirects');
  const files = new Set(walk(site));
  for (const file of [...files].filter(f => f.endsWith('.html') && f !== '404.html')) {
    const url = urlFor(file);
    if (url.endsWith('/')) assert.ok(rules.has(url), `${url} has no route`);
    else assert.equal(rules.get(url.slice(0, -5))?.to, rules.get(url)?.to ?? url, `${url} extensionless form`);
  }
  for (const [from, { to, status }] of rules) {
    assert.notEqual(from, to, `${from} redirects to itself`);
    const target = to.endsWith('/') ? to.slice(1) + 'index.html' : to.slice(1);
    assert.ok(files.has(target) || rules.has(to), `${from} -> ${to} lands nowhere`);
    if (status === '200') assert.ok(files.has(target), `${from} rewrites to missing ${to}`);
  }
  for (const [from, to] of MOVED) {
    assert.deepEqual(rules.get(`/eventi-ai-aziende/${from}/`), { to: `/eventi-ai-aziende/${to}/`, status: '301' }, from);
  }
  const headers = readFileSync(join(site, '_headers'), 'utf8');
  assert.match(headers, /^https:\/\/:worker\.:account\.workers\.dev\/\*\n {2}X-Robots-Tag: noindex$/m);
  for (const pattern of ['/*.html', '/*.txt', '/', '/en/']) {
    assert.ok(headers.includes(`${pattern}\n`) && new RegExp(`^${pattern.replace(/[*.\/]/g, '\\$&')}\\n(?: {2}.+\\n)*? {2}Content-Type: [^\\n]*charset=utf-8`, 'm').test(headers), `${pattern} declares charset=utf-8`);
  }
  assert.ok(!existsSync(join(site, 'wrangler.jsonc')));
});

test('the deploy workflow gates Cloudflare on the same checks as Pages', () => {
  const workflow = readFileSync(join(root, '.github/workflows/github-pages.yml'), 'utf8');
  assert.match(workflow, /node build\/package-cloudflare\.mjs/);
  assert.match(workflow, /node build\/check-hosting\.mjs http:\/\/127\.0\.0\.1:8787/);
  assert.match(workflow, /needs: build/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/master'/, 'production deploys only from master');
});
