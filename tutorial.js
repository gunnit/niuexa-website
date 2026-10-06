// Tutorial Detail Page JavaScript

// User-facing strings keyed on document language (same pattern as cookie-banner.js)
const TUTORIAL_STRINGS = {
    it: {
        copy: 'Copia',
        copied: 'Copiato',
        copyError: 'Copia non riuscita',
        copyLabel: 'Copia il codice',
        print: 'Stampa',
        shareTitle: 'Condivida questa guida',
        copyLink: 'Copia link',
        linkCopied: 'Link copiato',
        backToTop: 'Torna all\'inizio'
    },
    en: {
        copy: 'Copy',
        copied: 'Copied',
        copyError: 'Copy failed',
        copyLabel: 'Copy the code',
        print: 'Print',
        shareTitle: 'Share this guide',
        copyLink: 'Copy link',
        linkCopied: 'Link copied',
        backToTop: 'Back to top'
    }
};
// Drawn icons (Feather style) for the controls this script adds
const TUTORIAL_ICONS = {
    print: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    whatsapp: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    up: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'
};
function tutorialIcon(name) {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + TUTORIAL_ICONS[name] + '</svg>';
}

const tutorialT = TUTORIAL_STRINGS[(document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it'];

document.addEventListener('DOMContentLoaded', function() {
    
    // Chapter accordion functionality
    initChapterAccordion();
    
    // Table of Contents smooth scrolling and highlighting (fallback)
    initTableOfContents();
    
    // Reading progress indicator
    initReadingProgress();
    
    // Code copying functionality
    initCodeCopying();

    // Print functionality
    initPrintFeature();

    // Social sharing
    initSocialSharing();
});

// Chapter Accordion functionality
function initChapterAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.closest('.accordion-item');
            const accordionContent = accordionItem.querySelector('.accordion-content');
            const isActive = this.classList.contains('active');
            
            // Close all accordion items first
            accordionHeaders.forEach(otherHeader => {
                otherHeader.classList.remove('active');
                const otherItem = otherHeader.closest('.accordion-item');
                const otherContent = otherItem.querySelector('.accordion-content');
                otherContent.classList.remove('active');
            });
            
            // If the clicked item wasn't active, open it
            if (!isActive) {
                this.classList.add('active');
                accordionContent.classList.add('active');
                
                // Smooth scroll to section if it exists
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    setTimeout(() => {
                        const targetSection = document.getElementById(targetId);
                        if (targetSection) {
                            const headerOffset = 120;
                            const elementPosition = targetSection.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            
                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                }
            }
        });
    });
    
    // Close accordion when clicking outside
    document.addEventListener('click', function(e) {
        const accordion = document.querySelector('.chapter-accordion');
        if (accordion && !accordion.contains(e.target)) {
            // Don't close on outside clicks for better UX
            // accordionHeaders.forEach(header => {
            //     header.classList.remove('active');
            //     const content = header.closest('.accordion-item').querySelector('.accordion-content');
            //     content.classList.remove('active');
            // });
        }
    });
}

// Table of Contents functionality
function initTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-list a');
    const sections = document.querySelectorAll('.content-section');
    
    // Smooth scrolling for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerOffset = 100; // Account for fixed header
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update active state
                updateActiveTocLink(targetId);
            }
        });
    });
    
    // Highlight current section in TOC while scrolling
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px 0px -50% 0px'
    };
    
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateActiveTocLink(entry.target.id);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        if (section.id) {
            sectionObserver.observe(section);
        }
    });
}

function updateActiveTocLink(activeId) {
    const tocLinks = document.querySelectorAll('.toc-list a');
    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
        }
    });
}

