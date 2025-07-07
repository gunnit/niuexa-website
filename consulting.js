// Consulting Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initConsultingPage();
});

function initConsultingPage() {
    initIndustryTabs();
    initConsultationForm();
    initScrollAnimations();
}

// Industry Tabs Functionality
function initIndustryTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Add fade-in animation
                targetContent.style.animation = 'none';
                setTimeout(() => {
                    targetContent.style.animation = 'fadeInUp 0.5s ease';
                }, 10);
            }
        });
    });
}

// Consultation Form Functionality
function initConsultationForm() {
    const form = document.getElementById('consultationForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = getConsultationFormData();
            
            if (validateConsultationForm(formData)) {
                submitConsultationForm(formData);
            }
        });
    }
}

function getConsultationFormData() {
    return {
        name: document.getElementById('consultName').value.trim(),
        email: document.getElementById('consultEmail').value.trim(),
        company: document.getElementById('consultCompany').value.trim(),
        industry: document.getElementById('consultIndustry').value,
        message: document.getElementById('consultMessage').value.trim()
    };
}

function validateConsultationForm(data) {
    const errors = [];
    
    if (!data.name) {
        errors.push('Name is required');
    }
    
    if (!data.email) {
        errors.push('Email is required');
    } else if (!isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.company) {
        errors.push('Company name is required');
    }
    
    if (!data.industry) {
        errors.push('Please select an industry');
    }
    
    if (errors.length > 0) {
        showFormMessage(errors.join('\n'), 'error');
        return false;
    }
    
    return true;
}

