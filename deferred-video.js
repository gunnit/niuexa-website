// Decorative videos remain posters until they approach the viewport and motion is allowed.
(function () {
  'use strict';

  function init() {
    // Static posters are the fallback; never eagerly download every video.
    if (typeof window.IntersectionObserver !== 'function') return;
    var videos = Array.from(document.querySelectorAll('video[data-deferred-video]'))
      .filter(function (video) { return video.dataset.deferredVideoBound !== '1'; });
    if (!videos.length) return;

    var motion = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var connection = window.navigator.connection;
    var states = new Map(videos.map(function (video) {
      video.dataset.deferredVideoBound = '1';
      return [video, { video: video, near: false, visible: false, loaded: false, requested: false, attempt: 0 }];
    }));

    function allowed() {
      return !document.hidden && !(motion && motion.matches) && !(connection && connection.saveData);
    }

    function stop(state) {
      var wasRequested = state.requested;
      state.requested = false;
      state.attempt++;
      if (wasRequested || !state.video.paused) state.video.pause();
    }

    function sync(state) {
      if (!allowed()) { stop(state); return; }
      if (!state.loaded && (state.near || state.visible)) {
        var sources = Array.from(state.video.querySelectorAll('source[data-src]')).filter(function (source) {
          return Boolean(source.getAttribute('data-src'));
        });
        if (sources.length) {
          sources.forEach(function (source) { source.setAttribute('src', source.getAttribute('data-src')); });
          state.loaded = true;
          state.video.preload = 'metadata';
          state.video.load();
          nearObserver.unobserve(state.video);
        }
      }
      if (!state.visible || !state.loaded) { stop(state); return; }
      if (state.requested) return;
      state.requested = true;
      var attempt = ++state.attempt;
      function rejected() {
        if (state.attempt === attempt) stop(state);
      }
      try {
        Promise.resolve(state.video.play()).then(function () {
          // A play promise may settle after a tab, viewport or preference change.
          if (!allowed() || !state.visible) stop(state);
        }, rejected);
      } catch (e) {
        rejected();
      }
    }

    var nearObserver = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var state = states.get(entry.target);
        state.near = entry.isIntersecting;
        sync(state);
      });
    }, { rootMargin: '100px 0px', threshold: 0 });
    var visibleObserver = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var state = states.get(entry.target);
        state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.01;
        sync(state);
      });
    }, { threshold: 0.01 });
    videos.forEach(function (video) {
      nearObserver.observe(video);
      visibleObserver.observe(video);
    });

    function syncAll() { states.forEach(sync); }
    document.addEventListener('visibilitychange', syncAll);
    if (motion) {
      if (typeof motion.addEventListener === 'function') motion.addEventListener('change', syncAll);
      else if (typeof motion.addListener === 'function') motion.addListener(syncAll);
    }
    if (connection && typeof connection.addEventListener === 'function') connection.addEventListener('change', syncAll);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
