// Niuexa conversion tracking and UTM standardization
// - Captures UTM parameters into Web3Forms hidden fields
// - Emits normalized GA4/GTM events: form_start, form_submit, generate_lead, cta_click
// - Persists attribution for redirects and thank-you pages
(function () {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'];
  var ATTRIBUTION_KEYS = UTM_KEYS.concat(CLICK_ID_KEYS);
  var DEFAULT_CAMPAIGN = 'niuexa_website_conversion';
  var STORAGE_KEY = 'niuexa_attribution_v1';

  function nowIso() {
    return new Date().toISOString();
  }

  function safeJsonParse(value) {
    try { return JSON.parse(value || '{}') || {}; } catch (e) { return {}; }
  }

  function getStoredAttribution() {
    return safeJsonParse(window.localStorage ? localStorage.getItem(STORAGE_KEY) : '{}');
  }

  function saveAttribution(data) {
    if (!window.localStorage) return;
    var current = getStoredAttribution();
    var merged = Object.assign({}, current, data, { updated_at: nowIso() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  function captureAttribution() {
    var params = new URLSearchParams(window.location.search);
    var data = {};
    ATTRIBUTION_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) data[key] = value;
    });
    if (document.referrer) data.referrer = document.referrer;
    data.landing_page = window.location.href;
    if (Object.keys(data).some(function (k) { return ATTRIBUTION_KEYS.indexOf(k) !== -1; })) {
      saveAttribution(data);
    } else if (!getStoredAttribution().landing_page) {
      saveAttribution(data);
    }
  }

  function attribution() {
    var params = new URLSearchParams(window.location.search);
    var stored = getStoredAttribution();
    var data = Object.assign({}, stored);
    ATTRIBUTION_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) data[key] = value;
    });
    data.landing_page = stored.landing_page || window.location.href;
    data.current_page = window.location.href;
    data.referrer = stored.referrer || document.referrer || '';
    return data;
  }

  function ensureHidden(form, name, value) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    if (value !== undefined && value !== null && String(value) !== '') field.value = String(value);
    return field;
  }

  function formName(form) {
    return form.dataset.formLabel || form.getAttribute('aria-label') || form.id || form.getAttribute('name') || form.querySelector('[name="formSource"]')?.value || form.className || 'website_form';
  }

  function inferCampaign(form) {
    var name = formName(form).toLowerCase();
    if (name.indexOf('readiness') !== -1 || window.location.pathname.indexOf('ai-readiness') !== -1) return 'ai_readiness_pmi_2026';
    if (name.indexOf('newsletter') !== -1) return 'newsletter_growth_2026';
    if (window.location.pathname.indexOf('/books/') !== -1) return 'book_lead_magnet_2026';
    return DEFAULT_CAMPAIGN;
  }

  function inferRedirect(form) {
    if (form.querySelector('[name="redirect"]')) return null;
    var name = formName(form).toLowerCase();
    if (name.indexOf('readiness') !== -1 || window.location.pathname.indexOf('ai-readiness') !== -1) {
      return 'https://niuexa.ai/thank-you-ai-readiness-assessment.html';
    }
    return 'https://niuexa.ai/thank-you-page.html';
  }

  function populateForm(form) {
    var data = attribution();
    UTM_KEYS.forEach(function (key) {
      ensureHidden(form, key, data[key] || '');
    });
    CLICK_ID_KEYS.forEach(function (key) {
      ensureHidden(form, key, data[key] || '');
    });
    ensureHidden(form, 'landing_page', data.landing_page || window.location.href);
    ensureHidden(form, 'current_page', window.location.href);
    ensureHidden(form, 'referrer', data.referrer || '');
    ensureHidden(form, 'campaign', data.utm_campaign || inferCampaign(form));
    ensureHidden(form, 'form_name', formName(form));
    if (!form.querySelector('[name="from_name"]')) ensureHidden(form, 'from_name', 'Niuexa Website');
    if (!form.querySelector('[name="subject"]')) ensureHidden(form, 'subject', 'Nuova richiesta dal sito Niuexa');
    var redirect = inferRedirect(form);
    if (redirect) ensureHidden(form, 'redirect', redirect);
  }

  function track(eventName, props) {
    props = props || {};
    var data = Object.assign({
      event: eventName,
      campaign: props.campaign || attribution().utm_campaign || DEFAULT_CAMPAIGN,
      page_path: window.location.pathname,
      page_location: window.location.href
    }, props);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
    if (typeof window.gtag === 'function') {
      var gtagProps = Object.assign({}, data);
      delete gtagProps.event;
      window.gtag('event', eventName, gtagProps);
    }
  }

  function bindFormTracking(form) {
    if (form.dataset.niuexaTrackingBound === '1') return;
    form.dataset.niuexaTrackingBound = '1';
    populateForm(form);
    var started = false;
    var startHandler = function () {
      if (started) return;
      started = true;
      populateForm(form);
      track('form_start', { form_name: formName(form), campaign: inferCampaign(form) });
    };
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('focus', startHandler, { once: true });
      el.addEventListener('input', startHandler, { once: true });
    });
    form.addEventListener('submit', function () {
      populateForm(form);
      track('form_submit', { form_name: formName(form), campaign: inferCampaign(form) });
      saveAttribution(Object.assign({}, attribution(), {
        last_form_name: formName(form),
        last_campaign: inferCampaign(form),
        last_submit_at: nowIso()
      }));
    }, true);
  }

  function bindCtaTracking() {
    document.querySelectorAll('a[href], button, [data-track-cta]').forEach(function (el) {
      if (el.dataset && el.dataset.niuexaCtaBound === '1') return;
      var label = (el.getAttribute('data-track-cta') || el.textContent || el.getAttribute('aria-label') || '').trim();
      var href = el.getAttribute('href') || '';
      if (!label && !href) return;
      if (el.dataset) el.dataset.niuexaCtaBound = '1';
      el.addEventListener('click', function () {
        if (el.matches('a[href], [data-track-cta]')) {
          track('cta_click', {
            cta_id: el.getAttribute('data-track-cta') || label.slice(0, 80) || href,
            cta_text: label.slice(0, 120),
            cta_url: href,
            campaign: attribution().utm_campaign || DEFAULT_CAMPAIGN
          });
        }
      });
    });
  }

  function trackThankYouPage() {
    var path = window.location.pathname;
    if (!/thank-you/i.test(path)) return;
    var data = getStoredAttribution();
    var dedupeKey = 'niuexa_lead_event_' + path + '_' + (data.last_submit_at || 'direct');
    try {
      if (window.sessionStorage && sessionStorage.getItem(dedupeKey)) return;
      if (window.sessionStorage) sessionStorage.setItem(dedupeKey, nowIso());
    } catch (e) {
      // Tracking must continue when storage is unavailable or blocked.
    }
    track('generate_lead', {
      form_name: data.last_form_name || (path.indexOf('ai-readiness') !== -1 ? 'AI Readiness Assessment' : 'Website contact form'),
      campaign: data.last_campaign || data.utm_campaign || (path.indexOf('ai-readiness') !== -1 ? 'ai_readiness_pmi_2026' : DEFAULT_CAMPAIGN),
      lead_source: data.utm_source || 'website',
      lead_medium: data.utm_medium || 'organic'
    });
  }

  function init() {
    captureAttribution();
    document.querySelectorAll('form[action*="api.web3forms.com/submit"], form.contact-form, form.simple-signup-form, form.ai-readiness-form, form.phase-form').forEach(bindFormTracking);
    bindCtaTracking();
    trackThankYouPage();
  }

  window.NiuexaTracking = {
    init: init,
    track: track,
    populateForm: populateForm,
    attribution: attribution
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
