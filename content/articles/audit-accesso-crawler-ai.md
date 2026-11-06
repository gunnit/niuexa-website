---
slug: audit-accesso-crawler-ai
lang: it
type: Article
title: Audit di accesso dei crawler AI
meta_title: "Audit crawler AI: accesso, HTML e canonical | NIUEXA"
h1: "Audit di accesso dei crawler AI: quali prove controllare prima di cambiare il sito"
description: "Una scheda tecnica per controllare accesso dei crawler AI, robots, HTML ricevuto, rendering e canonical, con prove e priorità di correzione verificabili."
standfirst: "La pagina si apre nel browser, ma questo non dice quale contenuto abbia ricevuto un motore. Un audit utile collega richiesta, regole applicabili, corpo restituito e destinazione canonica, poi distingue le verifiche mancanti dai difetti riproducibili."
section: AEO e GEO
badge: AEO e GEO · Accesso tecnico
published: 2026-11-06
modified: 2026-11-06
author: redazione-niuexa
speakable: false
reading_time: 11 minuti di lettura
audience: Per responsabili web, SEO, IT e agenzie
format: Registro di audit e casi diagnostici
visuals: false
breadcrumb: [Home, Ricerca]
breadcrumb_label: Audit di accesso dei crawler AI
og_title: "Il crawler riceve davvero la pagina che vuoi pubblicare?"
og_description: "Una scheda per collegare richiesta, robots, corpo HTML, rendering, canonical e prova del motore, con quattro casi diagnostici fittizi."
og_image:
  src: img/articles/audit-accesso-crawler-ai/crawler-access-og.png
  alt: "Audit dei crawler AI: richiesta, contenuto ricevuto e prove distinte"
  w: 1200
  h: 630
quick_answer_heading: "Come verificare l'accesso dei crawler AI?"
quick_answer: >
  Per ogni URL registra **richiesta, regole applicabili e contenuto ricevuto**.
  Controlla redirect, direttive, HTML iniziale, rendering e destinazione
  canonica. Una prova con user-agent dichiarato è una simulazione: per
  attribuire una visita al crawler servono evidenze di identità e log.
  Conserva separatamente stato nell'indice, notifiche inviate e citazioni
  effettivamente osservate.
keywords:
  - audit accesso crawler AI
  - verificare robots crawler AI
  - HTML canonical indicizzazione AI
  - sito accessibile ChatGPT ricerca
  - verificare Googlebot Bingbot
faq_heading: Domande sull'audit di accesso dei crawler AI
faq:
  - q: Un HTTP 200 dimostra che il crawler ha letto la pagina?
    a: No. Descrive la risposta alla richiesta controllata. Va verificato anche il corpo ricevuto: potrebbe essere una verifica anti-bot, un contenitore senza testo o una pagina diversa. Per attribuire la visita a un crawler occorre inoltre verificarne l'identità con il metodo del provider.
  - q: Basta cambiare lo user-agent per provare l'accesso di un bot?
    a: No. Quel valore è dichiarato dal client e può essere imitato. Una richiesta simulata può aiutare a riprodurre una differenza, ma non prova il trattamento di un crawler autentico proveniente dalla sua infrastruttura.
  - q: Il gruppo con User-agent asterisco vale anche quando esiste un gruppo specifico?
    a: Non presumere che i gruppi si sommino. Per Google, il gruppo specifico applicabile non viene combinato con quello globale; gruppi specifici equivalenti possono essere uniti. Per ciascun provider controlla la sua documentazione e l'intero file, sul corretto host e protocollo.
  - q: Devo permettere l'addestramento per comparire nella ricerca AI?
    a: Non trattare le due scelte come equivalenti. OpenAI distingue OAI-SearchBot e GPTBot; Anthropic distingue Claude-SearchBot e ClaudeBot. Google-Extended riguarda gli usi Gemini documentati e non determina l'inclusione in Google Search. Valuta agente, prodotto e scopo separatamente.
  - q: Dopo la correzione, una sitemap o IndexNow confermano l'indicizzazione?
    a: No. Una notifica ricevuta non è una conferma di scansione o indicizzazione. Verifica prima la pagina pubblica corretta, poi conserva il riscontro del servizio con data e tipo di controllo. La citazione in una risposta AI richiede un'ulteriore osservazione.
