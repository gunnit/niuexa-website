import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../cookie-banner.js', import.meta.url), 'utf8');
const consentKey = 'niuexa_cookie_consent';

// Browser boundary only: execute the full banner, including its public revoke method.
function browser({ stored, blocked = false } = {}) {
  const local = new Map(stored === undefined ? [] : [[consentKey, stored]]);
  const session = new Map();
  const nodes = new Map();
  const applied = [];
  const events = [];
  const ready = [];
  let reloads = 0;
  function element() {
    return { style: {}, checked: false, dataset: {}, setAttribute() {},
      addEventListener() {}, appendChild(child) { if (child.id) nodes.set(child.id, child); } };
  }
  const storage = values => ({
    get length() { return values.size; }, key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { if (blocked) throw Error('Storage unavailable'); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error('Storage unavailable'); values.set(key, value); },
    removeItem(key) { if (blocked) throw Error('Storage unavailable'); values.delete(key); },
  });
  const document = { documentElement: { lang: 'en' }, body: element(), head: element(),
    createElement: element,
    getElementById(id) { return nodes.get(id) || null; },
    querySelector() { return element(); },
    addEventListener(name, fn) { if (name === 'DOMContentLoaded') ready.push(fn); },
  };
  for (const id of ['cookie-accept-all', 'cookie-reject-all', 'cookie-customize', 'cookie-save-preferences', 'cookie-back', 'analytics-cookies', 'marketing-cookies']) nodes.set(id, element());
  const ctx = vm.createContext({ document, localStorage: storage(local), sessionStorage: storage(session),
    dataLayer: [], console,
    gtag(...args) { applied.push(args); events.push({ type: 'gtag', args }); },
    dispatchEvent(event) { events.push({ type: event.type, detail: event.detail }); },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    location: { reload() { reloads++; } },
  });
  ctx.window = ctx;
  const originalPush = ctx.dataLayer.push.bind(ctx.dataLayer);
  ctx.dataLayer.push = value => { events.push({ type: 'dataLayer', value }); return originalPush(value); };
  vm.runInContext(source, ctx, { filename: 'cookie-banner.js' });
  for (const fn of ready) fn();
  return { ctx, local, session, nodes, applied, events, get reloads() { return reloads; } };
}

test('a restored choice updates Google before exposing a boolean GTM consent event', () => {
  const page = browser({ stored: JSON.stringify({ analytics: false, marketing: true }) });
  const consent = page.ctx.dataLayer.find(item => item.event === 'niuexa_consent_update');
  assert.ok(consent);
  assert.equal(consent.analytics_consent, false);
  assert.equal(consent.marketing_consent, true);
  assert.deepEqual(Object.keys(consent).sort(), ['analytics_consent', 'event', 'marketing_consent']);
  const mode = page.events.findIndex(e => e.type === 'gtag' && e.args[0] === 'consent');
  const trigger = page.events.findIndex(e => e.type === 'dataLayer');
  assert.ok(mode >= 0 && trigger > mode);
  assert.equal(page.applied[0][2].ad_storage, 'granted');
});

test('new preferences apply the consent update before either event notifies consumers', () => {
  const page = browser();
  page.events.length = 0;
  page.ctx.cookieBanner.acceptAllCookies();
  const mode = page.events.findIndex(e => e.type === 'gtag');
  assert.ok(mode >= 0);
  assert.ok(page.events.findIndex(e => e.type === 'niuexa:consent') > mode);
  assert.ok(page.events.findIndex(e => e.type === 'dataLayer') > mode);
  assert.equal(page.ctx.dataLayer.at(-1).marketing_consent, true);
});

test('revocation purges first-party measurement immediately even on a policy page without tracking.js', () => {
  const page = browser({ stored: JSON.stringify({ analytics: true, marketing: true }) });
  page.local.set('niuexa_attribution_v1', 'old');
  page.local.set('unrelated', 'keep');
  page.session.set('niuexa_pending_lead_v1', 'old');
  page.session.set('niuexa_lead_event_old', 'old');
  page.session.set('unrelated', 'keep');
  page.ctx.cookieBanner.revokeConsent();
  assert.deepEqual([...page.local], [['unrelated', 'keep']]);
  assert.deepEqual([...page.session], [['unrelated', 'keep']]);
  assert.equal(page.ctx.dataLayer.at(-1).marketing_consent, false);
  assert.equal(page.ctx.dataLayer.at(-1).analytics_consent, false);
  assert.equal(page.reloads, 1);
});

for (const stored of ['{bad JSON', 'null', '[]', '{"analytics":"true","marketing":"true"}']) {
  test('malformed or non-boolean saved consent fails closed: ' + stored, () => {
    const page = browser({ stored });
    assert.ok(page.nodes.has('cookie-banner'));
    assert.equal(page.ctx.dataLayer.at(-1).marketing_consent, false);
    assert.equal(page.ctx.dataLayer.at(-1).analytics_consent, false);
    assert.equal(page.ctx._linkedin_partner_id, undefined);
  });
}

test('blocked browser storage leaves a usable necessary-only banner', () => {
  const page = browser({ blocked: true });
  assert.ok(page.nodes.has('cookie-banner'));
  assert.doesNotThrow(() => page.ctx.cookieBanner.acceptOnlyNecessary());
  assert.equal(page.ctx.dataLayer.at(-1).marketing_consent, false);
});
