import test from 'node:test';
import assert from 'node:assert/strict';
import { bindCodeWeekForm } from '../code-week-registration-ui.mjs';

// Only DOM and network are substituted. Production binding, validation and
// transport run together; tests never submit to the real registration service.
function fixture() {
  const elements = new Map();
  for (const id of ['cw-form', 'cw-fields', 'cw-submit', 'cw-status', 'cw-botcheck', 'cw-privacy', 'cw-firstName', 'cw-lastName', 'cw-email', 'cw-company', 'cw-privacy-error', 'cw-firstName-error', 'cw-lastName-error', 'cw-email-error', 'cw-company-error']) {
    const listeners = new Map();
    elements.set(id, {
      value: '', checked: false, disabled: false, textContent: '', className: '', attrs: {}, focused: false,
      addEventListener(type, fn) { listeners.set(type, fn); },
      setAttribute(name, value) { this.attrs[name] = value; },
      focus() { this.focused = true; },
      reset() { for (const el of elements.values()) { el.value = ''; el.checked = false; } },
      async fire(type) { let prevented = false; await listeners.get(type)?.({ preventDefault() { prevented = true; } }); return prevented; },
    });
  }
  const doc = { getElementById: id => elements.get(id) };
  const get = id => elements.get('cw-' + id);
  function fill() {
    get('firstName').value = 'Ada'; get('lastName').value = 'Esempio'; get('email').value = 'ada@example.com'; get('privacy').checked = true;
  }
  return { doc, get, fill };
}
const now = () => new Date('2026-10-20T10:00:00+02:00');

test('validation focuses the first error and does not contact the provider', async () => {
  const f = fixture(); let calls = 0;
  bindCodeWeekForm(f.doc, { now, fetchImpl: async () => { calls++; throw Error('unreachable'); } });
  assert.equal(await f.get('form').fire('submit'), true);
  assert.equal(calls, 0);
  assert.equal(f.get('firstName').attrs['aria-invalid'], 'true');
  assert.equal(f.get('firstName').focused, true);
  assert.equal(f.get('privacy').attrs['aria-invalid'], 'true');
  assert.equal(f.get('submit').disabled, false);
});

test('an accepted request clears personal data and leaves participation confirmation to the team', async () => {
  const f = fixture(); let calls = 0;
  bindCodeWeekForm(f.doc, { now, fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ success: true }) }; } });
  f.fill(); await f.get('form').fire('submit');
  assert.equal(calls, 1);
  assert.match(f.get('status').textContent, /Richiesta inviata/);
  assert.match(f.get('status').textContent, /team Niuexa confermerà la partecipazione/);
  assert.match(f.get('status').textContent, /condividerà il link/);
  assert.equal(f.get('email').value, '');
  assert.equal(f.get('submit').disabled, true);
  await f.get('form').fire('submit');
  assert.equal(calls, 1);
});

test('service failure keeps entered details and allows deliberate retry with an uncertain-delivery message', async () => {
  const f = fixture(); let calls = 0;
  bindCodeWeekForm(f.doc, { now, fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ success: false }) }; } });
  f.fill(); await f.get('form').fire('submit');
  assert.equal(calls, 1);
  assert.equal(f.get('email').value, 'ada@example.com');
  assert.match(f.get('status').textContent, /Non possiamo verificare/);
  assert.equal(f.get('submit').disabled, false);
  assert.equal(f.get('form').attrs['aria-busy'], 'false');
});

test('an event that has started closes the form, including a tab left open across the start time', async () => {
  const f = fixture(); let current = new Date('2026-10-22T16:59:00+02:00'), calls = 0;
  bindCodeWeekForm(f.doc, { now: () => current, fetchImpl: async () => { calls++; throw Error('unreachable'); } });
  f.fill(); current = new Date('2026-10-22T17:00:00+02:00');
  await f.get('form').fire('submit');
  assert.equal(calls, 0); assert.equal(f.get('submit').disabled, true);
  assert.match(f.get('status').textContent, /chiuse/);
});
