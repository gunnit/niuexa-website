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
    matches() { return false; }, focus() {}, scrollIntoView() {}, remove() {},
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
    getItem(key) { if (blocked) throw Error('Storage blocked'); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error('Storage blocked'); values.set(key, value); },
    removeItem(key) { if (blocked) throw Error('Storage blocked'); values.delete(key); },
  };
}

function browser({ path = '/contatti.html', forms = [], session = new Map(), local = new Map(), blocked = false, fetchImpl, completeTag = true, completeLayer = true } = {}) {
  const callbacks = [];
  const doc = {
    readyState: 'loading', referrer: '', documentElement: { lang: 'it' }, head: element(), body: element(),
    addEventListener(type, callback) { if (type === 'DOMContentLoaded') callbacks.push(callback); },
    createElement() { return element(); },
    querySelectorAll(selector) {
      if (selector.startsWith('form[action')) return forms;
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
  const dataLayer = [];
  dataLayer.push = (...items) => {
    const length = Array.prototype.push.apply(dataLayer, items);
    for (const item of items) {
      if (completeLayer && typeof item.eventCallback === 'function') item.eventCallback('GTM-KG9S42S4');
    }
    return length;
  };
  const timers = new Map();
  let timerId = 0;
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
    setTimeout(fn, delay) { timers.set(++timerId, { fn, delay }); return timerId; },
    clearTimeout(id) { timers.delete(id); }, addEventListener() {},
    IntersectionObserver: class { observe() {} },
    FormData: class {
      constructor(f) { this.fields = new Map(f.children.map(el => [el.name, el.value])); }
      get(key) { return this.fields.get(key) ?? null; }
      delete(key) { this.fields.delete(key); }
      forEach(fn) { this.fields.forEach(fn); }
    },
    fetch: async (...args) => { calls.push(args); return fetchImpl(...args); },
    dataLayer,
  });
  ctx.window = ctx;
  ctx.gtag = (...args) => {
    ctx.dataLayer.push(args);
    if (completeTag && typeof args[2]?.event_callback === 'function') args[2].event_callback();
  };
  ctx.history = { replaceState(_state, _title, url) { ctx.location.href = url; } };
  const run = name => vm.runInContext(read(name), ctx, { filename: name });
  run('conversion-tracking.js');
  ctx.NiuexaTracking.init();
  return { ctx, run, calls, callbacks, timers, events: name => ctx.dataLayer.filter(item => item.event === name) };
}

