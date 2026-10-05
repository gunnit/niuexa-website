// Niuexa quiz on the free guides (certification.html, en/certification.html)
// Quiz engine and completion certificate. The certificate documents that a
// visitor passed an online quiz; it is not an accredited qualification.
// The form data stays in the visitor's browser (localStorage) and is never sent.

const CERT_LANG = (document.documentElement.lang || 'it').slice(0, 2) === 'en' ? 'en' : 'it';

const CERT_ICONS = {
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'
};

function certIcon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${CERT_ICONS[name] || ''}</svg>`;
}

const CERT_TEXT = {
    it: {
        questions: 'domande',
        minutes: 'min circa',
        start: 'Inizi il quiz',
        quizPrefix: 'Quiz',
        multipleChoice: 'Scelta multipla',
        trueFalse: 'Vero o falso',
        trueLabel: 'Vero',
        falseLabel: 'Falso',
        question: 'Domanda',
        failTitle: 'Quiz non superato',
        yourScore: 'Il Suo punteggio',
        minScore: 'Punteggio minimo per l\'attestato',
        retry: 'Riprovi il quiz',
        review: 'Rilegga la guida',
        close: 'Chiudi',
        linkCopied: 'Link copiato',
        certAlt: 'Attestato di completamento Niuexa',
        certTitle: 'ATTESTATO DI COMPLETAMENTO',
        certSubtitle: 'Quiz sulle guide gratuite di Niuexa',
        certIntro: 'Si attesta che',
        certPassed: 'ha superato il quiz sulla guida',
        certScore: (s) => `con un punteggio del ${s}%`,
        certDate: 'Data',
        certId: 'ID',
        certNote: 'Attestato di completamento di un quiz online. Non è una certificazione accreditata né un titolo riconosciuto.',
        shareText: (title, score) => `Ho superato il quiz di Niuexa sulla guida "${title}" con il ${score}%.`,
        locale: 'it-IT',
        fileName: 'Attestato-Niuexa'
    },
    en: {
        questions: 'questions',
        minutes: 'min approx.',
        start: 'Start the quiz',
        quizPrefix: 'Quiz',
        multipleChoice: 'Multiple choice',
        trueFalse: 'True or false',
        trueLabel: 'True',
        falseLabel: 'False',
        question: 'Question',
        failTitle: 'Quiz not passed',
        yourScore: 'Your score',
        minScore: 'Minimum score for the certificate',
        retry: 'Try the quiz again',
        review: 'Read the guide again',
        close: 'Close',
        linkCopied: 'Link copied',
        certAlt: 'Niuexa certificate of completion',
        certTitle: 'CERTIFICATE OF COMPLETION',
        certSubtitle: 'Quiz on the free Niuexa guides',
        certIntro: 'This is to confirm that',
        certPassed: 'passed the quiz on the guide',
        certScore: (s) => `with a score of ${s}%`,
        certDate: 'Date',
        certId: 'ID',
        certNote: 'Certificate of completion of an online quiz. It is not an accredited certification or a recognised qualification.',
        shareText: (title, score) => `I passed the Niuexa quiz on the guide "${title}" with ${score}%.`,
        locale: 'en-GB',
        fileName: 'Niuexa-Certificate'
    }
}[CERT_LANG];

const CERT_TUTORIALS = {
    it: [
        {
            id: 'umanizzare-testi-ai',
            title: 'Umanizzare i testi AI',
            description: 'Tecniche per rendere naturali i contenuti scritti con l\'AI: ritmo, tono, editing.',
            duration: '20',
            questions: 15,
            difficulty: 'Intermedio',
            icon: 'pen',
            guide: '/tutorial-umanizzare-testi-ai.html'
        },
        {
            id: 'generazione-immagini-ai',
            title: 'Generazione di immagini AI',
            description: 'Tool, prompting e workflow per creare immagini con l\'AI.',
            duration: '15',
            questions: 12,
            difficulty: 'Da base ad avanzato',
            icon: 'image',
            guide: '/tutorial-generazione-immagini-ai.html'
        },
        {
            id: 'generazione-video-ai',
            title: 'Generazione di video AI',
            description: 'I principali tool di video AI e come usarli in un flusso di produzione.',
            duration: '12',
            questions: 10,
            difficulty: 'Tutti i livelli',
            icon: 'video',
            guide: '/tutorial-generazione-video-ai.html'
        },
        {
            id: 'ai-seo',
            title: 'AI SEO: SEO, AEO e GEO',
            description: 'Come comparire nelle risposte di ChatGPT, Perplexity e Google AI.',
            duration: '20',
            questions: 15,
            difficulty: 'Intermedio',
            icon: 'search',
            guide: '/tutorial-ai-seo.html'
        }
    ],
    en: [
        {
            id: 'umanizzare-testi-ai',
            title: 'Humanizing AI text',
            description: 'Techniques that make AI-written content read naturally: rhythm, tone, editing.',
            duration: '20',
            questions: 15,
            difficulty: 'Intermediate',
            icon: 'pen',
            guide: '/en/tutorial-humanize-ai-text.html'
        },
        {
            id: 'generazione-immagini-ai',
            title: 'AI image generation',
            description: 'Tools, prompting and workflows for creating images with AI.',
            duration: '15',
            questions: 12,
            difficulty: 'Beginner to advanced',
            icon: 'image',
            guide: '/en/tutorial-ai-image-generation.html'
        },
        {
            id: 'generazione-video-ai',
            title: 'AI video generation',
            description: 'The main AI video tools and how to use them in a production workflow.',
            duration: '12',
            questions: 10,
            difficulty: 'All levels',
            icon: 'video',
            guide: '/en/tutorial-ai-video-generation.html'
        },
        {
            id: 'ai-seo',
            title: 'AI SEO: SEO, AEO and GEO',
            description: 'How to appear in the answers of ChatGPT, Perplexity and Google AI.',
            duration: '20',
            questions: 15,
            difficulty: 'Intermediate',
            icon: 'search',
            // No English version of this guide yet
            guide: '/tutorial-ai-seo.html'
        }
    ]
}[CERT_LANG];

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
        this.availableTutorials = CERT_TUTORIALS;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateTutorialSelection();
        this.checkUrlParameters();
    }

    setupEventListeners() {
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

        const certForm = document.getElementById('certification-form');
        if (certForm) {
            certForm.addEventListener('submit', (e) => this.handleFormSubmission(e));
        }

        this.setupCertificateActions();
    }

    populateTutorialSelection() {
        const tutorialsGrid = document.querySelector('.tutorials-grid');
        if (!tutorialsGrid) return;

        tutorialsGrid.innerHTML = this.availableTutorials.map(tutorial => `
            <article class="tutorial-cert-card" data-tutorial-id="${tutorial.id}">
                <div class="icon-tile">${certIcon(tutorial.icon)}</div>
                <h3>${tutorial.title}</h3>
                <p>${tutorial.description}</p>
                <ul class="tutorial-cert-meta">
                    <li>${tutorial.questions} ${CERT_TEXT.questions}</li>
                    <li>${tutorial.duration} ${CERT_TEXT.minutes}</li>
                    <li>${tutorial.difficulty}</li>
                </ul>
                <button type="button" class="btn btn-primary start-cert-btn" data-start="${tutorial.id}">
                    ${CERT_TEXT.start}
                </button>
            </article>
        `).join('');

        tutorialsGrid.querySelectorAll('[data-start]').forEach(button => {
            button.addEventListener('click', () => this.startCertification(button.dataset.start));
        });
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

        try {
            this.quizData = await this.loadQuizData(tutorialId);
        } catch (error) {
            console.error('Error loading quiz data:', error);
            this.quizData = this.generateSampleQuizData(tutorialId);
        }
        this.resetQuizState();
        this.updateQuizHeader();
        this.showScreen('quiz');
        this.displayQuestion();
    }

    async loadQuizData(tutorialId) {
        try {
            const response = await fetch(`/quiz-data/${tutorialId}.json`);
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
            timeLimit: 20,
            questions: baseQuestions
        };
    }

    // Offline fallback only: the real questions live in /quiz-data/*.json
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
                    correct: 1
                },
                {
                    id: 2,
                    type: 'true-false',
                    question: 'Per umanizzare un testo AI è sufficiente correggere solo gli errori grammaticali.',
                    correct: false
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
                    correct: 2
                },
                {
                    id: 4,
                    type: 'true-false',
                    question: 'I detector AI sono infallibili nel riconoscere contenuti generati artificialmente.',
                    correct: false
                },
                {
                    id: 5,
                    type: 'multiple-choice',
                    question: 'Quale elemento NON aiuta a umanizzare un testo AI?',
                    options: [
                        'Aggiungere transizioni naturali',
                        'Inserire opinioni personali',
                        'Ripetere le stesse parole chiave',
                        'Usare esempi concreti'
                    ],
                    correct: 2
                }
            ]
        };

        return questionBanks[tutorialId] || questionBanks['umanizzare-testi-ai'];
    }

    resetQuizState() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
    }

    updateQuizHeader() {
        const elements = {
            'quiz-title': `${CERT_TEXT.quizPrefix}: ${this.currentTutorial.title}`,
            'quiz-duration': `${this.currentTutorial.duration} ${CERT_TEXT.minutes}`,
            'quiz-questions': `${this.quizData.totalQuestions} ${CERT_TEXT.questions}`,
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
        this.setupQuestionListeners();
    }

    generateQuestionHTML(question) {
        const name = `question-${question.id}`;
        const option = (value, text) => `
                <label class="answer-option" data-answer="${value}">
                    <input type="radio" name="${name}" value="${value}">
                    <span class="option-indicator" aria-hidden="true"></span>
                    <span class="option-text">${text}</span>
                </label>`;
        let optionsHTML = '';

        if (question.type === 'multiple-choice') {
            optionsHTML = question.options.map((text, index) => option(index, text)).join('');
        } else if (question.type === 'true-false') {
            optionsHTML = option('true', CERT_TEXT.trueLabel) + option('false', CERT_TEXT.falseLabel);
        }

        return `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-number">${CERT_TEXT.question} ${this.currentQuestionIndex + 1}</span>
                    <span class="question-type">${question.type === 'multiple-choice' ? CERT_TEXT.multipleChoice : CERT_TEXT.trueFalse}</span>
                </div>
                <h2 class="question-text" id="question-text">${question.question}</h2>
                <div class="answer-options" role="radiogroup" aria-labelledby="question-text">
                    ${optionsHTML}
                </div>
            </div>
        `;
    }

    setupQuestionListeners() {
        const options = document.querySelectorAll('.answer-option');
        options.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            if (!radio) return;
            // "change" covers mouse, touch and keyboard (arrow keys) selection
            radio.addEventListener('change', () => {
                options.forEach(opt => opt.classList.toggle('selected', opt === option));
                this.enableNavigation();
            });
        });
    }

    enableNavigation() {
        const nextBtn = document.getElementById('next-question');
        const submitBtn = document.getElementById('submit-quiz');
        if (nextBtn) nextBtn.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const currentQuestionSpan = document.getElementById('current-question');

        if (progressFill) {
            const progress = ((this.currentQuestionIndex + 1) / this.quizData.totalQuestions) * 100;
            // Drives a scaleX transform in CSS, not a width reflow.
            progressFill.style.setProperty('--progress', progress);
            progressFill.setAttribute('aria-valuenow', Math.round(progress));
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
            nextBtn.hidden = isLastQuestion;
            submitBtn.hidden = !isLastQuestion;
            // Enabled again once an answer is selected
            nextBtn.disabled = true;
            submitBtn.disabled = true;
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
            const radioButton = document.querySelector(`input[name^="question-"][value="${savedAnswer}"]`);
            if (radioButton) {
                radioButton.checked = true;
                radioButton.closest('.answer-option').classList.add('selected');
                this.enableNavigation();
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
                isCorrect = parseInt(userAnswer, 10) === question.correct;
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
        }
    }

    showFailureScreen() {
        const modal = this.createFailureModal();
        document.body.appendChild(modal);
        const retry = modal.querySelector('.retry-btn');
        if (retry) retry.focus();
    }

    createFailureModal() {
        const modal = document.createElement('div');
        modal.className = 'failure-modal';
        modal.innerHTML = `
            <div class="failure-content" role="dialog" aria-modal="true" aria-labelledby="failure-title">
                <h2 id="failure-title">${CERT_TEXT.failTitle}</h2>
                <p>${CERT_TEXT.yourScore}: <strong>${this.score}%</strong></p>
                <p>${CERT_TEXT.minScore}: <strong>${this.passingScore}%</strong></p>
                <div class="failure-actions">
                    <button type="button" class="btn btn-primary retry-btn">${CERT_TEXT.retry}</button>
                    <button type="button" class="btn btn-secondary review-btn">${CERT_TEXT.review}</button>
                </div>
            </div>
        `;

        modal.querySelector('.retry-btn').addEventListener('click', () => this.retakeQuiz());
        modal.querySelector('.review-btn').addEventListener('click', () => this.reviewMaterial());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
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
        window.open(this.currentTutorial.guide, '_blank', 'noopener');
    }

    handleFormSubmission(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        this.userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            company: formData.get('company') || '',
            linkedin: formData.get('linkedin') || '',
            tutorial: this.currentTutorial.title,
            score: this.score,
            date: new Date().toISOString(),
            certificateId: this.generateCertificateId()
        };

        this.saveUserData();

        this.showScreen('certificate');
        setTimeout(() => {
            this.generateCertificate();
        }, 300);
    }

    generateCertificateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).slice(2, 11);
        return `NIUEXA-${timestamp}-${random}`.toUpperCase();
    }

    saveUserData() {
        // Kept in this browser only; nothing is sent to Niuexa
        try {
            const existingData = JSON.parse(localStorage.getItem('niuexa_certifications') || '[]');
            existingData.push(this.userData);
            localStorage.setItem('niuexa_certifications', JSON.stringify(existingData));
        } catch (error) {
            // Private mode or blocked storage: the certificate still renders
        }

        this.trackCertificationCompletion();
    }

    trackCertificationCompletion() {
        if (typeof gtag !== 'undefined') {
            // Never send the email: Google Analytics forbids personal data in events.
            gtag('event', 'certification_completed', {
                'tutorial': this.currentTutorial.id,
                'score': this.score
            });
        }
    }

    // Colours come from the design tokens in styles.css
    token(name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    }

    async generateCertificate() {
        const canvas = document.getElementById('certificate-canvas');
        if (!canvas) return;

        if (document.fonts && document.fonts.ready) {
            try {
                await document.fonts.ready;
            } catch (error) {
                // Fall back to system fonts
            }
        }

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const navy = this.token('--dark-gray', '#14324A');
        const white = this.token('--white', '#FFFFFF');
        const muted = this.token('--muted-on-dark', '#ADB5BD');
        const signal = this.token('--signal-on-dark', '#4FD1C5');
        const heading = "'Space Grotesk', system-ui, sans-serif";
        const body = "'Hanken Grotesk', system-ui, sans-serif";

        ctx.clearRect(0, 0, w, h);

        // Navy field carries white text at AA; the brand spectrum is a band, not a text background
        ctx.fillStyle = navy;
        ctx.fillRect(0, 0, w, h);

        const band = ctx.createLinearGradient(0, 0, w, 0);
        band.addColorStop(0, this.token('--primary-blue', '#237DA6'));
        band.addColorStop(0.5, this.token('--brand-teal', '#0E9C9A'));
        band.addColorStop(1, this.token('--primary-green', '#43AE68'));
        ctx.fillStyle = band;
        ctx.fillRect(0, 0, w, 10);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(28, 38, w - 56, h - 66);

        ctx.textAlign = 'center';

        ctx.fillStyle = signal;
        ctx.font = `600 15px ${heading}`;
        ctx.fillText('NIUEXA', w / 2, 86);

        ctx.fillStyle = white;
        ctx.font = `700 30px ${heading}`;
        ctx.fillText(CERT_TEXT.certTitle, w / 2, 134);

        ctx.fillStyle = muted;
        ctx.font = `400 16px ${body}`;
        ctx.fillText(CERT_TEXT.certSubtitle, w / 2, 162);

        ctx.fillStyle = white;
        ctx.font = `400 19px ${body}`;
        ctx.fillText(CERT_TEXT.certIntro, w / 2, 218);

        ctx.font = `700 32px ${heading}`;
        ctx.fillText(this.fitText(ctx, this.userData.fullName.toUpperCase(), w - 120), w / 2, 266);

        ctx.font = `400 19px ${body}`;
        ctx.fillText(CERT_TEXT.certPassed, w / 2, 314);

        ctx.font = `600 24px ${heading}`;
        ctx.fillText(`"${this.currentTutorial.title}"`, w / 2, 352);

        ctx.font = `400 17px ${body}`;
        ctx.fillText(CERT_TEXT.certScore(this.score), w / 2, 386);

        const date = new Date().toLocaleDateString(CERT_TEXT.locale);
        ctx.fillStyle = muted;
        ctx.font = `400 13px ${body}`;
        ctx.fillText(`${CERT_TEXT.certDate}: ${date}`, w / 2, 450);
        ctx.fillText(`${CERT_TEXT.certId}: ${this.userData.certificateId}`, w / 2, 472);

        ctx.font = `400 12px ${body}`;
        ctx.fillText(CERT_TEXT.certNote, w / 2, 528);
        ctx.fillText('niuexa.ai', w / 2, 548);

        this.setupCertificateActions();
    }

    fitText(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) return text;
        let cut = text;
        while (cut.length > 1 && ctx.measureText(cut + '…').width > maxWidth) {
            cut = cut.slice(0, -1);
        }
        return cut + '…';
    }

    setupCertificateActions() {
        const downloadBtn = document.getElementById('download-certificate');
        const viewBtn = document.getElementById('view-certificate');
        const shareLinkedIn = document.getElementById('share-linkedin');
        const shareX = document.getElementById('share-twitter');
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

        if (shareX) {
            shareX.onclick = () => this.shareCertificate('x');
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
        link.download = `${CERT_TEXT.fileName}-${this.currentTutorial.id}-${this.userData.fullName.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    viewCertificateFullscreen() {
        const canvas = document.getElementById('certificate-canvas');
        if (!canvas) return;

        const modal = document.createElement('div');
        modal.className = 'certificate-fullscreen-modal';
        modal.innerHTML = `
            <div class="fullscreen-content" role="dialog" aria-modal="true" aria-label="${CERT_TEXT.certAlt}">
                <button type="button" class="close-fullscreen" aria-label="${CERT_TEXT.close}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <img src="${canvas.toDataURL()}" alt="${CERT_TEXT.certAlt}" class="fullscreen-certificate">
            </div>
        `;

        const close = modal.querySelector('.close-fullscreen');
        close.onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });

        document.body.appendChild(modal);
        close.focus();
    }

    // The public link to this quiz (there is no certificate lookup to link to)
    quizUrl() {
        return `${window.location.origin}${window.location.pathname}?tutorial=${encodeURIComponent(this.currentTutorial.id)}`;
    }

    shareCertificate(platform) {
        const text = CERT_TEXT.shareText(this.currentTutorial.title, this.score);
        const url = this.quizUrl();

        let shareUrl = '';

        switch (platform) {
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'x':
                shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,width=600,height=500');
        }
    }

    copyCertificateLink() {
        const btn = document.getElementById('copy-certificate-link');
        if (!navigator.clipboard || !btn) return;

        navigator.clipboard.writeText(this.quizUrl()).then(() => {
            const label = btn.querySelector('.btn-label') || btn;
            const originalText = label.textContent;
            label.textContent = CERT_TEXT.linkCopied;
            setTimeout(() => {
                label.textContent = originalText;
            }, 2000);
        });
    }

    showScreen(screenName) {
        document.querySelectorAll('.certification-screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            window.scrollTo(0, 0);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.certification = new NiuexaCertification();
});
