slug:        incident-response-ai-pmi
lang:        it
type:        Article
title:       Incident response AI per PMI
meta_title:  "Incident Response AI per PMI: Runbook Operativo | Niuexa"
h1:          "Incident response AI per PMI: il runbook operativo"
description: "Runbook pratico per gestire incidenti AI: severità, contenimento, evidenze, ripristino, comunicazione e post-mortem per le PMI."
standfirst:  Quando un sistema AI sbaglia in produzione, "spegnerlo" è solo l'inizio. Servono severità, ruoli, contenimento, evidenze e criteri di riapertura definiti prima dell'incidente.
section:     AI Governance e Operations
badge:       AI Governance e Operations
published:   2026-08-04
modified:    2026-10-05

author:      gregor-maric
reviewed_by: roberto-botto

reading_time: 10 minuti di lettura   # words/220, rounded up to 5 minutes
audience:    Per CEO, COO, IT e security
format:      Runbook in 7 fasi
visuals:     true

breadcrumb:  [Home, Ricerca]
breadcrumb_label: Incident response AI

og_title:    "Incident response AI per PMI: il runbook operativo"
og_description: Come rilevare, contenere e risolvere un incidente AI senza perdere evidenze, continuità e responsabilità.
twitter_description: "Severità, contenimento, evidenze, ripristino e post-mortem per sistemi AI in produzione."

og_image:
  src: img/articles/incident-response-ai-pmi/incident-response-ai-pmi-og.png
  alt: Runbook Niuexa per la gestione degli incidenti nei sistemi AI
  w: 1200
  h: 630

hero:
  src: img/articles/incident-response-ai-pmi/incident-response-ai-pmi-og.png
  alt: Runbook Niuexa per rilevare, contenere, ripristinare e imparare da un incidente AI
  w: 1200
  h: 630
  caption: Un piano utile protegge prima il processo, poi permette di capire la causa senza distruggere le evidenze.

quick_answer_heading: "Risposta rapida: che cos'è l'incident response AI?"
quick_answer: >
  L'**incident response AI** è il processo con cui un'azienda rileva, classifica,
  contiene e risolve eventi inattesi legati a un sistema AI: un output falso
  inviato a un cliente, un agente che esegue un'azione non autorizzata o una fuga
  di dati. Il runbook stabilisce chi decide, che cosa fermare e quali prove
  conservare.

keywords:
  - incident response AI
  - gestione incidenti intelligenza artificiale
  - runbook AI
  - incidente AI agent
  - sicurezza AI PMI

faq_heading: FAQ sulla gestione degli incidenti AI
faq:
  - q: Che cos'è un incidente AI?
    a: È un evento in cui un sistema AI produce o abilita un comportamento inatteso con impatto su dati, persone, denaro, sicurezza, conformità o continuità.
  - q: Qual è la prima azione?
    a: "Mettere in sicurezza il processo: fermare azioni rischiose, limitare accessi e attivare il fallback, preservando log e versioni."
  - q: Quali evidenze devo conservare?
    a: Input e output pertinenti, timestamp, identità, permessi, versione del modello e del prompt, fonti recuperate, tool chiamati e decisioni umane.
  - q: Ogni incidente va notificato?
    a: No. Gli obblighi dipendono da sistema, ruolo, gravità e normativa applicabile; serve una valutazione specifica.
  - q: Quando posso riattivare il sistema?
    a: Quando causa e controllo sono verificati, il fallback resta disponibile, un owner accetta il rischio residuo e il monitoraggio è attivo.

sources_intro: "Il runbook e la matrice di severità sono una guida operativa Niuexa. Sono informati da:"
sources_disclaimer: Il contenuto è informativo e non sostituisce una valutazione legale, privacy, cybersecurity o regolamentare sul caso specifico.
sources:
  - title: NIST AI Risk Management Framework
    url: https://www.nist.gov/itl/ai-risk-management-framework
    publisher: NIST
    note: per governare, mappare, misurare e gestire i rischi AI.
  - title: NIST AI 600-1, Generative AI Profile
    url: https://doi.org/10.6028/NIST.AI.600-1
    publisher: NIST
    note: che include azioni su incident response e incident disclosure.
  - title: OWASP GenAI Incident Response Guide
    url: https://genai.owasp.org/resource/genai-incident-response-guide-1-0/
    publisher: OWASP
    note: guida per professionisti della sicurezza che gestiscono incidenti GenAI.
  - title: Commissione europea, quadro dell'AI Act
    url: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
    publisher: Commissione europea
    note: per ruoli, approccio basato sul rischio e casi che prevedono gestione o segnalazione di incidenti seri.

