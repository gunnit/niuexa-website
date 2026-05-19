/* Niuexa A+ polish — count-up stats, marquee duplication, micro-interactions */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ---- Partners marquee: duplicate children so the -50% translate is seamless
  function duplicatePartners() {
    var grid = document.querySelector('.partners-grid');
    if (!grid || grid.dataset.duplicated === '1') return;
    var originals = Array.from(grid.children);
    originals.forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      grid.appendChild(clone);
    });
    grid.dataset.duplicated = '1';
  }

  // ---- Count-up on hero stats. Parses things like "100+", "100-150%", "25+"
  function animateStat(el) {
    if (el.dataset.animated === '1') return;
    el.dataset.animated = '1';
    var raw = el.dataset.value || el.textContent.trim();
    // Match the first number(s) we see; support ranges like 100-150
    var rangeMatch = raw.match(/^(\d+)\s*-\s*(\d+)(.*)$/);
    var singleMatch = raw.match(/^(\d+)(.*)$/);

    var prefix = '', unit = '';
    var fromA, toA, fromB = null, toB = null;

    if (rangeMatch) {
      fromA = 0; toA = parseInt(rangeMatch[1], 10);
      fromB = 0; toB = parseInt(rangeMatch[2], 10);
      unit = rangeMatch[3] || '';
    } else if (singleMatch) {
      fromA = 0; toA = parseInt(singleMatch[1], 10);
      unit = singleMatch[2] || '';
    } else {
      return; // no number — bail
    }

    var duration = 1400;
    var start = performance.now();

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var e = easeOutCubic(p);
      var a = Math.round(fromA + (toA - fromA) * e);
      var text;
      if (toB !== null) {
        var b = Math.round(fromB + (toB - fromB) * e);
        text = a + '-' + b;
      } else {
        text = '' + a;
      }
      if (unit) {
        // Wrap unit in a span so we can style it
        el.innerHTML = text + '<span class="nx-unit">' + unit + '</span>';
      } else {
        el.textContent = text;
      }
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function watchStats() {
    var targets = document.querySelectorAll(
      '.hero-stats .stat-number, .company-stats .stat h3, .testimonial-results .result-number'
    );
    if (!('IntersectionObserver' in window)) {
      targets.forEach(animateStat);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    targets.forEach(function (t) {
      // Stash original for the animation parser
      t.dataset.value = t.textContent.trim();
      // Render initial state as "0" + unit so the swap from text → 0 → final is clean
      io.observe(t);
    });
  }

  // ---- Scroll reveal on cards
  function watchReveals() {
    if (!('IntersectionObserver' in window)) return;
    var targets = document.querySelectorAll(
      '.service-card, .testimonial-card, .course-card, .faq-item, .partner-logo'
    );
    targets.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1)';
      el.style.transitionDelay = (Math.min(i, 6) * 60) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  ready(function () {
    duplicatePartners();
    watchStats();
    watchReveals();
  });
})();
