// Form copy follows the page language (Italian pages address the reader with "Lei")
const FORM_STRINGS = {
    it: {
        sending: 'Invio in corso…',
        sendError: 'Invio non riuscito. Controlli la connessione e riprovi, oppure ci scriva dalla pagina contatti.',
        firstName: 'Inserisca il nome (almeno 2 caratteri).',
        lastName: 'Inserisca il cognome (almeno 2 caratteri).',
        name: 'Inserisca il nome (almeno 2 caratteri).',
        minChars: 'Inserisca almeno 2 caratteri.',
        company: 'Inserisca il nome dell\'azienda.',
        service: 'Scelga un\'area di interesse.',
        email: 'Inserisca un indirizzo email valido, per esempio nome@azienda.it.',
        message: 'Descriva la Sua richiesta in almeno 10 caratteri.',
        messageField: 'Inserisca almeno 10 caratteri.',
        phone: 'Inserisca un numero di telefono valido, per esempio +39 02 1234567.',
        thankYou: '/thank-you-page.html',
        signupTitle: 'Grazie',
        signupText: 'Abbiamo ricevuto la Sua richiesta e Le scriveremo a breve.',
        signupError: 'Invio non riuscito. Riprovi o ci scriva a info@niuexa.ai.',
        trainingTitle: 'Parliamo della formazione per il Suo team',
        trainingSubtitle: 'Ci racconti gli obiettivi e le competenze del Suo team. Le proporremo il percorso di formazione AI più adatto.',
        trainingMessageLabel: 'Quali sono i Suoi obiettivi di formazione? *',
        trainingMessagePlaceholder: 'Es. aiutare il team commerciale a usare l’AI nel lavoro quotidiano, partendo dalle competenze attuali'
    },
    en: {
        sending: 'Sending…',
        sendError: 'Sending failed. Check your connection and try again, or write to us from the contact page.',
        firstName: 'Enter your first name (at least 2 characters).',
        lastName: 'Enter your last name (at least 2 characters).',
        name: 'Enter your name (at least 2 characters).',
        minChars: 'Enter at least 2 characters.',
        company: 'Enter your company name.',
        service: 'Choose an area of interest.',
        email: 'Enter a valid email address, for example name@company.com.',
        message: 'Describe your request in at least 10 characters.',
        messageField: 'Enter at least 10 characters.',
        phone: 'Enter a valid phone number, for example +39 02 1234567.',
        thankYou: '/en/thank-you-page.html',
        signupTitle: 'Thank you',
        signupText: 'We have received your request and will be in touch shortly.',
        signupError: 'Sending failed. Please try again or email us at info@niuexa.ai.',
        trainingTitle: 'Let’s plan your team’s AI training',
        trainingSubtitle: 'Tell us about your team’s goals and current skills. We’ll suggest a suitable AI training programme.',
        trainingMessageLabel: 'What are your training goals? *',
        trainingMessagePlaceholder: 'E.g. help the sales team use AI in their daily work, building on their current skills'
    }
};
const formT = FORM_STRINGS[(document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it'];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality (navigation is now handled in includes.js)
    initScrollEffects();
    initAnimations();
    initContactIntent();
    initContactForm();
    initSimpleSignupForms();
    hideElevenLabsBranding();
});

