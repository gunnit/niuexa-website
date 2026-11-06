slug: ordini-email-pdf-erp
lang: it
type: Article
speakable: false
title: Ordini da email e PDF al gestionale
meta_title: "Ordini da email e PDF a ERP: runbook AI | Niuexa"
h1: "Ordini da email e PDF al gestionale: validare i dati prima di scrivere"
description: "Come portare ordini da email e PDF al gestionale: campi, righe, controlli, approvazioni, duplicati e ricevute incerte. Esempio e test di collaudo."
standfirst: Estrarre una quantità da un PDF e creare un ordine nel gestionale sono due risultati diversi. Questo runbook separa lettura, validazione, approvazione e conferma, con un ordine di esempio e prove sugli errori che una demo riuscita non mostra.
section: AI Engineering e Processi
badge: Automazione documentale
published: 2026-11-06
modified: 2026-11-06
author: redazione-niuexa
reading_time: 12 minuti di lettura
audience: Per responsabili operations, amministrazione e IT
format: Runbook con esempio e prove di accettazione
visuals: false
breadcrumb: [Home, Ricerca]
breadcrumb_label: Ordini da email e PDF a ERP
og_title: "Dall'email all'ordine ERP: controlli, approvazioni ed esiti"
og_description: "Un runbook per validare righe d'ordine, evitare duplicati e verificare le scritture nel gestionale. Esempio sintetico e scheda di collaudo."
twitter_description: "Email e PDF non sono ancora ordini ERP: un metodo per verificare dati, approvazioni, duplicati e ricevute incerte."
og_image:
  src: img/articles/ordini-email-pdf-erp/ordini-email-pdf-erp-og.png
  alt: Ordini da email e PDF al gestionale: validare i dati prima di scrivere
  w: 1200
  h: 630
quick_answer_heading: "Come automatizzare gli ordini da email e PDF senza perdere il controllo?"
quick_answer: >
  Trasforma email e PDF in una **proposta d'ordine**, conserva i riferimenti
  alle fonti e verifica campi, righe e condizioni contro anagrafiche e regole
  autorizzate. Prima della scrittura, applica l'approvazione prevista dal processo.
  Identifica duplicati e tentativi con chiavi distinte; se manca la conferma del
  gestionale, verifica lo stato esterno prima di ripetere. Una bozza corretta non
  prova che l'ordine sia stato registrato.
keywords:
  - ordini email PDF gestionale
  - estrazione dati ordini AI
  - integrazione ERP AI
  - validazione righe ordine
  - duplicati ordini API
  - riconciliazione workflow AI
faq_heading: Domande frequenti sugli ordini da email e PDF
faq:
  - q: Un valore di confidence alto basta per creare l'ordine?
    a: "No. È un segnale stimato del sistema di estrazione. Correttezza dei campi, coerenza commerciale, permessi e condizioni di approvazione richiedono controlli distinti. Le soglie vanno valutate sui documenti del processo."
  - q: Il controllo dell'hash del PDF elimina tutti i duplicati?
    a: "No. L'hash aiuta a riconoscere lo stesso file; due file diversi possono rappresentare lo stesso ordine. Serve anche un'identità commerciale concordata e una gestione delle revisioni."
  - q: Un timeout significa che l'ERP non ha creato l'ordine?
    a: "No. L'ERP può aver eseguito la scrittura prima che la risposta vada persa. Mantieni l'esito incerto e verifica lo stato esterno; non ripetere alla cieca una creazione."
  - q: MCP impedisce le scritture duplicate?
    a: "No. Il protocollo di collegamento non sostituisce identità dell'operazione, autorizzazioni, controlli di concorrenza e semantica dell'API del gestionale."
  - q: Quanti documenti servono per un pilot?
    a: "Non esiste un numero universale. Il campione deve coprire formati, clienti, righe, eccezioni e casi di errore rilevanti; criteri e soglie si concordano prima delle prove."
