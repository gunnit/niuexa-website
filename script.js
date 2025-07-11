// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality (navigation is now handled in includes.js)
    initScrollEffects();
    initAnimations();
    initContactForm();
    initServiceCards();
});

// Scroll effects
function initScrollEffects() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (hero && heroContent) {
            heroContent.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Intersection Observer for animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .program-card, .product-card, .use-case, .stat');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Counter animation for stats
    const stats = document.querySelectorAll('.stat h3');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.textContent);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(function() {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '') + (element.textContent.includes('%') ? '%' : '');
    }, 16);
}

// Service cards interaction
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Product cards interaction
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Validate form
            if (validateForm(formObject)) {
                // Show success message
                showMessage('Thank you for your message! We will get back to you soon.', 'success');
                
                // Reset form
                this.reset();
                
                // In a real application, you would send the data to a server
                console.log('Form submitted:', formObject);
            }
        });
    }
}

// Form validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Please enter a valid name');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Please enter a message with at least 10 characters');
    }
    
    if (errors.length > 0) {
        showMessage(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message function
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = message;
    
    // Style the message
    messageDiv.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        font-weight: 500;
        ${type === 'success' 
            ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
            : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    
    // Insert message
    const contactForm = document.getElementById('contactForm');
    contactForm.insertBefore(messageDiv, contactForm.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Smooth reveal animations
function addRevealAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .service-card,
        .program-card,
        .product-card,
        .use-case,
        .stat {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .service-card.animate-in,
        .program-card.animate-in,
        .product-card.animate-in,
        .use-case.animate-in,
        .stat.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .service-card.animate-in {
            transition-delay: 0.1s;
        }
        
        .service-card:nth-child(2).animate-in {
            transition-delay: 0.2s;
        }
        
        .service-card:nth-child(3).animate-in {
            transition-delay: 0.3s;
        }
        
        .program-card.animate-in {
            transition-delay: 0.1s;
        }
        
        .program-card:nth-child(2).animate-in {
            transition-delay: 0.2s;
        }
        
        .program-card:nth-child(3).animate-in {
            transition-delay: 0.3s;
        }
        
        .product-card.animate-in {
            transition-delay: 0.1s;
        }
        
        .product-card:nth-child(2).animate-in {
            transition-delay: 0.2s;
        }
        
        .product-card:nth-child(3).animate-in {
            transition-delay: 0.3s;
        }
        
        .product-card:nth-child(4).animate-in {
            transition-delay: 0.4s;
        }
    `;
    document.head.appendChild(style);
}

// Initialize reveal animations
addRevealAnimations();

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler is now handled in includes.js for navigation

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add loading styles
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
        body:not(.loaded) {
            overflow: hidden;
        }
        
        body:not(.loaded) .hero-title,
        body:not(.loaded) .hero-subtitle,
        body:not(.loaded) .hero-buttons {
            opacity: 0;
            transform: translateY(30px);
        }
        
        body.loaded .hero-title,
        body.loaded .hero-subtitle,
        body.loaded .hero-buttons {
            animation: fadeInUp 1s ease forwards;
        }
        
        body.loaded .hero-subtitle {
            animation-delay: 0.2s;
        }
        
        body.loaded .hero-buttons {
            animation-delay: 0.4s;
        }
    `;
    document.head.appendChild(loadingStyle);
});

// Tech grid animation enhancement
function enhanceTechGrid() {
    const gridItems = document.querySelectorAll('.grid-item');
    
    gridItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

// Initialize tech grid enhancements
setTimeout(enhanceTechGrid, 1000);

// Sphere animation enhancement
function enhanceSphere() {
    const sphereCore = document.querySelector('.sphere-core');
    
    if (sphereCore) {
        sphereCore.addEventListener('mouseenter', function() {
            this.style.animationDuration = '1s';
        });
        
        sphereCore.addEventListener('mouseleave', function() {
            this.style.animationDuration = '2s';
        });
    }
}

// Initialize sphere enhancements
setTimeout(enhanceSphere, 1000);

// Add custom cursor effect for interactive elements
function addCustomCursor() {
    const interactiveElements = document.querySelectorAll('.btn, .service-card, .product-card, .nav-link');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            document.body.style.cursor = 'pointer';
        });
        
        element.addEventListener('mouseleave', function() {
            document.body.style.cursor = 'default';
        });
    });
}

// Initialize custom cursor
addCustomCursor();

// Performance optimization: Lazy load animations
const lazyAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '50px'
});

// Observe sections for lazy animation loading
document.querySelectorAll('section').forEach(section => {
    lazyAnimationObserver.observe(section);
});