// Reading progress indicator
function initReadingProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    
    // Add styles
    const progressStyles = `
        .reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(35, 125, 166, 0.12);
            z-index: 1000;
        }

        .progress-fill {
            height: 100%;
            background: var(--gradient-primary);
            /* Scaled, not resized: animating width relayouts the page on every
               scroll frame, transform stays on the compositor. */
            width: 100%;
            transform: scaleX(0);
            transform-origin: left center;
            transition: transform 0.1s linear;
        }

        @media (prefers-reduced-motion: reduce) {
            .progress-fill { transition: none; }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = progressStyles;
    document.head.appendChild(style);
    document.body.appendChild(progressBar);
    
    const progressFill = progressBar.querySelector('.progress-fill');
    
    // Update progress on scroll. Reads are batched into a rAF so a fast scroll
    // cannot force a layout per wheel event.
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollTop = window.pageYOffset;
            const progress = documentHeight > 0 ? scrollTop / documentHeight : 0;

            progressFill.style.transform = 'scaleX(' + Math.min(Math.max(progress, 0), 1) + ')';
            ticking = false;
        });
    }, { passive: true });
}

// Code copying functionality
function initCodeCopying() {
    const codeBlocks = document.querySelectorAll('pre code, .code-block');
    
    codeBlocks.forEach(codeBlock => {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        wrapper.style.position = 'relative';
        
        codeBlock.parentNode.insertBefore(wrapper, codeBlock);
        wrapper.appendChild(codeBlock);
        
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'copy-code-btn';
        copyButton.textContent = tutorialT.copy;
        copyButton.setAttribute('aria-label', tutorialT.copyLabel);

        wrapper.appendChild(copyButton);

        // Copy functionality
        copyButton.addEventListener('click', async function() {
            const text = codeBlock.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                this.textContent = tutorialT.copied;
                setTimeout(() => {
                    this.textContent = tutorialT.copy;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                this.textContent = tutorialT.copyError;
                setTimeout(() => {
                    this.textContent = tutorialT.copy;
                }, 2000);
            }
        });
    });
}

// Print: a quiet control in the article header (it used to float over the text)
function initPrintFeature() {
    const tutorialStats = document.querySelector('.tutorial-stats');
    if (!tutorialStats) return;
    const printButton = document.createElement('button');
    printButton.type = 'button';
    printButton.className = 'tutorial-action-btn print-tutorial-btn';
    printButton.innerHTML = tutorialIcon('print') + '<span>' + tutorialT.print + '</span>';
    printButton.addEventListener('click', function() {
        window.print();
    });
    tutorialStats.appendChild(printButton);
}

// Social sharing functionality
function initSocialSharing() {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-share';
    shareContainer.innerHTML = `
        <h2 class="social-share-title">${tutorialT.shareTitle}</h2>
        <div class="share-buttons">
            <button type="button" class="share-btn" data-platform="linkedin">${tutorialIcon('linkedin')}<span>LinkedIn</span></button>
            <button type="button" class="share-btn" data-platform="x"><span>X</span></button>
            <button type="button" class="share-btn" data-platform="whatsapp">${tutorialIcon('whatsapp')}<span>WhatsApp</span></button>
            <button type="button" class="share-btn copy-link" data-platform="copy">${tutorialIcon('link')}<span class="share-btn-label">${tutorialT.copyLink}</span></button>
        </div>
    `;

    // Insert share container after conclusion
    const conclusion = document.querySelector('.conclusion');
    if (conclusion) {
        conclusion.parentNode.insertBefore(shareContainer, conclusion.nextSibling);
    }
    
    // Add event listeners for share buttons
    const shareButtons = shareContainer.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.dataset.platform;
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl = '';
            
            switch (platform) {
                case 'x':
                    shareUrl = `https://x.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${title}%20${url}`;
                    break;
                case 'copy':
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        const label = this.querySelector('.share-btn-label');
                        label.textContent = tutorialT.linkCopied;
                        setTimeout(() => {
                            label.textContent = tutorialT.copyLink;
                        }, 2000);
                    });
                    return;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

// Utility function for analytics
function trackTutorialProgress(sectionId) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'tutorial_section_view', {
            'section_id': sectionId,
            'tutorial_url': window.location.pathname
        });
    }
}

// Back to top functionality
function initBackToTop() {
    const backToTopButton = document.createElement('button');
    backToTopButton.type = 'button';
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = tutorialIcon('up');
    backToTopButton.setAttribute('aria-label', tutorialT.backToTop);
    document.body.appendChild(backToTopButton);

    let ticking = false;
    window.addEventListener('scroll', function() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() {
            backToTopButton.classList.toggle('is-visible', window.pageYOffset > 600);
            ticking = false;
        });
    }, { passive: true });

    backToTopButton.addEventListener('click', function() {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
}

// Initialize back to top
initBackToTop();

// Active TOC entry and the controls above are styled in tutorial.css
