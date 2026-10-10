import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

// The network and browser DOM are the only substitutes. The real shared script
// and real form handlers run together; no live form endpoint is ever contacted.
function element(name = '', value = '') {
  const listeners = [];
  return {
    name, value, type: 'text', checked: true, dataset: {}, style: {}, className: '',
    textContent: 'Send', innerHTML: 'Send', children: [],
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener(type, fn, options) { listeners.push({ type, fn, capture: options === true }); },
    async fire(type) {
      const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      const results = listeners.filter(l => l.type === type).sort((a, b) => b.capture - a.capture).map(l => l.fn.call(this, event));
      await Promise.all(results);
      return event;
    },
    setAttribute(key, val) { this[key] = val; },
    getAttribute(key) { return this[key] || null; },
    removeAttribute(key) { delete this[key]; },
    hasAttribute(key) { return this[key] !== undefined; },
    appendChild(child) { this.children.push(child); child.parentNode = this; child.parentElement = this; },
    insertBefore(child) { this.appendChild(child); },
    replaceChild(child, old) { this.children = this.children.map(el => el === old ? child : el); child.parentNode = this; },
    querySelector(selector) { return selector === 'span' ? (this.span ||= element()) : null; },
    querySelectorAll() { return []; },
    matches() { return false; }, focus() {}, scrollIntoView() {},
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); },
  };
}

function form(className = 'phase-form', redirect = 'https://niuexa.ai/thank-you-page.html') {
  const f = element();
  f.className = className;
  f.id = 'contact-form';
  f.action = 'https://api.web3forms.com/submit';
  f.method = 'POST';
  f.dataset.formLabel = className === 'simple-signup-form' ? 'Newsletter signup' : 'Contact request';
  f.button = element();
  f.parentNode = f.parentElement = element();
  f.parentNode.appendChild(f);
  for (const [name, value] of Object.entries({ access_key: 'offline-test-key', name: 'Test Person', firstName: 'Test', lastName: 'Person', company: 'Offline Test', service: 'consulting', email: 'test@example.com', message: 'This is an offline fixture.', privacy: 'on', redirect })) {
    const field = element(name, value);
    if (name === 'email') field.type = 'email';
    if (name === 'privacy') field.type = 'checkbox';
    f.appendChild(field);
  }
  f.querySelector = selector => {
    if (selector.includes('button') || selector.includes('.btn-submit')) return f.button;
    const match = /\[name="([^"]+)"\]/.exec(selector);
    if (match) return f.children.find(el => el.name === match[1]) || null;
    if (selector === 'input[type="email"]') return f.children.find(el => el.name === 'email');
    return null;
  };
  f.querySelectorAll = selector => selector === '[required]' || selector === '.error' ? [] : f.children;
  return f;
}

function storage(values = new Map(), blocked = false) {
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { if (blocked) throw Error('Storage blocked'); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error('Storage blocked'); values.set(key, value); },
    removeItem(key) { if (blocked) throw Error('Storage blocked'); values.delete(key); },
  };
}

function browser({ path = '/contatti.html', forms = [], session = new Map(), local = new Map(), blocked = false, fetchImpl } = {}) {
  const callbacks = [];
  const listeners = new Map();
  const doc = {
    readyState: 'loading', referrer: '', documentElement: { lang: 'it' }, head: element(), body: element(),
    addEventListener(type, callback) { if (type === 'DOMContentLoaded') callbacks.push(callback); },
    createElement() { return element(); },
    querySelectorAll(selector) {
      if (selector.startsWith('form[action')) return forms;
      if (selector === 'form[data-niuexa-tracking-bound="1"]') return forms.filter(f => f.dataset.niuexaTrackingBound === '1');
      if (selector === 'form.simple-signup-form') return forms.filter(f => f.className === 'simple-signup-form');
      return [];
    },
    querySelector(selector) {
      if (selector === '.form-column' || selector === '.form-header') return element();
      return forms.find(f => selector === '.' + f.className) || null;
    },
    getElementById() { return null; },
  };
  const calls = [];
  let currentUrl = new URL(path, 'https://niuexa.ai');
  const location = {
    get href() { return currentUrl.href; },
    set href(value) { currentUrl = new URL(value, currentUrl); },
    get origin() { return currentUrl.origin; },
    get pathname() { return currentUrl.pathname; },
    get search() { return currentUrl.search; },
  };
  const ctx = vm.createContext({
    document: doc, location,
    localStorage: storage(local, blocked), sessionStorage: storage(session, blocked),
    URL, URLSearchParams, crypto: { randomUUID }, console: { error() {}, log() {} },
    setTimeout() {},
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(callback); },
    dispatchEvent(event) { for (const callback of listeners.get(event.type) || []) callback(event); },
    IntersectionObserver: class { observe() {} },
    FormData: class {
      constructor(f) { this.fields = new Map(f.children.map(el => [el.name, el.value])); }
      get(key) { return this.fields.get(key) ?? null; }
      delete(key) { this.fields.delete(key); }
      forEach(fn) { this.fields.forEach(fn); }
    },
    fetch: async (...args) => { calls.push(args); return fetchImpl(...args); },
    dataLayer: [],
  });
  ctx.window = ctx;
  ctx.gtag = (...args) => ctx.dataLayer.push(args);
  ctx.history = { replaceState(_state, _title, url) { ctx.location.href = url; } };
  const run = name => vm.runInContext(read(name), ctx, { filename: name });
  run('conversion-tracking.js');
  ctx.NiuexaTracking.init();
  return { ctx, run, calls, callbacks, events: name => ctx.dataLayer.filter(item => item.event === name) };
}

