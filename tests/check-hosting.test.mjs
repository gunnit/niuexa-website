import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = mkdtempSync(join(tmpdir(), 'niuexa-hosting-test-'));
after(() => rmSync(root, { recursive: true, force: true }));
mkdirSync(join(root, 'build')); mkdirSync(join(root, '_site'));
writeFileSync(join(root, 'build/check-hosting.mjs'), readFileSync(resolve(import.meta.dirname, '../build/check-hosting.mjs')));
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
