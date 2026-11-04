import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const script = readFileSync(new URL('../ai-readiness-tool.js', import.meta.url), 'utf8');

// Run the real form script. Only the DOM boundary is substituted; these tests
// never dispatch a submit event or contact the production form provider.
function element(props = {}) {
  const listeners = [];
  const classes = new Set();
  return {
    value: '', type: 'text', dataset: {}, style: {}, children: [],
    classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) },
    addEventListener(type, callback) { listeners.push({ type, callback }); },
    fire(type, props = {}) {
      const event = { type, target: this, ...props };
      for (const listener of listeners.filter(listener => listener.type === type)) listener.callback.call(this, event);
    },
    hasAttribute(name) { return name === 'required' && this.required; },
    appendChild(child) { this.children.push(child); },
    ...props,
  };
}

function page(value = '') {
  const field = element({ value, type: 'url', required: true, parentElement: element() });
  const button = element({ type: 'submit', innerHTML: 'Send' });
  button.closest = () => button;
  field.closest = () => null;
  const form = element({
    querySelector: selector => selector === '.btn-submit' ? button : null,
    querySelectorAll: selector => selector === '.error' ? [] : [field],
  });
  const document = element({
    querySelector: selector => selector === '.ai-readiness-form' ? form : null,
    createElement: () => element(),
    head: element(),
  });
  const browser = element();
  const context = vm.createContext({ document, URL, console, window: browser });
  vm.runInContext(script, context, { filename: 'ai-readiness-tool.js' });
  document.fire('DOMContentLoaded');
  return { field, button, form, browser, context };
}

test('bare domains become valid HTTPS URLs without losing paths, queries or fragments', () => {
  const p = page();
  for (const [input, expected] of [
    ['azienda.it', 'https://azienda.it'],
    ['www.azienda.it', 'https://www.azienda.it'],
    ['azienda.it:8443/catalogo?q=a%20b&lang=it#scheda', 'https://azienda.it:8443/catalogo?q=a%20b&lang=it#scheda'],
    ['  www.azienda.it/percorso?next=https%3A%2F%2Fexample.com#news  ', 'https://www.azienda.it/percorso?next=https%3A%2F%2Fexample.com#news'],
  ]) {
    p.field.value = input;
    assert.equal(p.context.validateField(p.field), true, input);
    assert.equal(p.field.value, expected);
  }
});

test('existing HTTP and HTTPS URLs retain their scheme, spelling and URL components', () => {
  const p = page();
  for (const input of ['http://www.azienda.it/a?b=1#c', 'https://azienda.it', 'HTTPS://AZIENDA.IT/CaseSensitive?q=A%2FB']) {
    p.field.value = input;
    assert.equal(p.context.validateField(p.field), true, input);
    assert.equal(p.field.value, input);
  }
});

test('empty, malformed and unsupported protocol values remain invalid and are not prefixed', () => {
  const p = page();
  for (const input of ['', 'not a website', 'azienda', 'azienda..it', '-azienda.it', 'person@azienda.it', 'https://azienda..it', 'https://', 'ftp://azienda.it', 'mailto:person@azienda.it', 'javascript:alert(1)', 'http:azienda.it']) {
    p.field.value = input;
    assert.equal(p.context.validateField(p.field), false, input);
    assert.equal(p.field.value, input, input);
  }
});

test('typed domains normalize on blur and browser autofill normalizes on change', () => {
  for (const type of ['blur', 'change']) {
    const p = page();
    p.field.value = 'www.azienda.it';
    p.field.fire(type);
    assert.equal(p.field.value, 'https://www.azienda.it', type);
  }
});

test('pasted and replacement values normalize immediately without changing ordinary typing', () => {
  for (const inputType of ['insertFromPaste', 'insertReplacementText']) {
    const p = page();
    p.field.value = 'azienda.it/percorso?x=1';
    p.field.fire('input', { inputType });
    assert.equal(p.field.value, 'https://azienda.it/percorso?x=1', inputType);
  }
  const p = page();
  p.field.value = 'azienda.it';
  p.field.fire('input', { inputType: 'insertText' });
  assert.equal(p.field.value, 'azienda.it', 'ordinary typing must not move the cursor by rewriting the field');
});

test('submit clicks and Enter normalize before the browser performs native validation', () => {
  const click = page();
  click.field.value = 'www.azienda.it';
  click.form.fire('click', { target: click.button });
  assert.equal(click.field.value, 'https://www.azienda.it');
  const enter = page();
  enter.field.value = 'www.azienda.it';
  enter.form.fire('keydown', { target: enter.field, key: 'Enter', isComposing: false });
  assert.equal(enter.field.value, 'https://www.azienda.it');
});

test('prefilled and restored values normalize without requiring another user edit', () => {
  const p = page('www.azienda.it');
  assert.equal(p.field.value, 'https://www.azienda.it');
  p.field.value = 'azienda.it/restored';
  p.browser.fire('pageshow');
  assert.equal(p.field.value, 'https://azienda.it/restored');
});
