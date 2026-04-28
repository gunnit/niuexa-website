/**
 * ROI Calculator - Live Call Edition
 * Real-time calculation, no submit button needed.
 * Pure math — no AI API required.
 */

const ROICalculator = {
    form: null,
    resultsSection: null,
    currentResults: null,

    CONFIG: {
        DEFAULT_AUTOMATION_LEVEL: 80,
        ERROR_REDUCTION_FACTOR: 0.5,
        CHART_HEIGHT: 300,
        DEBOUNCE_DELAY: 200
    },

    // Industry benchmarks for smart defaults
    INDUSTRY_BENCHMARKS: {
        finance:       { implementation: 8000, monthly: 300, errorRate: 4, automation: 85 },
        healthcare:    { implementation: 6000, monthly: 250, errorRate: 6, automation: 75 },
        retail:        { implementation: 5000, monthly: 200, errorRate: 5, automation: 80 },
        manufacturing: { implementation: 10000, monthly: 400, errorRate: 7, automation: 85 },
        technology:    { implementation: 7000, monthly: 350, errorRate: 3, automation: 90 },
        consulting:    { implementation: 6000, monthly: 250, errorRate: 4, automation: 80 },
        marketing:     { implementation: 5500, monthly: 275, errorRate: 5, automation: 80 },
        other:         { implementation: 5000, monthly: 200, errorRate: 5, automation: 80 }
    },

    init() {
        if (!this.cacheElements()) {
            console.error('ROI Calculator: Required elements not found');
            return;
        }
        this.bindEvents();
        this.loadSavedData();
        this.trackAnalytics('calculator_loaded');
        // Run initial calc if there's saved data
        this.recalculate();
    },

    cacheElements() {
        this.form = document.getElementById('roiCalculator');
        this.resultsSection = document.getElementById('calculatorResults');
        this.automationSlider = document.getElementById('automationLevel');
        this.sliderValue = document.querySelector('.slider-value');
        this.resetButton = document.getElementById('resetForm');

        if (!this.form || !this.resultsSection) return false;
        return true;
    },

    bindEvents() {
        if (!this.form) return;

        // Real-time calculation on ANY input change — no submit needed
        this.form.addEventListener('input', this.debounce(() => {
            this.recalculate();
            this.saveFormData();
        }, this.CONFIG.DEBOUNCE_DELAY));

        // Also calc on select change (frequency, industry)
        this.form.addEventListener('change', () => {
            this.recalculate();
            this.saveFormData();
        });

        // Slider value display
        if (this.automationSlider && this.sliderValue) {
            this.automationSlider.addEventListener('input', (e) => {
                this.sliderValue.textContent = e.target.value + '%';
            });
        }

        // Industry selection → fill smart defaults
        const industrySelect = document.getElementById('industry');
        if (industrySelect) {
            industrySelect.addEventListener('change', (e) => {
                this.applyIndustryDefaults(e.target.value);
            });
        }

        // Submit button still works (scrolls to results)
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.recalculate();
            if (this.resultsSection.style.display !== 'none') {
                this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        // Reset
        if (this.resetButton) {
            this.resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm();
            });
        }

        // Results actions
        this.initResultsActions();
    },

    // Apply smart defaults when industry is selected
    applyIndustryDefaults(industry) {
        const bench = this.INDUSTRY_BENCHMARKS[industry];
        if (!bench) return;

        const fields = {
            implementationCost: bench.implementation,
            monthlyCost: bench.monthly,
            errorRate: bench.errorRate,
            automationLevel: bench.automation
        };

        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el && !el.value) {
                el.value = value;
                if (id === 'automationLevel' && this.sliderValue) {
                    this.sliderValue.textContent = value + '%';
                }
            }
        });
    },

    // Core: recalculate and show/hide results in real time
    recalculate() {
        const data = this.getFormData();

        // Need at minimum: time, frequency, occurrences, hourly rate
        const hasMinimumData = data.timePerProcess > 0 &&
                               data.frequency &&
                               data.occurrences > 0 &&
                               data.hourlyRate > 0;

        if (!hasMinimumData) {
            this.resultsSection.style.display = 'none';
            return;
        }

        try {
            const results = this.performROICalculation(data);
            this.currentResults = results;
            this.displayResults(results);
            this.showResultsSection();
        } catch (error) {
            console.error('Calculation error:', error);
        }
    },

    getFormData() {
        const get = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        const num = (id, fallback) => {
            const v = parseFloat(get(id));
            return isNaN(v) ? (fallback || 0) : v;
        };

        return {
            processName: get('processName').trim() || 'Processo',
            industry: get('industry'),
            timePerProcess: num('timePerProcess'),
            frequency: get('frequency'),
            occurrences: num('occurrences'),
            hourlyRate: num('hourlyRate'),
            peopleInvolved: num('peopleInvolved', 1),
            errorRate: num('errorRate', 0),
            automationLevel: num('automationLevel', this.CONFIG.DEFAULT_AUTOMATION_LEVEL),
            implementationCost: num('implementationCost', 0),
            monthlyCost: num('monthlyCost', 0)
        };
    },

    performROICalculation(data) {
        const frequencyMultipliers = {
            'daily': 260,   // working days, not 365
            'weekly': 52,
            'monthly': 12
        };

        const annualMultiplier = frequencyMultipliers[data.frequency];
        if (!annualMultiplier) throw new Error('Invalid frequency');

        // Current state
        const timePerProcessHours = data.timePerProcess / 60;
        const totalTimePerOccurrence = timePerProcessHours * data.peopleInvolved;
        const annualOccurrences = data.occurrences * annualMultiplier;
        const totalAnnualHours = totalTimePerOccurrence * annualOccurrences;
        const currentAnnualCost = totalAnnualHours * data.hourlyRate;

        // With AI
        const automationPct = data.automationLevel / 100;
        const timeSavedHours = totalAnnualHours * automationPct;
        const timeAfterAI = totalAnnualHours - timeSavedHours;
        const laborSavings = timeSavedHours * data.hourlyRate;

        // Error reduction savings
        const errorReductionValue = currentAnnualCost * (data.errorRate / 100) * this.CONFIG.ERROR_REDUCTION_FACTOR;

        // AI costs
        const annualAICosts = data.monthlyCost * 12;
        const totalImplementationCost = data.implementationCost;

        // Net benefit (labor savings + error savings - AI running costs)
        const totalAnnualSavings = laborSavings + errorReductionValue;
        const netAnnualBenefit = totalAnnualSavings - annualAICosts;

        // ROI = net benefit / total first year investment
        const totalFirstYearCost = totalImplementationCost + annualAICosts;
        const roiPercentage = totalFirstYearCost > 0
            ? ((netAnnualBenefit / totalFirstYearCost) * 100)
            : (netAnnualBenefit > 0 ? Infinity : 0);
        const paybackMonths = netAnnualBenefit > 0
            ? (totalImplementationCost / (netAnnualBenefit / 12))
            : Infinity;

        // 5-year projection (fixed: no double-counting)
        const fiveYearProjection = [];
        for (let year = 0; year <= 5; year++) {
            const cumulativeGrossSavings = totalAnnualSavings * year;
            const cumulativeCosts = totalImplementationCost + (annualAICosts * year);
            const netValue = cumulativeGrossSavings - cumulativeCosts;
            fiveYearProjection.push({
                year,
                savings: cumulativeGrossSavings,
                costs: cumulativeCosts,
                netValue
            });
        }

        return {
            processName: data.processName,
            industry: data.industry,
            // Before/After comparison
            currentAnnualHours: totalAnnualHours,
            currentAnnualCost,
            afterAIHours: timeAfterAI,
            afterAICost: (timeAfterAI * data.hourlyRate) + annualAICosts,
            // Savings
            timeSavedHours,
            laborSavings,
            errorReductionValue,
            totalAnnualSavings,
            // Costs
            annualAICosts,
            totalImplementationCost,
            // Net
            netAnnualBenefit,
            roiPercentage,
            paybackMonths,
            fiveYearProjection
        };
    },

    displayResults(results) {
        // Summary cards
        this.setElementText('annualSavings', this.formatCurrency(results.totalAnnualSavings));
        this.setElementText('roiPercentage', this.formatPercentage(results.roiPercentage));
        this.setElementText('paybackPeriod', this.formatMonths(results.paybackMonths));

        // Before/After comparison
        this.setElementText('beforeHours', this.formatHours(results.currentAnnualHours));
        this.setElementText('beforeCost', this.formatCurrency(results.currentAnnualCost));
        this.setElementText('afterHours', this.formatHours(results.afterAIHours));
        this.setElementText('afterCost', this.formatCurrency(results.afterAICost));

        // Breakdown
        this.setElementText('currentCost', this.formatCurrency(results.currentAnnualCost));
        this.setElementText('timeSaved', this.formatHours(results.timeSavedHours));
        this.setElementText('errorReduction', this.formatCurrency(results.errorReductionValue));
        this.setElementText('totalImplementation', this.formatCurrency(results.totalImplementationCost));
        this.setElementText('annualAICosts', this.formatCurrency(results.annualAICosts));
        this.setElementText('netBenefit', this.formatCurrency(results.netAnnualBenefit));

        // Chart
        this.createChart(results);
    },

    setElementText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    showResultsSection() {
        if (!this.resultsSection) return;
        if (this.resultsSection.style.display === 'block') return; // already visible
        this.resultsSection.style.display = 'block';
        this.resultsSection.classList.add('slideInRight');
    },

    createChart(results) {
        const ctx = document.getElementById('roiChart');
        if (!ctx) return;

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
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 20 }
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
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    x: {
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    }
                },
                interaction: { intersect: false, mode: 'index' },
                elements: { point: { radius: 6, hoverRadius: 8 } },
                animation: { duration: 400, easing: 'easeOutQuart' }
            }
        });
    },

    // Results action buttons
    initResultsActions() {
        const downloadBtn = document.getElementById('downloadReport');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.generatePDFReport();
                this.trackAnalytics('report_downloaded');
            });
        }

        const consultationBtn = document.getElementById('scheduleConsultation');
        if (consultationBtn) {
            consultationBtn.addEventListener('click', () => {
                window.location.href = 'index.html#contact';
                this.trackAnalytics('consultation_requested');
            });
        }

        const emailBtn = document.getElementById('emailResults');
        if (emailBtn) {
            emailBtn.addEventListener('click', () => {
                this.showEmailModal();
            });
        }
    },

    generatePDFReport() {
        if (!this.currentResults) return;
        const r = this.currentResults;

        const reportContent = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Report ROI - ${r.processName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 40px; padding: 20px; background: linear-gradient(135deg, #0066cc, #00cc66); color: white; border-radius: 10px; }
        .header h1 { margin: 0; font-size: 2.5rem; }
        .header h2 { margin: 10px 0; font-size: 1.5rem; opacity: 0.9; }
        .header p { margin: 5px 0; opacity: 0.8; }
        .comparison { display: flex; gap: 20px; margin: 30px 0; }
        .comparison > div { flex: 1; padding: 20px; border-radius: 10px; text-align: center; }
        .before { background: #fff3f3; border: 2px solid #ff6b6b; }
        .after { background: #f0fff4; border: 2px solid #00cc66; }
        .comparison h3 { margin-bottom: 10px; }
        .comparison .value { font-size: 1.8rem; font-weight: bold; }
        .summary { display: flex; justify-content: space-around; margin: 30px 0; gap: 20px; }
        .summary-card { flex: 1; text-align: center; padding: 20px; border: 2px solid #0066cc; border-radius: 10px; background: #f8f9fa; }
        .summary-card h3 { color: #0066cc; margin-bottom: 10px; }
        .summary-card .value { font-size: 2rem; font-weight: bold; }
        .breakdown { margin: 40px 0; }
        .breakdown h3 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        .breakdown-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 50px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        @media print { body { margin: 0; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Report Analisi ROI Agenti AI</h1>
        <h2>${r.processName}</h2>
        <p>Settore: ${r.industry || 'Non specificato'}</p>
        <p>Generato il ${new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="comparison">
        <div class="before">
            <h3>Prima (Stato Attuale)</h3>
            <div class="value">${this.formatHours(r.currentAnnualHours)}/anno</div>
            <p>${this.formatCurrency(r.currentAnnualCost)}/anno</p>
        </div>
        <div class="after">
            <h3>Dopo (Con AI)</h3>
            <div class="value">${this.formatHours(r.afterAIHours)}/anno</div>
            <p>${this.formatCurrency(r.afterAICost)}/anno</p>
        </div>
    </div>
    <div class="summary">
        <div class="summary-card"><h3>Risparmi Annuali</h3><div class="value">${this.formatCurrency(r.totalAnnualSavings)}</div></div>
        <div class="summary-card"><h3>ROI</h3><div class="value">${this.formatPercentage(r.roiPercentage)}</div></div>
        <div class="summary-card"><h3>Payback</h3><div class="value">${this.formatMonths(r.paybackMonths)}</div></div>
    </div>
    <div class="breakdown">
        <h3>Dettaglio</h3>
        <div class="breakdown-item"><span>Costo Annuale Attuale:</span><strong>${this.formatCurrency(r.currentAnnualCost)}</strong></div>
        <div class="breakdown-item"><span>Tempo Risparmiato:</span><strong>${this.formatHours(r.timeSavedHours)}</strong></div>
        <div class="breakdown-item"><span>Riduzione Errori:</span><strong>${this.formatCurrency(r.errorReductionValue)}</strong></div>
        <div class="breakdown-item"><span>Costo Implementazione:</span><strong>${this.formatCurrency(r.totalImplementationCost)}</strong></div>
        <div class="breakdown-item"><span>Costi Annuali AI:</span><strong>${this.formatCurrency(r.annualAICosts)}</strong></div>
        <div class="breakdown-item"><span>Beneficio Netto Annuale:</span><strong>${this.formatCurrency(r.netAnnualBenefit)}</strong></div>
    </div>
    <div class="footer">
        <p><strong>Report generato da Niuexa - Soluzioni AI per il Business</strong></p>
        <p>Per implementare questi risultati, contattaci per una consulenza gratuita.</p>
        <p>Web: niuexa.ai | Email: info@niuexa.ai</p>
    </div>
</body>
</html>`;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(reportContent);
        printWindow.document.close();
        printWindow.onload = function() { printWindow.print(); };
    },

    showEmailModal() {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000;';

        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;padding:2rem;border-radius:15px;max-width:500px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.2);';
        modal.innerHTML = `
            <h3 style="margin-bottom:1rem;color:#0066cc;">Ricevi l'Analisi ROI via Email</h3>
            <p style="margin-bottom:1.5rem;color:#666;">Inserisci il tuo indirizzo email per ricevere il report dettagliato.</p>
            <input type="email" id="emailInput" placeholder="Il tuo indirizzo email" style="width:100%;padding:0.8rem;border:2px solid #e9ecef;border-radius:8px;margin-bottom:1rem;font-size:1rem;box-sizing:border-box;">
            <div style="display:flex;gap:1rem;justify-content:flex-end;">
                <button id="cancelEmail" style="padding:0.8rem 1.5rem;border:2px solid #6c757d;background:transparent;color:#6c757d;border-radius:8px;cursor:pointer;">Annulla</button>
                <button id="sendEmail" style="padding:0.8rem 1.5rem;border:none;background:#0066cc;color:white;border-radius:8px;cursor:pointer;">Invia Report</button>
            </div>`;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        document.getElementById('emailInput').focus();

        const close = () => { if (document.body.contains(overlay)) document.body.removeChild(overlay); };

        document.getElementById('cancelEmail').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
        });

        document.getElementById('sendEmail').addEventListener('click', () => {
            const email = document.getElementById('emailInput').value.trim();
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert(`L'analisi ROI sarà inviata a ${email} a breve!`);
                this.trackAnalytics('email_report_requested', { email });
                close();
            } else {
                alert('Inserisci un indirizzo email valido.');
            }
        });
    },

    // Form management
    resetForm() {
        this.form.reset();
        this.resultsSection.style.display = 'none';
        if (this.sliderValue) this.sliderValue.textContent = this.CONFIG.DEFAULT_AUTOMATION_LEVEL + '%';
        if (this.automationSlider) this.automationSlider.value = this.CONFIG.DEFAULT_AUTOMATION_LEVEL;
        this.clearSavedData();
    },

    saveFormData() {
        try {
            localStorage.setItem('roiCalculatorData', JSON.stringify(this.getFormData()));
        } catch (e) { /* ignore */ }
    },

    loadSavedData() {
        try {
            const saved = localStorage.getItem('roiCalculatorData');
            if (!saved) return;
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input && data[key] !== undefined && data[key] !== '' && data[key] !== 0) {
                    input.value = data[key];
                    if (key === 'automationLevel' && this.sliderValue) {
                        this.sliderValue.textContent = data[key] + '%';
                    }
                }
            });
        } catch (e) { /* ignore */ }
    },

    clearSavedData() {
        try { localStorage.removeItem('roiCalculatorData'); } catch (e) { /* ignore */ }
    },

    // Utilities
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },

    trackAnalytics(event, data = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', event, { event_category: 'ROI Calculator', ...data });
        }
    },

    formatCurrency(amount) {
        if (!isFinite(amount)) return '—';
        return new Intl.NumberFormat('it-IT', {
            style: 'currency', currency: 'EUR',
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(Math.round(amount));
    },

    formatPercentage(pct) {
        if (!isFinite(pct)) return '∞';
        return new Intl.NumberFormat('it-IT', {
            style: 'percent',
            minimumFractionDigits: 0, maximumFractionDigits: 1
        }).format(pct / 100);
    },

    formatMonths(months) {
        if (!isFinite(months) || months <= 0) return 'Immediato';
        if (months < 1) return '< 1 mese';
        if (months < 12) return Math.round(months) + ' mesi';
        const years = Math.floor(months / 12);
        const rem = Math.round(months % 12);
        let str = years + (years === 1 ? ' anno' : ' anni');
        if (rem > 0) str += ' e ' + rem + ' mesi';
        return str;
    },

    formatHours(hours) {
        if (!isFinite(hours)) return '—';
        return new Intl.NumberFormat('it-IT').format(Math.round(hours)) + ' ore';
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ROICalculator.init();
});