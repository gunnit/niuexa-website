/* ==========================================================================
   landing-agent.js
   Behaviour for the AI agent landing pages.

   Three jobs, all of them enhancements. Nothing here is required for the page
   to render correctly: the markup and landing-agent.css already produce the
   finished state, and every branch below either improves it or bows out.
   ========================================================================== */

(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ----------------------------------------------------------------------
       Navigation: swap to the light treatment once the dark hero is behind us.
       ---------------------------------------------------------------------- */

    function initNav() {
        var nav = document.querySelector('.agent-landing__nav');
        var hero = document.querySelector('.agent-hero');
        if (!nav || !hero || !('IntersectionObserver' in window)) return;

        // Fires when the hero's bottom edge passes under the nav bar.
        var observer = new IntersectionObserver(function (entries) {
            nav.setAttribute('data-past-hero', String(!entries[0].isIntersecting));
        }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 });

        observer.observe(hero);
    }

    /* ----------------------------------------------------------------------
       Pipeline reveal.

       Preferred path is pure CSS via `animation-timeline: view()`, which needs
       no JavaScript at all. This function only handles the browsers that lack
       it (Firefox today) by arming the transition-based fallback.

       The `is-armed` class is what applies the offset starting state. It is
       added only after we have confirmed both that the fallback is needed and
       that an observer exists to undo it, so the bands can never get stuck
       hidden. Without JS, or with reduced motion, the image simply renders
       complete and sharp.
       ---------------------------------------------------------------------- */

    function initPipeline() {
        var pipeline = document.querySelector('.pipeline');
        if (!pipeline) return;

        var supportsViewTimeline =
            window.CSS &&
            typeof CSS.supports === 'function' &&
            CSS.supports('animation-timeline', 'view()');

        if (supportsViewTimeline) return;            // CSS has it covered.
        if (reduceMotion.matches) return;            // Honour the preference.
        if (!('IntersectionObserver' in window)) return;

        pipeline.classList.add('is-armed');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);   // Play once, then stop.
                }
            });
        }, { threshold: 0.2 });

        observer.observe(pipeline);

        // If the section is already on screen at load, the observer fires
        // immediately; this guards the edge case where it does not.
        window.setTimeout(function () {
            if (!pipeline.classList.contains('is-visible')) {
                var box = pipeline.getBoundingClientRect();
                if (box.top < window.innerHeight && box.bottom > 0) {
                    pipeline.classList.add('is-visible');
                }
            }
        }, 400);
    }

    /* ----------------------------------------------------------------------
       Hero video: decorative, so it must never cost more than it gives.
       Paused whenever it is off screen or the tab is hidden, and not played at
       all under reduced motion, where the poster frame stands in for it.
       ---------------------------------------------------------------------- */

    function initHeroVideo() {
        var video = document.querySelector('.agent-hero__media video');
        if (!video) return;

        if (reduceMotion.matches) {
            video.removeAttribute('autoplay');
            video.pause();
            return;
        }

        var play = function () {
            var attempt = video.play();
            // Autoplay can still be refused; the poster frame is the fallback.
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        };

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries[0].isIntersecting ? play() : video.pause();
            }, { threshold: 0.05 }).observe(video);
        } else {
            play();
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                video.pause();
            } else if (video.getBoundingClientRect().bottom > 0) {
                play();
            }
        });
    }

    /* ----------------------------------------------------------------------
       Smooth scrolling for the in-page anchors, unless motion is reduced.
       ---------------------------------------------------------------------- */

    function initAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (event) {
                var id = this.getAttribute('href');
                if (!id || id === '#') return;

                var target = document.querySelector(id);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({
                    behavior: reduceMotion.matches ? 'auto' : 'smooth',
                    block: 'start'
                });

                // scrollIntoView moves the viewport but not focus; without this
                // keyboard and screen reader users stay where they were.
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            });
        });
    }

    function init() {
        initNav();
        initPipeline();
        initHeroVideo();
        initAnchors();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
