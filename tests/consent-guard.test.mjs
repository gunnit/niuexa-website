import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { consentGuardScript, withConsentGuard } from '../build/inline-consent-guard.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const source = readFileSync(join(ROOT, 'consent-guard.js'), 'utf8');

// Browser boundary only: a DOM node prototype, storage and window events.
function page(stored) {
  const inserted = [];
  const listeners = {};
  class Node {
    appendChild(node) { inserted.push(node); return node; }
    insertBefore(node) { inserted.push(node); return node; }
  }
  const ctx = vm.createContext({
    Node, URL, location: { href: 'https://niuexa.ai/' },
    localStorage: { getItem: () => stored ?? null },
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
  });
  ctx.window = ctx;
  vm.runInContext(source, ctx, { filename: 'consent-guard.js' });
  const head = new Node();
  const script = (src) => ({ nodeName: 'SCRIPT', src });
  const consent = (detail) => (listeners['niuexa:consent'] || []).forEach((fn) => fn({ detail }));
  return { inserted, head, script, consent };
}

test('HubSpot and Apollo wait for marketing consent while Google tags load at once', () => {
  const p = page();
  const hubspot = p.script('https://js-eu1.hs-scripts.com/148943129.js');
  const apollo = p.script('https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=x');
  const gtag = p.script('https://www.googletagmanager.com/gtag/js?id=G-8JW0S3PJKM');
  p.head.appendChild(hubspot);
  p.head.insertBefore(apollo, null);
  p.head.appendChild(gtag);
  assert.deepEqual(p.inserted, [gtag]);
  p.consent({ analytics: true, marketing: false });
  assert.deepEqual(p.inserted, [gtag]);
  p.consent({ analytics: false, marketing: true });
  assert.deepEqual(p.inserted, [gtag, hubspot, apollo]);
  const later = p.script('https://js-eu1.hs-analytics.net/analytics/1/148943129.js');
  p.head.appendChild(later);
  assert.equal(p.inserted.at(-1), later);
});

test('a saved marketing consent lets the vendors load on page load', () => {
  const p = page(JSON.stringify({ analytics: false, marketing: true }));
  const hubspot = p.script('https://js-eu1.hs-scripts.com/148943129.js');
  p.head.appendChild(hubspot);
  assert.deepEqual(p.inserted, [hubspot]);
});

test('a malformed saved choice fails closed', () => {
  const p = page('{not json');
  p.head.appendChild(p.script('https://assets.apollo.io/x.js'));
  assert.deepEqual(p.inserted, []);
});

function* pages(dir) {
  for (const name of readdirSync(dir)) {
    if (['.git', '.github', '.claude', 'node_modules', '_site', '_site-review', 'build', 'tests', 'templates', 'qa'].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* pages(path);
    else if (name.endsWith('.html')) yield path;
  }
}

test('every page that loads GTM runs the current guard before the GTM loader', () => {
  const script = consentGuardScript();
  let checked = 0;
  for (const path of pages(ROOT)) {
    const html = readFileSync(path, 'utf8');
    if (!html.includes("'gtm.start'")) continue;
    checked++;
    assert.equal(withConsentGuard(html, script), html, `${path}: run node build/inline-consent-guard.mjs`);
    assert.ok(html.indexOf(script) < html.indexOf("'gtm.start'"), path);
  }
  assert.ok(checked > 100, `only ${checked} GTM pages found`);
});
