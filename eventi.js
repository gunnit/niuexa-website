// Eventi Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Event data structure
    const eventsData = {
        upcoming: [
            {
                id: 1,
                title: "RENDI PIÙ EFFICIENTE LA TUA AZIENDA CON L'AI",
                date: new Date('2025-11-19'),
                time: "18:00 - 20:00",
                location: "Via Rutilia, 10 - 20141 Milano",
                description: "Scopri come l'intelligenza artificiale può trasformare ogni aspetto della tua attività, dalla gestione dei dati alla comunicazione con i clienti. Impara a ottimizzare i processi aziendali e a raggiungere i tuoi obiettivi in modo più rapido e intelligente.",
                image: "img/eventi/event_placeholder.webp",
                status: "available", // available, full, past
                maxAttendees: 40,
                currentAttendees: 0,
                topics: ["Efficienza Aziendale", "AI in Azienda", "Ottimizzazione Processi"],
                speaker: "Roberto Botto e Gregor Maric",
                registrationUrl: "https://www.eventbrite.com/e/rendi-piu-efficiente-la-tua-azienda-con-lai-tickets-1730433145119?aff=oddtdtcreator"
            },
            {
                id: 2,
                title: "RENDI PIÙ EFFICIENTE LA TUA AZIENDA CON L'AI",
                date: new Date('2025-11-26'),
                time: "18:00 - 20:00",
                location: "Via Vittorio Andreis, 18/16/M - 10152 Torino",
                description: "Scopri come l'intelligenza artificiale può trasformare ogni aspetto della tua attività, dalla gestione dei dati alla comunicazione con i clienti. Impara a ottimizzare i processi aziendali e a raggiungere i tuoi obiettivi in modo più rapido e intelligente.",
                image: "img/eventi/event_team.webp",
                status: "available", // available, full, past
                maxAttendees: 40,
                currentAttendees: 0,
                topics: ["Efficienza Aziendale", "AI in Azienda", "Ottimizzazione Processi"],
                speaker: "Roberto Botto e Gregor Maric",
                registrationUrl: "https://www.eventbrite.com/e/biglietti-rendi-piu-efficiente-la-tua-azienda-con-lai-1850864659019?aff=oddtdtcreator"
            }
        ],
        past: [
            {
                id: 101,
                title: "AI Aperitivo: Introduzione al Machine Learning",
                date: new Date('2024-12-18'),
                image: "img/sedemilanoevento.jpg",
                attendees: 23,
                feedback: "Evento fantastico! Spiegazioni chiare e esempi pratici."
            },
            {
                id: 102,
                title: "AI Aperitivo: Computer Vision per Business",
                date: new Date('2024-11-20'),
                image: "img/sedeeventomilano2.jpg",
                attendees: 25,
                feedback: "Demo impressionanti, molto utile per il mio lavoro."
            },
            {
                id: 103,
                title: "AI Aperitivo: Etica nell'Intelligenza Artificiale",
                date: new Date('2024-10-23'),
                image: "img/sedeeventomilano3.jpg",
                attendees: 21,
                feedback: "Discussione molto stimolante su un tema importante."
            }
        ]
    };

    // Initialize page
    function init() {
        renderUpcomingEvents();
        renderPastEvents();
        populateEventSelect();
        initializeAnimations();
        setupFormHandling();
    }

    // Render upcoming events
    function renderUpcomingEvents() {
        const container = document.getElementById('upcoming-events');
        if (!container) return;

        container.innerHTML = '';

        eventsData.upcoming.forEach(event => {
            const eventCard = createEventCard(event);
            container.appendChild(eventCard);
        });

        // Add animation class after a short delay
        setTimeout(() => {
            const cards = container.querySelectorAll('.event-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in-up');
                }, index * 200);
            });
        }, 100);
    }

    // Create event card HTML
    function createEventCard(event) {
        const div = document.createElement('div');
        div.className = 'event-card';
        
        const statusClass = event.status === 'full' ? 'full' : '';
        const statusText = event.status === 'full' ? 'Sold Out' : 'Posti Disponibili';
        const availableSpots = event.maxAttendees - event.currentAttendees;
        
        div.innerHTML = `
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}" loading="lazy">
                <div class="event-status ${statusClass}">${statusText}</div>
            </div>
            <div class="event-content">
                <div class="event-date">
                    <span>📅</span>
                    <span>${formatEventDate(event.date)}</span>
                </div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
                <div class="event-details">
                    <div class="event-detail">
                        <span>⏰</span>
                        <span>${event.time}</span>
                    </div>
                    <div class="event-detail">
                        <span>📍</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-detail">
                        <span>👥</span>
                        <span>${availableSpots} posti disponibili</span>
                    </div>
                    <div class="event-detail">
                        <span>🎯</span>
                        <span>Speaker: ${event.speaker}</span>
                    </div>
                </div>
                <div class="event-topics">
                    ${event.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                </div>
                <div class="event-actions">
                    <a href="${event.registrationUrl || '#contact-form'}" ${event.registrationUrl ? 'target="_blank" rel="noopener noreferrer"' : `onclick="selectEvent(${event.id})"`} class="btn btn-primary">
                        ${event.status === 'full' ? 'Lista d\'Attesa' : 'Registrati'}
                    </a>
                    <button class="btn btn-outline" onclick="shareEvent(${event.id})">Condividi</button>
                </div>
            </div>
        `;

        return div;
    }

    // Render past events
    function renderPastEvents() {
        const container = document.getElementById('past-events');
        if (!container) return;

        container.innerHTML = '';

        eventsData.past.forEach(event => {
            const pastEventCard = createPastEventCard(event);
            container.appendChild(pastEventCard);
        });
    }

    // Create past event card
    function createPastEventCard(event) {
        const div = document.createElement('div');
        div.className = 'past-event-card';
        
        div.innerHTML = `
            <div class="past-event-image">
                <img src="${event.image}" alt="${event.title}" loading="lazy">
            </div>
            <div class="past-event-content">
                <h4 class="past-event-title">${event.title}</h4>
                <div class="past-event-date">${formatPastEventDate(event.date)}</div>
                <div class="past-event-stats">
                    <span>👥 ${event.attendees} partecipanti</span>
                </div>
            </div>
        `;

        return div;
    }

    // Populate event select dropdown
    function populateEventSelect() {
        const select = document.getElementById('evento');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        eventsData.upcoming.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.title} - ${formatEventDate(event.date)}`;
            select.appendChild(option);
        });
    }

    // Format event date for display
    function formatEventDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('it-IT', options);
    }

    // Format past event date
    function formatPastEventDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('it-IT', options);
    }

    // Global functions for event interaction
    window.selectEvent = function(eventId) {
        const eventSelect = document.getElementById('evento');
        if (eventSelect) {
            eventSelect.value = eventId;
        }
        
        // Smooth scroll to form
        const form = document.getElementById('contact-form');
        if (form) {
            form.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    window.shareEvent = function(eventId) {
        const event = eventsData.upcoming.find(e => e.id === eventId);
        if (!event) return;

        const shareData = {
            title: event.title,
            text: `Partecipa a "${event.title}" il ${formatEventDate(event.date)}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            const shareText = `${shareData.title} - ${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification('Link copiato negli appunti!', 'success');
            });
        }
    };

    // Form handling
    function setupFormHandling() {
        const form = document.getElementById('event-registration-form');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    }

    // Handle form submission
    function handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validation
        if (!validateForm(data)) {
            return;
        }

        // Show loading state
        form.classList.add('form-loading');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Registrazione in corso...';

        // Simulate API call
        setTimeout(() => {
            // Remove loading state
            form.classList.remove('form-loading');
            submitButton.textContent = originalText;

            // Show success message
            showSuccessMessage(form);
            
            // Reset form
            form.reset();
            
            // Update event attendee count (simulation)
            updateEventAttendeeCount(parseInt(data.evento));
            
        }, 2000);
    }

    // Form validation
    function validateForm(data) {
        const required = ['nome', 'cognome', 'email', 'evento'];
        const missing = required.filter(field => !data[field] || data[field].trim() === '');
        
        if (missing.length > 0) {
            showNotification('Per favore compila tutti i campi obbligatori', 'error');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Per favore inserisci un indirizzo email valido', 'error');
            return false;
        }

        return true;
    }

    // Show success message
    function showSuccessMessage(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `
            <h3>✅ Registrazione Completata!</h3>
            <p>Grazie per la registrazione. Riceverai una email di conferma a breve.</p>
            <p>Ti aspettiamo al nostro AI Aperitivo!</p>
        `;
        
        form.parentNode.insertBefore(successDiv, form.nextSibling);
        
        // Remove success message after 10 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 10000);
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : '#2ed573'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Update event attendee count
    function updateEventAttendeeCount(eventId) {
        const event = eventsData.upcoming.find(e => e.id === eventId);
        if (event && event.currentAttendees < event.maxAttendees) {
            event.currentAttendees++;
            
            // Check if event is now full
            if (event.currentAttendees >= event.maxAttendees) {
                event.status = 'full';
            }
            
            // Re-render events
            renderUpcomingEvents();
            populateEventSelect();
        }
    }

    // Initialize animations
    function initializeAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            observer.observe(card);
        });

        // Observe past event cards
        document.querySelectorAll('.past-event-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        .topic-tag {
            display: inline-block;
            background: var(--light-blue);
            color: var(--primary-blue);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin: 0.2rem;
        }
        
        .event-topics {
            margin: 1rem 0;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Initialize everything when DOM is loaded
    init();
});

// Additional utility functions
function getNextWednesdayOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWednesday = new Date(firstDay);
    
    // Find first Wednesday
    while (firstWednesday.getDay() !== 3) {
        firstWednesday.setDate(firstWednesday.getDate() + 1);
    }
    
    // Get last Wednesday of the month
    const lastWednesday = new Date(firstWednesday);
    while (lastWednesday.getMonth() === firstDay.getMonth()) {
        lastWednesday.setDate(lastWednesday.getDate() + 7);
    }
    lastWednesday.setDate(lastWednesday.getDate() - 7);
    
    return lastWednesday;
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        eventsData,
        formatEventDate,
        getNextWednesdayOfMonth
    };
}