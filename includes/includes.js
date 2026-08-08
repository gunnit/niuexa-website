// Navigation HTML content
const navigationHTML = `
<!-- Skip Navigation -->
<a href="#main-content" class="skip-link">Vai al contenuto principale</a>
<!-- Navigation -->
<nav class="navbar" aria-label="Navigazione principale">
    <div class="nav-container">
        <div class="nav-logo">
            <a href="/">
                <div class="logo-container">
                    <img src="/img/pictogram_blue_transparent.png" alt="Niuexa - AI Solutions" class="logo-icon" width="40" height="40" loading="eager">
                    <div class="logo-text">
                        <div class="logo-title">NIUEXA</div>
                        <span class="logo-tagline">AI Solutions</span>
                    </div>
                </div>
            </a>
        </div>
        <ul class="nav-menu" id="nav-menu">
            <li class="nav-item">
                <a href="/" class="nav-link" data-page="home">Home</a>
            </li>
            <li class="nav-item">
                <a href="/chi-siamo.html" class="nav-link" data-page="chi-siamo">Chi Siamo</a>
            </li>
            <li class="nav-item dropdown">
                <button type="button" class="nav-link dropdown-toggle" data-page="soluzioni" aria-expanded="false" aria-haspopup="true" aria-controls="dropdown-soluzioni">Soluzioni <span class="dropdown-arrow" aria-hidden="true">▼</span></button>
                <ul class="dropdown-menu" id="dropdown-soluzioni">
                    <li><a href="/consulting.html" class="dropdown-link" data-page="consulting">Consulenza</a></li>
                    <li><a href="/training.html" class="dropdown-link" data-page="training">Formazione</a></li>
                    <li><a href="/products.html" class="dropdown-link" data-page="products">Prodotti</a></li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <button type="button" class="nav-link dropdown-toggle" data-page="risorse" aria-expanded="false" aria-haspopup="true" aria-controls="dropdown-risorse">Risorse <span class="dropdown-arrow" aria-hidden="true">▼</span></button>
                <ul class="dropdown-menu" id="dropdown-risorse">
                    <li><a href="/impara.html" class="dropdown-link" data-page="impara">Impara</a></li>
                    <li><a href="/research.html" class="dropdown-link" data-page="research">Ricerca</a></li>
                    <li><a href="/roi-calculator.html" class="dropdown-link" data-page="roi-calculator">Calcolatore ROI</a></li>
                    <li><a href="/eventi.html" class="dropdown-link" data-page="eventi">Eventi</a></li>
                    <li><a href="/resources.html" class="dropdown-link" data-page="resources">Risorse Gratuite</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <a href="/contatti.html" class="nav-link" data-page="contatti">Contatti</a>
            </li>
            <li class="nav-item">
                <a href="https://aeo.niuexa.ai" class="nav-link login-link" target="_blank" rel="noopener noreferrer">🔐 Login</a>
            </li>
            <li class="nav-item language-switcher">
                <a href="/en/index.html" class="nav-link" title="Switch to English">🇬🇧 EN</a>
            </li>
        </ul>
        <button type="button" class="hamburger" aria-label="Apri menu di navigazione" aria-expanded="false" aria-controls="nav-menu">
            <span class="bar" aria-hidden="true"></span>
            <span class="bar" aria-hidden="true"></span>
            <span class="bar" aria-hidden="true"></span>
        </button>
    </div>
</nav>
`;

// Footer HTML content
const footerHTML = `
<!-- Footer -->
<footer class="footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-brand">
                <h2>NIUEXA</h2>
                <p>Soluzioni AI Avanzate per il tuo Business.</p>
            </div>
            <div class="footer-links">
                <div class="footer-column">
                    <h3>Servizi</h3>
                    <ul>
                        <li><a href="/consulting.html">Consulenza AI</a></li>
                        <li><a href="/training.html">Formazione AI</a></li>
                        <li><a href="/products.html">Prodotti AI</a></li>
                        <li><a href="/roi-calculator.html">ROI Calculator</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Risorse</h3>
                    <ul>
                        <li><a href="/impara.html">Impara</a></li>
                        <li><a href="/research.html">Ricerca</a></li>
                        <li><a href="/roi-calculator.html">Calcolatore ROI</a></li>
                        <li><a href="/eventi.html">Eventi</a></li>
                        <li><a href="/resources.html">Risorse Gratuite</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Azienda</h3>
                    <ul>
                        <li><a href="/chi-siamo.html">Chi Siamo</a></li>
                        <li><a href="/carriere.html">Carriere</a></li>
                        <li><a href="/contatti.html">Contatti</a></li>
                        <li><a href="/#contact">Parla con Noi</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Social</h3>
                    <ul>
                        <li><a href="https://linkedin.com/company/niuexa" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                        <li><a href="https://discord.gg/vyKckeS3" target="_blank" rel="noopener noreferrer">Discord Community</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Legale</h3>
                    <ul>
                        <li><a href="/privacy-policy.html">Privacy Policy</a></li>
                        <li><a href="/cookie-policy.html">Cookie Policy</a></li>
                        <li><a href="/terms-of-service.html">Termini di Servizio</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="footer-bottom-content">
                <p class="footer-copyright">&copy; 2024-2026 Niuexa. Tutti i diritti riservati.</p>
                <p class="footer-company">Niuexa è una BU di Bebit Srl - P.I. 11215720019</p>
            </div>
        </div>
    </div>
</footer>
`;

