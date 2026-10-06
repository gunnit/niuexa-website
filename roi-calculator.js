/**
 * ROI Calculator
 * Real-time estimate from the visitor's own inputs: no submit needed,
 * pure math in the browser, nothing is sent anywhere.
 * The output is an estimate, never a promise: copy and labels say so.
 */

// User-facing strings keyed on document language (same pattern as cookie-banner.js)
const ROI_STRINGS = {
    it: {
        locale: 'it-IT',
        htmlLang: 'it',
        defaultProcess: 'Processo',
        yearLabel: 'Anno',
        netValue: 'Valore netto',
        cumulativeSavings: 'Risparmi cumulati',
        cumulativeCosts: 'Costi cumulati',
        chartLabel: 'Grafico: valore netto, risparmi e costi cumulati in 5 anni con i valori inseriti',
        immediate: 'Immediato',
        never: 'Non recuperato con questi valori',
        noCosts: 'Nessun costo inserito',
        notAvailable: 'n/d',
        lessThanMonth: '< 1 mese',
        months: 'mesi',
        oneYear: ' anno',
        years: ' anni',
        and: ' e ',
        hours: ' ore',
        reportTitle: 'Stima ROI',
        reportHeader: 'Stima ROI di un processo',
        sector: 'Settore',
        notSpecified: 'Non specificato',
        generatedOn: 'Generato il',
        before: 'Oggi',
        after: 'Con l\'automazione (stima)',
        perYear: '/anno',
        annualSavings: 'Risparmio lordo annuo',
        roi: 'ROI sul primo anno',
        payback: 'Recupero del costo iniziale',
        breakdown: 'Dettaglio del calcolo',
        currentAnnualCost: 'Costo annuo attuale del processo:',
        timeSaved: 'Ore risparmiate all\'anno:',
        errorReduction: 'Valore degli errori evitati:',
        implementationCost: 'Costo iniziale:',
        annualAICosts: 'Costi ricorrenti annui:',
        netAnnualBenefit: 'Beneficio netto annuo:',
        reportNote: 'Stima calcolata solo dai valori inseriti: non è una previsione né una garanzia di risultato.',
        reportFooter1: 'Stima generata con il calcolatore ROI di Niuexa',
        reportFooter2: 'Prima chiamata di 30 minuti gratuita: niuexa.ai/contatti.html',
        contactUrl: 'contatti.html'
    },
    en: {
        locale: 'en-GB',
        htmlLang: 'en',
        defaultProcess: 'Process',
        yearLabel: 'Year',
        netValue: 'Net value',
        cumulativeSavings: 'Cumulative savings',
        cumulativeCosts: 'Cumulative costs',
        chartLabel: 'Chart: net value, cumulative savings and cumulative costs over 5 years with the values entered',
        immediate: 'Immediate',
        never: 'Not recovered with these values',
        noCosts: 'No costs entered',
        notAvailable: 'n/a',
        lessThanMonth: '< 1 month',
        months: 'months',
        oneYear: ' year',
        years: ' years',
        and: ' and ',
        hours: ' hours',
        reportTitle: 'ROI estimate',
        reportHeader: 'ROI estimate for one process',
        sector: 'Industry',
        notSpecified: 'Not specified',
        generatedOn: 'Generated on',
        before: 'Today',
        after: 'With automation (estimate)',
        perYear: '/year',
        annualSavings: 'Gross annual saving',
        roi: 'First-year ROI',
        payback: 'Recovery of the initial cost',
        breakdown: 'Calculation detail',
        currentAnnualCost: 'Current annual cost of the process:',
        timeSaved: 'Hours saved per year:',
        errorReduction: 'Value of errors avoided:',
        implementationCost: 'Initial cost:',
        annualAICosts: 'Annual running costs:',
        netAnnualBenefit: 'Net annual benefit:',
        reportNote: 'Estimate calculated only from the values entered: it is neither a forecast nor a guarantee of results.',
        reportFooter1: 'Estimate generated with the Niuexa ROI calculator',
        reportFooter2: 'Free 30-minute first call: niuexa.ai/en/contact.html',
        contactUrl: '/en/contact.html'
    }
};
const roiT = ROI_STRINGS[(document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it'];

const ROICalculator = {
    form: null,
    resultsSection: null,
    currentResults: null,

    CONFIG: {
        // Example value shown on the slider; the page labels it as a value to replace
        DEFAULT_AUTOMATION_LEVEL: 50,
        ERROR_REDUCTION_FACTOR: 0.5,
        CHART_HEIGHT: 300,
        DEBOUNCE_DELAY: 200
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
            const container = this.resultsSection.closest('.calculator-container');
            if (container) container.classList.remove('has-results');
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
            processName: get('processName').trim() || roiT.defaultProcess,
            industry: get('industry'),
            industryLabel: (() => {
                const el = document.getElementById('industry');
                return el && el.value && el.selectedOptions[0] ? el.selectedOptions[0].text : '';
            })(),
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
            industryLabel: data.industryLabel,
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
        this.setElementText('roiPercentage', this.formatROI(results.roiPercentage));
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
        const container = this.resultsSection.closest('.calculator-container');
        if (container) container.classList.add('has-results');
        if (this.resultsSection.style.display === 'block') return; // already visible
        this.resultsSection.style.display = 'block';
        this.resultsSection.classList.add('slideInRight');
    },

    createChart(results) {
        const ctx = document.getElementById('roiChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (window.roiChartInstance) {
            window.roiChartInstance.destroy();
        }

        // Colours and fonts come from the design tokens in styles.css
        const rootStyle = getComputedStyle(document.documentElement);
        const token = (name, fallback) => (rootStyle.getPropertyValue(name) || '').trim() || fallback;
        const withAlpha = (hex, alpha) => {
            const m = /^#([0-9a-f]{6})$/i.exec(hex);
            if (!m) return hex;
            const n = parseInt(m[1], 16);
            return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
        };
        const netColor = token('--blue-text', '#1F6E94');
        const savingsColor = token('--green-text', '#2C7A45');
        const costsColor = token('--error-text', '#B02A37');
        const gridColor = withAlpha(token('--dark-gray', '#14324A'), 0.08);
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (window.Chart && Chart.defaults) {
            Chart.defaults.font.family = token('--font-secondary', 'system-ui, sans-serif');
            Chart.defaults.color = token('--medium-gray', '#54697A');
        }
        ctx.setAttribute('role', 'img');
        ctx.setAttribute('aria-label', roiT.chartLabel);

        const years = results.fiveYearProjection.map(p => `${roiT.yearLabel} ${p.year}`);
        const netValues = results.fiveYearProjection.map(p => p.netValue);
        const savings = results.fiveYearProjection.map(p => p.savings);
        const costs = results.fiveYearProjection.map(p => p.costs);

        window.roiChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: roiT.netValue,
                        data: netValues,
                        borderColor: netColor,
                        backgroundColor: withAlpha(netColor, 0.1),
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: roiT.cumulativeSavings,
                        data: savings,
                        borderColor: savingsColor,
                        backgroundColor: withAlpha(savingsColor, 0.1),
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: roiT.cumulativeCosts,
                        data: costs,
                        borderColor: costsColor,
                        backgroundColor: withAlpha(costsColor, 0.1),
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
                    // The section heading above the canvas already names the chart
                    title: { display: false },
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
                        grid: { color: gridColor }
                    },
                    x: {
                        grid: { color: gridColor }
                    }
                },
                interaction: { intersect: false, mode: 'index' },
                elements: { point: { radius: 6, hoverRadius: 8 } },
                animation: reduceMotion ? false : { duration: 400, easing: 'easeOutQuart' }
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
                window.location.href = roiT.contactUrl;
                this.trackAnalytics('consultation_requested');
            });
        }
    },

    generatePDFReport() {
        if (!this.currentResults) return;
        const r = this.currentResults;
        const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const processName = esc(r.processName);
        const industry = esc(r.industryLabel || roiT.notSpecified);

        const reportContent = `<!DOCTYPE html>
<html lang="${roiT.htmlLang}">
<head>
    <meta charset="UTF-8">
    <title>${roiT.reportTitle}: ${processName}</title>
    <style>
        body { font-family: 'Hanken Grotesk', system-ui, sans-serif; margin: 20px; line-height: 1.6; color: #14324A; }
        .header { text-align: center; margin-bottom: 40px; padding: 20px; background: linear-gradient(135deg, #1F64AE, #2C7A45); color: white; border-radius: 10px; }
        .header h1 { margin: 0; font-size: 2.5rem; }
        .header h2 { margin: 10px 0; font-size: 1.5rem; opacity: 0.9; }
        .header p { margin: 5px 0; opacity: 0.8; }
        .comparison { display: flex; gap: 20px; margin: 30px 0; }
        .comparison > div { flex: 1; padding: 20px; border-radius: 10px; text-align: center; }
        .before { background: #F1F5F8; border: 2px solid #CBD5E0; }
        .after { background: #E6F5EC; border: 2px solid #2C7A45; }
        .comparison h3 { margin-bottom: 10px; }
        .comparison .value { font-size: 1.8rem; font-weight: bold; }
        .summary { display: flex; justify-content: space-around; margin: 30px 0; gap: 20px; }
        .summary-card { flex: 1; text-align: center; padding: 20px; border: 2px solid #1F64AE; border-radius: 10px; background: #F1F5F8; }
        .summary-card h3 { color: #1F6E94; margin-bottom: 10px; }
        .summary-card .value { font-size: 2rem; font-weight: bold; }
        .breakdown { margin: 40px 0; }
        .breakdown h3 { color: #1F6E94; border-bottom: 2px solid #1F6E94; padding-bottom: 10px; }
        .note { margin: 20px 0; padding: 12px 16px; background: #F1F5F8; border-radius: 8px; font-size: 0.95rem; }
        .breakdown-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 50px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        @media print { body { margin: 0; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${roiT.reportHeader}</h1>
        <h2>${processName}</h2>
        <p>${roiT.sector}: ${industry}</p>
        <p>${roiT.generatedOn} ${new Date().toLocaleDateString(roiT.locale, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="comparison">
        <div class="before">
            <h3>${roiT.before}</h3>
            <div class="value">${this.formatHours(r.currentAnnualHours)}${roiT.perYear}</div>
            <p>${this.formatCurrency(r.currentAnnualCost)}${roiT.perYear}</p>
        </div>
        <div class="after">
            <h3>${roiT.after}</h3>
            <div class="value">${this.formatHours(r.afterAIHours)}${roiT.perYear}</div>
            <p>${this.formatCurrency(r.afterAICost)}${roiT.perYear}</p>
        </div>
    </div>
    <div class="summary">
        <div class="summary-card"><h3>${roiT.annualSavings}</h3><div class="value">${this.formatCurrency(r.totalAnnualSavings)}</div></div>
        <div class="summary-card"><h3>${roiT.roi}</h3><div class="value">${this.formatROI(r.roiPercentage)}</div></div>
        <div class="summary-card"><h3>${roiT.payback}</h3><div class="value">${this.formatMonths(r.paybackMonths)}</div></div>
    </div>
    <div class="breakdown">
        <h3>${roiT.breakdown}</h3>
        <div class="breakdown-item"><span>${roiT.currentAnnualCost}</span><strong>${this.formatCurrency(r.currentAnnualCost)}</strong></div>
        <div class="breakdown-item"><span>${roiT.timeSaved}</span><strong>${this.formatHours(r.timeSavedHours)}</strong></div>
        <div class="breakdown-item"><span>${roiT.errorReduction}</span><strong>${this.formatCurrency(r.errorReductionValue)}</strong></div>
        <div class="breakdown-item"><span>${roiT.implementationCost}</span><strong>${this.formatCurrency(r.totalImplementationCost)}</strong></div>
        <div class="breakdown-item"><span>${roiT.annualAICosts}</span><strong>${this.formatCurrency(r.annualAICosts)}</strong></div>
        <div class="breakdown-item"><span>${roiT.netAnnualBenefit}</span><strong>${this.formatCurrency(r.netAnnualBenefit)}</strong></div>
    </div>
    <p class="note">${roiT.reportNote}</p>
    <div class="footer">
        <p><strong>${roiT.reportFooter1}</strong></p>
        <p>${roiT.reportFooter2}</p>
        <p>Web: niuexa.ai | Email: info@niuexa.ai</p>
    </div>
</body>
</html>`;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) return; // pop-up blocked: nothing to print into
        printWindow.document.write(reportContent);
        printWindow.document.close();
        printWindow.onload = function() { printWindow.print(); };
    },

    // Form management
    resetForm() {
        this.form.reset();
        this.resultsSection.style.display = 'none';
        const container = this.resultsSection.closest('.calculator-container');
        if (container) container.classList.remove('has-results');
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
        if (!isFinite(amount)) return roiT.notAvailable;
        return new Intl.NumberFormat(roiT.locale, {
            style: 'currency', currency: 'EUR',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
            // Italian CLDR leaves 4-digit amounts ungrouped (5000 € next to 45.500 €)
            useGrouping: 'always'
        }).format(Math.round(amount));
    },

    // ROI is infinite only when no cost was entered: say that instead of a symbol
    formatROI(pct) {
        if (!isFinite(pct)) return roiT.noCosts;
        return this.formatPercentage(pct);
    },

    formatPercentage(pct) {
        if (!isFinite(pct)) return roiT.notAvailable;
        return new Intl.NumberFormat(roiT.locale, {
            style: 'percent',
            minimumFractionDigits: 0, maximumFractionDigits: 1
        }).format(pct / 100);
    },

    formatMonths(months) {
        // Infinity means the net benefit never covers the initial cost
        if (!isFinite(months)) return roiT.never;
        if (months <= 0) return roiT.immediate;
        if (months < 1) return roiT.lessThanMonth;
        if (months < 12) return Math.round(months) + ' ' + roiT.months;
        const years = Math.floor(months / 12);
        const rem = Math.round(months % 12);
        let str = years + (years === 1 ? roiT.oneYear : roiT.years);
        if (rem > 0) str += roiT.and + rem + ' ' + roiT.months;
        return str;
    },

    formatHours(hours) {
        if (!isFinite(hours)) return roiT.notAvailable;
        return new Intl.NumberFormat(roiT.locale, { useGrouping: 'always' }).format(Math.round(hours)) + roiT.hours;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ROICalculator.init();
});