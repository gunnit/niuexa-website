import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { compareHostedContent } from '../build/hosting-content.mjs';

const root = mkdtempSync(join(tmpdir(), 'niuexa-hosting-test-'));
after(() => rmSync(root, { recursive: true, force: true }));
mkdirSync(join(root, 'build')); mkdirSync(join(root, '_site'));
writeFileSync(join(root, 'build/check-hosting.mjs'), readFileSync(resolve(import.meta.dirname, '../build/check-hosting.mjs')));
writeFileSync(join(root, 'build/hosting-content.mjs'), readFileSync(resolve(import.meta.dirname, '../build/hosting-content.mjs')));
for (const [file, body] of Object.entries({ 'index.html': 'current page', '404.html': 'missing page', '_redirects': '/ /index.html 200\n/old / 301\n' })) writeFileSync(join(root, '_site', file), body);
writeFileSync(join(root, 'mock-fetch.mjs'), `
import { appendFileSync } from 'node:fs';
const counts = new Map();
globalThis.fetch = async (url, options) => {
  const path = new URL(url).pathname;
  const count = (counts.get(path) || 0) + 1; counts.set(path, count);
  appendFileSync(process.env.REQUEST_LOG, JSON.stringify({path, count, signal:options.signal instanceof AbortSignal})+'\\n');
  if (path === '/' && process.env.FETCH_CASE === 'transient' && count === 1) return new Response('busy', {status:503});
  if (path === '/' && process.env.FETCH_CASE === 'unavailable') return new Response('busy', {status:503});
  if (path === '/old') {
    const locations = {external:'https://other.invalid/',query:'/?unexpected=1',fragment:'/#unexpected',absolute:'https://niuexa.ai/'};
    return new Response(null, {status:301,headers:{location:locations[process.env.FETCH_CASE] || '/'}});
  }
  const body = path.includes('404') || path.includes('__hosting-check-missing__') ? 'missing page' : process.env.FETCH_CASE === 'stale' ? 'previous page' : 'current page';
  return new Response(body, {status:path.includes('__hosting-check-missing__') ? 404 : 200,headers:{'content-type':'text/html; charset=utf-8','x-content-type-options':'nosniff'}});
};
`);
function run(scenario) {
  const log = join(root, scenario + '.jsonl'); writeFileSync(log, '');
  const result = spawnSync(process.execPath, ['--import', join(root, 'mock-fetch.mjs'), join(root, 'build/check-hosting.mjs'), 'https://niuexa.ai'], {
    encoding: 'utf8', env: { ...process.env, FETCH_CASE: scenario, REQUEST_LOG: log },
  });
  return { ...result, requests: readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse) };
}

test('live delivery check recovers from transient errors with bounded requests', () => {
  const result = run('transient');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.requests.filter(x => x.path === '/').length, 2);
  assert.ok(result.requests.every(x => x.signal), 'requests must have a deadline');
});

test('stale public content prevents a successful delivery check', () => {
  const result = run('stale');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /body differs/);
});

test('persistent server errors fail after three attempts', () => {
  const result = run('unavailable');
  assert.notEqual(result.status, 0);
  assert.equal(result.requests.filter(x => x.path === '/').length, 3);
});

for (const scenario of ['external', 'query', 'fragment']) {
  test(`redirect checks reject an unexpected ${scenario} destination`, () => {
    const result = run(scenario);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /redirects to/);
  });
}

test('same-origin absolute redirect locations are accepted', () => {
  const result = run('absolute');
  assert.equal(result.status, 0, result.stderr);
});

// Hand-written examples of the source link and Cloudflare's observed rewrite.
// Run the real CLI so directory rewrites, direct files, 404s and --compare all
// exercise the same content validation. Only the external HTTP boundary is faked.
const fontLink = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Hanken+Grotesk:wght@400&display=swap" media="print" onload="this.media=\'all\'">';
const preconnect = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
const fontCss = "@font-face {font-family:'Space Grotesk';font-style:normal;font-weight:500;src:url(/cf-fonts/v/space-grotesk/5.2.10/latin/wght/normal.woff2);unicode-range:U+0000-00FF;font-display:swap;}"
  + "@font-face {font-family:'Space Grotesk';font-style:normal;font-weight:700;src:url(/cf-fonts/v/space-grotesk/5.2.10/latin/wght/normal.woff2);unicode-range:U+0000-00FF;font-display:swap;}"
  + "@font-face {font-family:'Hanken Grotesk';font-style:normal;font-weight:400;src:url(/cf-fonts/v/hanken-grotesk/5.2.8/latin/wght/normal.woff2);unicode-range:U+0000-00FF;font-display:swap;}";
const fontPage = `<!doctype html><html><head>${preconnect}\n${fontLink}<noscript>${fontLink}</noscript><style>p{color:green}</style></head><body><h1>Current page</h1><script>const example = ${JSON.stringify(fontLink)};</script><!-- ${preconnect} --></body></html>`;

test('large pages validate font rewrites without compiling page content as a regex', () => {
  const source = fontPage.replace('</body>', '<p>Content that must remain unchanged.</p>'.repeat(6000) + '</body>');
  const delivered = source.replace(preconnect, '').replace(fontLink, `<style type="text/css">${fontCss}</style>`);
  assert.equal(compareHostedContent(Buffer.from(source), Buffer.from(delivered), true).matches, true);
});

