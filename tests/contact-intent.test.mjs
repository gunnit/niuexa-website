import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const trainingNames = ['course', 'participants', 'delivery_format'];

function contactMarkup(file) {
  return JSON.parse(execFileSync('python3', ['-c', `
import json,sys
from html.parser import HTMLParser
from pathlib import Path
class Contact(HTMLParser):
 def __init__(self):
  super().__init__(); self.active=False; self.depth=0; self.fields=[]; self.training=[]; self.attrs={}; self.copy={}; self.capture=None; self.select=None
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  for marker,key in [('data-contact-title','title'),('data-contact-subtitle','subtitle')]:
   if marker in attrs: self.capture=(tag,key); self.copy[key]=''
  if tag=='form':
   self.active='contact-form' in attrs.get('class','').split()
   if self.active: self.attrs=attrs
  if not self.active: return
  if tag=='label' and attrs.get('for')=='message': self.capture=(tag,'label'); self.copy['label']=''
  if tag=='div':
   if self.depth: self.depth+=1
   elif 'data-training-fields' in attrs: self.depth=1; self.training_attrs=attrs
  if tag in ['input','select','textarea'] and 'name' in attrs:
   field={'attrs':attrs,'options':[]}; self.fields.append(field)
   if self.depth: self.training.append(attrs['name'])
   if tag=='select': self.select=field
  if tag=='option' and self.select is not None: self.select['options'].append(attrs.get('value',''))
 def handle_data(self,data):
  if self.capture: self.copy[self.capture[1]]+=data
 def handle_endtag(self,tag):
  if self.capture and self.capture[0]==tag: self.capture=None
  if tag=='select': self.select=None
  if tag=='div' and self.depth: self.depth-=1
  if tag=='form': self.active=False
p=Contact(); p.feed(Path(sys.argv[1]).read_text()); print(json.dumps({'attrs':p.attrs,'fields':p.fields,'training':p.training,'training_attrs':getattr(p,'training_attrs',{}),'copy':p.copy}))
`, fileURLToPath(new URL('../' + file, import.meta.url))], { encoding: 'utf8' }));
}

// Only DOM boundaries and the network are substituted. The complete script.js,
// its DOMContentLoaded wiring, validation and submission handler run unchanged.
function element(props = {}) {
  const listeners = [];
  return {
    value: '', defaultValue: '', disabled: false, dataset: {}, children: [],
    textContent: '', placeholder: '', classList: { add() {}, remove() {} },
    addEventListener(type, fn, options) { listeners.push({ type, fn, capture: options === true }); },
    fire(type) {
      const event = { type, preventDefault() { this.defaultPrevented = true; } };
      return Promise.all(listeners.filter(l => l.type === type).sort((a, b) => b.capture - a.capture).map(l => l.fn.call(this, event)));
    },
    setAttribute(key, value) { this[key] = value; },
    getAttribute(key) { return this[key] ?? null; },
    removeAttribute(key) { delete this[key]; },
    appendChild(child) { this.children.push(child); child.parentNode = this; },
    insertBefore(child) { this.appendChild(child); },
    querySelector() { return null; }, querySelectorAll() { return []; },
    remove() {}, focus() {}, ...props
  };
}

