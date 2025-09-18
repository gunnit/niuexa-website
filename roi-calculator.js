/**
 * ROI Calculator - Production Ready Version
 * Enhanced with error handling, performance optimization, and better UX
 */

// Global state management
const ROICalculator = {
    form: null,
    resultsSection: null,
    currentResults: null,
    isCalculating: false,
    
    // Configuration constants
    CONFIG: {
        DEFAULT_AUTOMATION_LEVEL: 80,
        MIN_AUTOMATION_LEVEL: 10,
        MAX_AUTOMATION_LEVEL: 95,
        ERROR_REDUCTION_FACTOR: 0.5,
        CHART_HEIGHT: 300,
        DEBOUNCE_DELAY: 300,
        ANIMATION_DURATION: 600
    },
    
    // Initialize the calculator
    init() {
        if (!this.cacheElements()) {
            console.error('ROI Calculator: Failed to initialize - required elements not found');
            return;
        }
        this.bindEvents();
        this.setupFormValidation();
        this.loadSavedData();
        this.updateIndustryDefaults();
        this.trackAnalytics('calculator_loaded');
    },
    
    // Cache DOM elements for better performance
    cacheElements() {
        this.form = document.getElementById('roiCalculator');
        this.resultsSection = document.getElementById('calculatorResults');
        this.automationSlider = document.getElementById('automationLevel');
        this.sliderValue = document.querySelector('.slider-value');
        this.resetButton = document.getElementById('resetForm');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        
        // Validate required elements
        if (!this.form || !this.resultsSection) {
            console.error('ROI Calculator: Required elements not found');
            return false;
        }
        
        return true;
    },
    
    // Bind event listeners
    bindEvents() {
        if (!this.form) return;
        
        // Form submission 
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submit event triggered');
            this.handleFormSubmit();
        });
        
        // Also add click handler to submit button as backup
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Submit button clicked');
                this.handleFormSubmit();
            });
        }
        
        // Slider value updates
        if (this.automationSlider && this.sliderValue) {
            this.automationSlider.addEventListener('input', (e) => {
                this.sliderValue.textContent = e.target.value + '%';
                this.saveFormData();
            });
        }
        
        // Reset form
        if (this.resetButton) {
            this.resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm();
            });
        }
        
        // Auto-save form data
        this.form.addEventListener('input', this.debounce(() => {
            this.saveFormData();
        }, 1000));
        
        // Results actions
        this.initResultsActions();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ROI Calculator...');
    ROICalculator.init();
    
    // Debug check
    setTimeout(() => {
        const form = document.getElementById('roiCalculator');
        const results = document.getElementById('calculatorResults');
        console.log('Debug check:', {
            formFound: !!form,
            resultsFound: !!results,
            calculatorInitialized: !!ROICalculator.form
        });
    }, 1000);
});

// Enhanced form submission handler
ROICalculator.handleFormSubmit = function() {
    console.log('Form submitted!');
    if (this.isCalculating) return;
    
    try {
        this.isCalculating = true;
        this.showLoadingState();
        
        // Get and validate form data
        const formData = this.getFormData();
        console.log('Form data:', formData);
        
        const validation = this.validateFormData(formData);
        console.log('Validation result:', validation);
        
        if (!validation.isValid) {
            console.log('Validation failed:', validation.errors);
            this.showValidationErrors(validation.errors);
            return;
        }
        
        // Calculate ROI with error handling
        const results = this.performROICalculation(formData);
        console.log('Calculation results:', results);
        
        // Display results with animation
        this.displayResults(results);
        this.showResultsSection();
        
        // Track analytics
        this.trackAnalytics('roi_calculated', {
            industry: formData.industry,
            roi_percentage: results.roiPercentage,
            payback_months: results.paybackMonths
        });
        
    } catch (error) {
        console.error('ROI Calculation Error:', error);
        this.showErrorMessage('Si è verificato un errore durante il calcolo. Riprova.');
        this.trackAnalytics('calculation_error', { error: error.message });
    } finally {
        this.isCalculating = false;
        this.hideLoadingState();
    }
};

