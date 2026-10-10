import { EVENTS } from './event-registration-config.mjs';
import { FIELDS, validate, createRegistration } from './event-registration-core.mjs';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const flow = createRegistration();
const form = $('registration-form'), fields = $('registration-fields'), button = $('submit-registration');
const select = $('event-date'), status = $('form-status');
// A date stays open until the end of its day in Milan. The page is re-rendered every
// night; the browser also drops dates that have passed, but only ever from the dates the
// served page still offers, so a device clock running late cannot reopen a closed date.
const romeToday = () => (p => `${p.year}-${p.month}-${p.day}`)(Object.fromEntries(
  new Intl.DateTimeFormat('en', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).map(part => [part.type, part.value])));
const served = new Set([...select.options].map(option => option.value));
let open = [];
function dropPastDates() {
  open = EVENTS.filter(item => item.date >= romeToday() && served.has(item.id));
  for (const option of [...select.options]) if (option.value && !open.some(item => item.id === option.value)) option.remove();
}
dropPastDates();
const requested = EVENTS.find(item => item.id === params.get('event'));
let event = open.find(item => item.id === (params.get('event') || open[0]?.id));
let busy = false;
const completed = new Set();

// Event requests have no thank-you page, so the success state reports the request to
// Google Tag Manager the way conversion-tracking.js reports the site's other forms:
// a dataLayer event for GTM triggers and a gtag event for GA4. No personal data is sent.
function trackRequest(item) {
  try {
    const data = {
      event: 'event_registration',
      form_name: 'Eventi AI per aziende',
      event_date: item.date,
      campaign: params.get('utm_campaign') || 'eventi_ai_aziende_2026',
      page_path: location.pathname,
      // Event date and campaign are separate fields. Never forward arbitrary URL
      // query values or fragments, including when marketing consent is granted.
      page_location: location.origin + location.pathname,
    };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
    if (typeof window.gtag === 'function') {
      const { event: name, ...props } = data;
      window.gtag('event', name, props);
    }
  } catch {
    // Tracking must never turn a received request into an error message.
  }
}
function showStatus(message, kind = '') {
  status.textContent = message;
  status.className = 'form-status ' + kind;
}
// One placeholder at most, kept first and selected, when no valid date is chosen.
function showPlaceholder(text) {
  const option = select.querySelector('option[value=""]') || select.insertBefore(new Option('', ''), select.firstChild);
  option.text = text;
  select.value = '';
}
function updateEvent() {
  $('selected-date').textContent = event?.label || (open.length ? select.selectedOptions[0]?.text || '' : 'Richieste chiuse');
  fields.disabled = !event || completed.has(event.id);
  button.disabled = fields.disabled;
  button.textContent = !event ? (open.length ? 'Scegli una data valida' : 'Richieste chiuse') : completed.has(event.id) ? 'Richiesta già ricevuta' : 'Invia la richiesta ↗';
}
// Prevent native form submission; CSP form-action:none is a second layer.
form.addEventListener('submit', e => { e.preventDefault(); if (!button.disabled) submit(); });
select.addEventListener('change', () => {
  if (busy) return;
  event = open.find(item => item.id === select.value);
  const url = new URL(location.href);
  url.searchParams.set('event', select.value);
  history.replaceState(null, '', url);
  showStatus('');
  updateEvent();
});
if (event) select.value = event.id;
else if (!open.length) {
  showPlaceholder('Nessuna data in calendario');
  select.disabled = true;
  showStatus('Gli incontri in calendario si sono conclusi. Per informazioni scrivi a ai@niuexa.ai.');
} else if (requested) {
  showPlaceholder('Scegli una data');
  showStatus((requested.date < romeToday() ? 'L’incontro del ' + requested.label + ' si è già svolto.' : 'La data richiesta non è disponibile.') + ' Scegli uno degli appuntamenti in calendario.', 'error');
} else {
  showPlaceholder('Data non riconosciuta');
  showStatus('La data richiesta non è disponibile. Scegli uno degli appuntamenti in calendario.', 'error');
}
updateEvent();

async function submit() {
  if (busy || button.disabled || !event) return;
  // A tab left open past midnight must not send a date that has just closed.
  if (event.date < romeToday()) {
    const closed = event;
    event = undefined;
    dropPastDates();
    showPlaceholder(open.length ? 'Scegli una data' : 'Nessuna data in calendario');
    select.disabled = !open.length;
    showStatus('L’incontro del ' + closed.label + ' si è già svolto. ' + (open.length ? 'Scegli uno degli appuntamenti in calendario.' : 'Per informazioni scrivi a ai@niuexa.ai.'), 'error');
    updateEvent();
    return;
  }
  const input = Object.fromEntries(Object.keys(FIELDS).map(key => [key, $(key).value]));
  input.botcheck = $('botcheck').value;
  const { errors } = validate(input);
  for (const key of Object.keys(FIELDS)) {
    $(key).setAttribute('aria-invalid', String(Boolean(errors[key])));
    $(key + '-error').textContent = errors[key] || '';
  }
  if (Object.keys(errors).length) {
    showStatus('Verifica i campi indicati. Tutti i dati sono obbligatori.', 'error');
    $(Object.keys(errors)[0]).focus();
    return;
  }
  busy = true;
  fields.disabled = true;
  button.disabled = true;
  select.disabled = true;
  button.textContent = 'Invio in corso…';
  form.setAttribute('aria-busy', 'true');
  showStatus('');
  try {
    const receipt = await flow.submit(event.id, input);
    if (receipt.status !== 'received') throw new Error('PROVIDER');
    completed.add(event.id);
    trackRequest(event);
    form.reset();
    showStatus('Richiesta ricevuta per il ' + event.label + '. Questo messaggio non conferma il posto né la consegna di un’email.', 'success');
    status.focus();
  } catch {
    // Timeout/network failure can occur AFTER acceptance: never claim nothing was sent.
    showStatus('Non possiamo verificare la ricezione della richiesta. Puoi riprovare o contattarci a ai@niuexa.ai, indicando la data scelta. Non inviarla di nuovo se hai già ricevuto conferma dal team.', 'error');
    status.focus();
  } finally {
    busy = false;
    select.disabled = false;
    form.setAttribute('aria-busy', 'false');
    updateEvent();
  }
}
