// GDPR Cookie Banner Implementation
const COOKIE_BANNER_STRINGS = {
    it: {
        privacyHref: 'privacy-policy.html',
        title: '🍪 Utilizziamo i Cookie',
        intro: 'Questo sito utilizza cookie tecnici e di analytics per migliorare la tua esperienza di navigazione. I dati sono trattati in conformità al',
        privacyLink: 'GDPR',
        acceptAll: 'Accetta Tutti',
        rejectAll: 'Solo Necessari',
        customize: 'Personalizza',
        manageTitle: 'Gestisci le tue preferenze sui cookie',
        necessaryLabel: 'Cookie Necessari (Obbligatori)',
        necessaryDesc: 'Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati.',
        analyticsLabel: 'Cookie Analitici',
        analyticsDesc: 'Ci aiutano a capire come i visitatori interagiscono con il sito raccogliendo informazioni anonime.',
        save: 'Salva Preferenze',
        back: 'Indietro'
    },
    en: {
        privacyHref: '/en/privacy-policy.html',
        title: '🍪 We Use Cookies',
        intro: 'This site uses technical and analytics cookies to improve your browsing experience. Data is processed in compliance with',
        privacyLink: 'GDPR',
        acceptAll: 'Accept All',
        rejectAll: 'Only Necessary',
        customize: 'Customize',
        manageTitle: 'Manage your cookie preferences',
        necessaryLabel: 'Necessary Cookies (Required)',
        necessaryDesc: 'These cookies are essential for the website to function and cannot be disabled.',
        analyticsLabel: 'Analytics Cookies',
        analyticsDesc: 'These help us understand how visitors interact with the site by collecting anonymous information.',
        save: 'Save Preferences',
        back: 'Back'
    }
};

class CookieBanner {
    constructor() {
        this.cookieName = 'niuexa_cookie_consent';
        this.consentData = this.getConsentData();
        this.lang = (document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';
        this.t = COOKIE_BANNER_STRINGS[this.lang];
        this.init();
    }

    init() {
        // Check if consent already given
        if (!this.consentData) {
            this.showBanner();
        } else {
            this.loadAcceptedCookies();
        }
    }

    showBanner() {
        const banner = this.createBannerHTML();
        document.body.appendChild(banner);
        this.attachEventListeners();
    }

    createBannerHTML() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        const t = this.t;
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h4>${t.title}</h4>
                    <p>${t.intro} <a href="${t.privacyHref}" target="_blank">${t.privacyLink}</a>.</p>
                </div>
                <div class="cookie-banner-buttons">
                    <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">
                        ${t.acceptAll}
                    </button>
                    <button id="cookie-reject-all" class="cookie-btn cookie-btn-secondary">
                        ${t.rejectAll}
                    </button>
                    <button id="cookie-customize" class="cookie-btn cookie-btn-text">
                        ${t.customize}
                    </button>
                </div>
            </div>
            <div id="cookie-settings-panel" class="cookie-settings-panel" style="display: none;">
                <h4>${t.manageTitle}</h4>
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="necessary-cookies" checked disabled>
                        <label for="necessary-cookies"><strong>${t.necessaryLabel}</strong></label>
                    </div>
                    <p>${t.necessaryDesc}</p>
                </div>
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="analytics-cookies">
                        <label for="analytics-cookies"><strong>${t.analyticsLabel}</strong></label>
                    </div>
                    <p>${t.analyticsDesc}</p>
                </div>
                <div class="cookie-settings-buttons">
                    <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">
                        ${t.save}
                    </button>
                    <button id="cookie-back" class="cookie-btn cookie-btn-secondary">
                        ${t.back}
                    </button>
                </div>
            </div>
        `;
        return banner;
    }

    attachEventListeners() {
        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            this.acceptAllCookies();
        });

        document.getElementById('cookie-reject-all').addEventListener('click', () => {
            this.acceptOnlyNecessary();
        });

        document.getElementById('cookie-customize').addEventListener('click', () => {
            this.showCustomizePanel();
        });

        document.getElementById('cookie-save-preferences').addEventListener('click', () => {
            this.savePreferences();
        });

        document.getElementById('cookie-back').addEventListener('click', () => {
            this.hideCustomizePanel();
        });
    }

    acceptAllCookies() {
        const consent = {
            necessary: true,
            analytics: true,
            timestamp: Date.now(),
            version: '1.0'
        };
        this.saveConsent(consent);
        this.loadAcceptedCookies();
        this.hideBanner();
    }

    acceptOnlyNecessary() {
        const consent = {
            necessary: true,
            analytics: false,
            timestamp: Date.now(),
            version: '1.0'
        };
        this.saveConsent(consent);
        this.loadAcceptedCookies();
        this.hideBanner();
    }

    showCustomizePanel() {
        document.querySelector('.cookie-banner-content').style.display = 'none';
        document.getElementById('cookie-settings-panel').style.display = 'block';
    }

    hideCustomizePanel() {
        document.querySelector('.cookie-banner-content').style.display = 'block';
        document.getElementById('cookie-settings-panel').style.display = 'none';
    }

    savePreferences() {
        const analyticsConsent = document.getElementById('analytics-cookies').checked;
        const consent = {
            necessary: true,
            analytics: analyticsConsent,
            timestamp: Date.now(),
            version: '1.0'
        };
        this.saveConsent(consent);
        this.loadAcceptedCookies();
        this.hideBanner();
    }

    saveConsent(consent) {
        localStorage.setItem(this.cookieName, JSON.stringify(consent));
        this.consentData = consent;
    }

    getConsentData() {
        const consent = localStorage.getItem(this.cookieName);
        return consent ? JSON.parse(consent) : null;
    }

    loadAcceptedCookies() {
        if (this.consentData && this.consentData.analytics) {
            this.loadGoogleAnalytics();
        }
    }

    loadGoogleAnalytics() {
        // Load Google Analytics only if analytics cookies are accepted
        if (window.gtag) return; // Already loaded

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Strict;Secure'
        });
    }

    hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    // Public method to revoke consent
    revokeConsent() {
        localStorage.removeItem(this.cookieName);
        this.consentData = null;
        // Reload page to remove tracking cookies
        window.location.reload();
    }
}

// CSS for Cookie Banner
const cookieBannerCSS = `
#cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(52, 58, 64, 0.98);
    backdrop-filter: blur(10px);
    color: white;
    padding: 1.5rem;
    z-index: 9999;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    border-top: 2px solid #0066CC;
}

.cookie-banner-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
}

