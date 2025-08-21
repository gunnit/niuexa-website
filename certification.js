// Niuexa Certification System
// Advanced quiz engine, certificate generation, and user management

class NiuexaCertification {
    constructor() {
        this.currentTutorial = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizData = null;
        this.userData = {};
        this.score = 0;
        this.passingScore = 80;
        this.currentScreen = 'welcome';
        
        // Available tutorials for certification
        this.availableTutorials = [
            {
                id: 'umanizzare-testi-ai',
                title: 'Umanizzare Testi AI',
                description: 'Tecniche avanzate per trasformare contenuti AI in testi naturali',
                duration: '10 min',
                questions: 10,
                difficulty: 'Intermedio',
                category: 'Scrittura AI',
                icon: '📝'
            },
            {
                id: 'generazione-immagini-ai',
                title: 'Generazione Immagini AI',
                description: 'Tool e tecniche per la creazione di immagini con AI',
                duration: '12 min',
                questions: 12,
                difficulty: 'Principiante-Avanzato',
                category: 'AI Visuale',
                icon: '🎨'
            },
            {
                id: 'generazione-video-ai',
                title: 'Generazione Video AI',
                description: 'Creare video professionali con strumenti AI',
                duration: '15 min',
                questions: 15,
                difficulty: 'Tutti i Livelli',
                category: 'Video AI',
                icon: '🎬'
            },
            {
                id: 'voice-audio-ai',
                title: 'AI Voice & Audio',
                description: 'Voice cloning e generazione audio con AI',
                duration: '12 min',
                questions: 12,
                difficulty: 'Principiante-Avanzato',
                category: 'Audio AI',
                icon: '🎵'
            },
            {
                id: 'automazione-workflow-ai',
                title: 'Automazione Workflow AI',
                description: 'Sistemi automatizzati per business con AI',
                duration: '18 min',
                questions: 18,
                difficulty: 'Business-Focused',
                category: 'Business AI',
                icon: '🚀'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.populateTutorialSelection();
        this.checkUrlParameters();
        
        console.log('Niuexa Certification System initialized');
    }
    
    setupEventListeners() {
        // Navigation buttons
        const backToWelcome = document.getElementById('back-to-welcome');
        const prevQuestion = document.getElementById('prev-question');
        const nextQuestion = document.getElementById('next-question');
        const submitQuiz = document.getElementById('submit-quiz');
        const takeAnotherQuiz = document.getElementById('take-another-quiz');
        
        if (backToWelcome) {
            backToWelcome.addEventListener('click', () => this.showScreen('welcome'));
        }
        
        if (prevQuestion) {
            prevQuestion.addEventListener('click', () => this.previousQuestion());
        }
        
        if (nextQuestion) {
            nextQuestion.addEventListener('click', () => this.nextQuestion());
        }
        
        if (submitQuiz) {
            submitQuiz.addEventListener('click', () => this.submitQuiz());
        }
        
        if (takeAnotherQuiz) {
            takeAnotherQuiz.addEventListener('click', () => this.showScreen('welcome'));
        }
        
        // Form submission
        const certForm = document.getElementById('certification-form');
        if (certForm) {
            certForm.addEventListener('submit', (e) => this.handleFormSubmission(e));
        }
        
        // Certificate actions
        this.setupCertificateActions();
    }
    
    populateTutorialSelection() {
        const tutorialsGrid = document.querySelector('.tutorials-grid');
        if (!tutorialsGrid) return;
        
        tutorialsGrid.innerHTML = this.availableTutorials.map(tutorial => `
            <div class="tutorial-cert-card" data-tutorial-id="${tutorial.id}">
                <div class="tutorial-cert-icon">${tutorial.icon}</div>
                <div class="tutorial-cert-content">
                    <h3>${tutorial.title}</h3>
                    <p>${tutorial.description}</p>
                    <div class="tutorial-cert-meta">
                        <span class="duration">⏱️ ${tutorial.duration}</span>
                        <span class="questions">📝 ${tutorial.questions} domande</span>
                        <span class="difficulty">🎯 ${tutorial.difficulty}</span>
                    </div>
                    <button class="start-cert-btn" onclick="certification.startCertification('${tutorial.id}')">
                        Inizia Certificazione
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const tutorialId = urlParams.get('tutorial');
        
        if (tutorialId && this.availableTutorials.find(t => t.id === tutorialId)) {
            this.startCertification(tutorialId);
        }
    }
    
    async startCertification(tutorialId) {
        this.currentTutorial = this.availableTutorials.find(t => t.id === tutorialId);
        if (!this.currentTutorial) {
            console.error('Tutorial not found:', tutorialId);
            return;
        }
        
        // Load quiz data
        try {
            this.quizData = await this.loadQuizData(tutorialId);
            this.resetQuizState();
            this.updateQuizHeader();
            this.showScreen('quiz');
            this.displayQuestion();
        } catch (error) {
            console.error('Error loading quiz data:', error);
            // Fallback to sample data
            this.quizData = this.generateSampleQuizData(tutorialId);
            this.resetQuizState();
            this.updateQuizHeader();
            this.showScreen('quiz');
            this.displayQuestion();
        }
    }
    
    async loadQuizData(tutorialId) {
        // Try to load from JSON file, fallback to generated data
        try {
            const response = await fetch(`quiz-data/${tutorialId}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('Quiz data file not found, generating sample data');
        }
        
        return this.generateSampleQuizData(tutorialId);
    }
    
    generateSampleQuizData(tutorialId) {
        const baseQuestions = this.getBaseQuestions(tutorialId);
        
        return {
            tutorial: this.currentTutorial.title,
            totalQuestions: baseQuestions.length,
            passingScore: 80,
            timeLimit: 20, // minutes
            questions: baseQuestions
        };
    }
    
    getBaseQuestions(tutorialId) {
        const questionBanks = {
            'umanizzare-testi-ai': [
                {
                    id: 1,
                    type: 'multiple-choice',
                    question: 'Qual è la caratteristica principale che tradisce un testo generato dall\'AI?',
                    options: [
                        'Errori grammaticali frequenti',
                        'Linguaggio troppo formale e ripetitivo',
                        'Assenza di punteggiatura',
                        'Uso eccessivo di emoji'
                    ],
                    correct: 1,
                    explanation: 'I testi AI tendono ad essere troppo formali e ripetitivi, mancando della varietà stilistica umana.'
                },
                {
                    id: 2,
                    type: 'true-false',
                    question: 'Per umanizzare un testo AI è sufficiente correggere solo gli errori grammaticali.',
                    correct: false,
                    explanation: 'L\'umanizzazione richiede interventi su stile, tono, varietà lessicale e struttura narrativa.'
                },
                {
                    id: 3,
                    type: 'multiple-choice',
                    question: 'Quale tecnica è più efficace per rendere un testo AI più naturale?',
                    options: [
                        'Aggiungere più aggettivi',
                        'Usare solo frasi brevi',
                        'Variare la lunghezza delle frasi',
                        'Eliminare tutte le congiunzioni'
                    ],
                    correct: 2,
                    explanation: 'Variare la lunghezza delle frasi crea un ritmo più naturale e umano.'
                },
                {
                    id: 4,
                    type: 'multiple-choice',
                    question: 'Come si può aggiungere personalità a un testo AI?',
                    options: [
                        'Inserire aneddoti e esperienze personali',
                        'Usare solo terminologia tecnica',
                        'Scrivere solo in terza persona',
                        'Evitare qualsiasi opinione personale'
                    ],
                    correct: 0,
                    explanation: 'Gli aneddoti e le esperienze personali rendono il testo più autentico e umano.'
                },
                {
                    id: 5,
                    type: 'true-false',
                    question: 'I detector AI sono infallibili nel riconoscere contenuti generati artificialmente.',
                    correct: false,
                    explanation: 'I detector AI hanno limitazioni e possono essere ingannati con tecniche di umanizzazione appropriate.'
                },
                {
                    id: 6,
                    type: 'multiple-choice',
                    question: 'Qual è il vantaggio principale di umanizzare i testi AI?',
                    options: [
                        'Ridurre i costi di produzione',
                        'Aumentare la credibilità e l\'engagement',
                        'Scrivere più velocemente',
                        'Usare meno parole'
                    ],
                    correct: 1,
                    explanation: 'L\'umanizzazione aumenta la credibilità e il coinvolgimento del lettore.'
                },
                {
                    id: 7,
                    type: 'multiple-choice',
                    question: 'Come si può migliorare il tono di un testo AI?',
                    options: [
                        'Aggiungere più dati statistici',
                        'Usare un linguaggio più colloquiale',
                        'Inserire più acronimi',
                        'Scrivere frasi più lunghe'
                    ],
                    correct: 1,
                    explanation: 'Un linguaggio più colloquiale rende il testo più accessibile e umano.'
                },
                {
                    id: 8,
                    type: 'true-false',
                    question: 'È etico umanizzare testi AI senza dichiarare che sono stati generati artificialmente.',
                    correct: false,
                    explanation: 'La trasparenza è importante; l\'umanizzazione dovrebbe migliorare la qualità, non ingannare.'
                },
                {
                    id: 9,
                    type: 'multiple-choice',
                    question: 'Quale elemento NON aiuta a umanizzare un testo AI?',
                    options: [
                        'Aggiungere transizioni naturali',
                        'Inserire opinioni personali',
                        'Ripetere le stesse parole chiave',
                        'Usare esempi concreti'
                    ],
                    correct: 2,
                    explanation: 'La ripetizione eccessiva di parole chiave è tipica dei testi AI e va evitata.'
                },
                {
                    id: 10,
                    type: 'multiple-choice',
                    question: 'Qual è la strategia migliore per editare un testo AI?',
                    options: [
                        'Modificare solo l\'introduzione',
                        'Riscrivere completamente tutto',
                        'Intervenire su struttura, stile e contenuto',
                        'Cambiare solo la conclusione'
                    ],
                    correct: 2,
                    explanation: 'Un approccio olistico che considera struttura, stile e contenuto è più efficace.'
                }
            ],
            'generazione-immagini-ai': [
                {
                    id: 1,
                    type: 'multiple-choice',
                    question: 'Quale tool di generazione immagini AI è considerato tra i più avanzati nel 2025?',
                    options: ['DALL-E 2', 'Recraft V3', 'Stable Diffusion 1.0', 'DeepArt'],
                    correct: 1,
                    explanation: 'Recraft V3 è uno dei tool più avanzati disponibili nel 2025.'
                },
                {
                    id: 2,
                    type: 'true-false',
                    question: 'Il prompting è la tecnica di scrivere istruzioni dettagliate per l\'AI.',
                    correct: true,
                    explanation: 'Il prompting è fondamentale per ottenere risultati di qualità nella generazione di immagini.'
                }
                // Add more questions as needed
            ]
            // Add more tutorial question banks
        };
        
        return questionBanks[tutorialId] || questionBanks['umanizzare-testi-ai'].slice(0, 5);
    }
    
    resetQuizState() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
    }
    
    updateQuizHeader() {
        const elements = {
            'quiz-title': `Certificazione: ${this.currentTutorial.title}`,
            'quiz-duration': `⏱️ ${this.currentTutorial.duration}`,
            'quiz-questions': `📝 ${this.quizData.totalQuestions} domande`,
            'total-questions': this.quizData.totalQuestions
        };
        
        Object.entries(elements).forEach(([id, content]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = content;
        });
    }
    
    displayQuestion() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        const container = document.getElementById('question-container');
        
        if (!container || !question) return;
        
        container.innerHTML = this.generateQuestionHTML(question);
        this.updateProgress();
        this.updateNavigationButtons();
        
        // Add event listeners to answer options
        this.setupQuestionListeners();
    }
    
