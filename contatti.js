// Contact Page JavaScript
// Wrapped in an IIFE so initContactForm/validateForm/showMessage
// don't collide with the globals defined in script.js.
(function() {

// Copy follows the page language: contatti.html (it, formal "Lei") and en/contact.html share this file
const isEnglish = (document.documentElement.lang || 'it').toLowerCase().startsWith('en');
const CONTACT_STRINGS = isEnglish ? {
    sending: 'Sending...',
    sendError: 'Something went wrong. Please try again or write to us directly.',
    invalid: 'Please fill in all required fields correctly.'
} : {
    sending: 'Invio in corso...',
    sendError: 'Si è verificato un errore. Riprovi o ci scriva direttamente.',
    invalid: 'Compili correttamente tutti i campi obbligatori.'
};

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFormValidation();
    initSmoothScroll();
});

// Initialize contact form
function initContactForm() {
    const form = document.querySelector('.contact-form');

    if (!form) return;

    // Guard against double binding (script.js also targets .contact-form)
    if (form.dataset.bound) return;
    form.dataset.bound = '1';
    form.dataset.niuexaAsyncForm = '1';

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitButton = form.querySelector('.btn-submit');
        const originalButtonText = submitButton.innerHTML;

        // Validate form
        if (!validateForm(form)) {
            return;
        }

        // Show loading state
        submitButton.classList.add('loading');
        submitButton.innerHTML = `
            ${CONTACT_STRINGS.sending}
            <svg class="submit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
                <path d="M21 12a9 9 0 1 1-6.2-8.56"/>
            </svg>
        `;

        try {
            // Submit form data to Web3Forms
            const formData = new FormData(form);
            formData.delete('redirect');
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
                // Content-Type auto-set by browser for FormData
            });

            const result = await response.json();
            if (response.ok && result && result.success === true) {
                if (window.NiuexaTracking && typeof window.NiuexaTracking.confirmSubmission === 'function') {
                    window.NiuexaTracking.confirmSubmission(form, {
                        event_category: 'Contact',
                        event_label: 'Contact Form'
                    });
                }

                // Redirect to thank you page
                window.location.href = '/thank-you-page.html';
            } else {
                throw new Error('Errore nell\'invio del modulo');
            }
        } catch (error) {
            // Show error message
            showMessage('error', CONTACT_STRINGS.sendError);
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            submitButton.classList.remove('loading');
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Form validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    // Remove previous error states
    form.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }

        // Phone validation (optional field)
        if (field.type === 'tel' && field.value) {
            const phonePattern = /^[\d\s\+\-\(\)]+$/;
            if (!phonePattern.test(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }
    });

    // Check privacy checkbox
    const privacyCheckbox = form.querySelector('input[name="privacy"]');
    if (!privacyCheckbox.checked) {
        privacyCheckbox.parentElement.classList.add('error');
        isValid = false;
    }

    if (!isValid) {
        showMessage('error', CONTACT_STRINGS.invalid);
    }

    return isValid;
}

// Initialize real-time form validation
function initFormValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Remove error on focus
        input.addEventListener('focus', function() {
            this.classList.remove('error');
            if (this.parentElement.classList.contains('checkbox-label')) {
                this.parentElement.classList.remove('error');
            }
        });

        // Validate on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });

        // Real-time validation for email
        if (input.type === 'email') {
            input.addEventListener('input', function() {
                if (this.value) {
                    validateField(this);
                }
            });
        }
    });
}

// Validate individual field
function validateField(field) {
    // Required field validation
    if (field.hasAttribute('required') && !field.value.trim()) {
        field.classList.add('error');
        return false;
    }

    // Email validation
    if (field.type === 'email' && field.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(field.value)) {
            field.classList.add('error');
            return false;
        }
    }

    // Phone validation
    if (field.type === 'tel' && field.value) {
        const phonePattern = /^[\d\s\+\-\(\)]+$/;
        if (!phonePattern.test(field.value)) {
            field.classList.add('error');
            return false;
        }
    }

    field.classList.remove('error');
    return true;
}

// Show success/error messages
function showMessage(type, message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element (drawn icon, text set as text, announced to screen readers)
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');

    const iconPath = type === 'success'
        ? '<polyline points="20 6 9 17 4 12"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
    messageDiv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPath}</svg><span></span>`;
    messageDiv.querySelector('span').textContent = message;

    // Insert message
    const formColumn = document.querySelector('.form-column');
    const formHeader = document.querySelector('.form-header');
    formColumn.insertBefore(messageDiv, formHeader.nextSibling);

    // Auto-remove message after 10 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 10000);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize smooth scroll for internal links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Move keyboard focus with the scroll: first field of a form, else the target itself
                const field = targetElement.querySelector('input:not([type="hidden"]), select, textarea');
                if (field) {
                    field.focus({ preventScroll: true });
                } else {
                    if (!targetElement.hasAttribute('tabindex')) targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus({ preventScroll: true });
                }
            }
        });
    });
}

// Error and message styles live in contatti.css (tokens from styles.css).

})();
