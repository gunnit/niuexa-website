// AI Readiness Tool Form Handler

document.addEventListener('DOMContentLoaded', function() {
    initAIReadinessForm();
    initFormValidation();
});

// Initialize AI Readiness form
function initAIReadinessForm() {
    const form = document.querySelector('.ai-readiness-form');

    if (!form) return;
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
        submitButton.style.opacity = '0.7';
        submitButton.style.cursor = 'not-allowed';
        submitButton.innerHTML = `
            Invio in corso...
            <svg style="animation: spin 1s linear infinite;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
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
                    window.NiuexaTracking.confirmSubmission(form);
                }

                // Redirect to AI Readiness thank you page
                window.location.href = 'thank-you-ai-readiness.html';
            } else {
                throw new Error('Errore nell\'invio del modulo');
            }
        } catch (error) {
            // Show error message
            showMessage('error', 'Invio non riuscito. Riprovi tra qualche istante oppure ci scriva dalla pagina contatti.');
            console.error('Form submission error:', error);

            // Reset button state
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
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
        if (field.type === 'checkbox') {
            if (!field.checked) {
                field.parentElement.classList.add('error');
                isValid = false;
            }
        } else if (!field.value.trim()) {
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

        // URL validation (optional field)
        if (field.type === 'url' && field.value) {
            const urlPattern = /^https?:\/\/.+\..+/;
            if (!urlPattern.test(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }
    });

    if (!isValid) {
        showMessage('error', 'Controlli i campi evidenziati: sono obbligatori o non nel formato corretto.');
    }

    return isValid;
}

// Initialize real-time form validation
function initFormValidation() {
    const form = document.querySelector('.ai-readiness-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Remove error on focus
        input.addEventListener('focus', function() {
            this.classList.remove('error');
            this.parentElement.classList.remove('error');
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
    if (field.hasAttribute('required') && !field.value.trim() && field.type !== 'checkbox') {
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

    // URL validation
    if (field.type === 'url' && field.value) {
        const urlPattern = /^https?:\/\/.+\..+/;
        if (!urlPattern.test(field.value)) {
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
    // Styled by .form-message--success / --error in styles.css (tokens)
    messageDiv.className = `form-message form-message--${type}`;
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageDiv.textContent = message;

    // Insert message at top of form
    const form = document.querySelector('.ai-readiness-form');
    form.insertBefore(messageDiv, form.firstChild);

    // Auto-remove message after 10 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 10000);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add CSS animation for spinning loader.
// Named distinctly because cookie-banner.js also declares a top-level `style`
// in the same global scope; a shared name made one of the two scripts die with
// "Identifier 'style' has already been declared".
const readinessToolStyle = document.createElement('style');
readinessToolStyle.textContent = `
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
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
document.head.appendChild(readinessToolStyle);
