// Niuexa conversion tracking and UTM standardization
// - Captures UTM parameters into Web3Forms hidden fields
// - Separates form_submit_attempt from acknowledged form_submit / generate_lead
// - Correlates native provider redirects with one recent, single-use submission
// - Persists attribution for redirects and thank-you pages, only with marketing consent
//
// Consent is the choice cookie-banner.js saves in localStorage (niuexa_cookie_consent)
// and announces with the 'niuexa:consent' event. The privacy and cookie policies describe
// this behaviour, so keep them in step with it:
// - without marketing consent, nothing is written to localStorage, the Google Ads click IDs
//   (gclid, gbraid, wbraid) never enter form fields, and UTMs and the referrer are used only
//   in memory for the current page;
// - with marketing consent, attribution is stored for at most 90 days after its last update;
// - native thank-you correlation is kept for at most 30 minutes in sessionStorage,
//   only with analytics consent; old dedupe markers are removed on rejection.
(function () {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'];
  var ATTRIBUTION_KEYS = UTM_KEYS.concat(CLICK_ID_KEYS);
  var DEFAULT_CAMPAIGN = 'niuexa_website_conversion';
  var STORAGE_KEY = 'niuexa_attribution_v1';
  var CONSENT_KEY = 'niuexa_cookie_consent';
  var MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
  var PENDING_LEAD_KEY = 'niuexa_pending_lead_v1';
  var CALLBACK_PARAM = 'niuexa_submission';
  var CALLBACK_MAX_AGE = 30 * 60 * 1000;
  var submissions = new WeakMap();

  function nowIso() {
    return new Date().toISOString();
  }

  function safeJsonParse(value) {
    try { return JSON.parse(value || '{}') || {}; } catch (e) { return {}; }
  }

  // No saved choice, or storage that cannot be read, means no consent.
  function hasConsent(purpose) {
    try {
      var consent = safeJsonParse(localStorage.getItem(CONSENT_KEY));
      return typeof consent.analytics === 'boolean' && typeof consent.marketing === 'boolean' && consent[purpose] === true;
    } catch (e) {
      return false;
    }
  }

  function forgetAttribution() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* storage blocked: nothing was stored */ }
  }

  // Stored attribution is read only with marketing consent and while it is younger than
  // 90 days; anything stale or undated is deleted.
  function getStoredAttribution() {
    if (!hasConsent('marketing')) return {};
    var data;
    try { data = safeJsonParse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return {}; }
    var updated = Date.parse(data.updated_at);
    var age = Date.now() - updated;
    if (Number.isFinite(updated) && age >= 0 && age < MAX_AGE_MS) return data;
    forgetAttribution();
    return {};
  }

  function saveAttribution(data) {
    if (!hasConsent('marketing')) return;
    var merged = Object.assign({}, getStoredAttribution(), data, { updated_at: nowIso() });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch (e) { /* storage full or blocked */ }
  }

  // Page addresses sent with a form must not smuggle a click ID in their query string.
  function withoutClickIds(url) {
    if (!url) return '';
    try {
      var parsed = new URL(url, window.location.href);
      var found = CLICK_ID_KEYS.filter(function (key) { return parsed.searchParams.has(key); });
      if (!found.length) return url;
      found.forEach(function (key) { parsed.searchParams.delete(key); });
      return parsed.href;
    } catch (e) {
      return '';
    }
  }

  function captureAttribution() {
    if (!hasConsent('marketing')) {
      // Also removes attribution saved before consent was asked for or after it was withdrawn.
      forgetAttribution();
      return;
    }
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

  // Without marketing consent this is built in memory from the current address and referrer
  // only (nothing is stored), and it carries no click IDs.
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
    if (!hasConsent('marketing')) {
      CLICK_ID_KEYS.forEach(function (key) { delete data[key]; });
      data.landing_page = withoutClickIds(data.landing_page);
      data.current_page = withoutClickIds(data.current_page);
      data.referrer = withoutClickIds(data.referrer);
    }
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
    field.value = value === undefined || value === null ? '' : String(value);
    return field;
  }

  function formName(form) {
    return form.dataset.formLabel || form.getAttribute('aria-label') || form.id || form.getAttribute('name') || form.querySelector('[name="formSource"]')?.value || form.className || 'website_form';
  }

  // Two offers share the word "readiness": the AI Readiness Assessment (consulting) and the
  // AEO Analyzer sold on consulenza-aeo-geo.html. Match exact paths and label prefixes, never a
  // substring, so neither offer's forms or thank-you page are counted as the other's.
  var OFFERS = [
    {
      campaign: 'aeo_analyzer_2026', formName: 'AEO Analyzer',
      thankYou: 'https://niuexa.ai/thank-you-ai-readiness.html',
      paths: ['/consulenza-aeo-geo.html', '/en/ai-readiness-tool.html', '/thank-you-ai-readiness.html'],
      labels: ['aeo analyzer', 'ai readiness tool']
    },
    {
      campaign: 'ai_readiness_pmi_2026', formName: 'AI Readiness Assessment',
      thankYou: 'https://niuexa.ai/thank-you-ai-readiness-assessment.html',
      paths: ['/ai-readiness-assessment.html', '/ai-readiness-assessment-lp.html', '/thank-you-ai-readiness-assessment.html'],
      labels: ['ai readiness assessment']
    }
  ];

  function offerFor(label) {
    var path = window.location.pathname;
    label = (label || '').toLowerCase();
    for (var i = 0; i < OFFERS.length; i++) {
      var offer = OFFERS[i];
      if (offer.paths.indexOf(path) !== -1) return offer;
      for (var j = 0; j < offer.labels.length; j++) {
        if (label.indexOf(offer.labels[j]) === 0) return offer;
      }
    }
    return null;
  }

  function inferCampaign(form) {
    var name = formName(form).toLowerCase();
    var offer = offerFor(name);
    if (offer) return offer.campaign;
    if (name.indexOf('newsletter') !== -1) return 'newsletter_growth_2026';
    if (window.location.pathname.indexOf('/books/') !== -1) return 'book_lead_magnet_2026';
    return DEFAULT_CAMPAIGN;
  }

  function inferRedirect(form) {
    if (form.querySelector('[name="redirect"]')) return null;
    var offer = offerFor(formName(form));
    return offer ? offer.thankYou : 'https://niuexa.ai/thank-you-page.html';
  }

  function populateForm(form) {
    var data = attribution();
    var marketing = hasConsent('marketing');
    UTM_KEYS.forEach(function (key) {
      ensureHidden(form, key, data[key] || '');
    });
    CLICK_ID_KEYS.forEach(function (key) {
      if (marketing) {
        ensureHidden(form, key, data[key] || '');
        return;
      }
      var field = form.querySelector('[name="' + key + '"]');
      if (field) field.remove();
    });
    ensureHidden(form, 'landing_page', data.landing_page);
    ensureHidden(form, 'current_page', data.current_page);
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
    if (!hasConsent('marketing')) {
      CLICK_ID_KEYS.forEach(function (key) { delete data[key]; });
      ['page_location', 'page_referrer', 'cta_url', 'landing_page', 'current_page', 'referrer'].forEach(function (key) {
        if (data[key]) data[key] = withoutClickIds(data[key]);
      });
    }
    try {
      // Preserve both existing interfaces: the deployed GTM container decides which
      // tags consume each. Consent defaults/updates remain owned by the consent code.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(data);
      if (typeof window.gtag === 'function') {
        var gtagProps = Object.assign({}, data);
        delete gtagProps.event;
        window.gtag('event', eventName, gtagProps);
      }
    } catch (e) {
      // An analytics failure must never turn a received request into a form error.
    }
  }

  function newSubmission(form) {
    var data = attribution();
    return {
      submission_id: window.crypto && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
      created_at: Date.now(),
      form_name: formName(form),
      campaign: data.utm_campaign || inferCampaign(form),
      lead_source: data.utm_source || 'website',
      lead_medium: data.utm_medium || 'organic'
    };
  }

  function emitSuccess(submission, method, details) {
    if (submission.confirmed) return;
    submission.confirmed = true;
    var props = {
      submission_id: submission.submission_id,
      form_name: submission.form_name,
      campaign: submission.campaign,
      lead_source: submission.lead_source,
      lead_medium: submission.lead_medium,
      submission_status: 'success',
      confirmation_method: method
    };
    if (details) {
      props.event_category = details.event_category;
      props.event_label = details.event_label;
    }
    track('form_submit', props);
    track('generate_lead', props);
  }

  // Call only after the form handler has checked HTTP success and JSON success:true.
  // AJAX forms report here, before their existing redirect or inline success UI.
  function confirmSubmission(form, details) {
    var submission = submissions.get(form) || newSubmission(form);
    submissions.set(form, submission);
    emitSuccess(submission, 'provider_response', details);
  }

  function prepareNativeRedirect(form, submission) {
    if (form.dataset.niuexaAsyncForm === '1') return;
    var field = form.querySelector('[name="redirect"]');
    if (!field) return;
    try {
      var target = new URL(field.value, window.location.href);
      if (!hasConsent('analytics')) {
        target.searchParams.delete(CALLBACK_PARAM);
        field.value = target.href;
        return;
      }
      var provider = new URL(form.action, window.location.href);
      if (provider.origin !== 'https://api.web3forms.com' || provider.pathname !== '/submit') return;
      if (target.origin !== window.location.origin || !/^\/(en\/)?thank-you[^/]*\.html$/.test(target.pathname)) return;
      submission.redirect_path = target.pathname;
      // Analytics-only, tab-scoped correlation: no contact fields enter this record.
      window.sessionStorage.setItem(PENDING_LEAD_KEY, JSON.stringify(submission));
      target.searchParams.set(CALLBACK_PARAM, submission.submission_id);
      field.value = target.href;
    } catch (e) {
      // Native POST still works without storage; its uncorrelated return is not a lead.
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
      var submission = newSubmission(form);
      submissions.set(form, submission);
      track('form_submit_attempt', {
        form_name: submission.form_name,
        campaign: submission.campaign,
        submission_id: submission.submission_id,
        submission_status: 'attempt'
      });
      prepareNativeRedirect(form, submission);
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
    if (!/^\/(en\/)?thank-you[^/]*\.html$/.test(path)) return;
    var callback = new URL(window.location.href);
    var id = callback.searchParams.get(CALLBACK_PARAM);
    if (!id) return;
    callback.searchParams.delete(CALLBACK_PARAM);
    try {
      window.history.replaceState(null, '', callback.href);
    } catch (e) {
      // Removing the non-sensitive correlation ID is only URL hygiene.
    }
    if (!hasConsent('analytics')) return;
    try {
      var pending = safeJsonParse(window.sessionStorage.getItem(PENDING_LEAD_KEY));
      var age = Date.now() - pending.created_at;
      if (!(age >= 0 && age <= CALLBACK_MAX_AGE)) {
        window.sessionStorage.removeItem(PENDING_LEAD_KEY);
        return;
      }
      if (pending.submission_id !== id || pending.redirect_path !== path) return;
      // Consume before emitting; direct visits, reloads, old tokens and other tabs
      // cannot reuse this callback. It is a client correlation, not a signed receipt.
      window.sessionStorage.removeItem(PENDING_LEAD_KEY);
      emitSuccess(pending, 'provider_redirect');
    } catch (e) {
      // Fail closed if the callback cannot be consumed safely.
    }
  }

  function clearUnconsentedMeasurement() {
    if (hasConsent('analytics')) return;
    try {
      window.sessionStorage.removeItem(PENDING_LEAD_KEY);
      for (var i = window.sessionStorage.length - 1; i >= 0; i--) {
        var key = window.sessionStorage.key(i);
        if (key && key.indexOf('niuexa_lead_event_') === 0) window.sessionStorage.removeItem(key);
      }
    } catch (e) { /* storage unavailable */ }
  }

  function init() {
    clearUnconsentedMeasurement();
    trackThankYouPage();
    captureAttribution();
    document.querySelectorAll('form[action*="api.web3forms.com/submit"], form.contact-form, form.simple-signup-form, form.ai-readiness-form, form.phase-form').forEach(bindFormTracking);
    bindCtaTracking();
  }

  // A choice made in the banner applies at once: consent stores what this page captured and
  // adds the click IDs to the forms; a refusal deletes stored attribution and removes them.
  window.addEventListener('niuexa:consent', function () {
    clearUnconsentedMeasurement();
    captureAttribution();
    document.querySelectorAll('form[data-niuexa-tracking-bound="1"]').forEach(populateForm);
  });

  window.NiuexaTracking = {
    init: init,
    track: track,
    populateForm: populateForm,
    confirmSubmission: confirmSubmission,
    attribution: attribution
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
