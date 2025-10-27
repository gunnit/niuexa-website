// Navigation HTML content - English Version
const navigationHTML = `
<!-- Navigation -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <a href="/en/index.html">
                <div class="logo-container">
                    <img src="/img/pictogram_blue_transparent.png" alt="Niuexa" class="logo-icon">
                    <div class="logo-text">
                        <div class="logo-title">NIUEXA</div>
                        <span class="logo-tagline">From AI to ROI.</span>
                    </div>
                </div>
            </a>
        </div>
        <ul class="nav-menu">
            <li class="nav-item">
                <a href="/en/index.html" class="nav-link" data-page="home">Home</a>
            </li>
            <li class="nav-item">
                <a href="/en/about-us.html" class="nav-link" data-page="about-us">About Us</a>
            </li>
            <li class="nav-item dropdown">
                <a href="javascript:void(0)" class="nav-link dropdown-toggle" data-page="solutions">Solutions <span class="dropdown-arrow">▼</span></a>
                <ul class="dropdown-menu">
                    <li><a href="/en/consulting.html" class="dropdown-link" data-page="consulting">Consulting</a></li>
                    <li><a href="/en/training.html" class="dropdown-link" data-page="training">Training</a></li>
                    <li><a href="/en/products.html" class="dropdown-link" data-page="products">Products</a></li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <a href="javascript:void(0)" class="nav-link dropdown-toggle" data-page="resources">Resources <span class="dropdown-arrow">▼</span></a>
                <ul class="dropdown-menu">
                    <li><a href="/en/learn.html" class="dropdown-link" data-page="learn">Learn</a></li>
                    <li><a href="/en/research.html" class="dropdown-link" data-page="research">Research</a></li>
                    <li><a href="/en/roi-calculator.html" class="dropdown-link" data-page="roi-calculator">ROI Calculator</a></li>
                    <li><a href="/en/events.html" class="dropdown-link" data-page="events">Events</a></li>
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
        <div class="hamburger" role="button" aria-label="Open navigation menu" aria-expanded="false" tabindex="0">
            <span class="bar" aria-hidden="true"></span>
            <span class="bar" aria-hidden="true"></span>
            <span class="bar" aria-hidden="true"></span>
        </div>
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
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 Niuexa. All rights reserved.</p>
        </div>
    </div>
</footer>
`;

// Function to load HTML includes
function loadIncludes() {
    // Load navigation with loading state - support both placeholder IDs
    const navPlaceholder = document.getElementById('nav-placeholder') || document.getElementById('navigation-placeholder');
    if (navPlaceholder) {
        // Show loading state
        navPlaceholder.innerHTML = '<div class="loading-placeholder nav-loading" aria-label="Loading navigation">Loading navigation...</div>';

        // Simulate brief loading and then load content
        setTimeout(() => {
            try {
                navPlaceholder.innerHTML = navigationHTML;
                setActiveNavItem();
                // Initialize navigation functionality after loading
                initNavigationFunctionality();
            } catch (error) {
                console.error('Failed to load navigation:', error);
                navPlaceholder.innerHTML = '<div class="error-placeholder">Navigation failed to load. <button onclick="loadIncludes()">Retry</button></div>';
            }
        }, 100);
    }

    // Load footer with loading state
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = '<div class="loading-placeholder footer-loading" aria-label="Loading footer">Loading footer...</div>';

        setTimeout(() => {
            try {
                footerPlaceholder.innerHTML = footerHTML;
            } catch (error) {
                console.error('Failed to load footer:', error);
                footerPlaceholder.innerHTML = '<div class="error-placeholder">Footer failed to load.</div>';
            }
        }, 50);
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

        hamburger.addEventListener('click', toggleMenu);

        // Keyboard support for hamburger button
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

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

    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');

        if (dropdownToggle && dropdownMenu) {
            // Handle dropdown toggle clicks
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                dropdown.classList.toggle('active');
            });

            // Handle keyboard navigation for dropdown toggles
            dropdownToggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-item.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
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
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

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

// Load includes when DOM is ready
document.addEventListener('DOMContentLoaded', loadIncludes);