// Function to load HTML includes
function loadIncludes() {
    // Load navigation with loading state - support both placeholder IDs
    const navPlaceholder = document.getElementById('nav-placeholder') || document.getElementById('navigation-placeholder');
    // Both markup blocks are static strings in this file, so there is nothing
    // to wait for. The old setTimeout(100)/setTimeout(50) only delayed paint
    // and made the swap from the loading box visible as a layout jump.
    if (navPlaceholder) {
        try {
            navPlaceholder.innerHTML = navigationHTML;
            setActiveNavItem();
            initNavigationFunctionality();
        } catch (error) {
            console.error('Failed to load navigation:', error);
            navPlaceholder.innerHTML = '<div class="error-placeholder">Navigation failed to load. <button onclick="loadIncludes()">Retry</button></div>';
        }
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        try {
            footerPlaceholder.innerHTML = footerHTML;
        } catch (error) {
            console.error('Failed to load footer:', error);
            footerPlaceholder.innerHTML = '<div class="error-placeholder">Footer failed to load.</div>';
        }
    }
}

// Navigation functionality initialization
function initNavigationFunctionality() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        // Toggle mobile menu
        function toggleMenu() {
            const isActive = hamburger.classList.contains('active');
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Update ARIA attributes
            hamburger.setAttribute('aria-expanded', !isActive);
            
            // Focus management
            if (!isActive) {
                // Menu is opening - focus first link
                const firstLink = navMenu.querySelector('a');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            }
        }
        
        // A <button> already activates on Enter and Space, so a keydown
        // handler here would toggle the menu twice per keypress.
        hamburger.addEventListener('click', toggleMenu);


        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });
    }

    // Handle dropdown functionality
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');

    // The toggle is a <button> carrying aria-expanded, so the open/closed state
    // has to be written to the attribute everywhere the class changes —
    // otherwise a screen reader announces "collapsed" over an open menu.
    function setDropdown(dropdown, open) {
        dropdown.classList.toggle('active', open);
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', String(open));
    }

    function closeAllDropdowns(except) {
        dropdowns.forEach(dropdown => {
            if (dropdown !== except) setDropdown(dropdown, false);
        });
    }

    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');

        if (dropdownToggle && dropdownMenu) {
            // Handle dropdown toggle clicks. A <button> fires click on both
            // Enter and Space, so no separate keydown handler is needed for
            // activation — only for Escape.
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const willOpen = !dropdown.classList.contains('active');
                closeAllDropdowns(dropdown);
                setDropdown(dropdown, willOpen);
            });

            // Escape closes the open dropdown and returns focus to its toggle,
            // so keyboard users are never stranded inside an invisible menu.
            dropdown.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                    e.stopPropagation();
                    setDropdown(dropdown, false);
                    dropdownToggle.focus();
                }
            });

            // Tabbing past the last link closes the menu behind you.
            dropdown.addEventListener('focusout', function(e) {
                if (!dropdown.contains(e.relatedTarget)) setDropdown(dropdown, false);
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-item.dropdown')) {
            closeAllDropdowns();
        }
    });

    // Close mobile menu when clicking on navigation links (but NOT dropdown toggles)
    const navLinksOnly = document.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link');
    navLinksOnly.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            // Close all dropdowns
            closeAllDropdowns();
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // The dropdown toggles are <button>s and carry no href at all.
            if (!href) return;

            // Only prevent default for internal anchor links (starting with #)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Update active navigation link based on scroll position
    window.addEventListener('scroll', updateActiveNavLink);
}

// Update active navigation link based on scroll
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Function to set active navigation item based on current page
function setActiveNavItem() {
    const currentPage = getCurrentPage();
    const allLinks = document.querySelectorAll('.nav-link, .dropdown-link');
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    
    allLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
            link.classList.add('active');
            
            // If it's a dropdown link, also highlight the parent dropdown
            const dropdown = link.closest('.nav-item.dropdown');
            if (dropdown) {
                const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    dropdownToggle.classList.add('active');
                }
            }
        }
    });
}