sources_heading: Fonti e trasparenza editoriale
sources_intro: "Fonti primarie consultate il 6 novembre 2026. Registro, priorità e casi DEMO sono una proposta della Redazione Niuexa preparata con assistenza AI. I casi sono interamente fittizi: non descrivono difetti del sito Niuexa, richieste autentiche di crawler o risultati di clienti."
sources_disclaimer: "Ruoli dei bot e controlli dei provider possono cambiare. Adatta le prove all'infrastruttura autorizzata e conserva le esclusioni intenzionali; l'accessibilità non garantisce indicizzazione o citazioni."
sources:
  - title: OpenAI, Overview of OpenAI Crawlers
    url: https://developers.openai.com/api/docs/bots
    note: per la separazione fra ricerca, addestramento e visite richieste dagli utenti e i riferimenti IP pubblicati.
  - title: Google, How Google interprets the robots.txt specification
    url: https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
    note: per ambito di host e protocollo, selezione e combinazione dei gruppi.
  - title: Google, Block Search indexing with noindex
    url: https://developers.google.com/search/docs/crawling-indexing/block-indexing
    note: per direttive HTML o HTTP e necessità che Google possa leggerle.
  - title: Google, Specify a canonical URL
    url: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
    note: per segnali di canonicalizzazione e coerenza fra annotazioni e sitemap.
  - title: Google, JavaScript SEO basics
    url: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
    note: per HTML iniziale, risorse e rendering di Google Search.
  - title: Google, Verify requests from Google crawlers and fetchers
    url: https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests
    note: per i metodi di verifica e le distinte categorie di richieste Google.
  - title: Bing, How to Verify Bingbot
    url: https://www.bing.com/webmasters/help/how-to-verify-bingbot-3905dc26
    note: per verifica DNS inversa e diretta o riferimenti IP ufficiali aggiornati.
  - title: Google, Common crawlers and Google-Extended
    url: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended
    note: per il controllo degli usi Gemini e la separazione da Google Search.
  - title: Anthropic, Crawlers and site-owner controls
    url: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
    note: per i diversi ruoli di ClaudeBot, Claude-SearchBot e Claude-User.
  - title: Perplexity, Perplexity Crawlers
    url: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
    note: per PerplexityBot, visite richieste dagli utenti e riferimenti ufficiali di rete.
  - title: Google, URL Inspection tool
    url: https://support.google.com/webmasters/answer/9012289
    note: per la differenza fra dati conservati nell'indice e test live.
  - title: IndexNow, Documentation
    url: https://www.indexnow.org/documentation
    note: per il significato di ricezione degli URL della risposta HTTP 200.
related:
  - href: articolo-visibilita-chatgpt-perplexity-claude.html
    category: Quadro generale
    title: Capire accesso e visibilità nelle piattaforme AI
  - href: articolo-workflow-contenuti-ai-pubblicazione.html
    category: Pubblicazione
    title: Collegare fonti, revisione e pagina pubblica
  - href: articolo-benchmark-visibilita-ai-template.html
    category: Misurazione
    title: Conservare risposte, tentativi e denominatori
  - href: articolo-audit-accuratezza-brand-ai.html
    category: Accuratezza
    title: Verificare i fatti del brand nelle risposte
cta:
  heading: Quale passaggio dell'accesso devi verificare?
  body: "Porta un URL pubblico, il contenuto atteso e la prova che non coincide con l'atteso. Nella prima chiamata gratuita di 30 minuti possiamo chiarire il controllo successivo; eventuali attività successive si concordano nel preventivo."
  primary_label: Parliamo della verifica
  primary_href: /#contact
  secondary_label: Consulenza AEO e GEO
  secondary_href: consulenza-aeo-geo.html
---

## Definisci quale contenuto deve arrivare e a quale servizio

Un audit non comincia con «l'AI non vede il sito». Comincia con un URL, un fatto che dovrebbe essere leggibile e un contesto di richiesta. Scegli una pagina pubblica e indica titolo, informazione principale e versione attesa. Se il sito ha più lingue, host o sottodomini, trattali come destinazioni distinte. Una prova sulla home non descrive automaticamente schede, articoli o PDF.

