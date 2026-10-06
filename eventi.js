// Eventi page (eventi.html, en/events.html)
// The meeting dates and the archive are static HTML, so the page reads the
// same with or without JavaScript. This script only marks a date as held once
// it has passed (Milan time) and hides its registration link, so the page
// never invites requests for a meeting that has already taken place.
// Registration itself lives on /eventi-ai-aziende/.
(function () {
    'use strict';

    function todayInRome() {
        try {
            // en-CA formats as YYYY-MM-DD, which compares correctly as a string
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Europe/Rome',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date());
        } catch (e) {
            return new Date().toISOString().slice(0, 10);
        }
    }

    function markPastDates() {
        var today = todayInRome();
        var items = document.querySelectorAll('[data-event-date]');

        Array.prototype.forEach.call(items, function (item) {
            var date = item.getAttribute('data-event-date');
            if (!date || date >= today) return;

            item.classList.add('is-past');

            var status = item.querySelector('.signals-status');
            if (status) status.hidden = false;

            var register = item.querySelector('.signals-register');
            if (register) register.hidden = true;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', markPastDates);
    } else {
        markPastDates();
    }
})();
