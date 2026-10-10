import test from 'node:test';
import assert from 'node:assert/strict';
import { createCodeWeekRegistration, validateRegistration } from '../code-week-registration.mjs';

const valid = { firstName: ' Ada ', lastName: ' Esempio ', email: ' ada@example.com ', company: '', privacy: true, botcheck: '' };
const before = () => new Date('2026-10-20T10:00:00+02:00');
const received = () => ({ ok: true, json: async () => ({ success: true, message: 'Email sent successfully!' }) });

test('only minimal required details pass, while malformed inputs and missing privacy acknowledgement fail', () => {
  assert.deepEqual(validateRegistration(valid), {
    data: { firstName: 'Ada', lastName: 'Esempio', email: 'ada@example.com', company: '' }, errors: {},
  });
  for (const key of ['firstName', 'lastName', 'email']) assert.ok(validateRegistration({ ...valid, [key]: '' }).errors[key]);
  for (const email of ['wrong', 'a@b', 'a b@example.com', 'a@b.com\nBcc:other@example.com']) {
    assert.ok(validateRegistration({ ...valid, email }).errors.email);
  }
  assert.ok(validateRegistration({ ...valid, privacy: false }).errors.privacy);
  assert.ok(validateRegistration({ ...valid, firstName: 'x'.repeat(81) }).errors.firstName);
  assert.ok(validateRegistration({ ...valid, company: 'x'.repeat(161) }).errors.company);
});

test('valid submission sends the confirmed event with whitelisted fields to the existing provider and returns a receipt only', async () => {
  let payload;
  const flow = createCodeWeekRegistration({ now: before, fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.web3forms.com/submit');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    payload = JSON.parse(options.body);
    return received();
  }});
  assert.deepEqual(await flow.submit({ ...valid, arbitraryRecipient: 'bad@example.com', mobile: 'private' }), { status: 'received' });
  assert.equal(payload.firstName, 'Ada');
  assert.equal(payload.email, 'ada@example.com');
  assert.equal(payload.replyto, 'ada@example.com');
  assert.equal(payload.event_id, 'niuexa-code-week-2026-10-22');
  assert.equal(payload.event_start, '2026-10-22T17:00:00+02:00');
  assert.equal(payload.event_end, '2026-10-22T18:00:00+02:00');
  assert.equal(payload.event_timezone, 'Europe/Rome');
  assert.equal(payload.source, 'https://niuexa.ai/code-week-ai-2026.html');
  assert.equal(payload.subject, 'Laboratorio AI NIUEXA | 22 ottobre 2026');
  assert.equal(payload.privacy_acknowledged, true);
  assert.ok(payload.access_key);
  assert.equal('arbitraryRecipient' in payload, false);
  assert.equal('mobile' in payload, false);
  assert.equal('redirect' in payload, false);
  assert.equal('autoresponse' in payload, false);
});

test('invalid details, a filled honeypot and a started event never contact the service', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return received(); };
  const flow = createCodeWeekRegistration({ fetchImpl, now: before });
  await assert.rejects(flow.submit({}), /VALIDATION/);
  await assert.rejects(flow.submit({ ...valid, botcheck: 'spam' }), /SPAM/);
  const closed = createCodeWeekRegistration({ fetchImpl, now: () => new Date('2026-10-22T17:00:00+02:00') });
  await assert.rejects(closed.submit(valid), /CLOSED/);
  assert.equal(calls, 0);
});

test('provider rejection, malformed JSON and network failure never produce a receipt and release the retry lock', async () => {
  const scenarios = [
    () => ({ ok: false, json: async () => ({ success: true }) }),
    () => ({ ok: true, json: async () => ({ success: false, message: 'Invalid request' }) }),
    () => ({ ok: true, json: async () => ({ success: 'true' }) }),
    () => ({ ok: true, json: async () => ({}) }),
    () => ({ ok: true, json: async () => { throw Error('JSON'); } }),
    () => { throw Error('NETWORK'); },
  ];
  for (const response of scenarios) {
    let calls = 0;
    const flow = createCodeWeekRegistration({ now: before, fetchImpl: async () => ++calls === 1 ? response() : received() });
    await assert.rejects(flow.submit(valid));
    assert.equal(calls, 1, 'no automatic retry');
    assert.deepEqual(await flow.submit(valid), { status: 'received' });
  }
});

test('double clicks and repeated accepted submissions cannot create another request', async () => {
  let calls = 0, release;
  const flow = createCodeWeekRegistration({ now: before, fetchImpl: () => {
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

test('timeout aborts without a receipt or automatic retry', async () => {
  let calls = 0;
  const flow = createCodeWeekRegistration({ now: before, timeoutMs: 5, fetchImpl: async (url, { signal }) => {
    calls++;
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('TIMEOUT'))));
  }});
  await assert.rejects(flow.submit(valid), /TIMEOUT/);
  assert.equal(calls, 1);
});
