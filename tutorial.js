// Tutorial Detail Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Chapter accordion functionality
    initChapterAccordion();
    
    // Table of Contents smooth scrolling and highlighting (fallback)
    initTableOfContents();
    
    // Reading progress indicator
    initReadingProgress();
    
    // Code copying functionality
    initCodeCopying();
    
    // Scroll-based animations
    initScrollAnimations();
    
    // Print functionality
    initPrintFeature();
    
    // Social sharing
    initSocialSharing();
    
    // Bookmark functionality
    initBookmarks();
    
    // Initialize all features
    console.log('Tutorial page initialized');
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
            background: rgba(102, 126, 234, 0.1);
            z-index: 1000;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s ease;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = progressStyles;
    document.head.appendChild(style);
    document.body.appendChild(progressBar);
    
    const progressFill = progressBar.querySelector('.progress-fill');
    
    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const progress = (scrollTop / documentHeight) * 100;
        
        progressFill.style.width = Math.min(progress, 100) + '%';
    });
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
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '📋 Copia';
        copyButton.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            padding: 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        wrapper.appendChild(copyButton);
        
        // Show/hide copy button on hover
        wrapper.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
        });
        
        wrapper.addEventListener('mouseleave', () => {
            copyButton.style.opacity = '0';
        });
        
        // Copy functionality
        copyButton.addEventListener('click', async function() {
            const text = codeBlock.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                this.innerHTML = '✅ Copiato!';
                setTimeout(() => {
                    this.innerHTML = '📋 Copia';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                this.innerHTML = '❌ Errore';
                setTimeout(() => {
                    this.innerHTML = '📋 Copia';
                }, 2000);
            }
        });
    });
}

// Scroll-based animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.content-section, .highlight-box, .example-box, .concept-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Initially hide elements
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        observer.observe(element);
    });
    
    // Add animation keyframes
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(animationStyle);
}

// Print functionality
function initPrintFeature() {
    const printButton = document.createElement('button');
    printButton.className = 'print-tutorial-btn';
    printButton.innerHTML = '🖨️ Stampa Tutorial';
    printButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #667eea;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        font-weight: 500;
        transition: all 0.3s ease;
        z-index: 100;
    `;
    
    printButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    });
    
    printButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
    });
    
    printButton.addEventListener('click', function() {
        window.print();
    });
    
    document.body.appendChild(printButton);
    
    // Hide print button on mobile
    if (window.innerWidth < 768) {
        printButton.style.display = 'none';
    }
}

// Social sharing functionality
function initSocialSharing() {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-share';
    shareContainer.innerHTML = `
        <h4>Condividi questo tutorial</h4>
        <div class="share-buttons">
            <button class="share-btn twitter" data-platform="twitter">🐦 Twitter</button>
            <button class="share-btn linkedin" data-platform="linkedin">💼 LinkedIn</button>
            <button class="share-btn whatsapp" data-platform="whatsapp">💬 WhatsApp</button>
            <button class="share-btn copy-link" data-platform="copy">🔗 Copia Link</button>
        </div>
    `;
    
    // Add styles
    const shareStyles = `
        .social-share {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 2rem;
            margin: 3rem 0;
            text-align: center;
        }
        
        .social-share h4 {
            margin: 0 0 1rem 0;
            color: #2d3748;
        }
        
        .share-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .share-btn {
            background: white;
            border: 2px solid #e2e8f0;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }
        
        .share-btn:hover {
            border-color: #667eea;
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .share-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .share-btn {
                width: 200px;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = shareStyles;
    document.head.appendChild(style);
    
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
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${title}%20${url}`;
                    break;
                case 'copy':
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        this.innerHTML = '✅ Link copiato!';
                        setTimeout(() => {
                            this.innerHTML = '🔗 Copia Link';
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

// Bookmark functionality
function initBookmarks() {
    const bookmarkButton = document.createElement('button');
    bookmarkButton.className = 'bookmark-btn';
    bookmarkButton.innerHTML = '🔖 Aggiungi ai Preferiti';
    
    // Check if already bookmarked
    const tutorialId = window.location.pathname;
    const bookmarks = JSON.parse(localStorage.getItem('niuexa_bookmarks') || '[]');
    const isBookmarked = bookmarks.includes(tutorialId);
    
    if (isBookmarked) {
        bookmarkButton.innerHTML = '✅ Nei Preferiti';
        bookmarkButton.classList.add('bookmarked');
    }
    
    bookmarkButton.style.cssText = `
        background: transparent;
        border: 2px solid #667eea;
        color: #667eea;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        margin: 1rem 0;
    `;
    
    bookmarkButton.addEventListener('click', function() {
        const bookmarks = JSON.parse(localStorage.getItem('niuexa_bookmarks') || '[]');
        const tutorialId = window.location.pathname;
        
        if (bookmarks.includes(tutorialId)) {
            // Remove bookmark
            const index = bookmarks.indexOf(tutorialId);
            bookmarks.splice(index, 1);
            this.innerHTML = '🔖 Aggiungi ai Preferiti';
            this.classList.remove('bookmarked');
        } else {
            // Add bookmark
            bookmarks.push(tutorialId);
            this.innerHTML = '✅ Nei Preferiti';
            this.classList.add('bookmarked');
        }
        
        localStorage.setItem('niuexa_bookmarks', JSON.stringify(bookmarks));
    });
    
    // Insert bookmark button in tutorial header
    const tutorialStats = document.querySelector('.tutorial-stats');
    if (tutorialStats) {
        tutorialStats.appendChild(bookmarkButton);
    }
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
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 6rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.5rem;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 99;
    `;
    
    document.body.appendChild(backToTopButton);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
        } else {
            backToTopButton.style.opacity = '0';
        }
    });
    
    // Scroll to top on click
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize back to top
initBackToTop();

// Add active TOC styling
const tocStyle = document.createElement('style');
tocStyle.textContent = `
    .toc-list a.active {
        color: #5a67d8;
        font-weight: 600;
        border-left: 3px solid #667eea;
        padding-left: 1rem;
        background: rgba(102, 126, 234, 0.1);
    }
    
    .bookmark-btn.bookmarked {
        background: #667eea;
        color: white;
    }
`;
document.head.appendChild(tocStyle);