// Enhanced form data retrieval
ROICalculator.getFormData = function() {
    const formData = new FormData(this.form);
    return {
        processName: formData.get('processName')?.trim() || '',
        industry: formData.get('industry') || '',
        timePerProcess: this.parseNumber(formData.get('timePerProcess')),
        frequency: formData.get('frequency') || '',
        occurrences: this.parseNumber(formData.get('occurrences')),
        hourlyRate: this.parseNumber(formData.get('hourlyRate')),
        peopleInvolved: this.parseNumber(formData.get('peopleInvolved')) || 1,
        errorRate: this.parseNumber(formData.get('errorRate')) || 0,
        automationLevel: this.parseNumber(formData.get('automationLevel')) || this.CONFIG.DEFAULT_AUTOMATION_LEVEL,
        implementationCost: this.parseNumber(formData.get('implementationCost')) || 0,
        monthlyCost: this.parseNumber(formData.get('monthlyCost')) || 0
    };
};

// Enhanced form validation
ROICalculator.validateFormData = function(data) {
    const errors = [];
    
    // Required field validation
    if (!data.processName) {
        errors.push({ field: 'processName', message: 'Il nome del processo è obbligatorio' });
    }
    
    if (data.timePerProcess <= 0) {
        errors.push({ field: 'timePerProcess', message: 'Il tempo per processo deve essere maggiore di 0' });
    }
    
    if (!data.frequency) {
        errors.push({ field: 'frequency', message: 'La frequenza è obbligatoria' });
    }
    
    if (data.occurrences <= 0) {
        errors.push({ field: 'occurrences', message: 'Le occorrenze devono essere maggiori di 0' });
    }
    
    if (data.hourlyRate <= 0) {
        errors.push({ field: 'hourlyRate', message: 'La tariffa oraria deve essere maggiore di 0' });
    }
    
    if (data.peopleInvolved <= 0) {
        errors.push({ field: 'peopleInvolved', message: 'Le persone coinvolte devono essere maggiori di 0' });
    }
    
    // Range validation
    if (data.errorRate < 0 || data.errorRate > 100) {
        errors.push({ field: 'errorRate', message: 'Il tasso di errore deve essere tra 0 e 100%' });
    }
    
    if (data.automationLevel < this.CONFIG.MIN_AUTOMATION_LEVEL || data.automationLevel > this.CONFIG.MAX_AUTOMATION_LEVEL) {
        errors.push({ field: 'automationLevel', message: `Il livello di automazione deve essere tra ${this.CONFIG.MIN_AUTOMATION_LEVEL}% e ${this.CONFIG.MAX_AUTOMATION_LEVEL}%` });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Enhanced ROI calculation with error handling
ROICalculator.performROICalculation = function(data) {
    const frequencyMultipliers = {
        'daily': 365,
        'weekly': 52,
        'monthly': 12
    };
    
    const annualMultiplier = frequencyMultipliers[data.frequency];
    if (!annualMultiplier) {
        throw new Error('Frequenza non valida');
    }
    
    // Calculate current annual metrics
    const timePerProcessHours = data.timePerProcess / 60;
    const totalTimePerOccurrence = timePerProcessHours * data.peopleInvolved;
    const annualOccurrences = data.occurrences * annualMultiplier;
    const totalAnnualHours = totalTimePerOccurrence * annualOccurrences;
    const currentAnnualCost = totalAnnualHours * data.hourlyRate;
    
    // Calculate automation savings
    const automationPercentage = data.automationLevel / 100;
    const timeSavedHours = totalAnnualHours * automationPercentage;
    const laborSavings = timeSavedHours * data.hourlyRate;
    
    // Calculate error reduction savings
    const errorReductionValue = currentAnnualCost * (data.errorRate / 100) * this.CONFIG.ERROR_REDUCTION_FACTOR;
    
    // Calculate AI costs
    const annualAICosts = data.monthlyCost * 12;
    const totalImplementationCost = data.implementationCost;
    
    // Calculate net benefits
    const totalAnnualSavings = laborSavings + errorReductionValue;
    const netAnnualBenefit = totalAnnualSavings - annualAICosts;
    
    // Calculate ROI metrics
    const totalFirstYearCost = totalImplementationCost + annualAICosts;
    const roiPercentage = totalFirstYearCost > 0 ? ((netAnnualBenefit / totalFirstYearCost) * 100) : 0;
    const paybackMonths = netAnnualBenefit > 0 ? (totalImplementationCost / (netAnnualBenefit / 12)) : 0;
    
    // Generate 5-year projection
    const fiveYearProjection = [];
    for (let year = 0; year <= 5; year++) {
        const cumulativeSavings = netAnnualBenefit * year;
        const cumulativeCosts = totalImplementationCost + (annualAICosts * year);
        const netValue = cumulativeSavings - cumulativeCosts;
        
        fiveYearProjection.push({
            year,
            savings: cumulativeSavings,
            costs: cumulativeCosts,
            netValue
        });
    }
    
    return {
        processName: data.processName,
        industry: data.industry,
        currentAnnualCost,
        timeSavedHours,
        laborSavings,
        errorReductionValue,
        totalAnnualSavings,
        annualAICosts,
        totalImplementationCost,
        netAnnualBenefit,
        roiPercentage,
        paybackMonths,
        fiveYearProjection
    };
};

// Enhanced results display with animations
ROICalculator.displayResults = function(results) {
    this.currentResults = results;
    
    // Update summary cards with animation
    this.animateValue('annualSavings', results.totalAnnualSavings, this.formatCurrency);
    this.animateValue('roiPercentage', results.roiPercentage, this.formatPercentage);
    this.animateValue('paybackPeriod', results.paybackMonths, this.formatMonths);
    
    // Update breakdown
    document.getElementById('currentCost').textContent = this.formatCurrency(results.currentAnnualCost);
    document.getElementById('timeSaved').textContent = this.formatHours(results.timeSavedHours);
    document.getElementById('errorReduction').textContent = this.formatCurrency(results.errorReductionValue);
    document.getElementById('totalImplementation').textContent = this.formatCurrency(results.totalImplementationCost);
    document.getElementById('annualAICosts').textContent = this.formatCurrency(results.annualAICosts);
    document.getElementById('netBenefit').textContent = this.formatCurrency(results.netAnnualBenefit);
    
    // Create enhanced chart
    this.createEnhancedChart(results);
};

// Enhanced chart creation method
ROICalculator.createEnhancedChart = function(results) {
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (window.roiChartInstance) {
        window.roiChartInstance.destroy();
    }
    
    const years = results.fiveYearProjection.map(p => `Anno ${p.year}`);
    const netValues = results.fiveYearProjection.map(p => p.netValue);
    const savings = results.fiveYearProjection.map(p => p.savings);
    const costs = results.fiveYearProjection.map(p => p.costs);
    
    window.roiChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Valore Netto',
                    data: netValues,
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Risparmi Cumulativi',
                    data: savings,
                    borderColor: '#00CC66',
                    backgroundColor: 'rgba(0, 204, 102, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Costi Cumulativi',
                    data: costs,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Proiezione ROI a 5 Anni',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return ROICalculator.formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    radius: 6,
                    hoverRadius: 8
                }
            },
            animation: {
                duration: this.CONFIG.ANIMATION_DURATION,
                easing: 'easeOutQuart'
            }
        }
    });
};

