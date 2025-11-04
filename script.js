// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality (navigation is now handled in includes.js)
    initScrollEffects();
    initAnimations();
    initContactForm();
    initServiceCards();
    hideElevenLabsBranding();
    initFormcarryRedirection();
});

// Function to hide ElevenLabs branding
function hideElevenLabsBranding() {
    // Wait for widget to load and then hide branding
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Look for any elements containing the branding text
                const brandingElements = document.querySelectorAll('elevenlabs-convai *');
                brandingElements.forEach(function(element) {
                    if (element.textContent && 
                        (element.textContent.includes('Powered by ElevenLabs') || 
                         element.textContent.includes('Conversational AI'))) {
                        element.style.display = 'none';
                        // Also hide parent elements that might contain the branding
                        let parent = element.parentElement;
                        while (parent && parent.tagName !== 'ELEVENLABS-CONVAI') {
                            if (parent.textContent.includes('Powered by ElevenLabs')) {
                                parent.style.display = 'none';
                                break;
                            }
                            parent = parent.parentElement;
                        }
                    }
                });
                
                // Also check for shadow DOM
                const convaiElement = document.querySelector('elevenlabs-convai');
                if (convaiElement && convaiElement.shadowRoot) {
                    const shadowBranding = convaiElement.shadowRoot.querySelectorAll('*');
                    shadowBranding.forEach(function(element) {
                        if (element.textContent && 
                            (element.textContent.includes('Powered by ElevenLabs') || 
                             element.textContent.includes('Conversational AI'))) {
                            element.style.display = 'none';
                        }
                    });
                }
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also run immediately in case widget is already loaded
    setTimeout(function() {
        const brandingElements = document.querySelectorAll('elevenlabs-convai *');
        brandingElements.forEach(function(element) {
            if (element.textContent && 
                (element.textContent.includes('Powered by ElevenLabs') || 
                 element.textContent.includes('Conversational AI'))) {
                element.style.display = 'none';
            }
        });
    }, 2000);
    
    // Run periodically to catch any dynamically loaded content
    setInterval(function() {
        const brandingElements = document.querySelectorAll('elevenlabs-convai *');
        brandingElements.forEach(function(element) {
            if (element.textContent && 
                (element.textContent.includes('Powered by ElevenLabs') || 
                 element.textContent.includes('Conversational AI'))) {
                element.style.display = 'none';
            }
        });
    }, 5000);
}

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
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : '';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
                submitButton.setAttribute('aria-busy', 'true');
            }

            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Validate form
            if (validateForm(formObject)) {
                try {
                    // Submit form data to Formcarry
                    console.log('Submitting to:', this.action);
                    console.log('Form data:', formObject);

                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData
                        // Let browser auto-set Content-Type for FormData
                    });

                    console.log('Response status:', response.status);
                    console.log('Response OK:', response.ok);

                    if (response.ok) {
                        console.log('Form submitted successfully to Formcarry');

                        // Track conversion event
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'form_submit', {
                                'event_category': 'Contact',
                                'event_label': 'Homepage Contact Form'
                            });
                        }

                        // Redirect to thank you page
                        window.location.href = 'thank-you-page.html';
                    } else {
                        const errorData = await response.text();
                        console.error('Formcarry response error:', errorData);
                        throw new Error('Form submission failed');
                    }
                } catch (error) {
                    console.error('Form submission error:', error);
                    showMessage('There was an error sending your message. Please try again.', 'error');

                    // Reset button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                        submitButton.removeAttribute('aria-busy');
                    }
                }
            } else {
                // Reset button on validation error
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    submitButton.removeAttribute('aria-busy');
                }
            }
        });
        
        // Real-time validation feedback
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // Clear error state on input
                clearFieldError(this);
            });
        });
    }
}

// Form validation
function validateForm(data) {
    const errors = [];

    // Check firstName and lastName (homepage form)
    if (data.firstName !== undefined) {
        if (!data.firstName || data.firstName.trim().length < 2) {
            errors.push('Per favore inserisci un nome valido');
        }
        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push('Per favore inserisci un cognome valido');
        }
        if (!data.company || data.company.trim().length < 2) {
            errors.push('Per favore inserisci il nome dell\'azienda');
        }
        if (!data.service) {
            errors.push('Per favore seleziona un servizio');
        }
    }
    // Check name field (other forms)
    else if (data.name !== undefined) {
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Per favore inserisci un nome valido');
        }
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Per favore inserisci un indirizzo email valido');
    }

    if (!data.message || data.message.trim().length < 10) {
        errors.push('Per favore inserisci un messaggio di almeno 10 caratteri');
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

// Individual field validation
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearFieldError(field);

    switch (fieldName) {
        case 'name':
        case 'firstName':
        case 'lastName':
            if (!value || value.length < 2) {
                isValid = false;
                errorMessage = 'Per favore inserisci almeno 2 caratteri';
            }
            break;
        case 'company':
            if (!value || value.length < 2) {
                isValid = false;
                errorMessage = 'Per favore inserisci il nome dell\'azienda';
            }
            break;
        case 'service':
            if (!value) {
                isValid = false;
                errorMessage = 'Per favore seleziona un servizio';
            }
            break;
        case 'email':
            if (!value || !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Per favore inserisci un indirizzo email valido';
            }
            break;
        case 'message':
            if (!value || value.length < 10) {
                isValid = false;
                errorMessage = 'Per favore inserisci almeno 10 caratteri';
            }
            break;
        case 'phone':
            if (value && !isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Per favore inserisci un numero di telefono valido';
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.style.cssText = `
        color: #721c24;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    field.parentNode.appendChild(errorElement);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
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
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageDiv.setAttribute('aria-live', 'polite');
    
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
    const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.insertBefore(messageDiv, contactForm.firstChild);
    }
    
    // Remove message after 8 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 8000);
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

// Formcarry form redirection functionality
function initFormcarryRedirection() {
    // Find all forms that use Formcarry
    const formcarryForms = document.querySelectorAll('form[action*="formcarry.com"]');
    
    formcarryForms.forEach(form => {
        // Check if redirect field already exists to avoid duplicates
        const existingRedirect = form.querySelector('input[name="_redirect"]');
        if (!existingRedirect) {
            // Add redirect field immediately when page loads, not on submit
            const redirectField = document.createElement('input');
            redirectField.type = 'hidden';
            redirectField.name = '_redirect';
            redirectField.value = 'https://niuexa.ai/thank-you-page';
            form.appendChild(redirectField);
        }
    });
}