// The native thank-you correlation record is measurement storage: it needs analytics consent.
const analyticsConsent = () => new Map([['niuexa_cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: false })]]);

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
  const local = analyticsConsent();
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

test('without analytics consent no correlation record is stored and the redirect carries no token', async () => {
  const session = new Map();
  const f = form();
  browser({ forms: [f], session });
  assert.equal((await f.fire('submit')).defaultPrevented, false, 'native POST must remain native');
  assert.equal(session.has('niuexa_pending_lead_v1'), false);
  assert.equal(new URL(f.querySelector('[name="redirect"]').value).searchParams.has('niuexa_submission'), false);
});

test('a correlation record left from an earlier consent is removed once analytics consent is gone', () => {
  const session = new Map([['niuexa_pending_lead_v1', JSON.stringify({ submission_id: 'x', created_at: Date.now() })]]);
  browser({ session, path: '/thank-you-page.html?niuexa_submission=x' });
  assert.equal(session.has('niuexa_pending_lead_v1'), false);
});

test('expired native callback fails closed and storage denial never prevents form submission', async () => {
  const session = new Map();
  const local = analyticsConsent();
  const f = form();
  const page = browser({ forms: [f], session, local });
  await f.fire('submit');
  assert.equal(session.size, 1, 'the record exists before it is aged');
  for (const [key, value] of session) {
    const entry = JSON.parse(value); entry.created_at = Date.now() - 31 * 60 * 1000;
    session.set(key, JSON.stringify(entry));
  }
  assert.equal(browser({ path: f.querySelector('[name="redirect"]').value, session, local }).events('generate_lead').length, 0);
  assert.equal(session.size, 0, 'an expired record is deleted when read');
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


const acceptedAnalytics = JSON.stringify({ necessary: true, analytics: true, marketing: false });
function aeoPage({ consent = acceptedAnalytics, fetchImpl, ...options } = {}) {
  const f = form('ai-readiness-form', 'https://niuexa.ai/thank-you-ai-readiness.html');
  f.dataset.formLabel = 'AEO Analyzer';
  const local = new Map();
  if (consent !== null) local.set('niuexa_cookie_consent', consent);
  const page = browser({
    path: '/consulenza-aeo-geo.html?utm_source=google&utm_campaign=aeo_qa#contact',
    forms: [f], local,
    fetchImpl: fetchImpl || (async () => ({ ok: true, json: async () => ({ success: true }) })),
    ...options,
  });
  page.run('ai-readiness-tool.js');
  page.ctx.initAIReadinessForm();
  return { ...page, f, leadCalls: () => page.ctx.dataLayer.filter(x => x[0] === 'event' && x[1] === 'generate_lead') };
}
const settleTasks = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

function contactPage(kind, options = {}) {
  const f = form('contact-form');
  const page = browser({ forms: [f],
    fetchImpl: async () => ({ ok: true, json: async () => ({ success: true }) }),
    ...options,
  });
  if (kind === 'contact-page') {
    page.run('contatti.js');
    page.callbacks.at(-1)();
  } else {
    page.run('script.js');
    page.ctx.initContactForm();
  }
  return { ...page, f };
}

for (const kind of ['contact-form', 'contact-page']) {
  test(`${kind}: received enquiry waits for native Ads and GA4 delivery before redirect`, async () => {
    const page = contactPage(kind, { completeTag: false, completeLayer: false });
    const submitted = page.f.fire('submit');
    await settleTasks();
    assert.equal(page.calls.length, 1);
    assert.equal(page.ctx.location.pathname, '/contatti.html', 'provider success alone must not cut tracking short');
    const nativeEvent = page.events('form_submit')[0];
    const googleEvent = page.ctx.dataLayer.find(item => item[0] === 'event' && item[1] === 'generate_lead')[2];
    assert.equal(nativeEvent.submission_id, googleEvent.submission_id);
    assert.equal(nativeEvent.submission_status, 'success');
    assert.equal(nativeEvent.confirmation_method, 'provider_response');
    googleEvent.event_callback();
    await settleTasks();
    assert.equal(page.ctx.location.pathname, '/contatti.html', 'GA4 completion must not bypass the pending Ads tag');
    nativeEvent.eventCallback('GTM-ANOTHER-CONTAINER');
    await settleTasks();
    assert.equal(page.ctx.location.pathname, '/contatti.html', 'another container cannot finish the NIUEXA Ads wait');
    nativeEvent.eventCallback('GTM-KG9S42S4');
    nativeEvent.eventCallback('GTM-KG9S42S4');
    await submitted;
    assert.equal(page.ctx.location.pathname, '/thank-you-page.html');
    assert.equal(page.events('form_submit').length, 1);
    assert.equal(page.events('generate_lead').length, 1);
    await page.ctx.NiuexaTracking.confirmSubmission(page.f);
    assert.equal(page.events('generate_lead').length, 1, 'repeated success does not resend the lead');
  });

  for (const pending of ['both', 'google', 'tag-manager']) {
    test(`${kind}: a missing ${pending} callback cannot trap a received enquiry`, async () => {
      const page = contactPage(kind, { completeTag: pending === 'tag-manager', completeLayer: pending === 'google' });
      const previousTimers = new Set(page.timers.keys());
      const submitted = page.f.fire('submit');
      await settleTasks();
      assert.equal(page.ctx.location.pathname, '/contatti.html');
      const deadline = [...page.timers].find(([id, timer]) => !previousTimers.has(id) && timer.delay > 0 && timer.delay <= 1500)?.[1];
      assert.ok(deadline, 'delivery must have an independent bounded deadline');
      deadline.fn();
      await submitted;
      assert.equal(page.ctx.location.pathname, '/thank-you-page.html');
    });
  }

  for (const mode of ['old-api', 'throwing-api', 'rejecting-api']) {
    test(`${kind}: ${mode} does not turn provider success into a form error`, async () => {
      const page = contactPage(kind);
      page.ctx.NiuexaTracking.confirmSubmission = mode === 'old-api' ? () => undefined
        : mode === 'throwing-api' ? () => { throw Error('tracking failed'); }
          : () => Promise.reject(Error('tracking failed'));
      await page.f.fire('submit');
      assert.equal(page.calls.length, 1);
      assert.equal(page.ctx.location.pathname, '/thank-you-page.html');
    });
  }
}

test('AEO confirmed enquiry routes once to its GA4 property with original landing metadata', async () => {
  const page = aeoPage();
  await page.f.fire('submit');
  assert.equal(page.leadCalls().length, 1);
  const props = page.leadCalls()[0][2];
  assert.equal(props.send_to, 'G-8JW0S3PJKM');
  assert.equal(props.page_location, 'https://niuexa.ai/consulenza-aeo-geo.html?utm_source=google&utm_campaign=aeo_qa#contact');
  assert.equal(props.form_name, 'AEO Analyzer');
  assert.equal(props.submission_status, 'success');
  assert.equal(props.confirmation_method, 'provider_response');
  assert.match(props.submission_id, /^[a-f0-9-]{36}$/);
  assert.equal(page.events('generate_lead').length, 0, 'no parallel GTM custom event owner');
  assert.equal(page.events('form_submit').length, 0, 'no second success event for this scoped route');
  assert.equal(page.ctx.location.pathname, '/thank-you-ai-readiness.html');
  assert.equal(page.ctx.dataLayer.some(x => x[0] === 'config' || x[0] === 'consent'), false);
  for (const key of ['name', 'firstName', 'lastName', 'email', 'company', 'message', 'privacy']) assert.equal(key in props, false);
  await page.ctx.NiuexaTracking.confirmSubmission(page.f);
  assert.equal(page.leadCalls().length, 1);
});

for (const consent of [null, '{bad', 'null', 'true', '{}', '{"analytics":"true","marketing":false}', '{"analytics":true}', '{"analytics":false,"marketing":true}']) {
  test(`AEO consent ${consent}: successful form is delivered without analytics or later replay`, async () => {
    const page = aeoPage({ consent });
    await page.f.fire('submit');
    assert.equal(page.calls.length, 1);
    assert.equal(page.ctx.location.pathname, '/thank-you-ai-readiness.html');
    assert.equal(page.leadCalls().length, 0);
    assert.equal(page.events('generate_lead').length, 0);
    page.ctx.localStorage.setItem('niuexa_cookie_consent', acceptedAnalytics);
    await page.ctx.NiuexaTracking.confirmSubmission(page.f);
    assert.equal(page.leadCalls().length, 0, 'later consent never replays an earlier denied lead');
  });
}

test('AEO blocked consent storage keeps the successful form usable without a lead event', async () => {
  const page = aeoPage({ blocked: true });
  await page.f.fire('submit');
  assert.equal(page.ctx.location.pathname, '/thank-you-ai-readiness.html');
  assert.equal(page.leadCalls().length, 0);
});

for (const failure of ['http', 'provider-false', 'provider-string', 'json', 'network']) {
  test(`AEO ${failure} failure does not send a lead and permits a retry`, async () => {
    let succeed = false;
    const page = aeoPage({ fetchImpl: async () => {
      if (succeed) return { ok: true, json: async () => ({ success: true }) };
      if (failure === 'network') throw Error('offline');
      return { ok: failure !== 'http', json: async () => {
        if (failure === 'json') throw Error('invalid JSON');
        return { success: failure === 'provider-string' ? 'true' : failure === 'http' };
      } };
    } });
    await page.f.fire('submit');
    assert.equal(page.leadCalls().length, 0);
    assert.equal(page.ctx.location.pathname, '/consulenza-aeo-geo.html');
    assert.equal(page.f.button.disabled, false);
    succeed = true;
    await page.f.fire('submit');
    assert.equal(page.calls.length, 2);
    assert.equal(page.leadCalls().length, 1);
  });
}

test('AEO request lock prevents concurrent provider requests and keeps the original submission token', async () => {
  let finish;
  const page = aeoPage({ fetchImpl: () => new Promise(resolve => { finish = resolve; }) });
  const first = page.f.fire('submit');
  const originalId = page.events('form_submit_attempt')[0].submission_id;
  assert.equal(page.f.button.disabled, true);
  const duplicate = page.f.fire('submit');
  assert.equal(page.calls.length, 1);
  assert.equal(page.events('form_submit_attempt').length, 1);
  finish({ ok: true, json: async () => ({ success: true }) });
  await Promise.all([first, duplicate]);
  assert.equal(page.leadCalls().length, 1);
  assert.equal(page.leadCalls()[0][2].submission_id, originalId);
});

test('AEO waits for the Google event callback before navigating and repeated callbacks are harmless', async () => {
  const page = aeoPage({ completeTag: false });
  const submitted = page.f.fire('submit');
  await settleTasks();
  assert.equal(page.ctx.location.pathname, '/consulenza-aeo-geo.html');
  const props = page.leadCalls()[0][2];
  assert.equal(typeof props.event_callback, 'function');
  assert.ok(props.event_timeout > 0 && props.event_timeout <= 2000);
  props.event_callback(); props.event_callback();
  await submitted;
  assert.equal(page.ctx.location.pathname, '/thank-you-ai-readiness.html');
  assert.equal(page.leadCalls().length, 1);
});

test('AEO navigates after a bounded independent timeout if the Google callback never arrives', async () => {
  const page = aeoPage({ completeTag: false });
  const submitted = page.f.fire('submit');
  await settleTasks();
  assert.equal(page.ctx.location.pathname, '/consulenza-aeo-geo.html');
  const deadline = [...page.timers.values()].find(timer => timer.delay > 0 && timer.delay <= 2000);
  assert.ok(deadline, 'independent navigation deadline exists');
  deadline.fn();
  await submitted;
  assert.equal(page.ctx.location.pathname, '/thank-you-ai-readiness.html');
});

for (const mode of ['absent-gtag', 'throwing-gtag', 'old-api', 'throwing-api', 'absent-api']) {
  test(`AEO ${mode} does not turn provider success into a form error`, async () => {
    const page = aeoPage();
    if (mode === 'absent-gtag') delete page.ctx.gtag;
    if (mode === 'throwing-gtag') page.ctx.gtag = () => { throw Error('blocked'); };
    if (mode === 'old-api') page.ctx.NiuexaTracking.confirmSubmission = () => undefined;
    if (mode === 'throwing-api') page.ctx.NiuexaTracking.confirmSubmission = () => { throw Error('tracking failed'); };
    if (mode === 'absent-api') delete page.ctx.NiuexaTracking;
    await page.f.fire('submit');
    assert.equal(page.ctx.location.pathname, '/thank-you-ai-readiness.html');
    assert.equal(page.f.children.some(el => el.className === 'form-message form-message--error'), false);
  });
}

test('AEO invalid required field produces neither provider request nor success event', async () => {
  const page = aeoPage();
  const missing = element('website', ''); missing.type = 'url';
  const originalQuery = page.f.querySelectorAll;
  page.f.querySelectorAll = selector => selector === '[required]' ? [missing] : originalQuery(selector);
  await page.f.fire('submit');
  assert.equal(page.calls.length, 0);
  assert.equal(page.leadCalls().length, 0);
  assert.equal(page.ctx.location.pathname, '/consulenza-aeo-geo.html');
});

test('native AEO fallback records do not gain landing URLs from the scoped AJAX repair', async () => {
  const f = form();
  f.dataset.formLabel = 'AEO Analyzer';
  const session = new Map();
  const page = browser({ forms: [f], session, local: analyticsConsent(), path: '/consulenza-aeo-geo.html?gclid=private-click' });
  await f.fire('submit');
  const pending = JSON.parse(session.get('niuexa_pending_lead_v1'));
  assert.equal('page_location' in pending, false);
  assert.equal('page_path' in pending, false);
});

for (const marketing of [false, true]) {
  test(`AEO marketing consent ${marketing}: explicit GA4 route preserves the source without leaking denied click IDs`, async () => {
    const page = aeoPage({
      consent: JSON.stringify({ necessary: true, analytics: true, marketing }),
      path: '/consulenza-aeo-geo.html?utm_source=google&gclid=click-a&gbraid=click-b&wbraid=click-c#contact',
    });
    await page.f.fire('submit');
    const location = new URL(page.leadCalls()[0][2].page_location);
    assert.equal(location.pathname, '/consulenza-aeo-geo.html');
    assert.equal(location.searchParams.get('utm_source'), 'google');
    for (const key of ['gclid', 'gbraid', 'wbraid']) assert.equal(location.searchParams.has(key), marketing);
    assert.equal(page.ctx.dataLayer.some(x => x[0] === 'config' || x[0] === 'consent'), false);
  });
}

for (const marketing of [false, true]) {
  test(`marketing consent ${marketing}: attribution storage and click-ID form fields follow the choice`, () => {
    const local = new Map([['niuexa_cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing })]]);
    if (!marketing) local.set('niuexa_attribution_v1', JSON.stringify({ gclid: 'old', updated_at: new Date().toISOString() }));
    const f = form();
    browser({ forms: [f], local, path: '/contatti.html?utm_source=google&gclid=click-a' });
    assert.equal(local.has('niuexa_attribution_v1'), marketing, 'stored only with marketing consent; earlier records deleted');
    assert.equal(f.querySelector('[name="gclid"]')?.value, marketing ? 'click-a' : undefined);
    assert.equal(f.querySelector('[name="utm_source"]').value, 'google', 'UTMs still reach the form for this page');
    assert.equal(new URL(f.querySelector('[name="current_page"]').value).searchParams.has('gclid'), marketing);
  });
}

test('stored attribution older than 90 days is dropped', () => {
  const old = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString();
  const local = new Map([
    ['niuexa_cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: true })],
    ['niuexa_attribution_v1', JSON.stringify({ utm_source: 'stale', updated_at: old })],
  ]);
  const page = browser({ local });
  assert.equal(page.ctx.NiuexaTracking.attribution().utm_source, undefined);
  assert.equal(JSON.parse(local.get('niuexa_attribution_v1')).utm_source, undefined, 'the stale record is replaced, not merged');
});
