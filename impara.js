// Impara Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Add loaded class for animations
    document.body.classList.add('impara-js-loaded');
    
    // Smooth scrolling for internal links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Tutorial card hover effects
    const tutorialCards = document.querySelectorAll('.tutorial-card');
    tutorialCards.forEach(card => {
        if (!card.classList.contains('coming-soon')) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        }
    });
    
    // Category card interactions
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            // Future: Filter tutorials by category
            const category = this.querySelector('h3').textContent;
            console.log('Clicked category:', category);
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe tutorial cards and category cards
    const animatedElements = document.querySelectorAll('.tutorial-card, .category-card');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .tutorial-card:not(.animate-in),
        .category-card:not(.animate-in) {
            opacity: 0;
            transform: translateY(30px);
        }
    `;
    document.head.appendChild(style);
    
    // Search functionality (future enhancement)
    function initSearch() {
        const searchInput = document.querySelector('#tutorial-search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const tutorials = document.querySelectorAll('.tutorial-card');
                
                tutorials.forEach(tutorial => {
                    const title = tutorial.querySelector('h3').textContent.toLowerCase();
                    const description = tutorial.querySelector('p').textContent.toLowerCase();
                    
                    if (title.includes(searchTerm) || description.includes(searchTerm)) {
                        tutorial.style.display = '';
                    } else {
                        tutorial.style.display = 'none';
                    }
                });
            });
        }
    }
    
    // Initialize search if search input exists
    initSearch();
    
    // Handle coming soon tutorial clicks
    const comingSoonCards = document.querySelectorAll('.tutorial-card.coming-soon');
    comingSoonCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create notification
            const notification = document.createElement('div');
            notification.className = 'coming-soon-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <h4>Tutorial in arrivo!</h4>
                    <p>Questo tutorial sarà disponibile presto. Iscriviti alla nostra newsletter per essere notificato.</p>
                    <button class="close-notification">✕</button>
                </div>
            `;
            
            // Add notification styles
            notification.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            `;
            
            const notificationContent = notification.querySelector('.notification-content');
            notificationContent.style.cssText = `
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 400px;
                text-align: center;
                position: relative;
                animation: slideIn 0.3s ease;
            `;
            
            const closeBtn = notification.querySelector('.close-notification');
            closeBtn.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #999;
            `;
            
            document.body.appendChild(notification);
            
            // Close notification
            function closeNotification() {
                notification.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }
            
            closeBtn.addEventListener('click', closeNotification);
            notification.addEventListener('click', function(e) {
                if (e.target === notification) {
                    closeNotification();
                }
            });
            
            // Auto close after 5 seconds
            setTimeout(closeNotification, 5000);
        });
    });
    
    // Add fade animations CSS
    const fadeStyle = document.createElement('style');
    fadeStyle.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(fadeStyle);
});

// Utility function to track tutorial interactions
function trackTutorialClick(tutorialName) {
    // Future: Add analytics tracking
    console.log('Tutorial clicked:', tutorialName);
    
    // Example Google Analytics event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'tutorial_click', {
            'tutorial_name': tutorialName,
            'page_location': window.location.href
        });
    }
}