function page({ lang = 'it', query = '', restored = {}, marked = true, markup } = {}) {
  const defaults = markup ? Object.fromEntries(markup.fields.map(field => [field.attrs.name, field.attrs.value || ''])) : { access_key: 'offline-fixture', firstName: '', lastName: '', company: '', service: '', email: '', message: '', course: '', participants: '', delivery_format: '' };
  defaults.access_key = 'offline-fixture';
  const fields = Object.fromEntries(Object.entries(defaults).map(([name, value]) => [name, element({ name, value, defaultValue: value, disabled: markup ? 'disabled' in markup.fields.find(field => field.attrs.name === name).attrs : trainingNames.includes(name) })]));
  for (const [name, value] of Object.entries(restored)) fields[name].value = value;
  fields.message.placeholder = markup ? markup.fields.find(field => field.attrs.name === 'message').attrs.placeholder : lang === 'it' ? 'Il processo attuale' : 'Your current process';
  const originals = { ...(markup ? markup.copy : { title: lang === 'it' ? 'Ci mostri un processo' : 'Show us a process', subtitle: lang === 'it' ? 'Il testo originale' : 'Original description', label: lang === 'it' ? 'Quale processo?' : 'Which process?' }), placeholder: fields.message.placeholder };
  const title = element({ textContent: originals.title });
  const subtitle = element({ textContent: originals.subtitle });
  const label = element({ textContent: originals.label });
  const training = element({ hidden: markup ? 'hidden' in markup.training_attrs : true, querySelectorAll: () => (markup ? markup.training : trainingNames).map(name => fields[name]) });
  const section = element({ querySelector: selector => ({ '[data-contact-title]': title, '[data-contact-subtitle]': subtitle }[selector] || null) });
  const button = element({ innerHTML: 'Send <svg></svg>' });
  const form = element({ action: 'https://api.web3forms.com/submit', dataset: marked ? { contactIntent: '' } : {}, closest: () => section });
  form.querySelector = selector => {
    if (selector === '[data-training-fields]') return training;
    if (selector === 'label[for="message"]') return label;
    if (selector === 'button[type="submit"]') return button;
    const name = /\[name="([^"]+)"\]/.exec(selector)?.[1];
    return name ? fields[name] || null : null;
  };
  form.querySelectorAll = () => Object.values(fields);
  Object.values(fields).forEach(field => { field.parentNode = element(); });
  const domCallbacks = [];
  const delayed = [];
  const document = {
    documentElement: { lang }, body: element(),
    addEventListener(type, fn) { if (type === 'DOMContentLoaded') domCallbacks.push(fn); },
    querySelector(selector) {
      if (selector === '.contact-form') return form;
      if (selector === '.contact-form[data-contact-intent]') return marked && (!markup || 'data-contact-intent' in markup.attrs) ? form : null;
      return null;
    },
    querySelectorAll() { return []; }, getElementById() { return null; }, createElement: () => element()
  };
  const calls = [];
  const windowEvents = element();
  const context = vm.createContext({
    document, URLSearchParams, Promise, console,
    location: { search: query, pathname: lang === 'en' ? '/en/' : '/', href: 'https://niuexa.ai/' },
    addEventListener: windowEvents.addEventListener,
    matchMedia: () => ({ matches: false }),
    IntersectionObserver: class { observe() {} }, MutationObserver: class { observe() {} },
    setTimeout(fn, delay) { if (delay === 0) delayed.push(fn); }, clearTimeout() {},
    FormData: class extends FormData {
      constructor() { super(); for (const field of Object.values(fields)) if (!field.disabled) this.append(field.name, field.value); }
    },
    fetch: async (url, options) => { calls.push({ url, options }); return { ok: false, status: 503, json: async () => ({ success: false, message: 'Offline fixture' }) }; }
  });
  context.window = context;
  // Expected provider failure keeps the real handler on-page for payload assertions.
  context.console = { ...console, error() {} };
  vm.runInContext(script, context, { filename: 'script.js' });
  domCallbacks.forEach(fn => fn());
  return {
    fields, form, title, subtitle, label, training, originals, calls, context,
    initialize() { domCallbacks.forEach(fn => fn()); },
    pageshow() { return windowEvents.fire('pageshow'); },
    async service(value) { fields.service.value = value; await fields.service.fire('change'); },
    async reset() { const event = form.fire('reset'); Object.values(fields).forEach(field => { field.value = field.defaultValue; }); await event; delayed.splice(0).forEach(fn => fn()); },
    async submit() {
      Object.entries({ firstName: 'Offline', lastName: 'Test', company: 'Fixture Ltd', email: 'fixture@example.test', message: 'A training request from an offline test.' }).forEach(([name, value]) => { fields[name].value ||= value; });
      await form.fire('submit');
      return calls.at(-1)?.options.body;
    }
  };
}

for (const lang of ['it', 'en']) {
  test(`${lang}: an allowed course opens training without replacing contact data`, () => {
    const p = page({ lang, query: '?course=prompt-engineering', restored: { firstName: 'Existing', message: 'Keep my specific goals' } });
    assert.equal(p.fields.service.value, 'formazione');
    assert.equal(p.fields.course.value, 'prompt-engineering');
    assert.equal(p.training.hidden, false);
    for (const name of trainingNames) assert.equal(p.fields[name].disabled, false);
    assert.notEqual(p.title.textContent, p.originals.title);
    assert.notEqual(p.subtitle.textContent, p.originals.subtitle);
    assert.match(p.label.textContent, lang === 'it' ? /formazione/i : /training/i);
    assert.notEqual(p.fields.message.placeholder, p.originals.placeholder);
    assert.equal(p.fields.firstName.value, 'Existing');
    assert.equal(p.fields.message.value, 'Keep my specific goals');
  });
}

