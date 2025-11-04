// AI Readiness Tool Form Handler

document.addEventListener('DOMContentLoaded', function() {
    initAIReadinessForm();
    initFormValidation();
});

// Initialize AI Readiness form
function initAIReadinessForm() {
    const form = document.querySelector('.ai-readiness-form');

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
        submitButton.style.opacity = '0.7';
        submitButton.style.cursor = 'not-allowed';
        submitButton.innerHTML = `
            Invio in corso...
            <svg style="animation: spin 1s linear infinite;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
            </svg>
        `;

        try {
            // Submit form data to Formcarry
            const formData = new FormData(form);

            console.log('AI Readiness Form - Submitting to:', form.action);
            console.log('AI Readiness Form - Data:', Object.fromEntries(formData));

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('AI Readiness Form - Response status:', response.status);
            console.log('AI Readiness Form - Response OK:', response.ok);

            if (response.ok) {
                console.log('AI Readiness Form - Submitted successfully to Formcarry');

                // Track conversion event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'AI Readiness Tool',
                        'event_label': 'AI Readiness Form'
                    });
                }

                // Redirect to AI Readiness thank you page
                window.location.href = 'thank-you-ai-readiness.html';
            } else {
                const errorData = await response.text();
                console.error('AI Readiness Form - Formcarry response error:', errorData);
                throw new Error('Errore nell\'invio del modulo');
            }
        } catch (error) {
            // Show error message
            showMessage('error', 'Si è verificato un errore. Per favore riprova o contattaci direttamente.');
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
                field.parentElement.style.color = '#dc3545';
                isValid = false;
            }
        } else if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            field.style.backgroundColor = '#fff5f5';
            field.classList.add('error');
            isValid = false;
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                field.style.borderColor = '#dc3545';
                field.style.backgroundColor = '#fff5f5';
                field.classList.add('error');
                isValid = false;
            }
        }

        // URL validation (optional field)
        if (field.type === 'url' && field.value) {
            const urlPattern = /^https?:\/\/.+\..+/;
            if (!urlPattern.test(field.value)) {
                field.style.borderColor = '#dc3545';
                field.style.backgroundColor = '#fff5f5';
                field.classList.add('error');
                isValid = false;
            }
        }
    });

    if (!isValid) {
        showMessage('error', 'Per favore compila tutti i campi obbligatori correttamente.');
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
            this.style.borderColor = '#e0e0e0';
            this.style.backgroundColor = 'white';
            this.classList.remove('error');
            if (this.parentElement.style) {
                this.parentElement.style.color = '#343A40';
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
    if (field.hasAttribute('required') && !field.value.trim() && field.type !== 'checkbox') {
        field.style.borderColor = '#dc3545';
        field.style.backgroundColor = '#fff5f5';
        field.classList.add('error');
        return false;
    }

    // Email validation
    if (field.type === 'email' && field.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(field.value)) {
            field.style.borderColor = '#dc3545';
            field.style.backgroundColor = '#fff5f5';
            field.classList.add('error');
            return false;
        }
    }

    // URL validation
    if (field.type === 'url' && field.value) {
        const urlPattern = /^https?:\/\/.+\..+/;
        if (!urlPattern.test(field.value)) {
            field.style.borderColor = '#dc3545';
            field.style.backgroundColor = '#fff5f5';
            field.classList.add('error');
            return false;
        }
    }

    field.style.borderColor = '#e0e0e0';
    field.style.backgroundColor = 'white';
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
    messageDiv.style.cssText = `
        padding: 1rem 1.5rem;
        margin-bottom: 1.5rem;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideDown 0.3s ease;
        ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
    `;

    const icon = type === 'success' ? '✅' : '❌';
    messageDiv.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;

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

// Add CSS animation for spinning loader
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);