// Initialize results actions
ROICalculator.initResultsActions = function() {
    // Download Report
    const downloadBtn = document.getElementById('downloadReport');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            this.generatePDFReport();
            this.trackAnalytics('report_downloaded');
        });
    }
    
    // Schedule Consultation
    const consultationBtn = document.getElementById('scheduleConsultation');
    if (consultationBtn) {
        consultationBtn.addEventListener('click', () => {
            window.location.href = 'index.html#contact';
            this.trackAnalytics('consultation_requested');
        });
    }
    
    // Email Results
    const emailBtn = document.getElementById('emailResults');
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            this.showEmailModal();
        });
    }
};

// Enhanced PDF report generation
ROICalculator.generatePDFReport = function() {
    if (!this.currentResults) return;
    
    const results = this.currentResults;
    const processName = results.processName || 'Analisi ROI';
    
    // Create comprehensive report content
    const reportContent = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>Report Analisi ROI - ${processName}</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 20px;
                    line-height: 1.6;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 40px;
                    padding: 20px;
                    background: linear-gradient(135deg, #0066cc, #00cc66);
                    color: white;
                    border-radius: 10px;
                }
                .header h1 { margin: 0; font-size: 2.5rem; }
                .header h2 { margin: 10px 0; font-size: 1.5rem; opacity: 0.9; }
                .header p { margin: 5px 0; opacity: 0.8; }
                .summary { 
                    display: flex; 
                    justify-content: space-around; 
                    margin: 30px 0;
                    gap: 20px;
                }
                .summary-card { 
                    flex: 1;
                    text-align: center; 
                    padding: 20px; 
                    border: 2px solid #0066cc;
                    border-radius: 10px;
                    background: #f8f9fa;
                }
                .summary-card h3 { 
                    color: #0066cc; 
                    margin-bottom: 10px;
                    font-size: 1.1rem;
                }
                .summary-card .value { 
                    font-size: 2rem; 
                    font-weight: bold; 
                    color: #333;
                }
                .breakdown { margin: 40px 0; }
                .breakdown h3 { 
                    color: #0066cc; 
                    border-bottom: 2px solid #0066cc;
                    padding-bottom: 10px;
                }
                .breakdown-item { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 12px 0; 
                    border-bottom: 1px solid #eee;
                }
                .breakdown-item:last-child { border-bottom: none; }
                .breakdown-label { font-weight: 500; }
                .breakdown-value { 
                    font-weight: bold; 
                    color: #0066cc;
                }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px solid #ddd;
                }
                @media print {
                    body { margin: 0; }
                    .header { background: #0066cc !important; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Report Analisi ROI Agenti AI</h1>
                <h2>${processName}</h2>
                <p>Settore: ${results.industry || 'Non specificato'}</p>
                <p>Generato il ${new Date().toLocaleDateString('it-IT', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
            </div>
            
            <div class="summary">
                <div class="summary-card">
                    <h3>Risparmi Annuali</h3>
                    <div class="value">${this.formatCurrency(results.totalAnnualSavings)}</div>
                </div>
                <div class="summary-card">
                    <h3>ROI Percentuale</h3>
                    <div class="value">${this.formatPercentage(results.roiPercentage)}</div>
                </div>
                <div class="summary-card">
                    <h3>Periodo di Recupero</h3>
                    <div class="value">${this.formatMonths(results.paybackMonths)}</div>
                </div>
            </div>
            
            <div class="breakdown">
                <h3>Dettaglio Completo</h3>
                <div class="breakdown-item">
                    <span class="breakdown-label">Costo Annuale Attuale:</span>
                    <span class="breakdown-value">${this.formatCurrency(results.currentAnnualCost)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Tempo Risparmiato all'Anno:</span>
                    <span class="breakdown-value">${this.formatHours(results.timeSavedHours)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Valore Riduzione Errori:</span>
                    <span class="breakdown-value">${this.formatCurrency(results.errorReductionValue)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Costo Totale Implementazione:</span>
                    <span class="breakdown-value">${this.formatCurrency(results.totalImplementationCost)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Costi Annuali AI:</span>
                    <span class="breakdown-value">${this.formatCurrency(results.annualAICosts)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Beneficio Netto Annuale:</span>
                    <span class="breakdown-value">${this.formatCurrency(results.netAnnualBenefit)}</span>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Report generato da Niuexa - Soluzioni AI per il Business</strong></p>
                <p>Per implementare questi risultati nella tua azienda, contattaci per una consulenza gratuita.</p>
                <p>Web: niuexa.ai | Email: info@niuexa.com</p>
            </div>
        </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    // Auto-print after content loads
    printWindow.onload = function() {
        printWindow.print();
    };
};

// Enhanced email modal
ROICalculator.showEmailModal = function() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #0066cc;">Ricevi l'Analisi ROI via Email</h3>
        <p style="margin-bottom: 1.5rem; color: #666;">Inserisci il tuo indirizzo email per ricevere un report dettagliato della tua analisi ROI.</p>
        <input type="email" id="emailInput" placeholder="Il tuo indirizzo email" 
               style="width: 100%; padding: 0.8rem; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 1rem; font-size: 1rem;">
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button id="cancelEmail" style="padding: 0.8rem 1.5rem; border: 2px solid #6c757d; background: transparent; color: #6c757d; border-radius: 8px; cursor: pointer;">
                Annulla
            </button>
            <button id="sendEmail" style="padding: 0.8rem 1.5rem; border: none; background: #0066cc; color: white; border-radius: 8px; cursor: pointer;">
                Invia Report
            </button>
        </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Focus on email input
    const emailInput = document.getElementById('emailInput');
    emailInput.focus();
    
    // Handle modal actions
    document.getElementById('cancelEmail').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    document.getElementById('sendEmail').addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (this.validateEmail(email)) {
            // In a real application, you would send this to your backend
            alert(`L'analisi ROI sarà inviata a ${email} a breve!`);
            this.trackAnalytics('email_report_requested', { email });
            document.body.removeChild(modalOverlay);
        } else {
            alert('Inserisci un indirizzo email valido.');
            emailInput.focus();
        }
    });
    
    // Close modal on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
    
    // Close modal on ESC key
    const escKeyHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modalOverlay);
            document.removeEventListener('keydown', escKeyHandler);
        }
    };
    document.addEventListener('keydown', escKeyHandler);
};

// Enhanced email validation
ROICalculator.validateEmail = function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Update industry defaults method
ROICalculator.updateIndustryDefaults = function() {
    const industrySelect = document.getElementById('industry');
    const implementationCostInput = document.getElementById('implementationCost');
    const monthlyCostInput = document.getElementById('monthlyCost');
    
    if (industrySelect) {
        industrySelect.addEventListener('change', (e) => {
            const industry = e.target.value;
            if (industry && industryBenchmarks[industry]) {
                // Suggest default costs based on industry
                if (!implementationCostInput.value) {
                    const suggestedImplementation = this.getIndustryImplementationCost(industry);
                    implementationCostInput.placeholder = suggestedImplementation;
                }
                
                if (!monthlyCostInput.value) {
                    const suggestedMonthly = this.getIndustryMonthlyCost(industry);
                    monthlyCostInput.placeholder = suggestedMonthly;
                }
            }
        });
    }
};

// Helper methods for industry defaults
ROICalculator.getIndustryImplementationCost = function(industry) {
    const costs = {
        finance: 8000,
        healthcare: 6000,
        manufacturing: 10000,
        technology: 7000,
        retail: 5000,
        consulting: 6000,
        marketing: 5500,
        other: 5000
    };
    return costs[industry] || 5000;
};

ROICalculator.getIndustryMonthlyCost = function(industry) {
    const costs = {
        finance: 300,
        healthcare: 250,
        manufacturing: 400,
        technology: 350,
        retail: 200,
        consulting: 250,
        marketing: 275,
        other: 200
    };
    return costs[industry] || 200;
};

// Utility methods
ROICalculator.parseNumber = function(value) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

ROICalculator.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

ROICalculator.animateValue = function(elementId, finalValue, formatter) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = this.CONFIG.ANIMATION_DURATION;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (finalValue - startValue) * easeOutQuart;
        
        element.textContent = formatter ? formatter(currentValue) : Math.round(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
};

ROICalculator.showLoadingState = function() {
    if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Calcolando...';
        this.submitButton.classList.add('loading');
    }
};

ROICalculator.hideLoadingState = function() {
    if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Calcola ROI';
        this.submitButton.classList.remove('loading');
    }
};