test('all supported courses and a service-only enquiry select training', () => {
  for (const course of ['executive-mastery', 'prompt-engineering', 'ai-agent-developer']) {
    const p = page({ query: '?service=formazione&course=' + course });
    assert.equal(p.fields.service.value, 'formazione');
    assert.equal(p.fields.course.value, course);
  }
  for (const query of ['?service=formazione', '?service=formazione&course=unknown']) {
    const p = page({ query });
    assert.equal(p.fields.service.value, 'formazione');
    assert.equal(p.fields.course.value, '');
  }
});

test('invalid, duplicate and conflicting query parameters do not prefill or inject copy', () => {
  for (const query of ['?course=unknown', '?service=consulenza&course=prompt-engineering', '?service=&course=prompt-engineering', '?service=<img onerror=alert(1)>&course=prompt-engineering', '?course=%3Csvg%20onload%3Dalert(1)%3E', '?service=formazione&service=consulenza', '?course=prompt-engineering&course=unknown']) {
    const p = page({ query });
    assert.equal(p.fields.service.value, '', query);
    assert.equal(p.fields.course.value, '', query);
    assert.equal(p.title.textContent, p.originals.title, query);
    assert.equal(p.training.hidden, true, query);
  }
});

test('a generic visit can switch to training and back, retaining values but excluding stale fields from the real payload', async () => {
  const p = page();
  assert.equal(p.training.hidden, true);
  assert.equal(p.title.textContent, p.originals.title);
  await p.service('formazione');
  assert.equal(p.training.hidden, false);
  p.fields.course.value = 'ai-agent-developer';
  p.fields.participants.value = '12';
  p.fields.delivery_format.value = 'hybrid';
  let payload = await p.submit();
  for (const [name, value] of Object.entries({ course: 'ai-agent-developer', participants: '12', delivery_format: 'hybrid' })) assert.deepEqual(payload.getAll(name), [value]);
  assert.equal(p.calls[0].url, 'https://api.web3forms.com/submit');
  assert.equal(p.calls[0].options.method, 'POST');
  assert.equal(payload.get('message'), 'A training request from an offline test.');
  await p.service('consulenza');
  assert.equal(p.training.hidden, true);
  for (const name of trainingNames) assert.equal(p.fields[name].disabled, true);
  assert.equal(p.title.textContent, p.originals.title);
  assert.equal(p.subtitle.textContent, p.originals.subtitle);
  assert.equal(p.label.textContent, p.originals.label);
  assert.equal(p.fields.message.placeholder, p.originals.placeholder);
  payload = await p.submit();
  for (const name of trainingNames) assert.equal(payload.has(name), false);
  await p.service('formazione');
  assert.equal(p.fields.course.value, 'ai-agent-developer');
  assert.equal(p.fields.participants.value, '12');
  assert.equal(p.fields.delivery_format.value, 'hybrid');
});

test('restored service and course selections survive query initialization and repeated initialization', async () => {
  const p = page({ query: '?service=formazione&course=prompt-engineering', restored: { service: 'consulenza', course: 'executive-mastery' } });
  assert.equal(p.fields.service.value, 'consulenza');
  assert.equal(p.fields.course.value, 'executive-mastery');
  assert.equal(p.training.hidden, true);
  await p.service('formazione');
  assert.equal(p.training.hidden, false);
  p.initialize();
  await p.service('consulenza');
  assert.equal(p.title.textContent, p.originals.title, 'initialization must not recapture training copy as the default');
  const training = page({ query: '?course=ai-agent-developer', restored: { service: 'formazione' } });
  assert.equal(training.fields.course.value, 'ai-agent-developer');
  const existing = page({ query: '?course=ai-agent-developer', restored: { service: 'formazione', course: 'executive-mastery' } });
  assert.equal(existing.fields.course.value, 'executive-mastery');
});