    generateQuestionHTML(question) {
        let optionsHTML = '';
        
        if (question.type === 'multiple-choice') {
            optionsHTML = question.options.map((option, index) => `
                <label class="answer-option" data-answer="${index}">
                    <input type="radio" name="question-${question.id}" value="${index}">
                    <span class="option-text">${option}</span>
                    <span class="option-indicator"></span>
                </label>
            `).join('');
        } else if (question.type === 'true-false') {
            optionsHTML = `
                <label class="answer-option" data-answer="true">
                    <input type="radio" name="question-${question.id}" value="true">
                    <span class="option-text">Vero</span>
                    <span class="option-indicator"></span>
                </label>
                <label class="answer-option" data-answer="false">
                    <input type="radio" name="question-${question.id}" value="false">
                    <span class="option-text">Falso</span>
                    <span class="option-indicator"></span>
                </label>
            `;
        }
        
        return `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-number">Domanda ${this.currentQuestionIndex + 1}</span>
                    <span class="question-type">${question.type === 'multiple-choice' ? 'Scelta Multipla' : 'Vero/Falso'}</span>
                </div>
                <h2 class="question-text">${question.question}</h2>
                <div class="answer-options">
                    ${optionsHTML}
                </div>
            </div>
        `;
    }
    
    setupQuestionListeners() {
        const options = document.querySelectorAll('.answer-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selection
                options.forEach(opt => opt.classList.remove('selected'));
                // Add selection to clicked option
                option.classList.add('selected');
                
                // Check the radio button
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // Enable next button
                const nextBtn = document.getElementById('next-question');
                const submitBtn = document.getElementById('submit-quiz');
                if (nextBtn) nextBtn.disabled = false;
                if (submitBtn) submitBtn.disabled = false;
            });
        });
    }
    
    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const currentQuestionSpan = document.getElementById('current-question');
        
        if (progressFill) {
            const progress = ((this.currentQuestionIndex + 1) / this.quizData.totalQuestions) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
        }
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const submitBtn = document.getElementById('submit-quiz');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
        
        const isLastQuestion = this.currentQuestionIndex === this.quizData.totalQuestions - 1;
        
        if (nextBtn && submitBtn) {
            if (isLastQuestion) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-block';
                submitBtn.disabled = true; // Will be enabled when answer is selected
            } else {
                nextBtn.style.display = 'inline-block';
                nextBtn.disabled = true; // Will be enabled when answer is selected
                submitBtn.style.display = 'none';
            }
        }
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.saveCurrentAnswer();
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.restorePreviousAnswer();
        }
    }
    
    nextQuestion() {
        this.saveCurrentAnswer();
        
        if (this.currentQuestionIndex < this.quizData.totalQuestions - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.restorePreviousAnswer();
        }
    }
    
    saveCurrentAnswer() {
        const selectedOption = document.querySelector('input[name^="question-"]:checked');
        if (selectedOption) {
            this.userAnswers[this.currentQuestionIndex] = selectedOption.value;
        }
    }
    
    restorePreviousAnswer() {
        const savedAnswer = this.userAnswers[this.currentQuestionIndex];
        if (savedAnswer !== undefined) {
            const radioButton = document.querySelector(`input[value="${savedAnswer}"]`);
            if (radioButton) {
                radioButton.checked = true;
                radioButton.closest('.answer-option').classList.add('selected');
                
                // Enable navigation buttons
                const nextBtn = document.getElementById('next-question');
                const submitBtn = document.getElementById('submit-quiz');
                if (nextBtn) nextBtn.disabled = false;
                if (submitBtn) submitBtn.disabled = false;
            }
        }
    }
    
    submitQuiz() {
        this.saveCurrentAnswer();
        this.calculateScore();
        
        if (this.score >= this.passingScore) {
            this.showScreen('registration');
            this.displayFinalScore();
        } else {
            this.showFailureScreen();
        }
    }
    
    calculateScore() {
        let correctAnswers = 0;
        
        this.quizData.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            let isCorrect = false;
            
            if (question.type === 'multiple-choice') {
                isCorrect = parseInt(userAnswer) === question.correct;
            } else if (question.type === 'true-false') {
                isCorrect = (userAnswer === 'true') === question.correct;
            }
            
            if (isCorrect) correctAnswers++;
        });
        
        this.score = Math.round((correctAnswers / this.quizData.totalQuestions) * 100);
    }
    
    displayFinalScore() {
        const scoreElement = document.getElementById('final-score');
        if (scoreElement) {
            scoreElement.textContent = `${this.score}%`;
            scoreElement.className = `score-value ${this.score >= 90 ? 'excellent' : 'good'}`;
        }
    }
    
    showFailureScreen() {
        // Show a failure modal or screen
        const modal = this.createFailureModal();
        document.body.appendChild(modal);
    }
    
    createFailureModal() {
        const modal = document.createElement('div');
        modal.className = 'failure-modal';
        modal.innerHTML = `
            <div class="failure-content">
                <div class="failure-icon">😞</div>
                <h2>Non hai superato la certificazione</h2>
                <p>Il tuo punteggio: <strong>${this.score}%</strong></p>
                <p>Punteggio minimo richiesto: <strong>${this.passingScore}%</strong></p>
                <div class="failure-actions">
                    <button onclick="certification.retakeQuiz()" class="retry-btn">
                        🔄 Riprova
                    </button>
                    <button onclick="certification.reviewMaterial()" class="review-btn">
                        📚 Rivedi il Materiale
                    </button>
                </div>
            </div>
        `;
        
        // Add close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
    
    retakeQuiz() {
        document.querySelector('.failure-modal')?.remove();
        this.resetQuizState();
        this.showScreen('quiz');
        this.displayQuestion();
    }
    
    reviewMaterial() {
        document.querySelector('.failure-modal')?.remove();
        const tutorialUrl = `tutorial-${this.currentTutorial.id}.html`;
        window.open(tutorialUrl, '_blank');
    }
    
    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        this.userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            company: formData.get('company') || '',
            linkedin: formData.get('linkedin') || '',
            consent: formData.get('consent') === 'on',
            tutorial: this.currentTutorial.title,
            score: this.score,
            date: new Date().toISOString(),
            certificateId: this.generateCertificateId()
        };
        
        // Save user data
        this.saveUserData();
        
        // Generate and display certificate
        this.showScreen('certificate');
        setTimeout(() => {
            this.generateCertificate();
        }, 500);
    }
    
    generateCertificateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `NIUEXA-${timestamp}-${random}`.toUpperCase();
    }
    
    saveUserData() {
        // Save to localStorage
        const existingData = JSON.parse(localStorage.getItem('niuexa_certifications') || '[]');
        existingData.push(this.userData);
        localStorage.setItem('niuexa_certifications', JSON.stringify(existingData));
        
        // Track analytics
        this.trackCertificationCompletion();
    }
    
    trackCertificationCompletion() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'certification_completed', {
                'tutorial': this.currentTutorial.id,
                'score': this.score,
                'user_email': this.userData.email
            });
        }
    }
    
    generateCertificate() {
        const canvas = document.getElementById('certificate-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#667eea');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Add border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);
        
        // Certificate content
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Title
        ctx.font = 'bold 36px Inter, Arial, sans-serif';
        ctx.fillText('CERTIFICATO DI COMPETENZA', canvasWidth / 2, 100);
        
        // Subtitle
        ctx.font = '18px Inter, Arial, sans-serif';
        ctx.fillText('rilasciato da Niuexa AI Consulting', canvasWidth / 2, 130);
        
        // Recipient
        ctx.font = '24px Inter, Arial, sans-serif';
        ctx.fillText('Si certifica che', canvasWidth / 2, 190);
        
        ctx.font = 'bold 32px Inter, Arial, sans-serif';
        ctx.fillText(this.userData.fullName.toUpperCase(), canvasWidth / 2, 240);
        
        // Achievement
        ctx.font = '20px Inter, Arial, sans-serif';
        ctx.fillText('ha completato con successo il corso', canvasWidth / 2, 290);
        
        ctx.font = 'bold 26px Inter, Arial, sans-serif';
        ctx.fillText(`"${this.currentTutorial.title}"`, canvasWidth / 2, 330);
        
        // Score
        ctx.font = '18px Inter, Arial, sans-serif';
        ctx.fillText(`con un punteggio del ${this.score}%`, canvasWidth / 2, 370);
        
        // Date and ID
        const date = new Date().toLocaleDateString('it-IT');
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.fillText(`Data: ${date}`, canvasWidth / 2 - 100, 450);
        ctx.fillText(`ID Certificato: ${this.userData.certificateId}`, canvasWidth / 2 + 100, 450);
        
        // Logo placeholder (you can add actual logo here)
        ctx.font = 'bold 16px Inter, Arial, sans-serif';
        ctx.fillText('NIUEXA', canvasWidth / 2, 500);
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.fillText('AI Consulting & Training', canvasWidth / 2, 520);
        
        // Setup certificate actions
        this.setupCertificateActions();
    }
    
    setupCertificateActions() {
        const downloadBtn = document.getElementById('download-certificate');
        const viewBtn = document.getElementById('view-certificate');
        const shareLinkedIn = document.getElementById('share-linkedin');
        const shareTwitter = document.getElementById('share-twitter');
        const shareWhatsApp = document.getElementById('share-whatsapp');
        const copyLink = document.getElementById('copy-certificate-link');
        
        if (downloadBtn) {
            downloadBtn.onclick = () => this.downloadCertificate();
        }
        
        if (viewBtn) {
            viewBtn.onclick = () => this.viewCertificateFullscreen();
        }
        
        if (shareLinkedIn) {
            shareLinkedIn.onclick = () => this.shareCertificate('linkedin');
        }
        
        if (shareTwitter) {
            shareTwitter.onclick = () => this.shareCertificate('twitter');
        }
        
        if (shareWhatsApp) {
            shareWhatsApp.onclick = () => this.shareCertificate('whatsapp');
        }
        
        if (copyLink) {
            copyLink.onclick = () => this.copyCertificateLink();
        }
    }
    
    downloadCertificate() {
        const canvas = document.getElementById('certificate-canvas');
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = `Certificato-Niuexa-${this.currentTutorial.id}-${this.userData.fullName.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
    
    viewCertificateFullscreen() {
        const canvas = document.getElementById('certificate-canvas');
        if (!canvas) return;
        
        const modal = document.createElement('div');
        modal.className = 'certificate-fullscreen-modal';
        modal.innerHTML = `
            <div class="fullscreen-content">
                <button class="close-fullscreen">✕</button>
                <img src="${canvas.toDataURL()}" alt="Certificato Niuexa" class="fullscreen-certificate">
            </div>
        `;
        
        modal.querySelector('.close-fullscreen').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
    }
    
    shareCertificate(platform) {
        const certificateText = `🏆 Ho appena ottenuto la certificazione "${this.currentTutorial.title}" da Niuexa AI Consulting con un punteggio del ${this.score}%! #AI #Certificazione #Niuexa`;
        const url = window.location.origin + '/certification.html';
        
        let shareUrl = '';
        
        switch (platform) {
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(certificateText)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(certificateText)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(certificateText + ' ' + url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
    
    copyCertificateLink() {
        const url = `${window.location.origin}/certificate-verify.html?id=${this.userData.certificateId}`;
        
        navigator.clipboard.writeText(url).then(() => {
            const btn = document.getElementById('copy-certificate-link');
            const originalText = btn.textContent;
            btn.textContent = '✅ Link Copiato!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }
    
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.certification-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    }
}

// Initialize certification system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.certification = new NiuexaCertification();
    console.log('Niuexa Certification System ready');
});

// Add some utility styles
const certificationStyles = `
    .failure-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .failure-content {
        background: white;
        padding: 3rem;
        border-radius: 12px;
        text-align: center;
        max-width: 400px;
    }
    
    .failure-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .failure-actions {
        margin-top: 2rem;
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    .retry-btn, .review-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .retry-btn {
        background: #667eea;
        color: white;
    }
    
    .review-btn {
        background: #f7fafc;
        color: #2d3748;
        border: 2px solid #e2e8f0;
    }
    
    .certificate-fullscreen-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .fullscreen-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .close-fullscreen {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
    }
    
    .fullscreen-certificate {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = certificationStyles;
document.head.appendChild(styleSheet);