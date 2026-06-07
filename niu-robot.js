/* =====================================================================
   Niu — interactive AI mascot behaviour
   Vanilla port of the Next.js prototype. Idle bob + pointer eye-tracking,
   click reactions (top -> super-duper-happy + confetti, else super-happy),
   a friendly wave greeting on load, with a reaction-video crossfade.
   ===================================================================== */
(function () {
    'use strict';

    function init() {
        var stage = document.querySelector('.hero-robot');
        if (!stage) return;

        var robot = stage.querySelector('.robotbg');
        var video = stage.querySelector('.robot-video');
        var eye   = stage.querySelector('.eye');
        var diamond = stage.querySelector('.eye-diamond');
        if (!robot || !video) return;

        var reduce = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // resolve asset folder from the robot image src so paths stay relative
        var img = robot.querySelector('.robotimg');
        var base = 'img/niu/';
        if (img && img.getAttribute('src')) {
            base = img.getAttribute('src').replace(/[^/]+$/, '');
        }
        // prefer alpha WebM (transparent) where VP9 is supported; MP4 fallback
        // (e.g. Safari) shows the original dark-background clip.
        var ext = video.canPlayType('video/webm; codecs="vp9"') ? '.webm' : '.mp4';
        var CLIPS = {
            wave:  base + 'wave' + ext,
            happy: base + 'super-happy' + ext,
            super: base + 'super-duper-happy' + ext
        };

        var playing = false;       // a reaction video is on screen
        var priority = 0;          // priority of the clip currently playing
        var safetyTimer = null;    // forces a reset if a clip never fires 'ended'

        function reset() {
            if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
            try { video.pause(); video.currentTime = 0; } catch (e) {}
            robot.classList.remove('video-on', 'playing');
            playing = false;
            priority = 0;
        }

        // play a reaction clip; higher-priority clips interrupt lower ones
        function play(src, prio) {
            if (playing && prio < priority) return false;
            playing = true;
            priority = prio;
            robot.classList.add('playing');
            robot.classList.remove('video-on');   // hidden until first frame
            if (video.getAttribute('src') !== src) video.setAttribute('src', src);
            try { video.currentTime = 0; } catch (e) {}
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
            if (safetyTimer) clearTimeout(safetyTimer);
            safetyTimer = setTimeout(reset, 12000);
            return true;
        }

        function reveal() {
            if (!playing) return;
            robot.classList.add('video-on');
            if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
        }
        video.addEventListener('loadeddata', reveal);
        video.addEventListener('canplay', reveal);
        video.addEventListener('playing', reveal);
        video.addEventListener('ended', reset);

        /* ---- click reactions ---- */
        robot.addEventListener('click', function (e) {
            if (playing) return;
            var r = robot.getBoundingClientRect();
            var ratio = (e.clientY - r.top) / r.height;
            if (ratio < 0.45) {
                if (play(CLIPS.super, 2) && !reduce) confettiBurst();
            } else {
                play(CLIPS.happy, 1);
            }
        });

        /* ---- pointer eye-tracking (idle only) ---- */
        if (diamond && eye && !reduce) {
            var curX = 0, curY = 0, tgtX = 0, tgtY = 0, raf;
            window.addEventListener('pointermove', function (ev) {
                var r = eye.getBoundingClientRect();
                var dx = ev.clientX - (r.left + r.width / 2);
                var dy = ev.clientY - (r.top + r.height / 2);
                var ang = Math.atan2(dy, dx);
                var amt = Math.min(1, Math.hypot(dx, dy) / 320);
                // offset range scales with robot size (tuned: ~2.2% / 1.6% of width)
                var w = robot.offsetWidth || 460;
                tgtX = (w * 0.022) * Math.cos(ang) * amt;
                tgtY = (w * 0.016) * Math.sin(ang) * amt;
            }, { passive: true });

            (function loop() {
                if (playing) { tgtX = 0; tgtY = 0; }   // eye sits still during a clip
                curX += (tgtX - curX) * 0.12;
                curY += (tgtY - curY) * 0.12;
                diamond.style.transform =
                    'translate(' + curX.toFixed(2) + 'px, ' + curY.toFixed(2) + 'px)';
                raf = requestAnimationFrame(loop);
            })();
        }

        /* ---- friendly greeting shortly after load ---- */
        if (!reduce) {
            setTimeout(function () { play(CLIPS.wave, 1); }, 3000);
        }

        /* ---- confetti burst (super-duper-happy) ---- */
        function confettiBurst() {
            var canvas = document.createElement('canvas');
            canvas.style.cssText =
                'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:100001;transition:opacity .2s;';
            document.body.appendChild(canvas);
            var ctx = canvas.getContext('2d');
            if (!ctx) { canvas.remove(); return; }

            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var W = window.innerWidth, H = window.innerHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.scale(dpr, dpr);

            var colors = ['#FFFFFF', '#237DA6', '#0E9C9A', '#43AE68'];
            var bits = [];
            for (var i = 0; i < 150; i++) {
                bits.push({
                    x: Math.random() * W,
                    y: -20 - Math.random() * H * 0.5,
                    size: 8 + Math.random() * 8,
                    color: colors[Math.random() * colors.length | 0],
                    vx: (Math.random() - 0.5) * 5,
                    vy: 1 + Math.random() * 4,
                    rot: Math.random() * Math.PI,
                    vr: (Math.random() - 0.5) * 0.3
                });
            }

            var start = null;
            function frame(ts) {
                if (start === null) start = ts;
                var elapsed = ts - start;
                ctx.clearRect(0, 0, W, H);
                canvas.style.opacity = elapsed > 4000 ? Math.max(0, (4700 - elapsed) / 700) : 1;
                for (var j = 0; j < bits.length; j++) {
                    var a = bits[j];
                    a.vy += 0.13;
                    a.x += a.vx; a.y += a.vy; a.rot += a.vr;
                    ctx.save();
                    ctx.translate(a.x, a.y);
                    ctx.rotate(a.rot);
                    ctx.fillStyle = a.color;
                    ctx.fillRect(-a.size / 2, -a.size / 2, a.size, a.size);
                    ctx.restore();
                }
                if (elapsed < 4700) requestAnimationFrame(frame);
                else canvas.remove();
            }
            requestAnimationFrame(frame);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