// Handles lead-magnet and newsletter forms that just need name+email capture.
// Any form tagged with class "simple-signup-form" gets POSTed to web3forms and
// shows an inline success message in place of the form.
function initSimpleSignupForms() {
    const forms = document.querySelectorAll('form.simple-signup-form');
    forms.forEach(function(form) {
        form.dataset.niuexaAsyncForm = '1';
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"], .btn-primary, .login-btn');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = formT.sending;
            }

            const formData = new FormData(form);
            // The provider's redirect field is for native POSTs; AJAX needs JSON.
            formData.delete('redirect');
            const emailField = form.querySelector('input[type="email"]');
            const email = emailField ? emailField.value.trim() : '';
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                if (emailField) {
                    emailField.classList.add('error');
                    emailField.setAttribute('aria-invalid', 'true');
                    emailField.focus();
                }
                return;
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                const result = await response.json();
                if (response.ok && result && result.success === true) {
                    if (window.NiuexaTracking && typeof window.NiuexaTracking.confirmSubmission === 'function') {
                        window.NiuexaTracking.confirmSubmission(form, {
                            event_category: 'Lead Capture',
                            event_label: form.dataset.formLabel || form.id || 'simple-signup'
                        });
                    }
                    const successHtml = form.dataset.successHtml ||
                        '<h3>' + formT.signupTitle + '</h3><p>' + formT.signupText + '</p>';
                    const successDiv = document.createElement('div');
                    successDiv.className = 'form-success';
                    successDiv.setAttribute('role', 'status');
                    successDiv.innerHTML = successHtml;
                    form.parentNode.replaceChild(successDiv, form);
                } else {
                    throw new Error('Submission failed with status ' + response.status);
                }
            } catch (err) {
                console.error('Signup form error:', err);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                showMessage(formT.signupError, 'error');
            }
        });
    });
}

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
    // The immersive homepage hero manages its own scroll motion in hero.js.
    // Only apply the legacy content parallax on pages without it.
    const legacyHeroContent = document.querySelector('.hero:not(.hero-immersive) .hero-content');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

        // Gentle parallax for legacy hero content only
        if (legacyHeroContent && !prefersReduced) {
            legacyHeroContent.style.transform = 'translateY(' + (scrollY * -0.18) + 'px)';
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
    const animateElements = document.querySelectorAll('.service-card, .program-card, .product-card, .use-case, .stat:not(.tutorial-stats .stat)');
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

// Training links can select a course without replacing a visitor's existing edits.
function initContactIntent() {
    const form = document.querySelector('.contact-form[data-contact-intent]');
    if (!form || form.dataset.contactIntentBound) return;
    const service = form.querySelector('[name="service"]');
    const course = form.querySelector('[name="course"]');
    const trainingFields = form.querySelector('[data-training-fields]');
    if (!service || !course || !trainingFields) return;
    form.dataset.contactIntentBound = '1';

    const section = form.closest('section');
    const title = section && section.querySelector('[data-contact-title]');
    const subtitle = section && section.querySelector('[data-contact-subtitle]');
    const message = form.querySelector('[name="message"]');
    const label = form.querySelector('label[for="message"]');
    const originals = {
        title: title && title.textContent,
        subtitle: subtitle && subtitle.textContent,
        label: label && label.textContent,
        placeholder: message && message.placeholder
    };
    const fields = trainingFields.querySelectorAll('input, select');
    const params = new URLSearchParams(window.location.search);
    const requestedCourse = params.get('course');
    const validCourse = ['executive-mastery', 'prompt-engineering', 'ai-agent-developer'].includes(requestedCourse);
    const unambiguous = params.getAll('service').length <= 1 && params.getAll('course').length <= 1;
    const trainingIntent = unambiguous && (params.has('service') ? params.get('service') === 'formazione' : validCourse);
    if (trainingIntent) {
        if (!service.value) service.value = 'formazione';
        if (service.value === 'formazione' && validCourse && !course.value) course.value = requestedCourse;
    }

    function syncTrainingFields() {
        const training = service.value === 'formazione';
        trainingFields.hidden = !training;
        fields.forEach(field => { field.disabled = !training; });
        if (title) title.textContent = training ? formT.trainingTitle : originals.title;
        if (subtitle) subtitle.textContent = training ? formT.trainingSubtitle : originals.subtitle;
        if (label) label.textContent = training ? formT.trainingMessageLabel : originals.label;
        if (message) message.placeholder = training ? formT.trainingMessagePlaceholder : originals.placeholder;
    }
    service.addEventListener('change', syncTrainingFields);
    // Disabled controls stay out of FormData, including after restoration or reset.
    form.addEventListener('submit', syncTrainingFields, true);
    form.addEventListener('reset', function() { setTimeout(syncTrainingFields, 0); });
    window.addEventListener('pageshow', syncTrainingFields);
    syncTrainingFields();
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        // Guard against double binding (contatti.js also targets .contact-form)
        if (contactForm.dataset.bound) return;
        contactForm.dataset.bound = '1';
        contactForm.dataset.niuexaAsyncForm = '1';

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            // innerHTML, not textContent: the button carries an icon that must come back
            const originalHTML = submitButton ? submitButton.innerHTML : '';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = formT.sending;
                submitButton.setAttribute('aria-busy', 'true');
            }

            // Get form data
            const formData = new FormData(this);
            formData.delete('redirect');
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

                    const result = await response.json();
                    if (response.ok && result && result.success === true) {
                        if (window.NiuexaTracking && typeof window.NiuexaTracking.confirmSubmission === 'function') {
                            window.NiuexaTracking.confirmSubmission(this, {
                                event_category: 'Contact',
                                event_label: 'Contact form ' + window.location.pathname
                            });
                        }

                        // Redirect to thank you page
                        window.location.href = formT.thankYou;
                    } else {
                        throw new Error('Form submission failed');
                    }
                } catch (error) {
                    console.error('Form submission error:', error);
                    showMessage(formT.sendError, 'error');

                    // Reset button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalHTML;
                        submitButton.removeAttribute('aria-busy');
                    }
                }
            } else {
                // Reset button on validation error
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalHTML;
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
            errors.push(formT.firstName);
        }
        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push(formT.lastName);
        }
        if (!data.company || data.company.trim().length < 2) {
            errors.push(formT.company);
        }
        if (!data.service) {
            errors.push(formT.service);
        }
    }
    // Check name field (other forms)
    else if (data.name !== undefined) {
        if (!data.name || data.name.trim().length < 2) {
            errors.push(formT.name);
        }
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push(formT.email);
    }

    if (!data.message || data.message.trim().length < 10) {
        errors.push(formT.message);
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
                errorMessage = formT.minChars;
            }
            break;
        case 'company':
            if (!value || value.length < 2) {
                isValid = false;
                errorMessage = formT.company;
            }
            break;
        case 'service':
            if (!value) {
                isValid = false;
                errorMessage = formT.service;
            }
            break;
        case 'email':
            if (!value || !isValidEmail(value)) {
                isValid = false;
                errorMessage = formT.email;
            }
            break;
        case 'message':
            if (!value || value.length < 10) {
                isValid = false;
                errorMessage = formT.messageField;
            }
            break;
        case 'phone':
            if (value && !isValidPhone(value)) {
                isValid = false;
                errorMessage = formT.phone;
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
