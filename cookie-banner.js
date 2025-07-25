// GDPR Cookie Banner Implementation
class CookieBanner {
    constructor() {
        this.cookieName = 'niuexa_cookie_consent';
        this.consentData = this.getConsentData();
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
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h4>🍪 Utilizziamo i Cookie</h4>
                    <p>Questo sito utilizza cookie tecnici e di analytics per migliorare la tua esperienza di navigazione. 
                    I dati sono trattati in conformità al <a href="privacy-policy.html" target="_blank">GDPR</a>.</p>
                </div>
                <div class="cookie-banner-buttons">
                    <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">
                        Accetta Tutti
                    </button>
                    <button id="cookie-reject-all" class="cookie-btn cookie-btn-secondary">
                        Solo Necessari
                    </button>
                    <button id="cookie-customize" class="cookie-btn cookie-btn-text">
                        Personalizza
                    </button>
                </div>
            </div>
            <div id="cookie-settings-panel" class="cookie-settings-panel" style="display: none;">
                <h4>Gestisci le tue preferenze sui cookie</h4>
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="necessary-cookies" checked disabled>
                        <label for="necessary-cookies"><strong>Cookie Necessari (Obbligatori)</strong></label>
                    </div>
                    <p>Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati.</p>
                </div>
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <input type="checkbox" id="analytics-cookies">
                        <label for="analytics-cookies"><strong>Cookie Analitici</strong></label>
                    </div>
                    <p>Ci aiutano a capire come i visitatori interagiscono con il sito raccogliendo informazioni anonime.</p>
                </div>
                <div class="cookie-settings-buttons">
                    <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">
                        Salva Preferenze
                    </button>
                    <button id="cookie-back" class="cookie-btn cookie-btn-secondary">
                        Indietro
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