related:
  - href: articolo-human-in-the-loop-ai-pmi.html
    category: Governance
    title: Progettare il controllo umano dell'AI
  - href: articolo-due-diligence-fornitori-ai-pmi.html
    category: Procurement
    title: Due diligence dei fornitori AI
  - href: articolo-rischi-ai-azienda.html
    category: AI Risk
    title: I rischi dell'AI in azienda
  - href: ai-readiness-assessment.html
    category: Assessment
    title: Valutare la readiness AI

cta:
  heading: I Suoi sistemi AI hanno un piano di incidente e ripristino?
  body: "Ci mostri un processo: nella prima chiamata di 30 minuti, gratuita, guardiamo che cosa succede se l’AI sbaglia, chi la ferma e quale percorso manuale resta disponibile."
  primary_label: Ci mostri un processo
  primary_href: /#contact
  secondary_label: Come lavoriamo
  secondary_href: consulting.html
---

## Perché il piano IT tradizionale non basta

Un guasto applicativo classico tende a essere riproducibile: un servizio non risponde, un database è indisponibile, una release introduce un errore. Un incidente AI può invece dipendere dall'interazione tra input, contesto recuperato, versione del modello, prompt di sistema, strumenti disponibili e decisioni umane. Due richieste simili possono produrre esiti diversi.

Per questo non basta registrare "errore del chatbot". Bisogna ricostruire la catena: chi ha inviato l'input, quale conoscenza è stata recuperata, quale versione era attiva, quali tool sono stati chiamati, quale azione è stata eseguita e quale controllo avrebbe dovuto intervenire. Il NIST AI RMF include meccanismi organizzativi per identificare e gestire i rischi; il profilo NIST per l'AI generativa invita inoltre a verificare e aggiornare processi di risposta e disclosure degli incidenti.

Per una PMI il principio è semplice: integrare l'AI nel processo di incident management esistente, aggiungendo le evidenze e le decisioni specifiche dei sistemi probabilistici. Non serve creare una centrale operativa separata; serve evitare che l'AI resti una zona senza owner.

## Prima dell'incidente: preparare cinque elementi

1. **Inventario:** sistema, owner, uso previsto, dati, integrazioni, utenti, fornitore e criticità del processo.
2. **Telemetria:** log di input e output consentiti, versioni, fonti, chiamate a strumenti, decisioni umane e alert, con minimizzazione e retention definite.
3. **Kill switch:** modalità per sospendere invii, pagamenti, aggiornamenti o accessi senza spegnere servizi non coinvolti.
4. **Fallback:** percorso manuale o degradato che mantiene il servizio essenziale mentre l'AI è isolata.
5. **Contatti:** incident lead, process owner, referente tecnico, privacy/legale e comunicazione, con sostituti e reperibilità proporzionati al rischio.

Se questi elementi vengono cercati durante l'emergenza, il tempo di contenimento aumenta e la ricostruzione diventa meno affidabile.

## La matrice di severità: da S1 a S4

:::figure src="img/articles/incident-response-ai-pmi/matrice-severita-incidenti-ai.svg" alt="Matrice Niuexa con quattro livelli di severità per incidenti AI" width="1200" height="680" loading="eager" class="article-diagram article-diagram-scroll"
La severità non dipende da quanto l'output appare strano, ma dalle conseguenze: persone, dati, denaro, diffusione e reversibilità. Su mobile, il diagramma scorre in orizzontale.
:::

| Livello | Esempio | Risposta minima |
| --- | --- | --- |
| **S1: basso** | Bozza interna errata, intercettata prima dell'uso. | Correzione, registrazione e verifica di ricorrenza. |
| **S2: medio** | Classificazione errata su un gruppo limitato di ticket. | Contenimento, fallback e analisi entro lo SLA interno. |
| **S3: alto** | Azioni errate verso clienti, dati riservati possibili o impatto economico. | Stop del flusso, incident team, verifica legale/privacy e comunicazione controllata. |
| **S4: critico** | Impatto esteso o non reversibile su diritti, salute, sicurezza o dati sensibili. | Crisis lead, contenimento immediato, decisioni esecutive e valutazione degli obblighi esterni. |