test('direct thank-you visits and stale legacy attribution do not become leads', () => {
  for (const path of ['/thank-you-page.html', '/thank-you-ai-readiness.html', '/en/thank-you-page.html']) {
    const page = browser({ path });
    page.ctx.localStorage.setItem('niuexa_attribution_v1', JSON.stringify({ last_submit_at: '2026-10-01', last_form_name: 'old form' }));
    page.ctx.NiuexaTracking.init();
    assert.equal(page.events('generate_lead').length, 0);
    assert.equal(page.events('form_submit').length, 0);
  }
});

test('submission starts an attempt, never a successful submission or lead', async () => {
  const f = form();
  const page = browser({ forms: [f] });
  const event = await f.fire('submit');
  assert.equal(event.defaultPrevented, false, 'native POST must remain native');
  assert.equal(page.events('form_submit_attempt').length, 1);
  assert.equal(page.events('form_submit').length, 0);
  assert.equal(page.events('generate_lead').length, 0);
});

test('native provider callback requires its own recent token and path; reloads cannot recount it', async () => {
  const session = new Map();
  const local = new Map([['niuexa_cookie_consent', JSON.stringify({ analytics: true, marketing: false })]]);
  const f = form();
  const page = browser({ forms: [f], session, local });
  await f.fire('submit');
  const redirect = f.querySelector('[name="redirect"]').value;
  assert.ok(new URL(redirect).searchParams.get('niuexa_submission'));
  const wrongPath = new URL(redirect); wrongPath.pathname = '/thank-you-ai-readiness.html';
  assert.equal(browser({ path: wrongPath.href, session, local }).events('generate_lead').length, 0);
  assert.equal(browser({ path: '/thank-you-page.html?niuexa_submission=wrong', session, local }).events('generate_lead').length, 0);
  const success = browser({ path: redirect, session, local });
  assert.equal(success.events('form_submit').length, 1);
  assert.equal(success.events('generate_lead').length, 1);
  assert.equal(success.events('generate_lead')[0].confirmation_method, 'provider_redirect');
  assert.equal(success.ctx.location.search, '', 'one-use callback token is removed from the address');
  success.ctx.NiuexaTracking.init();
  assert.equal(success.events('generate_lead').length, 1);
  assert.equal(browser({ path: redirect, session, local }).events('generate_lead').length, 0);
});

test('expired native callback fails closed and storage denial never prevents form submission', async () => {
  const session = new Map();
  const local = new Map([['niuexa_cookie_consent', JSON.stringify({ analytics: true, marketing: false })]]);
  const f = form();
  const page = browser({ forms: [f], session, local });
  await f.fire('submit');
  for (const [key, value] of session) {
    const entry = JSON.parse(value); entry.created_at = Date.now() - 31 * 60 * 1000;
    session.set(key, JSON.stringify(entry));
  }
  assert.equal(browser({ path: f.querySelector('[name="redirect"]').value, session, local }).events('generate_lead').length, 0);
  const deniedForm = form();
  const denied = browser({ forms: [deniedForm], blocked: true });
  assert.equal((await deniedForm.fire('submit')).defaultPrevented, false);
  assert.equal(deniedForm.querySelector('[name="redirect"]').value, 'https://niuexa.ai/thank-you-page.html');
  assert.equal(denied.events('generate_lead').length, 0);
});

test('a cached older tracking API cannot turn a received signup into a visible error', async () => {
  const f = form('simple-signup-form');
  const page = browser({ forms: [f], fetchImpl: async () => ({ ok: true, json: async () => ({ success: true }) }) });
  page.run('script.js');
  page.ctx.initSimpleSignupForms();
  delete page.ctx.NiuexaTracking.confirmSubmission;
  await f.fire('submit');
  assert.equal(f.parentNode.children[0].className, 'form-success');
});

