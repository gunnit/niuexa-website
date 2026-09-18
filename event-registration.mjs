import { EVENTS } from './event-registration-config.mjs';
import { FIELDS, validate, createRegistration } from './event-registration-core.mjs';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const flow = createRegistration();
const form = $('registration-form'), fields = $('registration-fields'), button = $('submit-registration');
const select = $('event-date'), status = $('form-status');
let event = EVENTS.find(item => item.id === (params.get('event') || EVENTS[0].id));
let busy = false;
const completed = new Set();

function showStatus(message, kind = '') {
  status.textContent = message;
  status.className = 'form-status ' + kind;
}
function updateEvent() {
  $('selected-date').textContent = event?.label || 'Data non riconosciuta';
  fields.disabled = !event || completed.has(event.id);
  button.disabled = fields.disabled;
  button.textContent = !event ? 'Scelga una data valida' : completed.has(event.id) ? 'Richiesta già ricevuta' : 'Invii la richiesta ↗';
}
// Prevent native form submission; CSP form-action:none is a second layer.
form.addEventListener('submit', e => { e.preventDefault(); if (!button.disabled) submit(); });
select.addEventListener('change', () => {
  if (busy) return;
  event = EVENTS.find(item => item.id === select.value);
  const url = new URL(location.href);
  url.searchParams.set('event', select.value);
  history.replaceState(null, '', url);
  showStatus('');
  updateEvent();
});
if (event) select.value = event.id;
else {
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
