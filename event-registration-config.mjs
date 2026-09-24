// Required fields confirmed by Roberto's 16 September email; dates and venue by his
// 20 September email (27 Oct and 17 Nov replace 17 Nov and 2 Dec).
// Null means NOT CONFIRMED. Historic event data must not fill these fields.
export const EVENTS = Object.freeze([
  ['2026-10-06', '6 ottobre 2026'],
  ['2026-10-27', '27 ottobre 2026'],
  ['2026-11-17', '17 novembre 2026'],
].map(([date, label]) => Object.freeze({
  id: date, date, label, timezone: 'Europe/Rome',
  // Time supplied by the owner; venue is Libera's Milan office (address from Roberto's signature).
  title: null, agenda: null, time: '18:30',
  venue: 'Ufficio Libera, Via Rutilia 10/8, 20141 Milano',
  speakers: null, format: 'in-person', price: null,
})));

// Public browser key reused from landing-niuexa.html, never a server secret.
// The provider account controls the destination mailbox; the key does not reveal it.
export const REGISTRATION = Object.freeze({
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: 'bfacbe48-94e9-4411-94a0-6017dc9791b6',
  source: 'https://niuexa.ai/eventi-ai-aziende/',
});