sources_heading: Fonti e perimetro del runbook
sources_intro: "Fonti ufficiali controllate il 6 novembre 2026. Il flusso, l'ordine dimostrativo e la scheda di collaudo sono una proposta editoriale Niuexa: non descrivono un cliente né una configurazione già verificata sul tuo gestionale."
sources:
  - title: Microsoft Document Intelligence — Accuracy e confidence
    url: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept/accuracy-confidence?view=doc-intel-4.0.0
    publisher: Microsoft
    note: distingue stime di estrazione e accuratezza; segnala che non tutti i campi hanno un valore di confidence.
  - title: LangGraph — Fault tolerance, retry e idempotenza
    url: https://docs.langchain.com/oss/python/langgraph/fault-tolerance
    publisher: LangChain
    note: chiarisce gli effetti dei tentativi ripetuti e la verifica di esiti senza conferma.
  - title: Microsoft Dataverse — Upsert e chiavi alternative
    url: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-upsert-insert-update-record
    publisher: Microsoft
    note: esempio concreto di API che distingue creazione e aggiornamento tramite identità del record; non è una funzione universale degli ERP.
  - title: OWASP — LLM Prompt Injection Prevention
    url: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
    publisher: OWASP
    note: tratta contenuti esterni non fidati, controlli sugli output e privilegi minimi.
sources_disclaimer: "Campi obbligatori, tolleranze, approvazioni, accessi e tempi di conservazione vanno definiti sul processo reale prima dell'uso operativo."
related:
  - href: articolo-mcp-api-webhook-integrazione-aziendale.html
    category: Integrazioni
    title: MCP, API o webhook per collegare i sistemi aziendali
  - href: articolo-costi-automazione-guida.html
    category: Costi
    title: Stimare il costo completo di un pilot di automazione
  - href: articolo-coda-lavoro-ai-agent.html
    category: Operations
    title: Organizzare il lavoro dell'agente con il framework 4C
  - href: articolo-human-in-the-loop-ai-pmi.html
    category: Controllo umano
    title: Definire approvazioni ed escalation proporzionate
cta:
  heading: Quale passaggio degli ordini vuoi verificare per primo?
  body: "Raccontaci come arrivano gli ordini e dove vengono registrati. Nella prima chiamata gratuita di 30 minuti definiamo il processo da approfondire e le evidenze necessarie per valutarlo."
  primary_label: Raccontaci il processo
  primary_href: /#contact
  secondary_label: Come lavoriamo
  secondary_href: consulting.html
---

## Il perimetro: dall'allegato a una proposta verificabile

**Nota editoriale:** contenuto preparato con assistenza AI; fonti ufficiali verificate il 6 novembre 2026. Esempi e prove sono costruiti per spiegare il metodo, senza attribuire una revisione personale o risultati a clienti.

Il primo pilot dovrebbe avere un confine riconoscibile: una casella autorizzata, alcuni tipi di ordine, un insieme di clienti e una destinazione ERP. Definisci chi decide quando email e allegato si contraddicono, quali eccezioni passano a una persona e che cosa significa «ordine registrato» nel sistema di destinazione.

Questo runbook riguarda l'inserimento degli ordini, non l'accettazione automatica di qualsiasi condizione proposta dal cliente. Disponibilità, prezzi, sconti, indirizzi e date richieste non diventano autorizzati solo perché compaiono nel PDF. Il responsabile commerciale stabilisce quali fonti prevalgono; l'IT verifica che le API consentano le operazioni previste.

Prima di automatizzare tutta la pratica, puoi fermarti alla bozza. Misura separatamente tempo di estrazione, revisione e registrazione. Il valore del pilot emerge dagli ordini corretti e conclusi, non dal numero di PDF letti.

## Un contratto dei dati per testata e righe

Per ciascun campo servono valore originale, eventuale valore normalizzato, riferimento alla fonte e risultato dei controlli. Conserva i documenti in un archivio autorizzato: il registro operativo può contenere riferimenti e identificativi, senza duplicare inutilmente email e allegati.

