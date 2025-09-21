// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFormValidation();
    initSmoothScroll();
});

// Initialize contact form
function initContactForm() {
    const form = document.querySelector('.contact-form');

    if (!form) return;

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
            Invio in corso...
            <svg class="submit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
            </svg>
        `;

        try {
            // Submit form data to Formcarry
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                showMessage('success', 'Grazie per averci contattato! Ti risponderemo entro 24 ore lavorative.');

                // Reset form
                form.reset();

                // Track conversion event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'Contact',
                        'event_label': 'Contact Form'
                    });
                }
            } else {
                throw new Error('Errore nell\'invio del modulo');
            }
        } catch (error) {
            // Show error message
            showMessage('error', 'Si è verificato un errore. Per favore riprova o contattaci direttamente.');
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
        showMessage('error', 'Per favore compila tutti i campi obbligatori correttamente.');
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

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;

    const icon = type === 'success' ? '✅' : '❌';
    messageDiv.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;

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
            }
        });
    });
}

// Add CSS for error states dynamically
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #dc3545;
        background-color: #fff5f5;
    }

    .checkbox-label.error {
        color: #dc3545;
    }

    .form-message {
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);