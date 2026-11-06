---
slug: framework-agentici-confronto
lang: it
type: Article
title: Scegliere un framework per agenti AI
meta_title: "Framework agenti AI: confronto e prove | NIUEXA"
h1: "LangGraph, OpenAI Agents SDK e Microsoft Agent Framework: come scegliere sul proprio processo"
description: "Confronta tre framework agentici su stato, approvazioni e ripresa: versioni Python documentate, matrice dei requisiti e prove da eseguire prima della scelta."
standfirst: "La domanda utile non è quale framework vinca in generale, ma quale permetta al team di controllare il proprio processo. Questa guida confronta tre opzioni Python documentate e propone una prova ripetibile con criteri fissati prima del risultato."
section: Agenti AI
badge: Agenti AI · Scelta del framework
published: 2026-11-06
modified: 2026-11-06
author: redazione-niuexa
speakable: false
reading_time: 12 minuti di lettura
audience: Per responsabili IT, sviluppo e acquisti di soluzioni AI
format: Matrice documentale e protocollo di valutazione
visuals: false
breadcrumb: [Home, Ricerca]
breadcrumb_label: Confrontare framework agentici
og_title: "Scegli il framework con una prova del tuo processo"
og_description: "Tre opzioni Python, versioni esplicite e un protocollo per confrontare stato, approvazioni, ripresa ed evidenze senza classifiche inventate."
og_image:
  src: img/articles/framework-agentici-confronto/framework-agentici-og.png
  alt: "Framework agentici: requisiti, stato, approvazioni e prova di accettazione"
  w: 1200
  h: 630
quick_answer_heading: "Come scegliere un framework per agenti AI?"
quick_answer: >
  Definisci prima **flusso, stato, azioni autorizzate e criteri di accettazione**.
  Confronta le capacità documentate della versione candidata, poi esegui lo
  stesso campione e gli stessi guasti controllati. Distingui memoria della
  conversazione, ripresa dell'esecuzione e conferma dell'effetto nel gestionale.
  Scegli solo dopo aver verificato anche manutenzione, costi operativi e
  responsabilità del team.
keywords:
  - confronto framework agenti AI
  - LangGraph OpenAI Agents SDK Microsoft Agent Framework
  - scegliere framework agentico
  - test accettazione agenti AI
  - checkpoint approvazioni agenti AI
faq_heading: Domande sulla scelta di un framework agentico
faq:
  - q: Questa guida stabilisce quale framework sia il migliore?
    a: No. Confronta capacità documentate di tre opzioni Python e propone un metodo di prova. Non sono stati eseguiti benchmark: il candidato adatto dipende da processo, integrazioni, competenze, criteri obbligatori e risultati della valutazione nel proprio ambiente.
  - q: Una sessione persistente basta per riprendere un lavoro interrotto?
    a: Non necessariamente. La cronologia della conversazione, lo stato di esecuzione e la registrazione dell'effetto nel sistema destinatario sono informazioni diverse. Verifica quali vengono salvate, dove, con quali permessi e come il flusso riparte dopo il riavvio del processo.
  - q: Un checkpoint impedisce di creare due volte lo stesso ordine?
    a: Da solo non dimostra questa proprietà. Serve verificare il comportamento dell'integrazione quando la scrittura riesce ma la conferma non arriva. Usa i meccanismi di idempotenza supportati dal destinatario o una riconciliazione adeguata; se l'esito resta incerto non registrarlo come fallimento certo.
  - q: Posso confrontare framework che usano modelli diversi?
    a: Sì, se dichiari di confrontare soluzioni complete. Se vuoi isolare l'orchestrazione, mantieni uguali modello, parametri, dati e strumenti dove possibile. Quando un'integrazione lo impedisce, registra la differenza e limita la conclusione: non attribuire al framework tutto il risultato.
  - q: Devo migrare subito dal framework che già uso?
    a: No. Inserisci l'implementazione attuale fra i candidati e misura quali requisiti non soddisfa. Valuta costo di migrazione, casi sospesi, aggiornamenti e competenze disponibili. Una funzione documentata in un altro progetto è un motivo per provare, non una prova che la migrazione convenga.
