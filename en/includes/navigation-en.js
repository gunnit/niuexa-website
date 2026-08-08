// Navigation HTML content - English Version
const navigationHTML = `
<!-- Skip Navigation -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- Navigation -->
<nav class="navbar" aria-label="Main navigation">
    <div class="nav-container">
        <div class="nav-logo">
            <a href="/en/index.html">
                <div class="logo-container">
                    <img src="/img/pictogram_blue_transparent.png" alt="Niuexa" class="logo-icon" width="40" height="40" loading="eager">
                    <div class="logo-text">
                        <div class="logo-title">NIUEXA</div>
                        <span class="logo-tagline">AI Solutions</span>
                    </div>
                </div>
            </a>
        </div>
        <ul class="nav-menu" id="nav-menu">
            <li class="nav-item">
                <a href="/en/index.html" class="nav-link" data-page="home">Home</a>
            </li>
            <li class="nav-item">
                <a href="/en/about-us.html" class="nav-link" data-page="about-us">About Us</a>
            </li>
            <li class="nav-item dropdown">
                <button type="button" class="nav-link dropdown-toggle" data-page="solutions" aria-expanded="false" aria-haspopup="true" aria-controls="dropdown-solutions">Solutions <span class="dropdown-arrow" aria-hidden="true">▼</span></button>
                <ul class="dropdown-menu" id="dropdown-solutions">
                    <li><a href="/en/consulting.html" class="dropdown-link" data-page="consulting">Consulting</a></li>
                    <li><a href="/en/training.html" class="dropdown-link" data-page="training">Training</a></li>
                    <li><a href="/en/products.html" class="dropdown-link" data-page="products">Products</a></li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <button type="button" class="nav-link dropdown-toggle" data-page="resources" aria-expanded="false" aria-haspopup="true" aria-controls="dropdown-resources">Resources <span class="dropdown-arrow" aria-hidden="true">▼</span></button>
                <ul class="dropdown-menu" id="dropdown-resources">
                    <li><a href="/en/learn.html" class="dropdown-link" data-page="learn">Learn</a></li>
                    <li><a href="/en/research.html" class="dropdown-link" data-page="research">Research</a></li>
                    <li><a href="/en/roi-calculator.html" class="dropdown-link" data-page="roi-calculator">ROI Calculator</a></li>
                    <li><a href="/en/events.html" class="dropdown-link" data-page="events">Events</a></li>
                    <li><a href="/resources.html" class="dropdown-link" data-page="free-resources">Free Resources</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <a href="/en/contact.html" class="nav-link" data-page="contact">Contact</a>
            </li>
            <li class="nav-item">
                <a href="/en/login.html" class="nav-link login-link" data-page="login">🔐 Login</a>
            </li>
            <li class="nav-item language-switcher">
                <a href="/index.html" class="nav-link" title="Switch to Italian">🇮🇹 IT</a>
            </li>
        </ul>
        <button type="button" class="hamburger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="nav-menu">
            <span class="bar" aria-hidden="true"></span>
            <span class="bar" aria-hidden="true"></span>
            <span class="bar" aria-hidden="true"></span>
        </button>
    </div>
</nav>
`;

// Footer HTML content - English Version
const footerHTML = `
<!-- Footer -->
<footer class="footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-brand">
                <h3>NIUEXA</h3>
                <p>Advanced AI Solutions for Your Business.</p>
            </div>
            <div class="footer-links">
                <div class="footer-column">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="/en/consulting.html">AI Consulting</a></li>
                        <li><a href="/en/training.html">AI Training</a></li>
                        <li><a href="/en/products.html">AI Products</a></li>
                        <li><a href="/en/roi-calculator.html">ROI Calculator</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="/en/learn.html">Learn</a></li>
                        <li><a href="/en/research.html">Research</a></li>
                        <li><a href="/en/roi-calculator.html">ROI Calculator</a></li>
                        <li><a href="/en/events.html">Events</a></li>
                        <li><a href="/resources.html">Free Resources</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="/en/about-us.html">About Us</a></li>
                        <li><a href="/en/careers.html">Careers</a></li>
                        <li><a href="/en/contact.html">Contact</a></li>
                        <li><a href="/en/index.html#contact">Talk to Us</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Social</h4>
                    <ul>
                        <li><a href="https://linkedin.com/company/niuexa" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                        <li><a href="https://discord.gg/vyKckeS3" target="_blank" rel="noopener noreferrer">Discord Community</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="/en/privacy-policy.html">Privacy Policy</a></li>
                        <li><a href="/en/cookie-policy.html">Cookie Policy</a></li>
                        <li><a href="/en/terms-of-service.html">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="footer-bottom-content">
                <p class="footer-copyright">&copy; 2024-2026 Niuexa. All rights reserved.</p>
                <p class="footer-company">Niuexa is a BU of Bebit Srl - VAT No. 11215720019</p>
            </div>
        </div>
    </div>
</footer>
`;

// Function to load HTML includes
function loadIncludes() {
    // Load navigation - support both placeholder IDs
    const navPlaceholder = document.getElementById('nav-placeholder') || document.getElementById('navigation-placeholder');
    // Both markup blocks are static strings in this file, so there is nothing
    // to wait for. The old setTimeout(100)/setTimeout(50) only delayed paint
    // and made the swap from the loading box visible as a layout jump.
    if (navPlaceholder) {
        try {
            navPlaceholder.innerHTML = navigationHTML;
            setActiveNavItem();
            // Initialize navigation functionality after loading
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
    } else if (page === 'about-us.html') {
        return 'about-us';
    } else if (page === 'consulting.html') {
        return 'consulting';
    } else if (page === 'training.html') {
        return 'training';
    } else if (page === 'products.html') {
        return 'products';
    } else if (page === 'learn.html') {
        return 'learn';
    } else if (page === 'research.html') {
        return 'research';
    } else if (page === 'roi-calculator.html') {
        return 'roi-calculator';
    } else if (page === 'events.html') {
        return 'events';
    } else if (page === 'careers.html') {
        return 'careers';
    } else if (page === 'contact.html') {
        return 'contact';
    } else if (page === 'login.html') {
        return 'login';
    }

    return 'home';
}

// Reveal-on-scroll animations (mirrors /includes/includes.js for EN pages).
// See styles.css `.js-animations` rules — without this class, cards stay
// at full opacity by default (safe), and with it they fade in.
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
});
