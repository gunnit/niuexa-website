import { EVENTS } from './event-registration-config.mjs';
import { FIELDS, validate, createRegistration } from './event-registration-core.mjs';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const flow = createRegistration();
const form = $('registration-form'), fields = $('registration-fields'), button = $('submit-registration');
const select = $('event-date'), status = $('form-status');
// A date stays open until the end of its day in Milan. The page is re-rendered every
// night, but a copy older than today must still never offer a date that has passed.
const today = (p => `${p.year}-${p.month}-${p.day}`)(Object.fromEntries(
  new Intl.DateTimeFormat('en', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).map(part => [part.type, part.value])));
const open = EVENTS.filter(item => item.date >= today);
for (const option of [...select.options]) if (!open.some(item => item.id === option.value)) option.remove();
let event = open.find(item => item.id === (params.get('event') || open[0]?.id));
let busy = false;
const completed = new Set();

function showStatus(message, kind = '') {
  status.textContent = message;
  status.className = 'form-status ' + kind;
}
function updateEvent() {
  $('selected-date').textContent = event?.label || (open.length ? 'Data non riconosciuta' : 'Richieste chiuse');
  fields.disabled = !event || completed.has(event.id);
  button.disabled = fields.disabled;
  button.textContent = !event ? (open.length ? 'Scelga una data valida' : 'Richieste chiuse') : completed.has(event.id) ? 'Richiesta già ricevuta' : 'Invii la richiesta ↗';
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
const requestedPast = EVENTS.find(item => item.id === params.get('event') && !open.includes(item));
if (event) select.value = event.id;
else if (!open.length) {
  select.prepend(new Option('Nessuna data in calendario', '', true, true));
  select.disabled = true;
  showStatus('Gli incontri in calendario si sono conclusi. Per informazioni scriva a ai@niuexa.ai.');
} else if (requestedPast) {
  select.prepend(new Option('Scelga una data', '', true, true));
  showStatus('L’incontro del ' + requestedPast.label + ' si è già svolto. Scelga uno degli appuntamenti in calendario.', 'error');
} else {
  const option = new Option('Data non riconosciuta', '', true, true);
  select.prepend(option);
  showStatus('La data richiesta non è disponibile. Scelga uno degli appuntamenti in calendario.', 'error');
}
updateEvent();

async function submit() {
  if (busy || button.disabled || !event) return;
  const input = Object.fromEntries(Object.keys(FIELDS).map(key => [key, $(key).value]));
  input.botcheck = $('botcheck').value;
  const { errors } = validate(input);
  for (const key of Object.keys(FIELDS)) {
    $(key).setAttribute('aria-invalid', String(Boolean(errors[key])));
    $(key + '-error').textContent = errors[key] || '';
  }
  if (Object.keys(errors).length) {
    showStatus('Verifichi i campi indicati. Tutti i dati sono obbligatori.', 'error');
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
    form.reset();
    showStatus('Richiesta ricevuta per il ' + event.label + '. Questo messaggio non conferma il posto né la consegna di un’email.', 'success');
    status.focus();
  } catch {
    // Timeout/network failure can occur AFTER acceptance: never claim nothing was sent.
    showStatus('Non possiamo verificare la ricezione della richiesta. Può riprovare o contattarci a ai@niuexa.ai, indicando la data scelta. Non invii nuovamente se ha già ricevuto conferma dal team.', 'error');
    status.focus();
  } finally {
    busy = false;
    select.disabled = false;
    form.setAttribute('aria-busy', 'false');
    updateEvent();
  }
}
