// Consulting page (consulting.html + en/consulting.html): industry tabs.
// Follows the WAI-ARIA tabs pattern: arrow keys, Home and End move between
// tabs; only the selected tab is in the tab order.

document.addEventListener('DOMContentLoaded', initIndustryTabs);

function initIndustryTabs() {
    const tabs = Array.from(document.querySelectorAll('.tab-btn[data-tab]'));
    if (!tabs.length) return;

    function select(tab, moveFocus) {
        tabs.forEach(function (other) {
            const selected = other === tab;
            const panel = document.getElementById(other.dataset.tab);
            other.classList.toggle('active', selected);
            other.setAttribute('aria-selected', selected ? 'true' : 'false');
            other.tabIndex = selected ? 0 : -1;
            if (panel) {
                panel.classList.toggle('active', selected);
                panel.hidden = !selected;
            }
        });
        if (moveFocus) tab.focus();
    }

    tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
            select(tab, false);
        });

        tab.addEventListener('keydown', function (event) {
            let target;
            switch (event.key) {
                case 'ArrowLeft':
                    target = tabs[(index - 1 + tabs.length) % tabs.length];
                    break;
                case 'ArrowRight':
                    target = tabs[(index + 1) % tabs.length];
                    break;
                case 'Home':
                    target = tabs[0];
                    break;
                case 'End':
                    target = tabs[tabs.length - 1];
                    break;
                default:
                    return;
            }
            event.preventDefault();
            select(target, true);
        });
    });
}
