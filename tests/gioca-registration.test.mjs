import test from 'node:test';
import assert from 'node:assert/strict';
import { GIOCA_EVENT, createGiocaRegistration, isGiocaOpen, makeCode, validateGioca } from '../gioca-registration.mjs';

const valid = { firstName: ' Ada ', lastName: ' Esempio ', company: ' Officina Esempio ', email: ' ada@example.com ', mobile: ' +39 333 1234567 ', privacy: true, marketing: false, botcheck: '' };
const duringFair = () => new Date('2026-10-28T11:00:00+01:00');
const received = () => ({ ok: true, json: async () => ({ success: true, message: 'Email sent successfully!' }) });

test('every field Roberto asked for is required, trimmed and bounded; marketing consent is optional', () => {
  assert.deepEqual(validateGioca(valid), {
    data: { firstName: 'Ada', lastName: 'Esempio', company: 'Officina Esempio', email: 'ada@example.com', mobile: '+39 333 1234567', marketing: false }, errors: {},
  });
  for (const key of ['firstName', 'lastName', 'company', 'email', 'mobile']) assert.ok(validateGioca({ ...valid, [key]: '' }).errors[key], key);
  for (const email of ['wrong', 'a@b', 'a b@example.com', 'a@b.com\nBcc:other@example.com']) assert.ok(validateGioca({ ...valid, email }).errors.email);
  for (const mobile of ['abc', '12', '+39 333 12 34 56 78 90 12', '333-1234567x']) assert.ok(validateGioca({ ...valid, mobile }).errors.mobile, mobile);
  assert.ok(validateGioca({ ...valid, privacy: false }).errors.privacy);
  assert.equal(validateGioca({ ...valid, marketing: true }).data.marketing, true);
  assert.equal(validateGioca({ ...valid, marketing: 'yes' }).data.marketing, false, 'only a real boolean counts as consent');
  assert.ok(validateGioca({ ...valid, company: 'x'.repeat(161) }).errors.company);
});

test('the game is open until the fair closes on 29 October and never before the page exists', () => {
  assert.equal(GIOCA_EVENT.closes, '2026-10-29T18:00:00+01:00');
  assert.equal(isGiocaOpen(new Date('2026-10-12T10:00:00+02:00')), true, 'printing and testing the QR before the fair');
  assert.equal(isGiocaOpen(new Date('2026-10-29T17:59:00+01:00')), true);
  assert.equal(isGiocaOpen(new Date('2026-10-29T18:00:00+01:00')), false);
  assert.equal(isGiocaOpen(new Date('invalid')), false);
});

test('codes are short, unambiguous for a hostess reading a phone screen, and use the supplied randomness', () => {
  const code = makeCode(() => 0);
  assert.equal(code, 'AT-AAAA');
  assert.equal(makeCode(() => 0.999999), 'AT-9999');
  for (let i = 0; i < 200; i++) assert.match(makeCode(), /^AT-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
});

test('a valid registration sends the whitelisted fields, the code and the consent flags to the existing provider', async () => {
  let payload;
  const flow = createGiocaRegistration({ now: duringFair, random: () => 0.5, fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.web3forms.com/submit');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    payload = JSON.parse(options.body);
    return received();
  }});
  const receipt = await flow.submit({ ...valid, marketing: true, arbitraryRecipient: 'bad@example.com' });
  assert.deepEqual(receipt, { status: 'received', code: payload.code });
  assert.match(payload.code, /^AT-[A-Z2-9]{4}$/);
  assert.equal(payload.subject, `Gioca e vinci A&T Vicenza | ${payload.code} | Esempio Ada`);
  assert.equal(payload.from_name, 'NIUEXA Gioca e vinci');
  assert.equal(payload.replyto, 'ada@example.com');
  assert.equal(payload.mobile, '+39 333 1234567');
  assert.equal(payload.company, 'Officina Esempio');
  assert.equal(payload.marketing_consent, true);
  assert.equal(payload.privacy_acknowledged, true);
  assert.equal(payload.event_id, 'aet-vicenza-2026-gioca-e-vinci');
  assert.equal(payload.stand, 'A&T Next 23');
  assert.equal(payload.source, 'https://niuexa.ai/gioca.html');
  assert.ok(payload.access_key);
  assert.equal('arbitraryRecipient' in payload, false);
  assert.equal('redirect' in payload, false);
  assert.equal('autoresponse' in payload, false);
});

test('invalid details, a filled honeypot and a closed game never contact the service', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return received(); };
  const flow = createGiocaRegistration({ fetchImpl, now: duringFair });
  await assert.rejects(flow.submit({}), /VALIDATION/);
  await assert.rejects(flow.submit({ ...valid, botcheck: 'spam' }), /SPAM/);
  const closed = createGiocaRegistration({ fetchImpl, now: () => new Date('2026-10-29T18:00:00+01:00') });
  await assert.rejects(closed.submit(valid), /CLOSED/);
  assert.equal(calls, 0);
});

test('provider rejection, malformed JSON and network failure give no code and release the lock without retrying', async () => {
  const scenarios = [
    () => ({ ok: false, json: async () => ({ success: true }) }),
    () => ({ ok: true, json: async () => ({ success: false, message: 'Invalid request' }) }),
    () => ({ ok: true, json: async () => ({ success: 'true' }) }),
    () => ({ ok: true, json: async () => { throw Error('JSON'); } }),
    () => { throw Error('NETWORK'); },
  ];
  for (const response of scenarios) {
    let calls = 0;
    const flow = createGiocaRegistration({ now: duringFair, fetchImpl: async () => ++calls === 1 ? response() : received() });
    await assert.rejects(flow.submit(valid));
    assert.equal(calls, 1, 'no automatic retry');
    assert.equal((await flow.submit(valid)).status, 'received');
  }
});

test('double taps and a second registration from the same phone cannot create another request', async () => {
  let calls = 0, release;
  const flow = createGiocaRegistration({ now: duringFair, fetchImpl: () => {
    calls++;
    return new Promise(resolve => { release = () => resolve(received()); });
  }});
  const pending = flow.submit(valid);
  await assert.rejects(flow.submit(valid), /BUSY/);
  release();
  await pending;
  await assert.rejects(flow.submit(valid), /DUPLICATE/);
  assert.equal(calls, 1);
});

test('timeout aborts without a code or automatic retry', async () => {
  let calls = 0;
  const flow = createGiocaRegistration({ now: duringFair, timeoutMs: 5, fetchImpl: async (url, { signal }) => {
    calls++;
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('TIMEOUT'))));
  }});
  await assert.rejects(flow.submit(valid), /TIMEOUT/);
  assert.equal(calls, 1);
});
