// ROI Calculator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initROICalculator();
});

function initROICalculator() {
    const form = document.getElementById('roiCalculator');
    const resultsSection = document.getElementById('calculatorResults');
    const resetButton = document.getElementById('resetForm');
    const automationSlider = document.getElementById('automationLevel');
    const sliderValue = document.querySelector('.slider-value');
    
    // Update slider value display
    if (automationSlider && sliderValue) {
        automationSlider.addEventListener('input', function() {
            sliderValue.textContent = this.value + '%';
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateROI();
        });
    }
    
    // Reset form
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            form.reset();
            resultsSection.style.display = 'none';
            sliderValue.textContent = '80%';
        });
    }
    
    // Results actions
    initResultsActions();
}

function calculateROI() {
    // Get form data
    const formData = getFormData();
    
    // Validate form data
    if (!validateFormData(formData)) {
        return;
    }
    
    // Calculate ROI metrics
    const results = performROICalculation(formData);
    
    // Display results
    displayResults(results);
    
    // Show results section
    const resultsSection = document.getElementById('calculatorResults');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Create chart
    createROIChart(results);
}

function getFormData() {
    return {
        processName: document.getElementById('processName').value,
        industry: document.getElementById('industry').value,
        timePerProcess: parseFloat(document.getElementById('timePerProcess').value) || 0,
        frequency: document.getElementById('frequency').value,
        occurrences: parseInt(document.getElementById('occurrences').value) || 0,
        hourlyRate: parseFloat(document.getElementById('hourlyRate').value) || 0,
        peopleInvolved: parseInt(document.getElementById('peopleInvolved').value) || 1,
        errorRate: parseFloat(document.getElementById('errorRate').value) || 0,
        automationLevel: parseFloat(document.getElementById('automationLevel').value) || 80,
        implementationCost: parseFloat(document.getElementById('implementationCost').value) || 0,
        monthlyCost: parseFloat(document.getElementById('monthlyCost').value) || 0
    };
}

function validateFormData(data) {
    const errors = [];
    
    if (!data.processName.trim()) {
        errors.push('Process name is required');
    }
    
    if (data.timePerProcess <= 0) {
        errors.push('Time per process must be greater than 0');
    }
    
    if (!data.frequency) {
        errors.push('Frequency is required');
    }
    
    if (data.occurrences <= 0) {
        errors.push('Occurrences must be greater than 0');
    }
    
    if (data.hourlyRate <= 0) {
        errors.push('Hourly rate must be greater than 0');
    }
    
    if (data.peopleInvolved <= 0) {
        errors.push('People involved must be greater than 0');
    }
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

function performROICalculation(data) {
    // Convert frequency to annual multiplier
    const frequencyMultipliers = {
        'daily': 365,
        'weekly': 52,
        'monthly': 12
    };
    
    const annualMultiplier = frequencyMultipliers[data.frequency] || 1;
    
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
    const errorReductionValue = currentAnnualCost * (data.errorRate / 100) * 0.5; // Assume 50% error reduction
    
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
            year: year,
            savings: cumulativeSavings,
            costs: cumulativeCosts,
            netValue: netValue
        });
    }
    
    return {
        processName: data.processName,
        industry: data.industry,
        currentAnnualCost: currentAnnualCost,
        timeSavedHours: timeSavedHours,
        laborSavings: laborSavings,
        errorReductionValue: errorReductionValue,
        totalAnnualSavings: totalAnnualSavings,
        annualAICosts: annualAICosts,
        totalImplementationCost: totalImplementationCost,
        netAnnualBenefit: netAnnualBenefit,
        roiPercentage: roiPercentage,
        paybackMonths: paybackMonths,
        fiveYearProjection: fiveYearProjection
    };
}

function displayResults(results) {
    // Update summary cards
    document.getElementById('annualSavings').textContent = formatCurrency(results.totalAnnualSavings);
    document.getElementById('roiPercentage').textContent = formatPercentage(results.roiPercentage);
    document.getElementById('paybackPeriod').textContent = formatMonths(results.paybackMonths);
    
    // Update breakdown
    document.getElementById('currentCost').textContent = formatCurrency(results.currentAnnualCost);
    document.getElementById('timeSaved').textContent = formatHours(results.timeSavedHours);
    document.getElementById('errorReduction').textContent = formatCurrency(results.errorReductionValue);
    document.getElementById('totalImplementation').textContent = formatCurrency(results.totalImplementationCost);
    document.getElementById('annualAICosts').textContent = formatCurrency(results.annualAICosts);
    document.getElementById('netBenefit').textContent = formatCurrency(results.netAnnualBenefit);
}

function createROIChart(results) {
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (window.roiChartInstance) {
        window.roiChartInstance.destroy();
    }
    
    const years = results.fiveYearProjection.map(p => `Year ${p.year}`);
    const netValues = results.fiveYearProjection.map(p => p.netValue);
    const savings = results.fiveYearProjection.map(p => p.savings);
    const costs = results.fiveYearProjection.map(p => p.costs);
    
    window.roiChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Net Value',
                    data: netValues,
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Cumulative Savings',
                    data: savings,
                    borderColor: '#00CC66',
                    backgroundColor: 'rgba(0, 204, 102, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Cumulative Costs',
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
                    text: '5-Year ROI Projection',
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
                            return '€' + value.toLocaleString();
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
            }
        }
    });
}