// Function to get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();


    if (page === 'index.html' || page === '') {
        return 'home';
    } else if (page === 'chi-siamo.html') {
        return 'chi-siamo';
    } else if (page === 'consulting.html') {
        return 'consulting';
    } else if (page === 'training.html') {
        return 'training';
    } else if (page === 'products.html') {
        return 'products';
    } else if (page === 'impara.html') {
        return 'impara';
    } else if (page === 'research.html') {
        return 'research';
    } else if (page === 'roi-calculator.html') {
        return 'roi-calculator';
    } else if (page === 'eventi.html') {
        return 'eventi';
    } else if (page === 'resources.html') {
        return 'resources';
    } else if (page === 'carriere.html') {
        return 'carriere';
    } else if (page === 'login.html') {
        return 'login';
    }

    return 'home';
}

// Reveal-on-scroll animations.
// Sets `js-animations` on <html> so the CSS opt-in fade rules apply, then
// observes cards and reveals them as they enter the viewport. A safety
// timer forces any still-hidden card visible after 2.5s so a flaky observer
// or hidden parent (e.g. tab content) can never strand content invisible.
function initRevealAnimations() {
    document.documentElement.classList.add('js-animations');

    const selector = '.service-card, .program-card, .product-card, .use-case, .stat';
    const targets = document.querySelectorAll(selector);
    if (!targets.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function(el) { observer.observe(el); });
    } else {
        targets.forEach(function(el) { el.classList.add('animate-in'); });
    }

    // Fail-safe: never leave cards stuck invisible.
    setTimeout(function() {
        document.querySelectorAll(selector).forEach(function(el) {
            if (!el.classList.contains('animate-in')) {
                el.classList.add('animate-in');
            }
        });
    }, 2500);
}

// Load includes when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadIncludes();
    initRevealAnimations();
    makeScrollRegionsFocusable();
});

var SCROLL_REGION_LABELS = { code: 'Blocco di codice scorrevole', table: 'Tabella scorrevole', block: 'Contenuto scorrevole' };

// Horizontally scrollable code blocks and wide tables are reachable with a
// mouse or a finger but not with a keyboard, which fails WCAG 2.1.1. Whether
// an element actually scrolls depends on the viewport, so this is decided at
// runtime and re-checked on resize rather than hard-coded into the markup.
function makeScrollRegionsFocusable() {
    var scrollRegionCounts = {};
    var candidates = document.querySelectorAll(
        'pre, table, figure, [class*="table-wrapper"], [class*="-scroll"], [class*="scroll-"]');
    Array.prototype.forEach.call(candidates, function (el) {
        // A table inside a scrolling wrapper is not itself the scroller.
        var scroller = el;
        var style = window.getComputedStyle(scroller);
        var scrolls = /(auto|scroll)/.test(style.overflowX) && scroller.scrollWidth > scroller.clientWidth + 1;

        if (scrolls) {
            if (!scroller.hasAttribute('tabindex')) scroller.setAttribute('tabindex', '0');
            // <figure> restricts which roles may override its implicit one, so
            // it gets focus and a name without a role; tabindex alone is what
            // WCAG 2.1.1 actually needs here.
            if (!scroller.hasAttribute('role') && scroller.tagName !== 'FIGURE') {
                scroller.setAttribute('role', 'region');
            }
            if (!scroller.hasAttribute('aria-label')) {
                // Landmarks of the same role must have distinct names, so the
                // label is numbered — a page with six scrollable code blocks
                // would otherwise expose six identically-named regions.
                var kind = scroller.tagName === 'PRE' ? 'code'
                    : (scroller.tagName === 'TABLE' || scroller.querySelector('table')) ? 'table'
                    : 'block';
                scrollRegionCounts[kind] = (scrollRegionCounts[kind] || 0) + 1;
                scroller.setAttribute('aria-label',
                    SCROLL_REGION_LABELS[kind] + ' ' + scrollRegionCounts[kind]);
            }
        } else if (scroller.getAttribute('data-scroll-region') === 'auto') {
            scroller.removeAttribute('tabindex');
            scroller.removeAttribute('role');
            scroller.removeAttribute('aria-label');
        }
        if (scrolls) scroller.setAttribute('data-scroll-region', 'auto');
    });
}

var scrollRegionTimer;
window.addEventListener('resize', function () {
    clearTimeout(scrollRegionTimer);
    scrollRegionTimer = setTimeout(makeScrollRegionsFocusable, 200);
});
