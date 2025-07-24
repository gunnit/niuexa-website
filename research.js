// Research Page Interactive Functionality

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeResearchPage();
});

function initializeResearchPage() {
    // Initialize article card interactions
    initializeArticleCards();
    
    // Initialize smooth scrolling for back buttons
    initializeBackButtons();
    
    // Initialize reading progress indicator
    initializeReadingProgress();
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize article sharing functionality
    initializeArticleSharing();
}

// Article Cards Functionality
function initializeArticleCards() {
    const articleCards = document.querySelectorAll('.article-card');
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    // Add click handlers for read more buttons
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const target = this.getAttribute('data-target');
            showArticle(target);
        });
    });
    
    // Add hover effects and keyboard navigation
    articleCards.forEach(card => {
        // Mouse events
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const button = this.querySelector('.read-more-btn');
                if (button) {
                    button.click();
                }
            }
        });
    });
}

// Show specific article content
function showArticle(articleId) {
    // Hide articles list
    const articlesSection = document.querySelector('.featured-articles');
    const heroSection = document.querySelector('.research-hero');
    
    if (articlesSection) {
        articlesSection.style.display = 'none';
    }
    if (heroSection) {
        heroSection.style.display = 'none';
    }
    
    // Show specific article content
    const articleContent = document.getElementById(articleId + '-content');
    if (articleContent) {
        articleContent.style.display = 'block';
        articleContent.classList.add('fade-in');
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Update page title
        const articleTitle = articleContent.querySelector('h1');
        if (articleTitle) {
            document.title = articleTitle.textContent + ' | Niuexa Research';
        }
        
        // Track article view (analytics)
        trackArticleView(articleId);
    }
}

// Show articles list (back from article)
function showArticlesList() {
    // Hide all article contents
    const articleContents = document.querySelectorAll('.full-article-content');
    articleContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('fade-in');
    });
    
    // Show articles list and hero
    const articlesSection = document.querySelector('.featured-articles');
    const heroSection = document.querySelector('.research-hero');
    
    if (articlesSection) {
        articlesSection.style.display = 'block';
    }
    if (heroSection) {
        heroSection.style.display = 'block';
    }
    
    // Restore original page title
    document.title = 'Ricerca AI - Tendenze e Insights sull\'Intelligenza Artificiale | Niuexa';
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Back button functionality
function initializeBackButtons() {
    const backButtons = document.querySelectorAll('.back-btn');
    
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showArticlesList();
        });
    });
}

// Reading Progress Indicator
function initializeReadingProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-blue), var(--primary-green));
        z-index: 9999;
        transition: width 0.1s ease;
        display: none;
    `;
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const currentArticle = document.querySelector('.full-article-content[style*="block"]');
        
        if (currentArticle) {
            progressBar.style.display = 'block';
            
            const articleBody = currentArticle.querySelector('.article-body');
            if (articleBody) {
                const scrollTop = window.pageYOffset;
                const docHeight = articleBody.offsetHeight;
                const winHeight = window.innerHeight;
                const scrollPercent = scrollTop / (docHeight - winHeight);
                const scrollPercentRounded = Math.round(scrollPercent * 100);
                
                progressBar.style.width = Math.min(scrollPercentRounded, 100) + '%';
            }
        } else {
            progressBar.style.display = 'none';
        }
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    // Create intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate
    const animatedElements = document.querySelectorAll('.article-card, .stat-box, .stats-grid');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Article Sharing Functionality
function initializeArticleSharing() {
    // Create share buttons for articles
    const articleHeaders = document.querySelectorAll('.article-header');
    
    articleHeaders.forEach(header => {
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-buttons';
        shareContainer.style.cssText = `
            margin-top: 1rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        `;
        
        // Share buttons data
        const shareButtons = [
            {
                name: 'LinkedIn',
                icon: '💼',
                url: 'https://www.linkedin.com/sharing/share-offsite/?url=',
                color: '#0077b5'
            },
            {
                name: 'Twitter',
                icon: '🐦',
                url: 'https://twitter.com/intent/tweet?url=',
                color: '#1da1f2'
            },
            {
                name: 'Email',
                icon: '📧',
                url: 'mailto:?subject=Interessante articolo AI&body=',
                color: '#ea4335'
            }
        ];
        
        shareButtons.forEach(btn => {
            const shareBtn = document.createElement('button');
            shareBtn.innerHTML = `${btn.icon} ${btn.name}`;
            shareBtn.style.cssText = `
                background: ${btn.color};
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: transform 0.2s ease;
            `;
            
            shareBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            shareBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
            
            shareBtn.addEventListener('click', function() {
                const currentUrl = window.location.href;
                const articleTitle = header.querySelector('h1').textContent;
                
                let shareUrl;
                if (btn.name === 'Email') {
                    shareUrl = btn.url + encodeURIComponent(currentUrl + ' - ' + articleTitle);
                } else {
                    shareUrl = btn.url + encodeURIComponent(currentUrl) + '&text=' + encodeURIComponent(articleTitle);
                }
                
                window.open(shareUrl, '_blank', 'width=600,height=400');
            });
            
            shareContainer.appendChild(shareBtn);
        });
        
        header.appendChild(shareContainer);
    });
}

// Analytics tracking
function trackArticleView(articleId) {
    // Google Analytics tracking (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'article_view', {
            'article_id': articleId,
            'article_title': document.querySelector('.article-header h1')?.textContent || '',
            'page_location': window.location.href
        });
    }
    
    // Custom analytics tracking
    console.log('Article viewed:', articleId);
}

// Utility function for smooth scrolling to elements
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key to go back to articles list
    if (e.key === 'Escape') {
        const currentArticle = document.querySelector('.full-article-content[style*="block"]');
        if (currentArticle) {
            showArticlesList();
        }
    }
    
    // Arrow keys for navigation (when viewing article)
    if (e.key === 'ArrowLeft' && e.ctrlKey) {
        showArticlesList();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
    // Handle browser navigation
    if (e.state && e.state.article) {
        showArticle(e.state.article);
    } else {
        showArticlesList();
    }
});

// Add to browser history when viewing articles
function addToHistory(articleId) {
    const state = { article: articleId };
    const title = document.querySelector('.article-header h1')?.textContent || '';
    const url = window.location.pathname + '#' + articleId;
    
    history.pushState(state, title, url);
}

// Enhanced article card interactions
function enhanceArticleCards() {
    const cards = document.querySelectorAll('.article-card');
    
    cards.forEach((card, index) => {
        // Add loading state to buttons
        const button = card.querySelector('.read-more-btn');
        if (button) {
            button.addEventListener('click', function() {
                // Add loading spinner
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="loading"></span> Caricamento...';
                this.disabled = true;
                
                // Simulate loading time
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 500);
            });
        }
        
        // Add subtle animation delay for cards
        card.style.animationDelay = (index * 0.1) + 's';
    });
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    enhanceArticleCards();
    
    // Check if there's a hash in URL to show specific article
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash + '-content')) {
        setTimeout(() => {
            showArticle(hash);
        }, 500);
    }
});

// Export functions for global access
window.showArticlesList = showArticlesList;
window.showArticle = showArticle;