function initResultsActions() {
    // Download Report
    const downloadBtn = document.getElementById('downloadReport');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            generatePDFReport();
        });
    }
    
    // Schedule Consultation
    const consultationBtn = document.getElementById('scheduleConsultation');
    if (consultationBtn) {
        consultationBtn.addEventListener('click', function() {
            window.location.href = 'index.html#contact';
        });
    }
    
    // Email Results
    const emailBtn = document.getElementById('emailResults');
    if (emailBtn) {
        emailBtn.addEventListener('click', function() {
            showEmailModal();
        });
    }
}

function generatePDFReport() {
    // Simple implementation - in a real app, you'd use a PDF library
    const resultsSection = document.getElementById('calculatorResults');
    const processName = document.getElementById('processName').value;
    
    // Create a new window with the results for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ROI Analysis Report - ${processName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .results-summary { display: flex; justify-content: space-around; margin: 20px 0; }
                .result-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .breakdown-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
                .highlight { background: #0066CC; color: white; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AI Agent ROI Analysis Report</h1>
                <h2>${processName}</h2>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            ${resultsSection.innerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function showEmailModal() {
    const email = prompt('Enter your email address to receive the ROI analysis:');
    if (email && validateEmail(email)) {
        // In a real application, you would send this to your backend
        alert('ROI analysis will be sent to ' + email + ' shortly!');
    } else if (email) {
        alert('Please enter a valid email address.');
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Utility functions
function formatCurrency(amount) {
    return '€' + Math.round(amount).toLocaleString();
}

function formatPercentage(percentage) {
    return Math.round(percentage) + '%';
}

function formatMonths(months) {
    if (months <= 0) return 'Immediate';
    if (months < 12) return Math.round(months) + ' months';
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    if (remainingMonths === 0) return years + ' year' + (years > 1 ? 's' : '');
    return years + ' year' + (years > 1 ? 's' : '') + ' ' + remainingMonths + ' months';
}

function formatHours(hours) {
    return Math.round(hours).toLocaleString() + ' hours';
}

// Industry benchmarks data
const industryBenchmarks = {
    finance: {
        avgTimeSaved: 45,
        avgROI: 320,
        avgPayback: 4.2
    },
    healthcare: {
        avgTimeSaved: 38,
        avgROI: 280,
        avgPayback: 5.1
    },
    retail: {
        avgTimeSaved: 35,
        avgROI: 250,
        avgPayback: 5.8
    },
    manufacturing: {
        avgTimeSaved: 52,
        avgROI: 380,
        avgPayback: 3.8
    },
    technology: {
        avgTimeSaved: 42,
        avgROI: 310,
        avgPayback: 4.5
    },
    consulting: {
        avgTimeSaved: 40,
        avgROI: 290,
        avgPayback: 4.8
    },
    marketing: {
        avgTimeSaved: 38,
        avgROI: 275,
        avgPayback: 5.2
    },
    other: {
        avgTimeSaved: 40,
        avgROI: 300,
        avgPayback: 5.0
    }
};

// Auto-fill suggestions based on industry
function updateIndustryDefaults() {
    const industrySelect = document.getElementById('industry');
    const implementationCostInput = document.getElementById('implementationCost');
    const monthlyCostInput = document.getElementById('monthlyCost');
    
    if (industrySelect) {
        industrySelect.addEventListener('change', function() {
            const industry = this.value;
            if (industry && industryBenchmarks[industry]) {
                // Suggest default costs based on industry
                if (!implementationCostInput.value) {
                    const suggestedImplementation = industry === 'finance' ? 8000 : 
                                                 industry === 'healthcare' ? 6000 :
                                                 industry === 'manufacturing' ? 10000 : 5000;
                    implementationCostInput.placeholder = suggestedImplementation;
                }
                
                if (!monthlyCostInput.value) {
                    const suggestedMonthly = industry === 'finance' ? 300 : 
                                           industry === 'healthcare' ? 250 :
                                           industry === 'manufacturing' ? 400 : 200;
                    monthlyCostInput.placeholder = suggestedMonthly;
                }
            }
        });
    }
}

// Initialize industry defaults
document.addEventListener('DOMContentLoaded', function() {
    updateIndustryDefaults();
});

// Form auto-save to localStorage
function initAutoSave() {
    const form = document.getElementById('roiCalculator');
    if (!form) return;
    
    // Load saved data
    const savedData = localStorage.getItem('roiCalculatorData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input && data[key]) {
                    input.value = data[key];
                    if (key === 'automationLevel') {
                        document.querySelector('.slider-value').textContent = data[key] + '%';
                    }
                }
            });
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
    
    // Save data on input
    form.addEventListener('input', function() {
        const formData = getFormData();
        localStorage.setItem('roiCalculatorData', JSON.stringify(formData));
    });
}

// Initialize auto-save
document.addEventListener('DOMContentLoaded', function() {
    initAutoSave();
});

// Clear saved data on reset
document.getElementById('resetForm')?.addEventListener('click', function() {
    localStorage.removeItem('roiCalculatorData');
});