function runFonts(scenario, flags = ['--cloudflare-fonts'], reference = false) {
  const dir = join(root, 'fonts-' + scenario + '-' + flags.length + '-' + reference);
  mkdirSync(join(dir, 'build'), { recursive: true }); mkdirSync(join(dir, '_site'));
  for (const file of ['check-hosting.mjs', 'hosting-content.mjs']) {
    const source = resolve(import.meta.dirname, '../build', file);
    if (existsSync(source)) writeFileSync(join(dir, 'build', file), readFileSync(source));
  }
  for (const [file, body] of Object.entries({ 'index.html': fontPage, '404.html': fontPage.replace('Current page', 'Missing page'), '_redirects': '/ /index.html 200\n' })) writeFileSync(join(dir, '_site', file), body);
  if (scenario === 'referenceAsset') writeFileSync(join(dir, '_site/script.js'), 'export default `' + fontPage + '`;');
  const rewritten = fontPage.replace(preconnect, '').replace(fontLink, `<style type="text/css">${fontCss}</style>`);
  const variants = {
    valid: rewritten,
    untouched: fontPage,
    stale: rewritten.replace('Current page', 'Previous page'),
    script: rewritten.replace('const example', 'alert(1); const example'),
    inline: rewritten.replace('color:green', 'color:red'),
    comment: rewritten.replace(`<!-- ${preconnect} -->`, '<!--  -->'),
    noscript: rewritten.replace(`<noscript>${fontLink}</noscript>`, '<noscript></noscript>'),
    missing: fontPage.replace(preconnect, '').replace(fontLink, ''),
    family: rewritten.replaceAll("font-family:'Hanken Grotesk'", "font-family:'Wrong Font'"),
    weight: rewritten.replace('font-weight:700', 'font-weight:600'),
    display: rewritten.replace('font-display:swap', 'font-display:block'),
    external: rewritten.replace('url(/cf-fonts/', 'url(https://other.invalid/cf-fonts/'),
    path: rewritten.replace('/space-grotesk/', '/wrong-family/'),
    css: rewritten.replace('</style>', 'body{display:none}</style>'),
    property: rewritten.replace('font-style:normal;', 'font-style:normal;background:red;'),
    missingFont: rewritten,
    referenceDrift: rewritten,
    referenceAsset: rewritten,
  };
  writeFileSync(join(dir, 'mock-fetch.mjs'), `
globalThis.fetch = async (url, options) => {
  const parsed = new URL(url), path = parsed.pathname;
  // The live /cf-fonts/ endpoint serves GET, but HEAD falls through to a 404.
  if (path.startsWith('/cf-fonts/')) return new Response('font', {status:options.method === 'HEAD' || ${scenario === 'missingFont'} ? 404 : 200, headers:{'content-type':'font/woff2'}});
  let body = parsed.hostname === 'reference.invalid' ? ${JSON.stringify(fontPage)} : ${JSON.stringify(variants[scenario])};
  if (parsed.hostname === 'reference.invalid' && ${JSON.stringify(scenario)} === 'referenceDrift') body = body.replace('Current page', 'Other content');
  if (path === '/script.js') return new Response('export default \x60' + body + '\x60;', {headers:{'content-type':'text/javascript; charset=utf-8','x-content-type-options':'nosniff','cache-control':'public, max-age=3600, stale-while-revalidate=86400'}});
  if (path.includes('404') || path.includes('__hosting-check-missing__')) body = body.replace('Current page', 'Missing page');
  return new Response(body,{status:path.includes('__hosting-check-missing__') ? 404 : 200,headers:{'content-type':'text/html; charset=utf-8','x-content-type-options':'nosniff'}});
};`);
  return spawnSync(process.execPath, ['--import', join(dir, 'mock-fetch.mjs'), join(dir, 'build/check-hosting.mjs'), 'https://niuexa.ai', ...flags, ...(reference ? ['--compare', 'https://reference.invalid'] : [])], { encoding: 'utf8' });
}

test('explicit Fonts mode accepts only the expected font rewrite across all HTML checks', () => {
  const result = runFonts('valid');
  assert.equal(result.status, 0, result.stderr);
});
test('strict default still rejects edge HTML transformations', () => {
  assert.notEqual(runFonts('valid', []).status, 0);
});
test('Fonts mode also accepts unchanged HTML when Cloudflare falls back', () => {
  const result = runFonts('untouched');
  assert.equal(result.status, 0, result.stderr);
});
test('reference parity accepts an equivalent untransformed font stylesheet', () => {
  const result = runFonts('valid', ['--cloudflare-fonts'], true);
  assert.equal(result.status, 0, result.stderr);
});
for (const scenario of ['stale', 'script', 'inline', 'comment', 'noscript', 'missing', 'family', 'weight', 'display', 'external', 'path', 'css', 'property', 'missingFont']) {
  test(`Fonts mode rejects ${scenario} drift`, () => {
    const result = runFonts(scenario);
    assert.notEqual(result.status, 0, result.stdout);
  });
}
test('reference parity continues to reject unrelated content changes', () => {
  assert.notEqual(runFonts('referenceDrift', ['--cloudflare-fonts'], true).status, 0);
});
test('reference parity never normalizes font-like HTML strings inside JavaScript assets', () => {
  const result = runFonts('referenceAsset', ['--cloudflare-fonts'], true);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /script\.js: content differs from reference/);
});
