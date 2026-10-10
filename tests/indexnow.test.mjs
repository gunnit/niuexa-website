import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const source = resolve(import.meta.dirname, '..');
const root = mkdtempSync(join(tmpdir(), 'niuexa-indexnow-test-'));
after(() => rmSync(root, { recursive: true, force: true }));
const put = (file, text) => { mkdirSync(dirname(join(root, file)), { recursive: true }); writeFileSync(join(root, file), text); };
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const html = title => `<html><head><title>${title}</title></head><body>${title.repeat(100)}</body></html>`;
for (const file of ['build/indexnow.mjs', 'build/package-pages.mjs', 'build/package-cloudflare.mjs']) {
  let text = readFileSync(join(source, file), 'utf8');
  if (file.endsWith('package-cloudflare.mjs')) text = text.replace(/export const RENAMED = .*;/, 'export const RENAMED = [];');
  put(file, text);
}
put('59d901b42caac9fceecf85148888c406.txt', '59d901b42caac9fceecf85148888c406\n');
put('build/event-content.mjs', "export const EVENTS = [{slug:'old-event'}];\nexport const MOVED = [];\nthrow new Error('Historical modules must never execute');\n");
for (const file of ['index.html', 'edited.html', 'deleted.html', 'renamed-old.html', 'becomes-noindex.html', 'becomes-redirect.html', 'private/deleted.html', 'tests/deleted.html', 'event-registration.html', 'books/.draft/deleted.html', 'eventi-ai-aziende/old-event/index.html', 'eventi-ai-aziende/draft/index.html']) put(file, html(file));
put('already-noindex.html', '<meta name="robots" content="noindex">old public page');
symlinkSync('private/deleted.html', join(root, 'symlink.html'));
git('init', '-q'); git('config', 'user.name', 'IndexNow test'); git('config', 'user.email', 'indexnow-test@example.invalid');
git('add', '.'); git('commit', '-qm', 'before');
const before = git('rev-parse', 'HEAD');
for (const file of ['deleted.html', 'already-noindex.html', 'private/deleted.html', 'tests/deleted.html', 'event-registration.html', 'books/.draft/deleted.html', 'eventi-ai-aziende/old-event/index.html', 'eventi-ai-aziende/draft/index.html', 'symlink.html']) rmSync(join(root, file));
git('mv', 'renamed-old.html', 'renamed-new.html');
put('edited.html', html('updated'));
put('added.html', html('new'));
put('en/index.html', html('English'));
put('becomes-noindex.html', '<meta content="noindex, follow" name="robots">retired from search');
put('becomes-redirect.html', '<meta http-equiv="refresh" content="0; url=/added.html">moved');
put('private/new.html', html('private'));
put('build/event-content.mjs', "export const EVENTS = [{slug:'new-event'}];\nexport const MOVED = [];\nthrow new Error('Historical modules must never execute');\n");
put('eventi-ai-aziende/new-event/index.html', html('new event'));
git('add', '-A'); git('commit', '-qm', 'after');
const afterRef = git('rev-parse', 'HEAD');
const current = ['index.html', 'edited.html', 'added.html', 'renamed-new.html', 'becomes-noindex.html', 'becomes-redirect.html', 'en/index.html', 'eventi-ai-aziende/new-event/index.html'];
for (const file of current) put('_site/' + file, readFileSync(join(root, file), 'utf8'));
put('_site/404.html', html('not found'));