ROICalculator.showResultsSection = function() {
    console.log('Showing results section...', this.resultsSection);
    if (!this.resultsSection) {
        console.error('Results section not found!');
        return;
    }
    
    this.resultsSection.style.display = 'block';
    this.resultsSection.classList.add('slideInRight');
    console.log('Results section displayed');
    
    // Smooth scroll to results
    setTimeout(() => {
        this.resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
};

ROICalculator.showValidationErrors = function(errors) {
    // Clear previous errors
    this.clearValidationErrors();
    
    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('error');
            
            // Add error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = error.message;
            field.parentNode.appendChild(errorMsg);
        }
    });
    
    // Focus on first error field
    if (errors.length > 0) {
        const firstErrorField = document.getElementById(errors[0].field);
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
};

ROICalculator.clearValidationErrors = function() {
    const errorFields = this.form.querySelectorAll('.error');
    const errorMessages = this.form.querySelectorAll('.error-message');
    
    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(msg => msg.remove());
};

ROICalculator.showErrorMessage = function(message) {
    // Create or update error alert
    let errorAlert = document.getElementById('errorAlert');
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.id = 'errorAlert';
        errorAlert.className = 'alert alert-error';
        this.form.prepend(errorAlert);
    }
    
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
};

ROICalculator.resetForm = function() {
    this.form.reset();
    this.resultsSection.style.display = 'none';
    this.clearValidationErrors();
    this.clearSavedData();
    
    // Reset slider display
    if (this.sliderValue) {
        this.sliderValue.textContent = this.CONFIG.DEFAULT_AUTOMATION_LEVEL + '%';
    }
    
    // Reset automation slider
    if (this.automationSlider) {
        this.automationSlider.value = this.CONFIG.DEFAULT_AUTOMATION_LEVEL;
    }
};