Questa classificazione è una guida operativa Niuexa, non una classificazione legale. Gli obblighi di notifica dipendono dal sistema, dal ruolo dell'organizzazione, dai dati e dalla normativa applicabile.

## Il runbook in sette fasi

:::figure src="img/articles/incident-response-ai-pmi/workflow-incident-response-ai.svg" alt="Sette fasi del ciclo di incident response AI: rilevare, classificare, contenere, preservare, ripristinare, comunicare e imparare" width="1200" height="760" loading="eager" class="article-diagram article-diagram-scroll"
Contenimento e preservazione devono procedere insieme: bloccare il rischio senza cancellare le tracce necessarie a comprenderlo. Su mobile, il diagramma scorre in orizzontale.
:::

### 1. Rilevare e aprire un evento

Accetti segnali da utenti, controlli automatici, monitoraggio qualità, sicurezza e fornitori. Registri subito timestamp, sistema, segnalante, comportamento osservato e azione già avvenuta. Eviti diagnosi premature.

### 2. Classificare impatto e perimetro

Chieda quali persone, dati, processi e canali sono coinvolti; se l'azione è reversibile; se il comportamento continua; se altri sistemi condividono modello, credenziali o knowledge base. Assegni una severità provvisoria, che può aumentare.

### 3. Contenere con il minimo raggio d'azione

Sospenda la funzione rischiosa, revochi token o permessi compromessi, disabiliti un tool, congeli una versione o devii sul fallback. Non applichi modifiche non tracciate "per vedere se passa": possono alterare le evidenze e introdurre nuove variabili.

### 4. Preservare le evidenze

Conservi input e output pertinenti, prompt di sistema, versione del modello, parametri, documenti recuperati, log delle chiamate, identità, autorizzazioni, configurazioni e decisioni umane. Protegga accesso, integrità e tempi di conservazione; non raccolga dati oltre il necessario.

### 5. Correggere e ripristinare per gradi

La correzione può riguardare dati, istruzioni, accessi, validazioni, soglie, interfaccia o processo. La verifichi su casi normali, edge case e caso dell'incidente. Riapra prima in ambiente controllato o su traffico limitato, mantenendo fallback e monitoraggio rafforzato.

### 6. Comunicare con una fonte unica

Definisca un incident lead e un log decisionale. Aggiornamenti interni, assistenza clienti, fornitori e valutazioni normative devono partire dallo stesso stato verificato. Distingua fatti, ipotesi e azioni in corso. Eviti messaggi rassicuranti prima di conoscere perimetro e impatto.

### 7. Chiudere con un post-mortem

Documenti sequenza, causa, controlli mancanti, tempo di rilevazione, tempo di contenimento e impatto. Ogni azione correttiva deve avere owner e scadenza. Il post-mortem non cerca un colpevole: cerca la condizione che ha permesso all'errore di raggiungere il processo reale.

## Il gate di riapertura

Un sistema non torna in produzione solo perché "sembra funzionare". Prima della riapertura verifichi:

- la causa è compresa abbastanza da evitare una replica immediata;
- il controllo correttivo è stato testato sul caso dell'incidente e su casi adiacenti;
- credenziali, permessi e versioni sono coerenti con il perimetro approvato;
- fallback e kill switch sono disponibili;
- un process owner accetta il rischio residuo;
- alert e campionamento rafforzato sono attivi per un periodo definito;
- eventuali comunicazioni o adempimenti sono stati valutati dai ruoli competenti.

Per S3 e S4 è utile una decisione nominativa di go/no-go. Per S1 e S2 può bastare un'approvazione operativa tracciata, purché il criterio sia stabilito prima.

## KPI per migliorare la risposta

- **Tempo di rilevazione:** dall'inizio dell'evento al primo alert attendibile.
- **Tempo di contenimento:** dall'apertura alla sospensione del comportamento rischioso.
- **Escalation corretta:** quota di eventi assegnati al livello e ai ruoli appropriati.
- **Recidiva:** incidenti simili dopo la correzione.
- **Copertura delle evidenze:** eventi per cui versione, fonti, azioni e identità sono ricostruibili.
- **Tempo in fallback:** durata e capacità del percorso alternativo.

Non usi il numero assoluto di incidenti come unico KPI: un sistema con segnalazioni aperte e tracciate può essere più maturo di uno che non rileva nulla.