| Dato | Controllo prima della bozza | Se il controllo non passa |
| --- | --- | --- |
| Cliente e società destinataria | Corrispondenza con l'anagrafica e con il perimetro autorizzato | Richiedere identificazione; non scegliere il cliente «più simile» |
| Numero ordine e revisione | Presenza, formato e identità commerciale concordata | Sospendere o assegnare una pratica provvisoria da risolvere |
| Codice articolo | Esistenza e corrispondenza nel catalogo valido | Chiarimento sulla riga; nessuna sostituzione inventata |
| Quantità e unità | Segno, separatori, unità e conversioni approvate | Evidenziare l'ambiguità senza correggerla silenziosamente |
| Prezzo e valuta | Confronto con listino o accordo autorizzato | Revisione commerciale della differenza |
| Importi di riga e totale | Ricalcolo con regole documentate di arrotondamento | Segnalare scostamento e regola applicata |
| Consegna e condizioni | Campi richiesti e compatibilità con il processo | Registrare la richiesta del cliente come tale, senza promettere l'esito |

Le righe sono importanti quanto la testata: estrarre correttamente il cliente non compensa una quantità moltiplicata per dieci. Evita medie che nascondano errori nei campi critici. Verifica anche righe spezzate su più pagine, note che valgono solo per un articolo e totali che includono voci estranee al perimetro scelto.

### Confidence e correttezza sono misure diverse

La [documentazione Microsoft Document Intelligence](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept/accuracy-confidence?view=doc-intel-4.0.0) descrive la confidence come stima dell'estrazione e avverte che non tutti i campi la restituiscono. Non trasformare una confidence di 0,99 nell'affermazione «il nostro processo è corretto al 99%»: la seconda richiede una misura sui casi con esito noto.

Una quantità può essere letta con sicurezza ma non essere ammessa dal contratto commerciale. Usa la confidence per indirizzare la revisione insieme a completezza, regole e criticità del campo. La soglia scelta per una descrizione non deve essere automaticamente quella di quantità, prezzo o codice cliente.

## Un ordine sintetico, dal documento alla bozza

**Esempio inventato:** il PDF `DOC-DEMO-104` riporta l'ordine `ORD-DEMO-104` del cliente `CLIENTE-DEMO-01`, in euro. Il catalogo e il listino dimostrativi confermano due righe:

| Articolo dimostrativo | Quantità | Unità | Prezzo netto unitario | Netto di riga |
| --- | --- | --- | --- | --- |
| DEMO-A | 12 | pezzi | 8,50 euro | 102,00 euro |
| DEMO-B | 3 | pezzi | 24,00 euro | 72,00 euro |

Il netto delle due righe è 174,00 euro. Imposte, trasporto e altre condizioni sono fuori da questo esempio e vanno gestiti separatamente nel processo reale. Questi importi non sono un listino di Niuexa o di un fornitore.

Una proposta schematica può conservare:

:::html
<pre><code class="language-json">{&#10;  &quot;request_id&quot;: &quot;PRATICA-DEMO-104&quot;,&#10;  &quot;customer_id&quot;: &quot;CLIENTE-DEMO-01&quot;,&#10;  &quot;customer_order_ref&quot;: &quot;ORD-DEMO-104&quot;,&#10;  &quot;source_ref&quot;: &quot;DOC-DEMO-104:pagina-1&quot;,&#10;  &quot;price_record_version&quot;: &quot;LISTINO-DEMO-v3&quot;,&#10;  &quot;currency&quot;: &quot;EUR&quot;,&#10;  &quot;net_total_minor_units&quot;: 17400,&#10;  &quot;validation_status&quot;: &quot;passed&quot;,&#10;  &quot;approval_status&quot;: &quot;awaiting_review&quot;,&#10;  &quot;erp_record_id&quot;: null&#10;}</code></pre>
:::

È un esempio di dati, non il formato di una specifica API. Il totale è espresso in centesimi per rendere esplicita l'unità. La bozza deve mantenere anche righe e provenienza dei singoli campi; qui il record è abbreviato per evidenziare gli stati.

Se il PDF indica 8,50 ma il listino valido indica 9,00, l'agente segnala il conflitto. Non modifica il prezzo per far tornare il totale. Una persona autorizzata risolve la differenza e approva una versione precisa della bozza; una successiva correzione della quantità richiede di riesaminare quell'approvazione.

## Stati che impediscono di confondere avanzamento e successo

Il processo deve poter ripartire senza perdere la distinzione fra dati elaborati e azioni esterne. Una possibile macchina a stati è questa:

| Stato | Evidenza conservata | Condizione per avanzare |
| --- | --- | --- |
| Ricevuto | Pratica, documento e data di acquisizione | Input previsto e accesso consentito |
| Estratto | Valori, riferimenti alle fonti e versione dell'estrattore | Contratto dei dati verificato |
| Sospeso | Errori o ambiguità per campo e riga | Correzione o decisione tracciata |
| Da approvare | Versione completa della proposta | Decisione del ruolo previsto |
| Approvato | Identità della decisione e versione approvata | Permesso di scrittura e contenuto ancora coerenti |
| Scrittura in corso | Identità dell'operazione e tentativo | Conferma secondo le regole dell'API |
| Esito incerto | Chiamata tentata senza conferma conclusiva | Verifica dello stato nel gestionale |
| Registrato | Identificativo ERP e controllo del risultato | Chiusura della pratica |

Un rifiuto o un annullamento devono avere una propria chiusura motivata. Non trasformare automaticamente uno stato sospeso in approvato dopo un'attesa. Chi approva deve vedere fonte, differenze, controlli falliti ed effetto previsto della scrittura, non soltanto un pulsante verde.

## Duplicati e tentativi: tre identità da separare

**Documento:** un identificativo e un'impronta del file aiutano a riconoscere un allegato identico. Non bastano se il cliente genera due PDF diversi per lo stesso ordine.

**Ordine commerciale:** una chiave concordata può comprendere società, cliente e riferimento ordine. La revisione va gestita esplicitamente: un ordine corretto non deve diventare un secondo ordine, né sovrascrivere automaticamente quello già approvato. La chiave deve rispettare le convenzioni reali, senza presumere che il numero sia unico fra tutti i clienti.

**Operazione di scrittura:** un'identità stabile collega richiesta, contenuto approvato e tentativi verso l'ERP. Due lavoratori concorrenti non devono limitarsi a controllare «non esiste» e poi creare entrambi: servono un coordinamento persistente e i vincoli supportati dalla destinazione.

Microsoft documenta, per [Dataverse, l'uso di Upsert e chiavi alternative](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-upsert-insert-update-record). È un esempio di capacità da verificare, non una funzione garantita da ogni ERP: aggiornare un record esistente può avere effetti commerciali propri. La scelta fra creazione, aggiornamento e revisione resta una regola del processo.

### Che cosa fare quando manca la ricevuta

La [guida LangGraph su retry e idempotenza](https://docs.langchain.com/oss/python/langgraph/fault-tolerance) distingue la ripetizione del lavoro dall'esecuzione una sola volta di un effetto esterno. Nel tuo connettore verifica se la destinazione accetta una chiave stabile, per quanto la conserva e che cosa restituisce quando cambia il contenuto della richiesta.

Se la risposta manca dopo l'invio, mantieni «esito incerto». Cerca l'operazione o l'ordine nella destinazione e confronta identificativo, versione e campi approvati. Se trovi la registrazione prevista, collega la conferma alla pratica; se non puoi stabilire l'esito, passa alla riconciliazione operativa. Un messaggio locale di errore non autorizza da solo una nuova creazione o un annullamento.

## Input non fidati, permessi e controllo proporzionato

L'allegato è una fonte di dati, non una policy aziendale. Un'istruzione nel PDF che chieda di cambiare destinatario, saltare l'approvazione o inviare credenziali non può ampliare i permessi. Le [indicazioni OWASP sul prompt injection](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) descrivono anche il rischio dei contenuti esterni e raccomandano controlli oltre il solo filtraggio.

Separa lettura dei documenti, consultazione di cataloghi e scrittura degli ordini. Limita l'accesso a società e clienti autorizzati; conserva nei log solo ciò che serve a ricostruire l'operazione, con accessi e durata definiti. Documenti e dati personali non devono diventare automaticamente copie integrali in ogni sistema di monitoraggio.

Nel pilot puoi richiedere approvazione prima di ogni scrittura. Un eventuale automatismo successivo richiede casi a basso impatto, criteri verificati e possibilità di fermarsi. Definisci responsabilità e soglie con il [metodo human-in-the-loop](articolo-human-in-the-loop-ai-pmi.html). Che il collegamento usi [API, webhook o MCP](articolo-mcp-api-webhook-integrazione-aziendale.html) non cambia il requisito di autorizzare l'azione concreta.

## Prove rappresentative prima del rilascio

Questi casi sono un punto di partenza, non una certificazione. Prepara input e risultati attesi prima del test; amplia il campione quando emergono nuovi formati o errori.

| Caso | Comportamento atteso | Evidenza da controllare |
| --- | --- | --- |
| Ordine completo come nell'esempio | Bozza corretta, poi scrittura solo dopo approvazione | Righe, totale, decisione e ID ERP |
| Cliente mancante o ambiguo | Sospensione senza scelta inventata | Campo irrisolto e richiesta di chiarimento |
| Codice articolo sconosciuto | Blocco della riga | Nessun prodotto sostitutivo selezionato |
| Quantità con separatore ambiguo | Revisione prima del calcolo | Valore originale e decisione sulla normalizzazione |
| Prezzo diverso dalla fonte valida | Eccezione commerciale | Differenza e riferimento al listino |
| Totale incoerente o riga su due pagine | Ricalcolo e verifica della completezza | Regola applicata e righe recuperate |
| Stesso allegato ricevuto due volte | Collegamento alla pratica esistente | Identità del documento e assenza di doppia creazione |
| PDF diverso per lo stesso ordine | Controllo dell'identità commerciale | Decisione fra duplicato e revisione |
| Bozza modificata dopo l'approvazione | Nuova verifica, senza riuso della vecchia decisione | Versioni e approvazione coerenti |
| ERP registra ma la risposta va persa | Esito incerto, poi verifica esterna | Un solo ordine e collegamento alla conferma |
| Due lavoratori sulla stessa pratica | Concorrenza gestita senza doppia creazione | Operazione assegnata e un solo ordine esterno |
| Permesso di scrittura negato | Operazione bloccata senza cambiare identità | Errore registrato e nessuna scrittura |
| Allegato con istruzioni estranee | Nessuna estensione delle azioni consentite | Permessi invariati e contenuto segnalato |

## La scheda di accettazione da copiare

Completa una scheda per il pilot e una riga per ogni prova. Soglie e criteri vanno concordati prima, non scelti dopo per rendere positivo il risultato.

:::html
<pre><code class="language-text">Processo e responsabile:&#10;Casella, tipi di documento, clienti e società inclusi:&#10;Operazioni escluse:&#10;Campi e righe critici, fonte autorevole per ciascuno:&#10;Formati ed eccezioni coperti dal campione:&#10;Versioni di estrattore, regole e connettore:&#10;Condizioni di approvazione e ruolo autorizzato:&#10;Identità documento / ordine / operazione:&#10;Metodo per verificare una ricevuta incerta:&#10;Soglie concordate: errori critici, esiti corretti, tempo di revisione:&#10;&#10;Per ogni prova:&#10;ID caso | input/versione | risultato atteso | risultato osservato&#10;controlli | decisione | operazione tentata | conferma ERP&#10;differenza | responsabile della correzione | esito della riprova</code></pre>
:::

Misura campi corretti su campi verificati, ordini conclusi correttamente su ordini valutati e tempo umano residuo. Riporta a parte errori critici, duplicati ed esiti incerti; non nasconderli nella media. Per stimare i costi usa gli [esiti validi del processo](articolo-costi-automazione-guida.html), mantenendo separati consumo tecnico e lavoro concluso.

La [coda di lavoro 4C](articolo-coda-lavoro-ai-agent.html) aiuta a organizzare incarichi e responsabilità. Questo runbook aggiunge il contratto specifico dell'ordine: quali dati possono avanzare, quale versione è approvata e quale prova chiude davvero la scrittura nel gestionale.