test('blocked attribution storage does not hide a provider-confirmed signup', async () => {
  const f = form('simple-signup-form');
  const page = browser({ forms: [f], blocked: true, fetchImpl: async () => ({ ok: true, json: async () => ({ success: true }) }) });
  page.run('script.js');
  page.ctx.initSimpleSignupForms();
  await f.fire('submit');
  assert.equal(f.parentNode.children[0].className, 'form-success');
  assert.equal(page.events('generate_lead').length, 1);
});

for (const kind of ['simple-signup-form', 'contact-form', 'ai-readiness-form', 'contact-page']) {
  for (const result of ['success', 'provider-false', 'provider-string', 'missing', 'http-error', 'invalid-json', 'network-error']) {
    test(`${kind}: ${result} requires provider success before conversion or success UI`, async () => {
      const f = form(kind === 'contact-page' ? 'contact-form' : kind);
      const page = browser({ forms: [f], fetchImpl: async () => {
        if (result === 'network-error') throw Error('offline');
        return { ok: result !== 'http-error', status: result === 'http-error' ? 400 : 200,
          json: async () => {
            if (result === 'invalid-json') throw Error('invalid JSON');
            return result === 'missing' ? {} : { success: result === 'provider-string' ? 'true' : result === 'success' || result === 'http-error' };
          }, text: async () => 'Provider rejected request' };
      } });
      if (kind === 'contact-page') {
        page.run('contatti.js');
        page.callbacks.at(-1)();
      } else if (kind === 'ai-readiness-form') {
        page.run('ai-readiness-tool.js');
        page.ctx.initAIReadinessForm();
      } else {
        page.run('script.js');
        page.ctx[kind === 'simple-signup-form' ? 'initSimpleSignupForms' : 'initContactForm']();
      }
      const originalPath = page.ctx.location.href;
      await f.fire('submit');
      assert.equal(page.calls.length, 1);
      assert.equal(page.calls[0][0], 'https://api.web3forms.com/submit');
      assert.equal(page.calls[0][1].method, 'POST');
      assert.equal(page.calls[0][1].body.get('access_key'), 'offline-test-key');
      assert.equal(page.calls[0][1].body.get('redirect'), null, 'AJAX expects JSON, not the native success redirect');
      assert.equal(page.events('form_submit_attempt').length, 1);
      const expected = result === 'success' ? 1 : 0;
      assert.equal(page.events('form_submit').length, expected);
      assert.equal(page.events('generate_lead').length, expected);
      assert.equal(page.ctx.dataLayer.filter(item => item[0] === 'event' && item[1] === 'form_submit').length, expected);
      if (expected) {
        assert.equal(page.events('generate_lead')[0].confirmation_method, 'provider_response');
        if (kind !== 'ai-readiness-form') {
          assert.equal(page.events('form_submit')[0].event_category, kind === 'simple-signup-form' ? 'Lead Capture' : 'Contact');
          assert.equal(page.events('form_submit')[0].event_label, kind === 'simple-signup-form' ? 'Newsletter signup' : kind === 'contact-page' ? 'Contact Form' : 'Contact form /contatti.html');
        }
        page.ctx.NiuexaTracking.confirmSubmission(f);
        assert.equal(page.events('generate_lead').length, 1, 'repeat success callback is idempotent');
        assert.equal(browser({ path: '/thank-you-page.html' }).events('generate_lead').length, 0);
        if (kind === 'simple-signup-form') assert.equal(f.parentNode.children[0].className, 'form-success');
        else assert.notEqual(page.ctx.location.href, originalPath);
      } else {
        assert.equal(page.ctx.location.href, originalPath);
        assert.equal(f.parentNode.children.includes(f), true);
      }
      assert.equal(page.ctx.dataLayer.some(item => item[0] === 'consent'), false, 'tracking does not override consent');
    });
  }
}

// Consent regressions exercise the real field values, storage and emitted payloads.
test('without analytics consent native forms send normally without a measurement token', async () => {
  const f = form();
  const session = new Map();
  const page = browser({ forms: [f], session });
  assert.equal((await f.fire('submit')).defaultPrevented, false);
  assert.equal(session.size, 0);
  assert.equal(f.querySelector('[name="redirect"]').value, 'https://niuexa.ai/thank-you-page.html');
});

