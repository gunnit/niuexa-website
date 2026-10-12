import { REGISTRATION } from './event-registration-config.mjs';

// Stand game at A&T Vicenza 2026. Stand number and opening hours come from the
// organiser's email of 7 October 2026 (Laura Diana, A&T); the prizes from Roberto's
// email of 7 October 2026. Registration stays open from the day the QR is printed
// until the fair closes, so the code can be tested before Vicenza.
export const GIOCA_EVENT = Object.freeze({
  id: 'aet-vicenza-2026-gioca-e-vinci',
  name: 'Gioca e vinci con Niuexa',
  fair: 'A&T Vicenza 2026',
  stand: 'A&T Next 23',
  start: '2026-10-27T09:00:00+02:00',
  closes: '2026-10-29T18:00:00+01:00',
  timezone: 'Europe/Rome',
  url: 'https://niuexa.ai/gioca.html',
});

export const FIELDS = Object.freeze({ firstName: 80, lastName: 80, company: 160, email: 254, mobile: 30 });

export function validateGioca(input = {}) {
  const data = {}, errors = {};
  for (const [field, max] of Object.entries(FIELDS)) {
    data[field] = typeof input[field] === 'string' ? input[field].trim() : '';
    if (!data[field]) errors[field] = 'Compila questo campo.';
    else if (data[field].length > max) errors[field] = `Usa al massimo ${max} caratteri.`;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Inserisci un indirizzo email valido.';
  const digits = data.mobile.replace(/\D/g, '');
  if (data.mobile && (!/^\+?[\d\s().-]+$/.test(data.mobile) || digits.length < 7 || digits.length > 15)) errors.mobile = 'Inserisci un numero di cellulare valido.';
  if (input.privacy !== true) errors.privacy = 'Conferma di aver letto l’informativa privacy.';
  data.marketing = input.marketing === true;
  return { data, errors };
}

export function isGiocaOpen(now = new Date()) {
  const timestamp = new Date(now).getTime();
  return Number.isFinite(timestamp) && timestamp < Date.parse(GIOCA_EVENT.closes);
}

// No 0/O or 1/I: the hostess reads the code off a phone screen at the stand.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function defaultRandom() {
  const crypto = globalThis.crypto;
  if (crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
  return Math.random();
}
export function makeCode(random = defaultRandom) {
  let code = 'AT-';
  for (let i = 0; i < 4; i++) code += ALPHABET[Math.min(ALPHABET.length - 1, Math.floor(random() * ALPHABET.length))];
  return code;
}

// Reuse the existing provider, without storing PII or automatically retrying.
export function createGiocaRegistration({ fetchImpl = globalThis.fetch, now = () => new Date(), random, timeoutMs = 15000 } = {}) {
  let busy = false, completed = false;
  return {
    async submit(input) {
      if (!isGiocaOpen(now())) throw Error('CLOSED');
      const { data, errors } = validateGioca(input);
      if (Object.keys(errors).length) throw Error('VALIDATION');
      if (input.botcheck) throw Error('SPAM');
      if (busy) throw Error('BUSY');
      if (completed) throw Error('DUPLICATE');
      busy = true;
      const code = makeCode(random);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const { marketing, ...person } = data;
        const response = await fetchImpl(REGISTRATION.endpoint, {
          method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            access_key: REGISTRATION.accessKey,
            subject: `Gioca e vinci A&T Vicenza | ${code} | ${person.lastName} ${person.firstName}`,
            from_name: 'NIUEXA Gioca e vinci',
            replyto: person.email,
            ...person,
            code,
            marketing_consent: marketing,
            privacy_acknowledged: true,
            privacy_policy: 'https://niuexa.ai/privacy-policy.html',
            event_id: GIOCA_EVENT.id,
            event_name: GIOCA_EVENT.name,
            fair: GIOCA_EVENT.fair,
            stand: GIOCA_EVENT.stand,
            source: GIOCA_EVENT.url,
            botcheck: '',
          }),
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw Error('PROVIDER');
        completed = true;
        return { status: 'received', code };
      } finally {
        clearTimeout(timer);
        busy = false;
      }
    },
  };
}