test('native reset restores generic copy and disabled fields without reapplying query prefill', async () => {
  const p = page({ query: '?service=formazione&course=executive-mastery' });
  assert.equal(p.training.hidden, false);
  p.fields.participants.value = '25';
  await p.reset();
  assert.equal(p.fields.service.value, '');
  assert.equal(p.fields.course.value, '');
  assert.equal(p.training.hidden, true);
  for (const name of trainingNames) assert.equal(p.fields[name].disabled, true);
  assert.equal(p.title.textContent, p.originals.title);
  assert.equal(p.fields.message.placeholder, p.originals.placeholder);
  await p.service('consulenza');
  const payload = await p.submit();
  for (const name of trainingNames) assert.equal(payload.has(name), false);
});

test('pageshow resynchronizes restored values without reapplying the link intent', async () => {
  const p = page({ query: '?course=executive-mastery' });
  p.fields.service.value = 'consulenza';
  p.fields.course.value = 'prompt-engineering';
  await p.pageshow();
  assert.equal(p.training.hidden, true);
  assert.equal(p.fields.course.value, 'prompt-engineering');
  assert.equal(p.title.textContent, p.originals.title);
  p.fields.service.value = 'formazione';
  await p.pageshow();
  assert.equal(p.training.hidden, false);
  assert.equal(p.fields.course.value, 'prompt-engineering');
});

test('submission resynchronizes disabled controls even when service changed without a change event', async () => {
  const p = page({ query: '?course=executive-mastery' });
  p.fields.service.value = 'consulenza';
  let payload = await p.submit();
  for (const name of trainingNames) assert.equal(payload.has(name), false);
  p.fields.service.value = 'formazione';
  payload = await p.submit();
  assert.deepEqual(payload.getAll('course'), ['executive-mastery']);
});

test('unmarked contact forms ignore training query parameters', () => {
  const p = page({ marked: false, query: '?service=formazione&course=executive-mastery' });
  assert.equal(p.fields.service.value, '');
  assert.equal(p.fields.course.value, '');
  assert.equal(p.title.textContent, p.originals.title);
});

test('message validation describes the request in either language', () => {
  for (const lang of ['it', 'en']) {
    const p = page({ lang });
    assert.equal(p.context.validateForm({ firstName: 'Test', lastName: 'Person', company: 'Example', service: 'formazione', email: 'test@example.test', message: '' }), false);
    const message = p.form.children.at(-1).textContent;
    assert.match(message, lang === 'it' ? /richiesta/i : /request/i);
    assert.doesNotMatch(message, /process/i);
  }
});

for (const [file, lang] of [['index.html', 'it'], ['en/index.html', 'en']]) {
  test(`${file}: real markup supplies each optional training field once and the runtime submits it only for training`, async () => {
    const markup = contactMarkup(file);
    assert.deepEqual(markup.training, trainingNames);
    for (const name of trainingNames) {
      const fields = markup.fields.filter(field => field.attrs.name === name);
      assert.equal(fields.length, 1);
      assert.ok('disabled' in fields[0].attrs);
      assert.equal('required' in fields[0].attrs, false);
    }
    const byName = name => markup.fields.find(field => field.attrs.name === name);
    assert.deepEqual(byName('course').options, ['', 'executive-mastery', 'prompt-engineering', 'ai-agent-developer']);
    assert.deepEqual(byName('delivery_format').options, ['', 'online', 'in-person', 'hybrid', 'to-discuss']);
    assert.equal(byName('participants').attrs.type, 'number');
    assert.equal(byName('participants').attrs.min, '1');
    assert.equal(byName('participants').attrs.step, '1');
    const p = page({ markup, lang, query: '?course=executive-mastery' });
    assert.equal(p.training.hidden, false);
    assert.notEqual(p.title.textContent, p.originals.title);
    assert.notEqual(p.subtitle.textContent, p.originals.subtitle);
    assert.notEqual(p.label.textContent, p.originals.label);
    let payload = await p.submit();
    assert.deepEqual(payload.getAll('course'), ['executive-mastery']);
    assert.deepEqual(payload.getAll('participants'), ['']);
    assert.deepEqual(payload.getAll('delivery_format'), ['']);
    await p.service('consulenza');
    payload = await p.submit();
    for (const name of trainingNames) assert.equal(payload.has(name), false);
  });
}