function submitConsultationForm(data) {
    // Show loading state
    const submitButton = document.querySelector('#consultationForm button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Scheduling...';
    submitButton.disabled = true;
    
    // Simulate API call (in real implementation, this would be an actual API call)
    setTimeout(() => {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showFormMessage('Thank you! We\'ll contact you within 24 hours to schedule your free consultation.', 'success');
        
        // Reset form
        document.getElementById('consultationForm').reset();
        
        // In a real application, you would send this data to your backend
        console.log('Consultation request submitted:', data);
        
        // Optional: Track conversion event
        trackConsultationRequest(data);
        
    }, 2000);
}

function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.consultation-form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `consultation-form-message ${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        font-weight: 500;
        text-align: center;
        ${type === 'success' 
            ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
            : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    
    // Insert message
    const form = document.getElementById('consultationForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function trackConsultationRequest(data) {
    // Analytics tracking (Google Analytics, Facebook Pixel, etc.)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'consultation_request', {
            'event_category': 'lead_generation',
            'event_label': data.industry,
            'value': 1
        });
    }
    
    // You can add other tracking services here
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Special handling for different elements
                if (entry.target.classList.contains('service-card')) {
                    animateServiceCard(entry.target);
                } else if (entry.target.classList.contains('case-study')) {
                    animateCaseStudy(entry.target);
                } else if (entry.target.classList.contains('process-step')) {
                    animateProcessStep(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .case-study, .process-step, .stat-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

function animateServiceCard(card) {
    const icon = card.querySelector('.service-icon');
    if (icon) {
        setTimeout(() => {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
            setTimeout(() => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }, 200);
    }
}

function animateCaseStudy(study) {
    const metrics = study.querySelectorAll('.metric-value');
    metrics.forEach((metric, index) => {
        setTimeout(() => {
            animateNumber(metric);
        }, index * 200);
    });
}

function animateProcessStep(step) {
    const stepNumber = step.querySelector('.step-number');
    if (stepNumber) {
        setTimeout(() => {
            stepNumber.style.transform = 'scale(1.2)';
            stepNumber.style.background = 'var(--gradient-secondary)';
            setTimeout(() => {
                stepNumber.style.transform = 'scale(1)';
                stepNumber.style.background = 'var(--gradient-primary)';
            }, 300);
        }, 100);
    }
}

function animateNumber(element) {
    const text = element.textContent;
    const number = parseFloat(text.replace(/[^\d.]/g, ''));
    
    if (isNaN(number)) return;
    
    const duration = 1000;
    const steps = 30;
    const increment = number / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        
        // Format the number based on original text
        let formattedNumber;
        if (text.includes('€')) {
            formattedNumber = '€' + current.toFixed(1) + (text.includes('M') ? 'M' : '');
        } else if (text.includes('%')) {
            formattedNumber = Math.round(current) + '%';
        } else {
            formattedNumber = Math.round(current).toString();
        }
        
        element.textContent = formattedNumber;
    }, duration / steps);
}

// Industry-specific content updates
function updateIndustryContent(industry) {
    const industryData = {
        finance: {
            avgSavings: '€2.5M',
            timeReduction: '75%',
            roi: '320%'
        },
        healthcare: {
            avgSavings: '€1.8M',
            timeReduction: '60%',
            roi: '280%'
        },
        manufacturing: {
            avgSavings: '€5.1M',
            timeReduction: '70%',
            roi: '380%'
        },
        retail: {
            avgSavings: '€1.2M',
            timeReduction: '55%',
            roi: '250%'
        },
        technology: {
            avgSavings: '€2.1M',
            timeReduction: '70%',
            roi: '310%'
        }
    };
    
    const data = industryData[industry];
    if (data) {
        // Update stats in the active tab
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const statValues = activeTab.querySelectorAll('.stat-value');
            if (statValues.length >= 3) {
                statValues[0].textContent = data.avgSavings;
                statValues[1].textContent = data.timeReduction;
                statValues[2].textContent = data.roi;
            }
        }
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
});

// Consultation form auto-save
function initConsultationAutoSave() {
    const form = document.getElementById('consultationForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Load saved data
    const savedData = localStorage.getItem('consultationFormData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input && data[key]) {
                    input.value = data[key];
                }
            });
        } catch (e) {
            console.error('Error loading saved consultation data:', e);
        }
    }
    
    // Save data on input
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const formData = getConsultationFormData();
            localStorage.setItem('consultationFormData', JSON.stringify(formData));
        });
    });
}

// Clear saved data on successful submission
function clearConsultationAutoSave() {
    localStorage.removeItem('consultationFormData');
}

// Initialize auto-save
document.addEventListener('DOMContentLoaded', function() {
    initConsultationAutoSave();
});

// Add to successful form submission
function submitConsultationForm(data) {
    // ... existing code ...
    
    setTimeout(() => {
        // ... existing code ...
        
        // Clear auto-saved data
        clearConsultationAutoSave();
        
    }, 2000);
}

// Keyboard navigation for tabs
function initKeyboardNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach((button, index) => {
        button.addEventListener('keydown', function(e) {
            let targetIndex;
            
            switch(e.key) {
                case 'ArrowLeft':
                    targetIndex = index > 0 ? index - 1 : tabButtons.length - 1;
                    break;
                case 'ArrowRight':
                    targetIndex = index < tabButtons.length - 1 ? index + 1 : 0;
                    break;
                case 'Home':
                    targetIndex = 0;
                    break;
                case 'End':
                    targetIndex = tabButtons.length - 1;
                    break;
                default:
                    return;
            }
            
            e.preventDefault();
            tabButtons[targetIndex].focus();
            tabButtons[targetIndex].click();
        });
    });
}

// Initialize keyboard navigation
document.addEventListener('DOMContentLoaded', function() {
    initKeyboardNavigation();
});

// Performance optimization: Lazy load heavy content
function initLazyLoading() {
    const lazyElements = document.querySelectorAll('.case-study, .industry-content');
    
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                lazyObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    lazyElements.forEach(element => {
        lazyObserver.observe(element);
    });
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', function() {
    initLazyLoading();
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateConsultationForm,
        isValidEmail,
        getConsultationFormData
    };
}