La [guida alla visibilità su ChatGPT, Perplexity e Claude](articolo-visibilita-chatgpt-perplexity-claude.html) presenta il quadro dei servizi. Qui il risultato è più operativo: un registro che permetta all'agenzia o al responsabile web di **riprodurre il problema, correggere il livello giusto e verificarne la chiusura**.

**Nota editoriale.** Metodo della Redazione Niuexa realizzato con assistenza AI. Fonti consultate il 6 novembre 2026. Gli esempi seguenti sono inventati; non attribuiscono errori a questo sito e non includono visite autentiche di motori.

Scegli un campione per template e condizioni: pagina informativa, pagina di servizio, variante linguistica e contenuto con script rilevanti. Scrivi perché ogni caso entra nel campione. Aggiungi pagine segnalate da errori riproducibili, senza chiamare l'intero sito «verificato» dopo pochi URL.

## Tieni uniti richiesta, risposta e corpo effettivamente ricevuto

Per ogni tentativo conserva data e ora con fuso, URL iniziale, metodo, contesto di sessione, user-agent dichiarato, catena dei redirect, URL finale e stato HTTP. Aggiungi header pertinenti, riferimento al corpo ricevuto e confronto con il fatto atteso. Se conservi un'impronta del file, mantieni anche una prova leggibile: l'impronta rileva differenze, ma non spiega quale contenuto manca.

| Parte del controllo | Evidenza da conservare | Conclusione che resta separata |
| --- | --- | --- |
| Richiesta pubblica | Parametri osservabili, redirect, header e corpo | Identità di un crawler autentico |
| Contenuto | Passaggio atteso e passaggio ricevuto | Inclusione nell'indice |
| Regole | File e direttive applicabili con data | Ricezione effettiva da parte del motore |
| Destinazione | Canonical dichiarato, risolto e controllato | Canonical scelto dal motore |
| Motore | Servizio, tipo di controllo, data e risultato | Citazione in una risposta AI |

Un `200` con una schermata di verifica, un modulo di login o il solo contenitore dell'applicazione non consegna necessariamente l'articolo atteso. Non basta cercare una parola: confronta il fatto che deve arrivare. Un test `HEAD` può essere utile per alcuni header, ma non restituisce il corpo da confrontare; per quella prova occorre una richiesta che lo riceva.

Ripeti le condizioni che sembrano influire, una alla volta. Browser autenticato e sessione anonima possono seguire percorsi diversi. La differenza va registrata, senza attribuirla subito al firewall: potrebbero intervenire cache, template, personalizzazione o autorizzazioni previste.

## Leggi il gruppo robots applicabile, non soltanto un Allow

Acquisisci il `robots.txt` relativo a host, protocollo e porta controllati. La [documentazione Google](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec) spiega che il gruppo specifico viene selezionato senza combinarlo con quello globale; gruppi specifici equivalenti possono essere uniti. Per gli altri provider verifica le regole documentate. Non dedurre che un'esclusione sotto `User-agent: *` resti attiva in ogni gruppo dedicato.

Registra agente valutato, gruppi rilevanti, percorso e regola che motiva l'esito. Un `Allow: /` isolato non descrive l'intero file. Conserva le esclusioni intenzionali e controlla anche il percorso di eventuali risorse necessarie alla pagina. Il registro deve consentire di spiegare quale regola abbia prodotto la valutazione, non soltanto mostrare un bollino verde.

Controlla poi le direttive ricevute nella pagina e negli header. Per Google, [noindex può comparire in HTML o in X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/block-indexing), e il crawler deve poterlo leggere. Bloccare la scansione e impedire l'indicizzazione sono controlli diversi. Prima di rimuovere una direttiva, verifica che la pagina debba davvero essere pubblica nell'indice: una sezione intenzionalmente esclusa non è un difetto da correggere.

## Associa ogni agente al suo prodotto e scopo