// This substitutes only the external HTTP boundary. Git, packaging membership,
// command-line selection and request payloads use the real implementation.
put('mock-fetch.mjs', `
import { appendFileSync } from 'node:fs';
globalThis.fetch = async (url, options = {}) => {
  appendFileSync(process.env.REQUEST_LOG, JSON.stringify({url:String(url),method:options.method || 'GET',body:options.body ? JSON.parse(options.body) : null,signal:options.signal instanceof AbortSignal,redirect:options.redirect})+'\\n');
  if (process.env.FETCH_CASE === 'forbidden') throw new Error('dry-run attempted network');
  if (String(url).endsWith('.txt')) {
    if (process.env.FETCH_CASE === 'key-redirect') return new Response(null,{status:302,headers:{location:'https://other.invalid/key.txt'}});
    return new Response(process.env.FETCH_CASE === 'bad-key' ? 'wrong' : '59d901b42caac9fceecf85148888c406\\n');
  }
  return new Response('',{status:process.env.FETCH_CASE === 'server-error' ? 503 : process.env.FETCH_CASE === 'pending' ? 202 : 200});
};
`);
let invocation = 0;
function run(args, fetchCase = 'forbidden') {
  const log = join(root, 'requests-' + invocation++ + '.jsonl');
  writeFileSync(log, '');
  const r = spawnSync(process.execPath, ['--import', join(root, 'mock-fetch.mjs'), join(root, 'build/indexnow.mjs'), ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, REQUEST_LOG: log, FETCH_CASE: fetchCase } });
  return { ...r, requests: readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) };
}
const urlsFrom = stdout => stdout.split('\n').map(x => x.trim()).filter(x => x.startsWith('https://niuexa.ai/')).sort();

test('changed-public selection includes deletes, both rename paths and noindex/redirect transitions without private or unpublished HTML', () => {
  const r = run([before, afterRef, '--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(urlsFrom(r.stdout), [
    'https://niuexa.ai/added.html',
    'https://niuexa.ai/already-noindex.html',
    'https://niuexa.ai/becomes-noindex.html',
    'https://niuexa.ai/becomes-redirect.html',
    'https://niuexa.ai/deleted.html',
    'https://niuexa.ai/edited.html',
    'https://niuexa.ai/en/',
    'https://niuexa.ai/eventi-ai-aziende/new-event/',
    'https://niuexa.ai/eventi-ai-aziende/old-event/',
    'https://niuexa.ai/renamed-new.html',
    'https://niuexa.ai/renamed-old.html',
  ].sort());
  assert.deepEqual(r.requests, [], 'dry-run must never fetch or submit');
});

test('explicit full backfill includes all packaged public HTML, including retirement signals, but not 404 or private sources', () => {
  const r = run(['--all', '--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(urlsFrom(r.stdout), [
    'https://niuexa.ai/', 'https://niuexa.ai/added.html', 'https://niuexa.ai/becomes-noindex.html',
    'https://niuexa.ai/becomes-redirect.html', 'https://niuexa.ai/edited.html', 'https://niuexa.ai/en/',
    'https://niuexa.ai/eventi-ai-aziende/new-event/', 'https://niuexa.ai/renamed-new.html',
  ].sort());
  assert.deepEqual(r.requests, []);
});

test('live ownership mismatch or redirect blocks the submission', () => {
  for (const scenario of ['bad-key', 'key-redirect']) {
    const r = run([before, afterRef], scenario);
    assert.notEqual(r.status, 0);
    assert.equal(r.requests.length, 1);
    assert.equal(r.requests[0].url, 'https://niuexa.ai/59d901b42caac9fceecf85148888c406.txt');
    assert.equal(r.requests[0].redirect, 'manual');
  }
});

test('successful receipt uses verified ownership and submits the complete lifecycle URL list with bounded requests', () => {
  const r = run([before, afterRef], 'success');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.requests.length, 2);
  assert.ok(r.requests.every(x => x.signal));
  const payload = r.requests[1].body;
  assert.equal(payload.host, 'niuexa.ai');
  assert.equal(payload.keyLocation, r.requests[0].url);
  assert.ok(payload.urlList.includes('https://niuexa.ai/deleted.html'));
  assert.ok(payload.urlList.includes('https://niuexa.ai/renamed-old.html'));
  assert.equal(payload.urlList.length, 11);
});

test('202 is reported as pending key validation, not indexed or fully validated', () => {
  const r = run(['--all'], 'pending');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /pending.*validation|validation.*pending/i);
});

test('temporary API failure retries a bounded number of times and remains a failed notification', () => {
  const r = run(['--all'], 'server-error');
  assert.notEqual(r.status, 0);
  assert.equal(r.requests.filter(x => x.method === 'POST').length, 3);
});

test('missing arguments fail rather than silently pretending a submission occurred', () => {
  const r = run([]);
  assert.notEqual(r.status, 0);
  assert.deepEqual(r.requests, []);
});