test('no consent removes legacy storage and strips click IDs from forms and event URLs', () => {
  const f = form();
  const local = new Map([['niuexa_attribution_v1', JSON.stringify({gclid: 'old'})]]);
  const session = new Map([['niuexa_pending_lead_v1', '{}'], ['niuexa_lead_event_old', 'old'], ['unrelated', 'keep']]);
  const page = browser({ path: '/contatti.html?gclid=secret&gbraid=secret2&wbraid=secret3&utm_source=current', forms: [f], local, session });
  assert.equal(local.has('niuexa_attribution_v1'), false);
  assert.deepEqual([...session], [['unrelated', 'keep']]);
  for (const key of ['gclid', 'gbraid', 'wbraid']) assert.equal(f.querySelector('[name="' + key + '"]'), null);
  assert.equal(f.querySelector('[name="current_page"]').value, 'https://niuexa.ai/contatti.html?utm_source=current');
  page.ctx.NiuexaTracking.track('cta_click', { cta_url: '/offer?gclid=secret#details' });
  const event = page.events('cta_click')[0];
  assert.equal(event.page_location, 'https://niuexa.ai/contatti.html?utm_source=current');
  assert.equal(event.cta_url, 'https://niuexa.ai/offer#details');
  assert.equal(JSON.stringify(page.ctx.dataLayer).includes('secret'), false);
});

test('revoking marketing consent clears stale hidden attribution and identifiers immediately', () => {
  const f = form();
  const local = new Map([
    ['niuexa_cookie_consent', JSON.stringify({ analytics: true, marketing: true })],
    ['niuexa_attribution_v1', JSON.stringify({ utm_source: 'old-source', referrer: 'https://old.example/?gclid=old', gclid: 'old', landing_page: 'https://niuexa.ai/?gclid=old', updated_at: new Date().toISOString() })]
  ]);
  const page = browser({ forms: [f], local });
  assert.equal(f.querySelector('[name="utm_source"]').value, 'old-source');
  assert.equal(f.querySelector('[name="gclid"]').value, 'old');
  local.set('niuexa_cookie_consent', JSON.stringify({ analytics: true, marketing: false }));
  page.ctx.dispatchEvent({ type: 'niuexa:consent', detail: { analytics: true, marketing: false } });
  assert.equal(f.querySelector('[name="utm_source"]').value, '');
  assert.equal(f.querySelector('[name="referrer"]').value, '');
  assert.equal(f.querySelector('[name="gclid"]'), null);
  assert.equal(local.has('niuexa_attribution_v1'), false);
});

test('analytics revocation removes pending callbacks and legacy measurement markers', async () => {
  const local = new Map([['niuexa_cookie_consent', JSON.stringify({ analytics: true, marketing: false })]]);
  const session = new Map([['niuexa_lead_event_old', 'old']]);
  const f = form();
  const page = browser({ forms: [f], local, session });
  await f.fire('submit');
  assert.ok(session.has('niuexa_pending_lead_v1'));
  local.set('niuexa_cookie_consent', JSON.stringify({ analytics: false, marketing: false }));
  page.ctx.dispatchEvent({ type: 'niuexa:consent', detail: { analytics: false, marketing: false } });
  assert.equal(session.size, 0);
});

for (const ageDays of [89, 91, -1]) {
  test('attribution age ' + ageDays + ' days is used only inside the 90-day window', () => {
    const local = new Map([
      ['niuexa_cookie_consent', JSON.stringify({ analytics: false, marketing: true })],
      ['niuexa_attribution_v1', JSON.stringify({ utm_source: 'stored-source', landing_page: 'https://niuexa.ai/old', updated_at: new Date(Date.now() - ageDays * 86400000).toISOString() })]
    ]);
    const page = browser({ local });
    assert.equal(page.ctx.NiuexaTracking.attribution().utm_source, ageDays === 89 ? 'stored-source' : undefined);
  });
}

test('malformed consent cannot allow attribution when the banner would reject the saved choice', () => {
  const local = new Map([['niuexa_cookie_consent', JSON.stringify({ analytics: 'yes', marketing: true })]]);
  const f = form();
  browser({ path: '/contatti.html?gclid=secret', forms: [f], local });
  assert.equal(local.has('niuexa_attribution_v1'), false);
  assert.equal(f.querySelector('[name="gclid"]'), null);
});

test('submitting again after analytics withdrawal strips the previous native callback token', async () => {
  const local = new Map([['niuexa_cookie_consent', JSON.stringify({ analytics: true, marketing: false })]]);
  const f = form();
  const page = browser({ forms: [f], local });
  await f.fire('submit');
  assert.ok(new URL(f.querySelector('[name="redirect"]').value).searchParams.has('niuexa_submission'));
  local.set('niuexa_cookie_consent', JSON.stringify({ analytics: false, marketing: false }));
  page.ctx.dispatchEvent({ type: 'niuexa:consent', detail: { analytics: false, marketing: false } });
  await f.fire('submit');
  assert.equal(f.querySelector('[name="redirect"]').value, 'https://niuexa.ai/thank-you-page.html');
});