ROICalculator.setupFormValidation = function() {
    // Real-time validation
    const inputs = this.form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            this.validateField(input);
        });
        
        input.addEventListener('input', () => {
            this.clearFieldError(input);
        });
    });
};

ROICalculator.validateField = function(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Questo campo è obbligatorio';
    } else if (field.type === 'number' && value) {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            isValid = false;
            message = 'Inserisci un numero valido maggiore di 0';
        }
    }
    
    if (isValid) {
        this.clearFieldError(field);
    } else {
        this.showFieldError(field, message);
    }
    
    return isValid;
};

ROICalculator.showFieldError = function(field, message) {
    this.clearFieldError(field);
    field.classList.add('error');
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    field.parentNode.appendChild(errorMsg);
};

ROICalculator.clearFieldError = function(field) {
    field.classList.remove('error');
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
};

ROICalculator.saveFormData = function() {
    try {
        const formData = this.getFormData();
        localStorage.setItem('roiCalculatorData', JSON.stringify(formData));
    } catch (error) {
        console.warn('Could not save form data:', error);
    }
};

ROICalculator.loadSavedData = function() {
    try {
        const savedData = localStorage.getItem('roiCalculatorData');
        if (!savedData) return;
        
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const input = document.getElementById(key);
            if (input && data[key] !== undefined && data[key] !== '') {
                input.value = data[key];
                
                if (key === 'automationLevel' && this.sliderValue) {
                    this.sliderValue.textContent = data[key] + '%';
                }
            }
        });
    } catch (error) {
        console.warn('Could not load saved data:', error);
    }
};

