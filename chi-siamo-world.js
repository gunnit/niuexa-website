/* Scroll-world configuration for chi-siamo.html — "La nostra storia".
   The camera is one continuous forward take across six clay-diorama scenes
   (architecture A), so there are no connector clips: each section's clip is a
   leg of the same flight, chained frame-to-frame at render time. */
(function () {
  'use strict';

  var SECTIONS = [
    {
      id: 'origine', label: 'Origine', accent: '#1F64AE',
      still: 'img/storia/origine.webp', clip: 'img/storia/vid/origine.mp4',
      scroll: 1.7, linger: 0.35,
      eyebrow: 'Prima dell’hype',
      title: 'Siamo partiti dai processi.',
      body: 'Molto prima che l’AI generativa diventasse una parola da conferenza, lavoravamo su flussi documentali e automazione. Quella disciplina è rimasta il nostro punto di partenza.',
      tags: ['Dal 2012', 'Automazione', 'RPA']
    },
    {
      id: 'nascita', label: 'Fondazione', accent: '#237DA6',
      still: 'img/storia/nascita.webp', clip: 'img/storia/vid/nascita.mp4',
      scroll: 1.5, linger: 0.4,
      eyebrow: '2024 — La fondazione',
      title: 'Due città, una tesi.',
      body: 'Niuexa nasce tra Milano e Torino con un’idea precisa: l’intelligenza artificiale serve a creare efficienza misurabile, non rumore.',
      tags: ['Milano', 'Torino']
    },
    {
      id: 'persone', label: 'Persone', accent: '#06B6D4',
      still: 'img/storia/persone.webp', clip: 'img/storia/vid/persone.mp4',
      scroll: 1.5, linger: 0.4,
      eyebrow: 'Le persone',
      title: 'Chi c’è dietro il lavoro.',
      body: 'Gregor Maric e Roberto Botto, e un team che unisce competenza tecnologica e capacità di far crescere i prodotti sul mercato.',
      tags: ['Gregor Maric', 'Roberto Botto', 'Gruppo LBBG']
    },
    {
      id: 'metodo', label: 'Metodo', accent: '#0E9C9A',
      still: 'img/storia/metodo.webp', clip: 'img/storia/vid/metodo.mp4',
      scroll: 1.4, linger: 0.35,
      eyebrow: 'Il metodo',
      title: 'Assessment, pilota, scala.',
      body: 'Nessun progetto parte da uno strumento. Parte da un processo misurato, da un pilota onesto e solo dopo dalla scala.',
      tags: ['Assessment', 'Pilota', 'Roll-out']
    },
    {
      id: 'aula', label: 'Formazione', accent: '#2C8A4C',
      still: 'img/storia/aula.webp', clip: 'img/storia/vid/aula.mp4',
      scroll: 1.4, linger: 0.35,
      eyebrow: 'La formazione',
      title: 'Ve la lasciamo in mano.',
      body: 'Formiamo i vostri team perché l’AI resti in azienda e continui a produrre valore anche quando noi non ci siamo più.',
      tags: ['Academy', 'Workshop', 'Certificazioni']
    },
    {
      id: 'impatto', label: 'Impatto', accent: '#43AE68',
      still: 'img/storia/impatto.webp', clip: 'img/storia/vid/impatto.mp4',
      scroll: 1.9, linger: 0.45,
      eyebrow: 'L’impatto',
      title: 'Conta il risultato, non la demo.',
      body: 'Oltre 25 aziende accompagnate, un ROI medio del 150% e più di 40 ore a settimana restituite ai team che lavorano con noi.',
      tags: ['25+ aziende', 'ROI 150%', '40h/settimana'],
      cta: {
        primary: { label: 'Parliamone', href: 'contatti.html' },
        secondary: { label: 'Calcola il tuo ROI', href: 'roi-calculator.html' }
      }
    }
  ];

  function start() {
    var host = document.getElementById('storia-world');
    if (!host || typeof window.mountScrollWorld !== 'function') return;

    mountScrollWorld(host, {
      nav: false,              // the site's own navbar is the only nav
      atmosphere: true,
      crossfade: 0.35,         // scene changes are dissolves, not frame-matched cuts
      hint: 'scorri per entrare',
      sections: SECTIONS,
      connectors: []           // architecture A: the legs are the journey
    });

    /* Every layer the engine builds is position:fixed, so once the flight is
       over they would keep painting on top of the article content below.
       Flag the wrapper as soon as its bottom clears the viewport. */
    var wrap = host.parentElement;
    var ticking = false;
    function mark() {
      ticking = false;
      var past = host.getBoundingClientRect().bottom <= 0;
      wrap.classList.toggle('is-past', past);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(mark); }
    }, { passive: true });
    window.addEventListener('resize', mark);
    mark();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
