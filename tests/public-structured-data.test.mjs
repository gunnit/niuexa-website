import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const sitemap = readFileSync(new URL('sitemap.xml', root), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);

test('every indexable sitemap page publishes parseable JSON-LD, including English pages', () => {
  assert.ok(urls.length > 0);
  for (const url of urls) {
    let path = new URL(url).pathname.replace(/^\//, '');
    if (!path || path.endsWith('/')) path += 'index.html';
    const html = readFileSync(new URL(path, root), 'utf8');
    const blocks = [...html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)];
    for (const [, source] of blocks) {
      assert.doesNotThrow(() => JSON.parse(source), `${url}: malformed JSON-LD`);
    }
  }
});
