// Tutorial hub (impara.html, en/learn.html): the area cards filter the list.
// Each area card is a toggle button (aria-pressed). Pressing one shows only
// the tutorials with a matching data-area; pressing it again, or the reset
// button, shows the full list. The status line announces the result.

document.addEventListener('DOMContentLoaded', function () {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.category-card[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.tutorials-grid .tutorial-card[data-area]'));
    var status = document.getElementById('tutorials-status');
    var reset = document.querySelector('.tutorials-reset');
    var list = document.getElementById('featured-tutorials');

    if (!buttons.length || !cards.length || !status) {
        return;
    }

    var isEnglish = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
    var total = cards.length;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function describe(shown, areaName) {
        if (isEnglish) {
            return shown + ' of ' + total + ' tutorials: ' + areaName;
        }
        return shown + ' tutorial su ' + total + ': ' + areaName;
    }

    function apply(filter, areaName) {
        var shown = 0;
        cards.forEach(function (card) {
            var match = !filter || card.getAttribute('data-area') === filter;
            card.hidden = !match;
            if (match) {
                shown += 1;
            }
        });

        buttons.forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter));
        });

        status.textContent = filter ? describe(shown, areaName) : status.getAttribute('data-all');
        if (reset) {
            reset.hidden = !filter;
        }
    }

    function bringListIntoView() {
        if (!list) {
            return;
        }
        var top = list.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.6 || top < 0) {
            list.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            var filter = button.getAttribute('data-filter');
            var active = button.getAttribute('aria-pressed') === 'true';
            var name = button.querySelector('.category-name');
            apply(active ? null : filter, name ? name.textContent : filter);
            if (!active) {
                bringListIntoView();
            }
        });
    });

    if (reset) {
        reset.addEventListener('click', function () {
            apply(null, '');
            // The reset button hides itself: keep keyboard focus in the list
            var first = cards[0].querySelector('a');
            if (first) {
                first.focus({ preventScroll: true });
            }
        });
    }
});
