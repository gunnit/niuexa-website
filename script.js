// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality (navigation is now handled in includes.js)
    initScrollEffects();
    initAnimations();
    initContactForm();
    hideElevenLabsBranding();
});

// Function to hide ElevenLabs branding
function hideElevenLabsBranding() {
    function hideBranding() {
        const brandingElements = document.querySelectorAll('elevenlabs-convai *');
        brandingElements.forEach(function(element) {
            if (element.textContent &&
                (element.textContent.includes('Powered by ElevenLabs') ||
                 element.textContent.includes('Conversational AI'))) {
                element.style.display = 'none';
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

    // MutationObserver handles all dynamic content changes
    const observer = new MutationObserver(function() {
        hideBranding();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Run once after widget likely loaded
    setTimeout(hideBranding, 2000);
}

// Utility: debounce
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

// Scroll effects — single consolidated handler with debounce
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const heroContent = document.querySelector('.hero-content');

    const onScroll = debounce(function() {
        const scrollY = window.scrollY;

        // Navbar scroll effect
        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }

        // Parallax effect for hero content
        if (heroContent) {
            heroContent.style.transform = 'translateY(' + (scrollY * -0.5) + 'px)';
        }
    }, 10);

    window.addEventListener('scroll', onScroll, { passive: true });
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

// Counter animation — handles suffixes like "+", "%" and range text
function animateCounter(element) {
    const text = element.textContent.trim();
    const suffix = text.replace(/^[\d]+/, '');
    const target = parseInt(text);

    if (isNaN(target) || target === 0) return;

    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(function() {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
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
                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
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
                        throw new Error('Form submission failed');
                    }
                } catch (error) {
                    console.error('Form submission error:', error);
                    showMessage('Si è verificato un errore. Per favore riprova.', 'error');

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
        showMessage(errors.join('\n'), 'error');
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

    field.parentNode.appendChild(errorElement);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Show message function — uses textContent to avoid XSS
function showMessage(message, type) {
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message form-message--' + type;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageDiv.setAttribute('aria-live', 'polite');

    const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.insertBefore(messageDiv, contactForm.firstChild);
    }

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 8000);
}

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Tech grid animation enhancement
function enhanceTechGrid() {
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach((item, index) => {
        item.style.animationDelay = index * 0.2 + 's';
    });
}

setTimeout(enhanceTechGrid, 1000);

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

document.querySelectorAll('section').forEach(section => {
    lazyAnimationObserver.observe(section);
});
