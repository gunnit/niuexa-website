import { FIELDS, createCodeWeekRegistration, isRegistrationOpen, validateRegistration } from './code-week-registration.mjs';

export function bindCodeWeekForm(doc, options = {}) {
  const get = name => doc.getElementById('cw-' + name);
  const form = get('form');
  if (!form) return;
  const fields = get('fields'), button = get('submit'), status = get('status');
  const now = options.now || (() => new Date());
  const flow = createCodeWeekRegistration(options);
  let busy = false, completed = false;
  const show = (message, kind = '') => {
    status.textContent = message;
    status.className = 'form-status ' + kind;
  };
  const sync = () => {
    const open = isRegistrationOpen(now());
    fields.disabled = busy || completed || !open;
    button.disabled = fields.disabled;
    button.textContent = completed ? 'Richiesta ricevuta' : !open ? 'Iscrizioni chiuse' : busy ? 'Invio in corso…' : 'Invia la richiesta';
    if (!open && !completed) show('Le richieste per questo laboratorio sono chiuse. Per informazioni scrivi a gregor.maric@niuexa.ai.');
  };
  sync();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || completed) return;
    if (!isRegistrationOpen(now())) { sync(); return; }
    const input = Object.fromEntries(Object.keys(FIELDS).map(key => [key, get(key).value]));
    input.privacy = get('privacy').checked;
    input.botcheck = get('botcheck').value;
    const { errors } = validateRegistration(input);
    for (const key of [...Object.keys(FIELDS), 'privacy']) {
      get(key).setAttribute('aria-invalid', String(Boolean(errors[key])));
      get(key + '-error').textContent = errors[key] || '';
    }
    if (Object.keys(errors).length) {
      show('Verifica i campi indicati.', 'error');
      get(Object.keys(errors)[0]).focus();
      return;
    }
    busy = true;
    form.setAttribute('aria-busy', 'true');
    show('');
    sync();
    try {
      await flow.submit(input);
      completed = true;
      form.reset();
      show('Richiesta inviata. Il team Niuexa confermerà la partecipazione e condividerà il link di accesso via email.', 'success');
    } catch {
      // A timeout may happen after service acceptance. Do not promise non-delivery.
      show('Non possiamo verificare la ricezione della richiesta. Puoi riprovare o scrivere a gregor.maric@niuexa.ai. Non inviarla di nuovo se hai già ricevuto conferma dal team.', 'error');
    } finally {
      busy = false;
      form.setAttribute('aria-busy', 'false');
      sync();
      status.focus();
    }
  });
}

if (typeof document !== 'undefined') bindCodeWeekForm(document);
