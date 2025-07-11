// Navigation HTML content
const navigationHTML = `
<!-- Navigation -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <a href="index.html"><h1>NIUEXA</h1></a>
        </div>
        <ul class="nav-menu">
            <li class="nav-item">
                <a href="index.html" class="nav-link" data-page="home">Home</a>
            </li>
            <li class="nav-item">
                <a href="index.html#company" class="nav-link" data-page="company">Chi Siamo</a>
            </li>
            <li class="nav-item">
                <a href="consulting.html" class="nav-link" data-page="consulting">Consulenza</a>
            </li>
            <li class="nav-item">
                <a href="training.html" class="nav-link" data-page="training">Formazione</a>
            </li>
            <li class="nav-item">
                <a href="products.html" class="nav-link" data-page="products">Prodotti</a>
            </li>
            <li class="nav-item">
                <a href="roi-calculator.html" class="nav-link" data-page="roi-calculator">Calcolatore ROI</a>
            </li>
            <li class="nav-item">
                <a href="index.html#contact" class="nav-link" data-page="contact">Contatti</a>
            </li>
            <li class="nav-item">
                <a href="login.html" class="nav-link login-link" data-page="login">🔐 Login</a>
            </li>
        </ul>
        <div class="hamburger">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </div>
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
                <h3>NIUEXA</h3>
                <p>Soluzioni AI Avanzate per il Business Moderno</p>
            </div>
            <div class="footer-links">
                <div class="footer-column">
                    <h4>Servizi</h4>
                    <ul>
                        <li><a href="consulting.html">Consulenza AI</a></li>
                        <li><a href="training.html">Formazione AI</a></li>
                        <li><a href="products.html">Prodotti AI</a></li>
                        <li><a href="roi-calculator.html">ROI Calculator</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Azienda</h4>
                    <ul>
                        <li><a href="index.html#company">Chi Siamo</a></li>
                        <li><a href="index.html#contact">Contatti</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Social</h4>
                    <ul>
                        <li><a href="https://linkedin.com/company/niuexa" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 Niuexa. Tutti i diritti riservati.</p>
        </div>
    </div>
</footer>
`;

// Function to load HTML includes
function loadIncludes() {
    // Load navigation
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = navigationHTML;
        setActiveNavItem();
        // Initialize navigation functionality after loading
        initNavigationFunctionality();
    }

    // Load footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }
}

// Navigation functionality initialization
function initNavigationFunctionality() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        // Toggle mobile menu
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
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
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

// Function to get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === 'index.html' || page === '') {
        return 'home';
    } else if (page === 'consulting.html') {
        return 'consulting';
    } else if (page === 'training.html') {
        return 'training';
    } else if (page === 'products.html') {
        return 'products';
    } else if (page === 'roi-calculator.html') {
        return 'roi-calculator';
    } else if (page === 'login.html') {
        return 'login';
    }
    
    return 'home';
}

// Load includes when DOM is ready
document.addEventListener('DOMContentLoaded', loadIncludes);