sources_heading: Fonti, versioni e trasparenza editoriale
sources_intro: "Fonti primarie consultate il 6 novembre 2026. I tag Python riportati identificano gli snapshot controllati; le guide online possono evolvere indipendentemente. Matrice dei requisiti, fixture e criteri di prova sono proposte della Redazione Niuexa: nessun benchmark dei tre framework è stato eseguito per questo articolo."
sources_disclaimer: "Non estendere le conclusioni ad altri linguaggi, versioni, servizi gestiti o configurazioni senza verifica. La disponibilità di una funzione non dimostra il comportamento della propria integrazione."
sources:
  - title: LangGraph, manifest Python al tag 1.2.20
    url: https://github.com/langchain-ai/langgraph/blob/1.2.20/libs/langgraph/pyproject.toml
    note: per distinguere il pacchetto core LangGraph dagli SDK e fissare il riferimento di versione.
  - title: LangGraph, overview e controllo dello stato
    url: https://docs.langchain.com/oss/python/langgraph/overview
    note: per il modello a grafo e la distinzione da LangChain.
  - title: LangGraph, persistence
    url: https://docs.langchain.com/oss/python/langgraph/persistence
    note: per checkpointer del thread e store tra thread.
  - title: LangGraph, interrupts
    url: https://docs.langchain.com/oss/python/langgraph/interrupts
    note: per sospensione, ripresa e riesecuzione del nodo.
  - title: LangGraph, fault tolerance
    url: https://docs.langchain.com/oss/python/langgraph/fault-tolerance
    note: per confine tra retry ed effetti esterni e conferme mancanti.
  - title: OpenAI Agents SDK, approvazioni al tag v0.24.0
    url: https://github.com/openai/openai-agents-python/blob/v0.24.0/docs/human_in_the_loop.md
    note: per richieste di approvazione, RunState, ripresa e versionamento del lavoro sospeso.
  - title: OpenAI Agents SDK, sessions al tag v0.24.0
    url: https://github.com/openai/openai-agents-python/blob/v0.24.0/docs/sessions/index.md
    note: per cronologia conversazionale e autorizzazione dell'accesso alle sessioni.
  - title: OpenAI Agents SDK, tracing al tag v0.24.0
    url: https://github.com/openai/openai-agents-python/blob/v0.24.0/docs/tracing.md
    note: per tracce, destinazioni di esportazione e contenuti potenzialmente sensibili.
  - title: Microsoft Agent Framework, manifest core Python al tag python-1.24.0
    url: https://github.com/microsoft/agent-framework/blob/python-1.24.0/python/packages/core/pyproject.toml
    note: per il riferimento del pacchetto agent-framework-core 1.24.0.
  - title: Microsoft Agent Framework, workflow checkpoints
    url: https://learn.microsoft.com/en-us/agent-framework/workflows/checkpoints
    note: per stato, confini di checkpoint e compatibilità della ripresa.
  - title: Microsoft Agent Framework, human-in-the-loop nei workflow
    url: https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop
    note: per richieste verso l'esterno e risposte che consentono al workflow di proseguire.
related:
  - href: articolo-tool-agenti-ai.html
    category: Architettura
    title: Dalla scelta del processo al rilascio di un agente AI
  - href: articolo-mcp-api-webhook-integrazione-aziendale.html
    category: Integrazioni
    title: Confrontare MCP, API dirette e webhook
  - href: articolo-ordini-email-pdf-erp.html
    category: Processo operativo
    title: Controllare ordini da email e PDF fino al gestionale
  - href: articolo-costi-automazione-guida.html#scheda-costo-pilota
    category: Budget
    title: Collegare consumi e costi alle pratiche accettate
cta:
  heading: Quale requisito deve dimostrare il tuo agente?
  body: "Porta un processo, i sistemi coinvolti e un'eccezione concreta. Nella prima chiamata gratuita di 30 minuti possiamo mettere a fuoco la prova da progettare; eventuali attività successive si concordano nel preventivo."
  primary_label: Parliamo della valutazione
  primary_href: /#contact
  secondary_label: Consulenza AI per le aziende
  secondary_href: consulting.html
---

## Parti dal requisito che potrebbe escludere un candidato

Una demo che risponde bene non spiega che cosa succede quando il processo resta sospeso per una notte, cambia il revisore o il gestionale registra una scrittura senza restituire la conferma. Per scegliere un framework descrivi prima quelle situazioni. Poi chiedi quale componente le gestisce, quale codice occorre aggiungere e quale evidenza dimostrerà il risultato.

La [guida generale agli agenti AI](articolo-tool-agenti-ai.html) affronta architettura, strumenti e rilascio. Qui il compito è più circoscritto: costruire una **decisione confrontabile fra implementazioni candidate**, con riferimenti documentali e prove ancora da eseguire. Il linguaggio considerato è Python. Le omonime librerie JavaScript, .NET o Go richiedono una valutazione separata.

