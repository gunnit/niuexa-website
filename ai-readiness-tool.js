// AI Readiness Tool Form Handler

document.addEventListener('DOMContentLoaded', function() {
    initWebsiteNormalization();
    initAIReadinessForm();
    initAeoEnquiryChoice();
    initFormValidation();
});

// Keep one short form while making the chosen offer visible and measurable.
function initAeoEnquiryChoice() {
    const form = document.querySelector('.ai-readiness-form');
    if (!form || !window.location || window.location.pathname !== '/consulenza-aeo-geo.html') return;
    document.querySelectorAll('a[data-aeo-plan]').forEach(link => {
        link.addEventListener('click', function() {
            const plan = link.dataset.aeoPlan;
            if (!['free', 'business', 'enterprise'].includes(plan)) return;
            const free = plan === 'free';
            form.dataset.enquiryType = free ? 'free_audit' : 'project_enquiry';
            form.dataset.serviceInterest = 'aeo_geo';
            form.dataset.selectedPlan = plan;
            const title = document.getElementById('rt-contact-title');
            const note = document.getElementById('aeo-followup-note');
            if (title) title.textContent = free ? 'Analisi e consulenza gratuite.' : 'Parliamo del tuo progetto ' + (plan === 'business' ? 'Business.' : 'Enterprise.');
            if (note) note.textContent = free
                ? "Ti ricontattiamo per concordare l'analisi della homepage e la prima chiamata gratuita di 30 minuti."
                : 'Ti ricontattiamo per definire attività, tempi e preventivo del progetto ' + (plan === 'business' ? 'Business.' : 'Enterprise.');
            const button = form.querySelector('.btn-submit');
            if (button) button.innerHTML = (free ? "Richiedi l'analisi gratuita" : 'Parliamo del progetto') + ' <img src="img/aeo-campaign/icons/arrow-right.svg" width="20" height="20" alt="" aria-hidden="true">';
            if (window.NiuexaTracking) window.NiuexaTracking.populateForm(form);
        });
    });
}

// Initialize AI Readiness form
function initAIReadinessForm() {
    const form = document.querySelector('.ai-readiness-form');

    if (!form) return;
    form.dataset.niuexaAsyncForm = '1';

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (form.dataset.niuexaSubmitting === '1') return;

        const submitButton = form.querySelector('.btn-submit');
        const originalButtonText = submitButton.innerHTML;

        // Validate form
        if (!validateForm(form)) {
            return;
        }

        // Show loading state
        form.dataset.niuexaSubmitting = '1';
        submitButton.disabled = true;
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
                try {
                    if (window.NiuexaTracking && typeof window.NiuexaTracking.confirmSubmission === 'function') {
                        // The AEO route resolves after dispatch or a short deadline;
                        // older cached tracking APIs return undefined, which is safe.
                        await window.NiuexaTracking.confirmSubmission(form);
                    }
                } catch (trackingError) {
                    // Analytics must never turn a received enquiry into a form error.
                }

                // Redirect to AI Readiness thank you page
                window.location.href = 'thank-you-ai-readiness.html';
            } else {
                throw new Error('Errore nell\'invio del modulo');
            }
        } catch (error) {
            // Show error message
            showMessage('error', 'Invio non riuscito. Riprova tra qualche istante oppure scrivici dalla pagina contatti.');
            console.error('Form submission error:', error);

            // Reset button state
            form.dataset.niuexaSubmitting = '0';
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Accept complete HTTP(S) website addresses, keeping the visitor's path/query intact.
function isValidWebsiteUrl(value) {
    if (!/^https?:\/\//i.test(value) || /\s/.test(value)) return false;
    try {
        const url = new URL(value);
        const labels = url.hostname.replace(/\.$/, '').split('.');
        return labels.length > 1 && labels.every(label => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label));
    } catch (error) {
        return false;
    }
}

function normalizeWebsiteField(field) {
    const value = field.value.trim();
    // A bare domain may include a port, path, query or fragment. Unsupported
    // protocols and malformed hosts must not be turned into plausible websites.
    if (!value || /^https?:\/\//i.test(value) || /^[/?#]/.test(value)) return;
    const candidate = 'https://' + value;
    if (!isValidWebsiteUrl(candidate)) return;
    const url = new URL(candidate);
    if (url.username || url.password) return;
    field.value = candidate;
}

function initWebsiteNormalization() {
    const form = document.querySelector('.ai-readiness-form');
    if (!form) return;
    const fields = Array.from(form.querySelectorAll('input')).filter(field => field.type === 'url');
    if (!fields.length) return;
    const normalizeAll = () => fields.forEach(normalizeWebsiteField);
    fields.forEach(field => {
        field.addEventListener('change', () => normalizeWebsiteField(field));
        field.addEventListener('input', event => {
            // Do not rewrite ordinary typing: setting a URL input's value can
            // move its cursor. Pasted/replacement values are already complete.
            if (event.inputType === 'insertFromPaste' || event.inputType === 'insertReplacementText') {
                normalizeWebsiteField(field);
            }
        });
    });
    // Native type=url validation happens before submit. Cover clicks and Enter
    // here, including browser autofill that did not emit change or blur.
    form.addEventListener('click', event => {
        if (event.target.closest('button[type="submit"], input[type="submit"]')) normalizeAll();
    }, true);
    form.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.isComposing) normalizeAll();
    }, true);
    window.addEventListener('pageshow', normalizeAll);
    normalizeAll();
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
        if (field.type === 'url') normalizeWebsiteField(field);
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
            if (!isValidWebsiteUrl(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }
    });

    if (!isValid) {
        showMessage('error', 'Controlla i campi evidenziati: sono obbligatori o non nel formato corretto.');
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
    if (field.type === 'url') normalizeWebsiteField(field);
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
        if (!isValidWebsiteUrl(field.value)) {
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
