import test from 'node:test';
import assert from 'node:assert/strict';
import { bindGiocaForm } from '../gioca-registration-ui.mjs';

// Only DOM and network are substituted. Production binding, validation and
// transport run together; tests never submit to the real registration service.
function fixture() {
  const elements = new Map();
  const ids = ['gv-form', 'gv-fields', 'gv-submit', 'gv-status', 'gv-botcheck', 'gv-privacy', 'gv-marketing', 'gv-firstName', 'gv-lastName', 'gv-company', 'gv-email', 'gv-mobile', 'gv-privacy-error', 'gv-firstName-error', 'gv-lastName-error', 'gv-company-error', 'gv-email-error', 'gv-mobile-error', 'gv-done', 'gv-code'];
  for (const id of ids) {
    const listeners = new Map();
    elements.set(id, {
      value: '', checked: false, disabled: false, hidden: false, textContent: '', className: '', attrs: {}, focused: false,
      addEventListener(type, fn) { listeners.set(type, fn); },
      setAttribute(name, value) { this.attrs[name] = value; },
      focus() { this.focused = true; },
      reset() { for (const el of elements.values()) { el.value = ''; el.checked = false; } },
      async fire(type) { let prevented = false; await listeners.get(type)?.({ preventDefault() { prevented = true; } }); return prevented; },
    });
  }
  const doc = { getElementById: id => elements.get(id) };
  const get = id => elements.get('gv-' + id);
  const fill = () => {
    get('firstName').value = 'Ada'; get('lastName').value = 'Esempio'; get('company').value = 'Officina Esempio';
    get('email').value = 'ada@example.com'; get('mobile').value = '+39 333 1234567'; get('privacy').checked = true;
  };
  return { doc, get, fill, pushed: [] };
}
const now = () => new Date('2026-10-28T11:00:00+01:00');

test('validation focuses the first error and does not contact the provider', async () => {
  const f = fixture(); let calls = 0;
  bindGiocaForm(f.doc, { now, fetchImpl: async () => { calls++; throw Error('unreachable'); } });
  assert.equal(await f.get('form').fire('submit'), true);
  assert.equal(calls, 0);
  assert.equal(f.get('firstName').attrs['aria-invalid'], 'true');
  assert.equal(f.get('firstName').focused, true);
  assert.equal(f.get('mobile').attrs['aria-invalid'], 'true');
  assert.equal(f.get('privacy').attrs['aria-invalid'], 'true');
  assert.equal(f.get('submit').disabled, false);
});

test('an accepted registration shows the code for the hostess, clears personal data and reports one anonymous event', async () => {
  const f = fixture(); let calls = 0;
  const dataLayer = [];
  bindGiocaForm(f.doc, { now, dataLayer, random: () => 0.5, fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ success: true }) }; } });
  f.fill(); await f.get('form').fire('submit');
  assert.equal(calls, 1);
  assert.match(f.get('code').textContent, /^AT-[A-Z2-9]{4}$/);
  assert.equal(f.get('done').hidden, false);
  assert.equal(f.get('fields').hidden, true);
  assert.match(f.get('status').textContent, /hostess/);
  assert.equal(f.get('email').value, '');
  assert.equal(f.get('mobile').value, '');
  assert.equal(f.get('submit').disabled, true);
  assert.deepEqual(dataLayer, [{ event: 'gioca_registration', form_name: 'Gioca e vinci A&T Vicenza 2026', campaign: 'aet_vicenza_2026' }]);
  await f.get('form').fire('submit');
  assert.equal(calls, 1);
});

test('service failure keeps entered details and allows a deliberate retry with an uncertain-delivery message', async () => {
  const f = fixture(); let calls = 0;
  bindGiocaForm(f.doc, { now, fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ success: false }) }; } });
  f.fill(); await f.get('form').fire('submit');
  assert.equal(calls, 1);
  assert.equal(f.get('email').value, 'ada@example.com');
  assert.match(f.get('status').textContent, /Non possiamo verificare/);
  assert.equal(f.get('done').hidden, true);
  assert.equal(f.get('submit').disabled, false);
  assert.equal(f.get('form').attrs['aria-busy'], 'false');
});

test('once the fair has closed the form stays closed, including a tab left open across closing time', async () => {
  const f = fixture(); let current = new Date('2026-10-29T17:59:00+01:00'), calls = 0;
  bindGiocaForm(f.doc, { now: () => current, fetchImpl: async () => { calls++; throw Error('unreachable'); } });
  f.fill(); current = new Date('2026-10-29T18:00:00+01:00');
  await f.get('form').fire('submit');
  assert.equal(calls, 0); assert.equal(f.get('submit').disabled, true);
  assert.match(f.get('status').textContent, /concluso/);
});