ROICalculator.clearSavedData = function() {
    try {
        localStorage.removeItem('roiCalculatorData');
    } catch (error) {
        console.warn('Could not clear saved data:', error);
    }
};

ROICalculator.trackAnalytics = function(event, data = {}) {
    // Analytics tracking - replace with your analytics provider
    if (typeof gtag !== 'undefined') {
        gtag('event', event, {
            event_category: 'ROI Calculator',
            ...data
        });
    }
    
    // Console log for development
    console.log('Analytics:', event, data);
};

// Enhanced formatting functions
ROICalculator.formatCurrency = function(amount) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(amount));
};

ROICalculator.formatPercentage = function(percentage) {
    return new Intl.NumberFormat('it-IT', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    }).format(percentage / 100);
};

ROICalculator.formatMonths = function(months) {
    if (months <= 0) return 'Immediato';
    if (months < 12) return Math.round(months) + ' mesi';
    
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    
    if (remainingMonths === 0) {
        return years + (years === 1 ? ' anno' : ' anni');
    }
    
    return years + (years === 1 ? ' anno' : ' anni') + ' e ' + remainingMonths + ' mesi';
};

ROICalculator.formatHours = function(hours) {
    return new Intl.NumberFormat('it-IT').format(Math.round(hours)) + ' ore';
};