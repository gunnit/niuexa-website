// Dates/required fields confirmed by Roberto's 16 September email.
// Null means NOT CONFIRMED. Historic event data must not fill these fields.
export const EVENTS = Object.freeze([
  ['2026-10-06', '6 ottobre 2026'],
  ['2026-11-17', '17 novembre 2026'],
  ['2026-12-02', '2 dicembre 2026'],
].map(([date, label]) => Object.freeze({
  id: date, date, label, timezone: 'Europe/Rome',
  // Time/venue supplied by the owner; street address verified at bebit.it/en/contacts.
  title: null, agenda: null, time: '18:30',
  venue: 'Ufficio Bebit, Via Rutilia 10, 20141 Milano',
  speakers: null, format: 'in-person', price: null,
})));

// Public browser key reused from landing-niuexa.html, never a server secret.
// The provider account controls the destination mailbox; the key does not reveal it.
export const REGISTRATION = Object.freeze({
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: 'bfacbe48-94e9-4411-94a0-6017dc9791b6',
  source: 'https://niuexa.ai/eventi-ai-aziende/',
});
