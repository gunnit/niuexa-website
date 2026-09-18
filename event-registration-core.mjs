import { EVENTS, REGISTRATION } from './event-registration-config.mjs';

// No PII storage, analytics, logging or automatic retries.
export function createRegistration({ fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}) {
  const completed = new Set();
  let busy = false;
  return {
    async submit(eventId, input) {
      const event = EVENTS.find(item => item.id === eventId);
      if (!event) throw new Error('EVENT');
      const { data, errors } = validate(input);
      if (Object.keys(errors).length) throw new Error('VALIDATION');
      if (input.botcheck) throw new Error('SPAM');
      if (busy) throw new Error('BUSY');
      if (completed.has(eventId)) throw new Error('DUPLICATE');
      busy = true;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(REGISTRATION.endpoint, {
          method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            access_key: REGISTRATION.accessKey,
            subject: `Richiesta partecipazione NIUEXA | ${event.label}`,
            from_name: 'NIUEXA incontri', replyto: data.email,
            ...data, event_id: event.id, event_date: event.date,
            event_label: event.label, source: REGISTRATION.source, botcheck: '',
          }),
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error('PROVIDER');
        completed.add(eventId);
        return { status: 'received', eventId };
      } finally { clearTimeout(timer); busy = false; }
    },
  };
}

export const FIELDS = Object.freeze({ firstName: 80, lastName: 80, company: 160, email: 254, mobile: 30 });
export function validate(input = {}) {
  const data = {}, errors = {};
  for (const [field, max] of Object.entries(FIELDS)) {
    data[field] = typeof input[field] === 'string' ? input[field].trim() : '';
    if (!data[field]) errors[field] = 'Compili questo campo.';
    else if (data[field].length > max) errors[field] = `Utilizzi al massimo ${max} caratteri.`;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Inserisca un indirizzo email valido.';
  const digits = data.mobile.replace(/\D/g, '');
  if (data.mobile && (!/^\+?[\d\s().-]+$/.test(data.mobile) || digits.length < 7 || digits.length > 15)) errors.mobile = 'Inserisca un numero valido, con prefisso internazionale.';
  return { data, errors };
}