.cookie-banner-text h4 {
    margin: 0 0 0.5rem 0;
    color: #00CC66;
    font-size: 1.1rem;
}

.cookie-banner-text p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

.cookie-banner-text a {
    color: #00CC66;
    text-decoration: underline;
}

.cookie-banner-buttons {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
}

.cookie-btn {
    padding: 0.7rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.cookie-btn-primary {
    background: linear-gradient(135deg, #0066CC, #00CC66);
    color: white;
}

.cookie-btn-primary:hover {
    background: linear-gradient(135deg, #004499, #009944);
    transform: translateY(-1px);
}

.cookie-btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid #6C757D;
}

.cookie-btn-secondary:hover {
    background: #6C757D;
    border-color: #6C757D;
}

.cookie-btn-text {
    background: transparent;
    color: #00CC66;
    text-decoration: underline;
}

.cookie-btn-text:hover {
    color: white;
}

.cookie-settings-panel {
    max-width: 1200px;
    margin: 0 auto;
}

.cookie-settings-panel h4 {
    color: #00CC66;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
}

.cookie-category {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #495057;
}

.cookie-category:last-of-type {
    border-bottom: none;
}

.cookie-category-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.cookie-category-header input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #0066CC;
}

.cookie-category-header label {
    color: white;
    font-size: 0.95rem;
}

.cookie-category p {
    margin: 0;
    font-size: 0.85rem;
    color: #ADB5BD;
    line-height: 1.4;
}

.cookie-settings-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .cookie-banner-content {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
    }
    
    .cookie-banner-buttons {
        flex-direction: column;
        width: 100%;
    }
    
    .cookie-btn {
        width: 100%;
        padding: 0.8rem;
    }
    
    .cookie-settings-buttons {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    #cookie-banner {
        padding: 1rem;
    }
    
    .cookie-banner-text h4 {
        font-size: 1rem;
    }
    
    .cookie-banner-text p {
        font-size: 0.85rem;
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = cookieBannerCSS;
document.head.appendChild(style);

// Initialize Cookie Banner when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new CookieBanner();
});

// Global function to revoke consent
window.revokeCookieConsent = function() {
    if (window.cookieBanner) {
        window.cookieBanner.revokeConsent();
    }
};