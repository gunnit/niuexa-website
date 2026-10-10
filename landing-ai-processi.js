/* Page-local enhancement. The form still works as a native POST without JavaScript. */
(function () {
  'use strict';
  var form = document.getElementById('processi-contact-form');
  var firstField = document.getElementById('pl-first-name');
  var service = document.getElementById('pl-service');
  var panel = document.querySelector('.pl-form-panel');
  document.querySelectorAll('a[href="#contatto"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (service && link.dataset.service) service.value = link.dataset.service;
      if (!panel || !firstField) return;
      event.preventDefault();
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panel.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'start'});
      firstField.focus({preventScroll:true});
      window.history.replaceState(null, '', '#contatto');
    });
  });
  if (!form) return;
  var button = form.querySelector('button[type="submit"]');
  var status = document.getElementById('pl-submit-status');
  var idleButton = button.innerHTML;
  var idleStatus = status.textContent;
  form.addEventListener('submit', function () {
    // Browser validation runs before submit; native POST preserves the existing endpoint.
    button.disabled = true;
    button.textContent = 'Invio in corso…';
    status.textContent = 'Invio della richiesta in corso.';
  });
  window.addEventListener('pageshow', function () {
    button.disabled = false;
    button.innerHTML = idleButton;
    status.textContent = idleStatus;
  });
})();
