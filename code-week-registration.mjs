import { REGISTRATION } from './event-registration-config.mjs';

// Confirmed by the organiser: free, online, Italian, 60 minutes.
export const CODE_WEEK_EVENT = Object.freeze({
  id: 'niuexa-code-week-2026-10-22',
  title: 'Dalla risposta AI all’azione: costruisci un flusso che puoi controllare',
  start: '2026-10-22T17:00:00+02:00',
  end: '2026-10-22T18:00:00+02:00',
  timezone: 'Europe/Rome',
  url: 'https://niuexa.ai/code-week-ai-2026.html',
});

export const FIELDS = Object.freeze({ firstName: 80, lastName: 80, email: 254, company: 160 });

export function validateRegistration(input = {}) {
  const data = {}, errors = {};
  for (const [field, max] of Object.entries(FIELDS)) {
    data[field] = typeof input[field] === 'string' ? input[field].trim() : '';
    if (!data[field] && field !== 'company') errors[field] = 'Compila questo campo.';
    else if (data[field].length > max) errors[field] = `Usa al massimo ${max} caratteri.`;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Inserisci un indirizzo email valido.';
  if (input.privacy !== true) errors.privacy = 'Conferma di aver letto l’informativa privacy.';
  return { data, errors };
}

export function isRegistrationOpen(now = new Date()) {
  const timestamp = new Date(now).getTime();
  return Number.isFinite(timestamp) && timestamp < Date.parse(CODE_WEEK_EVENT.start);
}

// Reuse the existing provider, without storing PII or automatically retrying.
export function createCodeWeekRegistration({ fetchImpl = globalThis.fetch, now = () => new Date(), timeoutMs = 15000 } = {}) {
  let busy = false, completed = false;
  return {
    async submit(input) {
      if (!isRegistrationOpen(now())) throw Error('CLOSED');
      const { data, errors } = validateRegistration(input);
      if (Object.keys(errors).length) throw Error('VALIDATION');
      if (input.botcheck) throw Error('SPAM');
      if (busy) throw Error('BUSY');
      if (completed) throw Error('DUPLICATE');
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
            subject: 'Laboratorio AI NIUEXA | 22 ottobre 2026',
            from_name: 'NIUEXA laboratorio AI',
            replyto: data.email,
            ...data,
            event_id: CODE_WEEK_EVENT.id,
            event_title: CODE_WEEK_EVENT.title,
            event_start: CODE_WEEK_EVENT.start,
            event_end: CODE_WEEK_EVENT.end,
            event_timezone: CODE_WEEK_EVENT.timezone,
            source: CODE_WEEK_EVENT.url,
            privacy_acknowledged: true,
            privacy_policy: 'https://niuexa.ai/privacy-policy.html',
            botcheck: '',
          }),
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw Error('PROVIDER');
        completed = true;
        return { status: 'received' };
      } finally {
        clearTimeout(timer);
        busy = false;
      }
    },
  };
}