Il nome del fornitore è troppo generico per decidere una regola. Le [impostazioni OpenAI](https://developers.openai.com/api/docs/bots) distinguono OAI-SearchBot per la ricerca e GPTBot per l'addestramento; ChatGPT-User recupera contenuti in contesti richiesti dall'utente e non determina l'inclusione nella ricerca. Registrare questi ruoli separatamente evita di trasformare una scelta editoriale in un permesso diverso da quello desiderato.

[Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) distingue Claude-SearchBot, ClaudeBot e Claude-User. [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) descrive PerplexityBot per i risultati di ricerca e Perplexity-User per visite richieste dall'utente; per quest'ultimo documenta un comportamento generalmente diverso rispetto al robots.txt. Non estendere automaticamente il controllo di un agente agli altri.

Per Google Search, esamina Googlebot e le indicazioni del servizio. Il token [Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended) controlla gli usi Gemini documentati, compresi addestramento e grounding, senza incidere sull'inclusione o sul ranking di Google Search. La scheda dell'audit deve quindi nominare il prodotto interessato, non una categoria indistinta «tutti i bot AI».

## Risolvi il canonical e confronta HTML iniziale e rendering

Registra il valore del canonical esattamente come viene ricevuto e la sua destinazione assoluta risolta nel contesto della pagina. Poi visita quella destinazione: stato finale, eventuali redirect, lingua e contenuto devono essere coerenti con lo scopo. Una pagina accessibile che dichiara un'altra destinazione inesistente richiede una verifica diversa da una pagina che non risponde affatto.

Google considera [redirect, annotazioni canonical e sitemap come segnali](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), con peso diverso. Il canonical dichiarato non prova la scelta del motore. Confrontalo con link interni e sitemap e, quando disponibile, con il canonical riportato nell'ispezione del servizio. Non fondere in un solo campo dichiarazione e selezione osservata.

Per i fatti essenziali confronta risposta HTML iniziale e pagina renderizzata. La [guida JavaScript di Google](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) descrive il proprio processo di rendering; questo non dimostra la capacità di ogni altro crawler. Se un'informazione appare soltanto dopo uno script, annota quale informazione, risorse richieste e risultato osservato. Una schermata corretta nel tuo browser rimane una prova di quel browser.

## Usa un registro copiabile per distinguere quattro diagnosi

Questo **caso è interamente fittizio**. Il dominio `azienda.example` non rappresenta un cliente. Il fatto dimostrativo `F-DEMO-v2` corrisponde alla frase «La procedura prevede un controllo prima dell'invio». Il corpo `TESTO-DEMO-v2` contiene quella frase; `CHALLENGE-DEMO` contiene soltanto una verifica anti-bot. I riferimenti `DEMO/E01` e simili sono etichette inventate, non file scaricabili.

Nel caso C02, la pagina iniziale dichiara il canonical relativo `/guida`: risolto sull'host dimostrativo diventa `https://azienda.example/guida`, che nell'esempio restituisce `404`. C03 contiene un `noindex` ricevuto nel controllo anonimo; la sua intenzionalità resta da confermare. C04 consegna il testo atteso nella prova pubblica, ma non possiede log di un bot identificato.

Copia il CSV con separatore punto e virgola. Ogni riga descrive una prova, non una pagina certificata per tutti i crawler. `NON-VALUTATO` e `NON-VERIFICATO` mantengono esplicite le informazioni mancanti.

:::html
<pre><code>test_id;url_testato;contesto;metodo;status_finale;fatto_atteso;corpo_osservato;noindex;canonico_risolto;status_canonico;bot_verificato;prova;diagnosi;prossimo_passaggio&#10;C01;https://azienda.example/guida;anonimo;GET;200;F-DEMO-v2;CHALLENGE-DEMO;NON-VALUTATO;NON-VALUTATO;NON-VALUTATO;NON-VERIFICATO;DEMO/E01;testo_atteso_non_consegnato;correlare_regola_e_corpo&#10;C02;https://azienda.example/it/guida;anonimo;GET;200;F-DEMO-v2;TESTO-DEMO-v2;NO;https://azienda.example/guida;404;NON-VERIFICATO;DEMO/E02;destinazione_canonica_inesistente;verificare_canonico_previsto&#10;C03;https://azienda.example/documento;anonimo;GET;200;F-DEMO-v2;TESTO-DEMO-v2;SI;https://azienda.example/documento;200;NON-VERIFICATO;DEMO/E03;direttiva_da_confermare;confermare_intenzione_editoriale&#10;C04;https://azienda.example/scheda;anonimo;GET;200;F-DEMO-v2;TESTO-DEMO-v2;NO;https://azienda.example/scheda;200;NON-VERIFICATO;DEMO/E04;accesso_crawler_non_dimostrato;ottenere_prova_identificata</code></pre>
:::

Il CSV è una sintesi: collega ogni riga alla scheda completa della richiesta e ai documenti autorizzati. Non include deliberatamente credenziali, cookie, dati di visitatori o contenuti riservati. La conclusione di C01 riguarda il corpo ricevuto in quella prova; non prova da sola che ogni crawler abbia incontrato la stessa verifica.

Stabilisci anche quale evidenza chiude ciascun caso. Questi criteri appartengono all'esempio, non a una certificazione del motore.

| Caso | Criterio proposto per la chiusura |
| --- | --- |
| C01 | La stessa prova riceve il fatto atteso nella versione corretta; eventuale consegna al crawler viene verificata a parte |
| C02 | Il canonical previsto viene confermato e la sua destinazione pubblica è accessibile e coerente; la scelta del motore rimane un'altra osservazione |
| C03 | Il responsabile conferma se l'esclusione sia voluta; la direttiva pubblica corrisponde alla decisione, anche se viene mantenuta |
| C04 | Una richiesta identificata viene collegata a URL, risposta e contenuto, oppure la lacuna resta esplicitamente aperta |

## Verifica l'identità del crawler prima di attribuirgli una visita

Cambiare lo user-agent dichiarato può aiutare a riprodurre una differenza, ma la richiesta resta una simulazione. Nei log cerca richieste pertinenti e verificane la provenienza con il metodo ufficiale applicabile. [Google](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests) distingue categorie di crawler e fetcher; [Bing](https://www.bing.com/webmasters/help/how-to-verify-bingbot-3905dc26) documenta verifica DNS inversa e diretta e riferimenti IP aggiornati. OpenAI e Perplexity pubblicano riferimenti di rete per i propri agenti.

Conserva metodo di verifica, data, URL e riferimento all'evento. Collega il risultato alla risposta effettiva, quando la telemetria lo consente. Un evento di accesso senza corpo dimostra meno di una richiesta identificata con evidenza del contenuto; una visita non presente nel periodo controllato non dimostra un blocco permanente.

Se la prova indica un'interferenza, fai identificare regola e perimetro al responsabile dell'infrastruttura. Evita eccezioni generali fondate soltanto sul nome del bot. La chiusura deve dimostrare che l'intervento autorizzato risolve il caso riprodotto e conserva i controlli intenzionali. Senza log o strumenti del provider, mantieni «consegna al crawler non verificata».

## Chiudi il difetto tecnico e registra separatamente gli esiti del motore

Una segnalazione utile contiene URL, atteso, osservato, evidenza datata, causa confermata o ancora ipotetica, responsabile e prova di accettazione. Dai precedenza all'impedimento riproducibile sul contenuto pubblico previsto. Una difformità intenzionale richiede una decisione editoriale; un controllo mancante richiede raccolta di prove. Non assegnare a entrambi la stessa etichetta «errore SEO».

Dopo la correzione ripeti le condizioni rilevanti e verifica la pagina pubblica. Il [workflow di pubblicazione](articolo-workflow-contenuti-ai-pubblicazione.html) aiuta a legare il rilascio alla revisione attesa. Conserva poi gli esiti esterni con il loro tipo e data: la [URL Inspection di Google](https://support.google.com/webmasters/answer/9012289) separa dati indicizzati e test live; [IndexNow](https://www.indexnow.org/documentation) specifica che HTTP 200 conferma la ricezione degli URL.

L'audit tecnico si chiude quando il difetto nel suo perimetro è corretto e verificato, anche se un motore non ha ancora aggiornato il proprio stato. Per osservare menzioni e citazioni usa invece un [benchmark con risposte conservate](articolo-benchmark-visibilita-ai-template.html). Accesso, indicizzazione, scelta del canonical e citazione hanno prove proprie: mantenerle collegate, senza confonderle, rende il prossimo intervento concreto.
