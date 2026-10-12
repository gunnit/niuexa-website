import { FIELDS, createGiocaRegistration, isGiocaOpen, validateGioca } from './gioca-registration.mjs';

export function bindGiocaForm(doc, options = {}) {
  const get = name => doc.getElementById('gv-' + name);
  const form = get('form');
  if (!form) return;
  const fields = get('fields'), button = get('submit'), status = get('status'), done = get('done'), codeBox = get('code');
  const now = options.now || (() => new Date());
  const flow = createGiocaRegistration(options);
  let busy = false, completed = false;
  done.hidden = true;
  const show = (message, kind = '') => {
    status.textContent = message;
    status.className = 'form-status ' + kind;
  };
  const sync = () => {
    const open = isGiocaOpen(now());
    fields.disabled = busy || completed || !open;
    button.disabled = fields.disabled;
    button.hidden = completed;
    button.textContent = !open ? 'Gioco concluso' : busy ? 'Invio in corso…' : 'Ricevi il codice e gioca';
    if (!open && !completed) show('Il gioco si è concluso con la fiera. Per informazioni scrivi a ai@niuexa.ai.');
  };
  // No personal data: one anonymous event for Google Tag Manager, like the other forms.
  const track = () => {
    try {
      const layer = options.dataLayer || (globalThis.window ? (window.dataLayer = window.dataLayer || []) : null);
      layer?.push({ event: 'gioca_registration', form_name: 'Gioca e vinci A&T Vicenza 2026', campaign: 'aet_vicenza_2026' });
    } catch {
      // Tracking must never turn a received registration into an error message.
    }
  };
  sync();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || completed) return;
    if (!isGiocaOpen(now())) { sync(); return; }
    const input = Object.fromEntries(Object.keys(FIELDS).map(key => [key, get(key).value]));
    input.privacy = get('privacy').checked;
    input.marketing = get('marketing').checked === true;
    input.botcheck = get('botcheck').value;
    const { errors } = validateGioca(input);
    for (const key of [...Object.keys(FIELDS), 'privacy']) {
      get(key).setAttribute('aria-invalid', String(Boolean(errors[key])));
      get(key + '-error').textContent = errors[key] || '';
    }
    if (Object.keys(errors).length) {
      show('Verifica i campi indicati. Servono tutti per giocare.', 'error');
      get(Object.keys(errors)[0]).focus();
      return;
    }
    busy = true;
    form.setAttribute('aria-busy', 'true');
    show('');
    sync();
    try {
      const { code } = await flow.submit(input);
      completed = true;
      form.reset();
      codeBox.textContent = code;
      fields.hidden = true;
      done.hidden = false;
      show('Registrazione ricevuta. Mostra il codice alla hostess allo stand e gira la ruota.', 'success');
      track();
    } catch {
      // A timeout may happen after service acceptance. Do not promise non-delivery.
      show('Non possiamo verificare la ricezione della registrazione. Riprova, oppure chiedi alla hostess: può registrarti lei allo stand.', 'error');
    } finally {
      busy = false;
      form.setAttribute('aria-busy', 'false');
      sync();
      status.focus();
    }
  });
}

if (typeof document !== 'undefined') bindGiocaForm(document);