**Nota editoriale:** articolo della Redazione Niuexa realizzato con assistenza AI. Fonti verificate il 6 novembre 2026. Gli esempi sono sintetici e il protocollo è proposto: non presentiamo risultati di laboratorio o di clienti.

Dividi i requisiti in obbligatori e preferenze. Un controllo di accesso indispensabile non può essere compensato da una demo più rapida. Per ogni requisito scrivi l'effetto atteso, chi lo accetta e quale prova conserverai. “Supporta la memoria” è troppo generico; “dopo il riavvio recupera la pratica sospesa e mostra al revisore gli stessi dati” è verificabile.

## Fissa versioni e confini prima di leggere la matrice

La tabella seguente identifica gli snapshot Python controllati nella documentazione e nel repository ufficiale. Non indica pacchetti installati o testati da Niuexa, né garantisce che una guida online descriva soltanto quel tag. Nel proprio pilot occorre fissare anche dipendenze, adattatori e backend di salvataggio effettivamente usati.

| Candidato | Riferimento controllato | Confine da mantenere |
| --- | --- | --- |
| LangGraph core | [langgraph 1.2.20](https://github.com/langchain-ai/langgraph/blob/1.2.20/libs/langgraph/pyproject.toml) | Il core non è il separato LangGraph SDK; backend e servizi di hosting hanno una propria configurazione |
| OpenAI Agents SDK per Python | [openai-agents 0.24.0](https://github.com/openai/openai-agents-python/blob/v0.24.0/pyproject.toml) | Non equivale a ogni funzione disponibile nei servizi OpenAI o nelle altre implementazioni linguistiche |
| Microsoft Agent Framework per Python | [agent-framework-core 1.24.0](https://github.com/microsoft/agent-framework/blob/python-1.24.0/python/packages/core/pyproject.toml) | Pacchetti di integrazione, linguaggi e servizi gestiti vanno registrati separatamente |

Conserva file delle dipendenze risolte, versione dell'applicazione, schema dei dati, istruzioni e definizioni dei tool. Annota modello e parametri esposti dal provider; se un identificativo è aggiornabile dal fornitore, non descriverlo come immutabile. Questa scheda permette di ricostruire il confronto quando cambia una libreria.

## Confronta capacità documentate senza trasformarle in un voto

La matrice riassume **meccanismi documentati**, non qualità misurate. Una voce presente significa che esiste un punto da implementare e provare. Non stabilisce che le tre soluzioni offrano la stessa semantica o che ogni applicazione costruita con esse soddisfi il requisito.

| Criterio | LangGraph | OpenAI Agents SDK | Microsoft Agent Framework |
| --- | --- | --- | --- |
| Organizzazione del flusso | Grafo con stato condiviso, nodi e archi | Esecuzioni di agenti con tool e passaggi fra agenti | Workflow che collegano esecutori e gestiscono messaggi |
| Stato da distinguere | Checkpointer per stato del thread; store per dati tra thread | Session per cronologia; RunState per esecuzione sospesa e decisioni | Checkpoint per stato del workflow, messaggi e richieste pendenti |
| Intervento esterno | Interrupt e ripresa con un valore fornito dall'esterno | Tool configurati per approvazione e interruzioni da risolvere | Richieste verso l'esterno e gestione delle risposte nel workflow |
| Verifica da aggiungere nel proprio ambiente | Backend persistente, identificazione del thread e comportamento del nodo ripreso | Conservazione affidabile di sessione e stato; autorizzazione delle decisioni | Backend dei checkpoint, confine del salvataggio e compatibilità del workflow |

Le fonti di lettura sono [overview](https://docs.langchain.com/oss/python/langgraph/overview), [persistence](https://docs.langchain.com/oss/python/langgraph/persistence) e [interrupts di LangGraph](https://docs.langchain.com/oss/python/langgraph/interrupts); [approvazioni](https://github.com/openai/openai-agents-python/blob/v0.24.0/docs/human_in_the_loop.md) e [sessioni OpenAI](https://github.com/openai/openai-agents-python/blob/v0.24.0/docs/sessions/index.md); [checkpoint](https://learn.microsoft.com/en-us/agent-framework/workflows/checkpoints) e [interazioni esterne Microsoft](https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop).

LangGraph non richiede LangChain: la sua documentazione lo presenta come livello di orchestrazione per controllare stato e flusso. Questa distinzione aiuta a non acquistare o progettare automaticamente un insieme di componenti solo perché compaiono negli esempi. Per ciascun candidato disegna che cosa resta nell'applicazione, che cosa viene salvato e quali servizi esterni sono necessari.

## Prova separatamente conversazione, ripresa ed effetto aziendale

Tre domande sembrano simili ma chiedono prove differenti. Il sistema ricorda che cosa è stato detto? Può continuare il lavoro dal punto previsto dopo un'interruzione? L'azione nel sistema destinatario è avvenuta una sola volta, con i dati autorizzati? Un esito positivo sulla prima domanda non chiude le altre due.

Nel modello documentato da LangGraph, riprendere dopo un interrupt comporta la riesecuzione del nodo dall'inizio. Collocare una scrittura prima della pausa richiede quindi particolare attenzione al suo comportamento durante la ripresa. Il [confine fra retry e idempotenza](https://docs.langchain.com/oss/python/langgraph/fault-tolerance) distingue la ripetizione del nodo dalla protezione dell'effetto esterno; la conferma mancante va trattata come esito sconosciuto finché non viene riconciliata.

Nell'Agents SDK, la cronologia della Session e il RunState sospeso hanno ruoli distinti. La guida alle approvazioni documenta la serializzazione e la ripresa, ma precisa anche che il caricamento non autentica lo snapshot o chi lo presenta. La verifica dell'identità, della proprietà del lavoro e dell'integrità dello stato resta un compito dell'applicazione. Conservare dati non significa aver autorizzato chi li usa.

I checkpoint dei workflow Microsoft vengono descritti in relazione ai superstep, con stato degli esecutori, messaggi e richieste. Nel pilot verifica il punto di salvataggio realmente raggiunto prima dell'arresto, non soltanto la presenza di un file. Verifica inoltre come una nuova versione del workflow tratta i lavori precedenti: un riavvio con lo stesso codice e un aggiornamento applicativo sono prove diverse.

## Prepara un caso sintetico uguale per tutti i candidati

Considera il seguente **scenario interamente inventato**: una richiesta DEMO-17 chiede di aggiornare un recapito in un gestionale di prova. Il valore originale è `SEDE-A`, quello proposto è `SEDE-B`. Un operatore può leggere la proposta; soltanto il ruolo previsto può approvarla. Il tool di scrittura è un simulatore isolato, senza dati personali né collegamenti alla produzione.

La fixture comprende richiesta originale, dati iniziali, risposta attesa del simulatore, regola di approvazione e modalità di lettura successiva. La stessa fixture viene consegnata a ogni implementazione. Non è un test di comprensione di un indirizzo reale: serve a osservare flusso e controlli. Eventuali prove con modello vanno aggiunte come un livello separato.

| Prova proposta | Evento introdotto | Evidenza richiesta prima di assegnare l'esito |
| --- | --- | --- |
| P01 · Attesa | La proposta è pronta, nessuno ha deciso | Nessuna scrittura; proposta e stato pendente recuperabili |
| P02 · Riavvio | Il processo viene fermato mentre attende | La stessa pratica riappare con dati e decisione ancora coerenti |
| P03 · Rifiuto | Il revisore autorizzato respinge la proposta | Nessuna modifica al simulatore e rifiuto collegato alla pratica |
| P04 · Proposta cambiata | Dopo la decisione `SEDE-B` viene sostituita con `SEDE-C` | La decisione precedente non autorizza silenziosamente il nuovo contenuto |
| P05 · Conferma persa | Il simulatore applica la modifica ma la risposta manca | Stato incerto e lettura di riconciliazione; nessuna duplicazione non controllata |
| P06 · Accesso diverso | Un altro utente tenta di recuperare o decidere sul lavoro | Accesso rifiutato secondo la regola prevista e prova dell'esito |
| P07 · Aggiornamento | Cambiano codice o schema mentre esiste lavoro pendente | Ripresa compatibile dimostrata oppure percorso esplicito di migrazione o sospensione |

Questi sono casi di accettazione proposti, **non sette prove superate**. Le proprietà dipendono dall'implementazione completa. Se un simulatore non può riprodurre il comportamento del gestionale reale, descrivi il limite e prepara una successiva verifica autorizzata nell'ambiente adeguato. Non sostituire l'incertezza con una spunta verde.

## Compila un registro comparabile e conserva anche i casi aperti

La seguente intestazione separa versione, caso e risultato. Le due righe dimostrative non contengono misure: indicano esplicitamente una prova non eseguita. Copia il registro, sostituisci i segnaposto e conserva a parte le evidenze autorizzate. È una proposta operativa, non un formato imposto dai framework.

:::html
<pre><code>candidato;versione_e_lock;app_version;caso;fixture_version;modello_e_parametri;backend_stato;tentativo;esito;effetto_osservato;evidenza;limite&#10;CANDIDATO-DEMO;DA-FISSARE;APP-DEMO;P02;FIXTURE-DEMO-1;DA-FISSARE;DA-FISSARE;NON-ESEGUITO;NON-ESEGUITO;NON-OSSERVATO;NESSUNA;scenario sintetico&#10;CANDIDATO-DEMO;DA-FISSARE;APP-DEMO;P05;FIXTURE-DEMO-1;DA-FISSARE;DA-FISSARE;NON-ESEGUITO;NON-ESEGUITO;NON-OSSERVATO;NESSUNA;scenario sintetico</code></pre>
:::

Definisci prima cosa significa “superato”, “fallito”, “non eseguito” e “inconcludente”. Un arresto prima del punto da osservare può rendere la prova inconcludente, non dimostrare che il controllo funziona. Registra quanti tentativi erano previsti, quanti sono stati eseguiti e quali sono rimasti aperti. Evita una percentuale che nasconde i casi non ottenuti.

Per isolare l'orchestrazione puoi iniziare con risposte del modello e tool simulati. Successivamente introduci il modello reale, lo stesso campione autorizzato, gli stessi strumenti e i parametri confrontabili. Se cambiano più componenti, il confronto riguarda le soluzioni complete. Mantieni le tracce sufficienti a ricostruire la decisione senza riversare credenziali o interi documenti nei log.

## Misura il lavoro necessario per mantenere il controllo

L'esito tecnico va affiancato all'onere di gestione. Registra tempo di implementazione e diagnosi, componenti aggiunti, conoscenze richieste, consumi, storage e attività manuali. Fissa prima l'inizio e la fine delle misure. Non confrontare un prototipo costruito dal team esperto con una prima prova di chi sta imparando senza dichiarare la differenza.

Per le tracce decidi destinazione, accessi e dati ammessi prima di usare informazioni aziendali. La [documentazione del tracing OpenAI al tag considerato](https://github.com/openai/openai-agents-python/blob/v0.24.0/docs/tracing.md) segnala che input e output possono contenere dati sensibili e descrive le opzioni di raccolta ed esportazione. Per ogni candidato verifica la configurazione effettiva: avere un pannello di osservabilità non dimostra né completezza delle prove né correttezza delle autorizzazioni.

Il [modello di costo per il pilot](articolo-costi-automazione-guida.html#scheda-costo-pilota) aiuta a collegare consumi e lavoro agli esiti accettati. Per la scelta del framework aggiungi il costo di gestire casi sospesi, aggiornamenti e incidenti. Un minor numero di righe di codice non misura automaticamente queste attività, così come il prezzo del solo pacchetto non rappresenta il costo della soluzione.

## Chiudi la scelta con una decisione e un motivo per riaprirla

Prepara una scheda finale con requisiti obbligatori, stato delle prove, limiti, costi osservati e responsabili. Scarta o correggi i candidati che non soddisfano un requisito necessario; confronta le preferenze soltanto tra le opzioni rimaste. Se un fatto è documentato ma non provato nel proprio ambiente, mantieni entrambe le informazioni.

È legittimo scegliere una soluzione più semplice quando il flusso non richiede l'orchestrazione aggiuntiva. È altrettanto legittimo accettare più componenti se una prova dimostra che rendono gestibile un requisito reale. Scrivi il motivo concreto: la decisione deve essere comprensibile anche a chi manterrà il sistema fra sei mesi.

Conserva infine la condizione che riapre la valutazione: nuovo requisito, modifica del gestionale, aggiornamento incompatibile, costo oltre la soglia concordata o incidente non coperto. Per collegare i sistemi usa la [guida a MCP, API e webhook](articolo-mcp-api-webhook-integrazione-aziendale.html); per il processo completo, il [runbook email/PDF verso il gestionale](articolo-ordini-email-pdf-erp.html). Il framework è una parte della soluzione: la decisione resta verificabile quando ogni confine ha un responsabile e una prova pertinente.
