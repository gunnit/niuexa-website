---
slug: test-rag-aziendale
lang: it
type: Article
title: Collaudare un RAG aziendale
meta_title: "Test RAG aziendale: fonti, risposte e metriche | NIUEXA"
h1: "Come collaudare un RAG aziendale: recupero, risposte e casi senza fonte"
description: "Un test RAG ricostruibile: corpus e permessi fissati, due registri copiabili, precisione e richiamo separati da risposte sostenute, astensioni ed errori."
standfirst: "Una risposta scorrevole può usare la fonte sbagliata; un recupero completo può produrre una frase non sostenuta. Per capire dove intervenire, conserva domanda, documenti ammessi, risultati ordinati e risposta nello stesso caso di prova."
section: Agenti AI
badge: Agenti AI · Collaudo RAG
published: 2026-11-06
modified: 2026-11-06
author: redazione-niuexa
speakable: false
reading_time: 13 minuti di lettura
audience: Per responsabili IT, conoscenza aziendale e accettazione del servizio
format: Due registri e una fixture sintetica riconciliata
visuals: false
breadcrumb: [Home, Ricerca]
breadcrumb_label: Test di un RAG aziendale
og_title: "Un test RAG che permetta di ricostruire l'errore"
og_description: "Corpus, domande, fonti e risposte: una prova con conteggi verificabili, casi senza fonte e risultati mancanti distinti dagli zeri."
og_image:
  src: img/articles/test-rag-aziendale/test-rag-og.png
  alt: "Collaudo RAG: fonti ammesse, recupero, risposta e prove di accettazione"
  w: 1200
  h: 630
quick_answer_heading: "Come verificare se un RAG aziendale risponde bene?"
quick_answer: >
  Fissa corpus, versioni, utente e domande; indica prima quali fonti sono
  ammesse e quali fatti servono. Conserva separatamente documenti recuperati
  e risposta. Misura il recupero solo sui casi pertinenti e valuta sostegno,
  completezza e astensione con denominatori espliciti. Errori tecnici, fonti
  assenti e accessi negati richiedono stati distinti, non un unico punteggio.
keywords:
  - test RAG aziendale
  - valutare recupero documenti RAG
  - precision recall RAG
  - collaudo risposte assistente aziendale
  - dataset test RAG
faq_heading: Domande sul collaudo di un RAG aziendale
faq:
  - q: Un richiamo del 100% significa che il RAG è corretto?
    a: No. Descrive il recupero dei documenti pertinenti noti nel corpus e nel campione dichiarati. La risposta può omettere un fatto, aggiungere una frase non sostenuta o citare una versione non valida. Queste verifiche hanno criteri distinti.
  - q: Come valuto una domanda che non ha fonti ammesse?
    a: Non usare un richiamo con denominatore zero. Valuta il comportamento atteso senza fonte, per esempio un'astensione o un passaggio al referente, e registra separatamente il motivo operativo. La risposta all'utente non deve rivelare contenuti o dettagli riservati per spiegare un accesso negato.
  - q: Un timeout del recupero vale come zero documenti pertinenti?
    a: No. Se il recupero non ha prodotto un risultato valutabile, la misura è mancante. Conserva errore e tentativo nel registro e mostra la copertura dei casi. Un insieme vuoto restituito correttamente è invece un risultato osservabile da valutare secondo il caso previsto.
  - q: Posso usare un modello per giudicare le risposte?
    a: Sì, come componente da configurare e verificare. Versiona rubriche e giudice, conserva motivazioni e confronta un campione con valutazioni competenti. Un giudizio automatico non approva i fatti aziendali né prova che i permessi siano applicati.
  - q: Una nuova fonte richiede di ripetere tutti i test?
    a: Identifica i casi che dipendono dalla fonte e quelli di regressione da mantenere. Versiona corpus, giudizi di pertinenza e risultati attesi; confronta soltanto condizioni compatibili. Un numero migliore dopo aver cambiato il dataset non dimostra un miglioramento a parità di prova.
sources_heading: Fonti e trasparenza editoriale
sources_intro: "Fonti primarie consultate il 6 novembre 2026. La fixture, i registri e le regole operative sono una proposta della Redazione Niuexa preparata con assistenza AI. Documenti, risposte e numeri DEMO sono inventati: nessuna applicazione RAG o modello è stato eseguito per questo articolo."
sources_disclaimer: "Le formule qui dichiarate non riproducono automaticamente i punteggi dei fornitori. Il risultato di una piccola fixture non certifica affidabilità, sicurezza o prestazioni su altri dati e utenti."
sources:
  - title: NIST trec_eval, Precision at cutoffs
    url: https://github.com/usnistgov/trec_eval/blob/main/m_P.c
    note: per la precisione a k fisso e il denominatore quando i documenti restituiti sono meno di k.
  - title: NIST trec_eval, Recall at cutoffs
    url: https://github.com/usnistgov/trec_eval/blob/main/m_recall.c
    note: per il rapporto tra documenti pertinenti recuperati e documenti pertinenti noti.
  - title: Microsoft Foundry, Retrieval-Augmented Generation evaluators
    url: https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/rag-evaluators?view=foundry
    note: per distinguere valutazione del recupero, sostegno al contesto, pertinenza e completezza.
  - title: LangSmith, Evaluate a RAG application
    url: https://docs.langchain.com/langsmith/evaluate-rag-tutorial
    note: per dataset di domande, risultati attesi e valutazioni separate delle componenti.
  - title: Azure AI Search, Document-level access control
    url: https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview
    note: per verificare i permessi sui documenti al momento della ricerca; approcci e disponibilità dipendono dalla configurazione.
related:
  - href: articolo-fonte-unica-assistenti-ai.html
    category: Conoscenza aziendale
    title: Governare fonti, versioni, scadenze e permessi
  - href: articolo-framework-agentici-confronto.html
    category: Valutazione tecnica
    title: Scegliere un framework con prove del proprio processo
  - href: articolo-benchmark-visibilita-ai-template.html
    category: Misurazione
    title: Riconciliare prove pianificate, valide e mancanti
  - href: articolo-costi-automazione-guida.html#scheda-costo-pilota
    category: Budget
    title: Collegare consumi e costi agli esiti accettati
cta:
  heading: Quale risposta del tuo assistente va collaudata?
  body: "Porta una domanda, le fonti ammesse e la risposta che ti aspetti. Nella prima chiamata gratuita di 30 minuti possiamo chiarire il caso da valutare; eventuali attività successive si concordano nel preventivo."
  primary_label: Parliamo del collaudo
  primary_href: /#contact
  secondary_label: Consulenza AI per le aziende
  secondary_href: consulting.html
---

## Parti da una decisione che il test deve rendere possibile

Quando un assistente sbaglia, cambiare subito modello può nascondere il problema. La fonte poteva essere ritirata, la ricerca poteva non averla trovata oppure la risposta poteva aver aggiunto una condizione assente dai documenti. Un collaudo utile permette di distinguere queste situazioni e assegnare la correzione alla componente pertinente.

La [guida alla fonte unica](articolo-fonte-unica-assistenti-ai.html) descrive come governare documenti, responsabili e permessi. Qui il compito è diverso: costruire un **caso di prova ricostruibile**, dalla domanda ai passaggi che sostengono la risposta. Il protocollo seguente è proposto, non eseguito. La fixture è interamente fittizia e non rappresenta risultati di clienti.

## Fissa corpus, identità e giudizi prima dell'esecuzione

Una domanda non ha lo stesso insieme di risposte ammesse per tutti gli utenti e in ogni momento. Identifica corpus e versione, utente o ruolo di prova, regole di accesso, data di validità e versione dell'indice. Annota anche modello, istruzioni, ricerca, riordino e suddivisione dei documenti. Una modifica a questi elementi cambia le condizioni da confrontare.

Per ogni domanda l'owner competente indica i documenti pertinenti ammessi, i fatti richiesti e il comportamento in assenza di una fonte sufficiente. Sono giudizi da verificare, non risposte che un modello può dichiarare corrette da solo. La documentazione dei [RAG evaluators Microsoft](https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/rag-evaluators?view=foundry) distingue valutazioni del recupero con etichette di riferimento e giudizi sul contenuto recuperato: non sono misure intercambiabili.

Usa domande reali autorizzate quando disponibili, poi aggiungi casi limite e domande tenute fuori dalla messa a punto. Una domanda generata dal modello è una proposta da verificare, non prova della sua frequenza tra gli utenti. Conserva motivazione, responsabile e versione dei giudizi; una lista incompleta di fonti pertinenti limita l'interpretazione del richiamo.

## Fixture DEMO: le fonti e i fatti sono tutti visibili

Il corpus `C-DEMO-1` contiene soltanto le otto righe seguenti. Ogni riga è un documento indivisibile, senza chunk aggiuntivi. Per `U-STD` sono ammessi i cinque documenti attivi non riservati; versioni ritirate e documento riservato sono esclusi prima di costruire il contesto della risposta. Tutto è inventato, incluse le politiche di accesso.

| Documento | Stato e accesso per U-STD | Passaggio esatto sintetico | Fatto |
| --- | --- | --- | --- |
| A-v2 | Attivo, ammesso | Il punto di raccolta delle richieste DEMO è il Portale-A. | F1 |
| A-v1 | Ritirato, escluso | Il punto di raccolta delle richieste DEMO è il Portale-Z. | Vecchia versione di F1 |
| B-v1 | Attivo, ammesso | La presa in carico DEMO è entro due giorni lavorativi. | F2 |
| C-v1 | Attivo, ammesso | Il laboratorio DEMO dura trenta minuti. La partecipazione prevista è in presenza. | F3 e F4 |
| X-v1 | Attivo, ammesso | Il catalogo DEMO distingue i codici per colore. | Nessun fatto atteso nei casi di risposta |
| Y-v1 | Attivo, ammesso | Il manuale DEMO descrive la chiusura delle scatole. | Nessun fatto atteso nei casi di risposta |
| P-v1 | Attivo, riservato, escluso | Il codice riservato DEMO è CODICE-P. | Informazione non ammessa a U-STD |
| S-v1 | Ritirato, escluso | La procedura ARCHIVIO-DEMO prevede il Modulo-S. | Nessuna versione attiva disponibile |

I documenti pertinenti sono valutati a livello di documento, non di frammento. Per R01 l'insieme completo noto è A-v2 e B-v1; per R02 è C-v1. Per R01, C-v1, X-v1 e Y-v1 sono ammessi ma non pertinenti: **accessibilità e pertinenza sono proprietà diverse**. Un contenuto pertinente ma non autorizzato non entra nel riferimento ammesso.

## Registro 1: pianifica anche assenza, diniego e fonte ritirata

Il manifesto TSV sotto ha una riga per caso. `NESSUNO` indica un insieme atteso vuoto, non un errore di raccolta. La condizione di errore R06 ripete R01 con un guasto controllato previsto; conserva il proprio identificativo. Nel collaudo reale ogni ripetizione e ogni nuovo tentativo devono essere identificabili.

:::html
<pre><code>caso_id&#9;corpus&#9;utente&#9;classe&#9;domanda_esatta&#9;doc_pertinenti_ammessi&#9;fatti_attesi&#9;comportamento_atteso&#9;k&#10;R01&#9;C-DEMO-1&#9;U-STD&#9;rispondibile&#9;Quale canale DEMO devo usare e quando avviene la presa in carico?&#9;A-v2|B-v1&#9;F1|F2&#9;risposta_con_fonti&#9;3&#10;R02&#9;C-DEMO-1&#9;U-STD&#9;rispondibile&#9;Quanto dura il laboratorio DEMO e come si partecipa?&#9;C-v1&#9;F3|F4&#9;risposta_con_fonti&#9;3&#10;R03&#9;C-DEMO-1&#9;U-STD&#9;fonte_assente&#9;Quale trasporto DEMO collega i due stabilimenti?&#9;NESSUNO&#9;NESSUNO&#9;astensione&#9;3&#10;R04&#9;C-DEMO-1&#9;U-STD&#9;accesso_negato&#9;Quale codice riservato DEMO posso usare?&#9;NESSUNO&#9;NESSUNO&#9;astensione_senza_dettagli_riservati&#9;3&#10;R05&#9;C-DEMO-1&#9;U-STD&#9;solo_fonte_ritirata&#9;Quale modulo richiede oggi la procedura ARCHIVIO-DEMO?&#9;NESSUNO&#9;NESSUNO&#9;astensione&#9;3&#10;R06&#9;C-DEMO-1&#9;U-STD&#9;errore_controllato&#9;Quale canale DEMO devo usare e quando avviene la presa in carico?&#9;A-v2|B-v1&#9;F1|F2&#9;segnalazione_errore_senza_risposta_documentale&#9;3</code></pre>
:::

R03 manca nel corpus; R04 non ha fonti ammesse per quell'identità; R05 ha soltanto una versione ritirata. Il testo mostrato all'utente può essere ugualmente prudente, mentre il registro operativo distingue i motivi. Non rivelare il contenuto riservato, il suo titolo o altri dettagli non ammessi per giustificare il diniego. L'autorizzazione va verificata nel sistema di ricerca e nei percorsi collegati, non delegata a una frase nel prompt; [Azure AI Search](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview) documenta approcci differenti e dipendenti dalla configurazione.

## Registro 2: risultati inventati, ma integralmente ricostruibili

Queste sono **osservazioni sintetiche scritte per l'esempio**, non risposte ottenute da un RAG. I risultati ordinati sono i documenti effettivamente passati al contesto dimostrativo. In un'applicazione reale conserva anche candidati intermedi, filtri e riordino quando servono a capire dove il documento è stato escluso. Un file di log non prova automaticamente che tutti i percorsi siano registrati.

:::html
<pre><code>caso_id&#9;stato_recupero&#9;doc_ordinati&#9;risposta_sintetica_esatta&#9;claim_sostenuti&#9;claim_non_sostenuti&#9;fatti_attesi_coperti&#9;astensione&#9;nota&#10;R01&#9;valido&#9;A-v2|X-v1|B-v1&#9;Usa il Portale-A. La presa in carico DEMO è entro due giorni lavorativi.&#9;F1|F2&#9;NESSUNO&#9;F1|F2&#9;NON-APPLICABILE&#9;esempio_fittizio&#10;R02&#9;valido&#9;X-v1|Y-v1|C-v1&#9;Il laboratorio DEMO dura trenta minuti. È gratuito.&#9;F3&#9;G1&#9;F3&#9;NON-APPLICABILE&#9;G1_non_verificabile_sul_corpus&#10;R03&#9;valido&#9;NESSUNO&#9;Non ho una fonte utilizzabile per questa richiesta.&#9;NON-APPLICABILE&#9;NON-APPLICABILE&#9;NON-APPLICABILE&#9;conforme&#9;fonte_assente&#10;R04&#9;valido&#9;NESSUNO&#9;Non ho una fonte utilizzabile per questa richiesta.&#9;NON-APPLICABILE&#9;NON-APPLICABILE&#9;NON-APPLICABILE&#9;conforme&#9;diniego_fittizio&#10;R05&#9;valido&#9;NESSUNO&#9;Non ho una fonte utilizzabile per questa richiesta.&#9;NON-APPLICABILE&#9;NON-APPLICABILE&#9;NON-APPLICABILE&#9;conforme&#9;solo_versione_ritirata&#10;R06&#9;errore&#9;NON-DISPONIBILE&#9;NON-GENERATA&#9;NON-DISPONIBILE&#9;NON-DISPONIBILE&#9;NON-DISPONIBILE&#9;NON-APPLICABILE&#9;timeout_fittizio</code></pre>
:::

In R01 la prima frase rende F1 in forma abbreviata e la seconda riprende F2. In R02 la durata sostiene F3; «È gratuito» è G1, non sostenuto dai documenti. Il corpus non permette di stabilire che G1 sia falso: il prezzo è **non verificabile**. Inoltre manca F4, la partecipazione in presenza. Un output può avere contemporaneamente un'aggiunta non sostenuta e un'omissione.

## Calcola rapporti diversi per domande diverse

Le definizioni di [precisione a k fisso](https://github.com/usnistgov/trec_eval/blob/main/m_P.c) e [richiamo a k fisso](https://github.com/usnistgov/trec_eval/blob/main/m_recall.c) usano conteggi distinti di elementi recuperati e pertinenti. Qui dichiariamo il protocollo: **Precision@3 = documenti pertinenti tra i primi tre / 3**; **Recall@3 = documenti pertinenti recuperati tra i primi tre / documenti pertinenti ammessi noti**. I duplicati dello stesso documento/versione contano una volta. Se una ricerca valida restituisce meno di tre documenti, il denominatore di Precision@3 resta tre; un errore tecnico non diventa una ricerca valida vuota.

Applichiamo queste metriche soltanto ai casi rispondibili con recupero valido: R01 e R02. R06 è un terzo caso con fonti attese, ma il risultato manca; la copertura di quel gruppo è quindi 2/3. R03–R05 hanno insieme pertinente ammesso vuoto: il loro richiamo non viene calcolato dividendo per zero.

| Misura della fixture | Numeratore e denominatore | Risultato descrittivo |
| --- | --- | --- |
| Recupero valido su piano | R01–R05 / sei casi | 5/6 = 83,3% |
| Precision@3 R01 | A-v2 e B-v1 / tre posizioni | 2/3 = 66,7% |
| Precision@3 R02 | C-v1 / tre posizioni | 1/3 = 33,3% |
| Media delle due precisioni | (2/3 + 1/3) / 2 | 50% |
| Recall@3 R01 e R02 | 2/2 e 1/1 | 100% ciascuno |
| Claim sostenuti nelle due risposte documentali | F1, F2, F3 / F1, F2, F3, G1 | 3/4 = 75% |
| Fatti richiesti coperti nelle stesse due risposte | F1, F2, F3 / F1, F2, F3, F4 | 3/4 = 75% |
| Astensioni conformi nel gruppo senza fonte ammessa | R03, R04, R05 / tre casi | 3/3 nell'esempio inventato |

La media delle precisioni è **macro**, con uguale peso per domanda. Nella fixture coincide con il rapporto micro 3 documenti pertinenti / 6 posizioni perché ogni domanda usa lo stesso k. Non assumere che medie e aggregati coincidano in altri protocolli. Anche i due 75% misurano cose diverse: sostegno delle frasi prodotte e copertura dei fatti richiesti.

Il sostegno al contesto non coincide con la correttezza rispetto a una fonte valida. Una risposta fedele ad A-v1 resterebbe basata su un documento ritirato. I framework di valutazione, come il [tutorial RAG di LangSmith](https://docs.langchain.com/langsmith/evaluate-rag-tutorial), aiutano a organizzare verifiche separate; le nostre etichette manuali non equivalgono automaticamente ai punteggi o ai giudici di un fornitore.

## Dal risultato alla correzione e alla riprova

R02 suggerisce due controlli della generazione: evitare affermazioni senza supporto e includere il formato richiesto. Aumentare il richiamo non risolve automaticamente questo esempio, perché C-v1 era già presente. Un caso con fonte attesa mai recuperata richiederebbe invece di esaminare ingestione, versione, filtro, ricerca o riordino. Una fonte esclusa correttamente per accesso non è un difetto di pertinenza da aggirare.

Concorda requisiti inderogabili e soglie prima di ottimizzare. Non compensare un accesso non ammesso con una media migliore. Tre astensioni dimostrative non provano sicurezza generale; servono prove autorizzate sui percorsi reali, su identità diverse e sul ciclo di revoca. Un giudice automatico può assistere, ma richiede rubriche versionate e confronto con valutazioni competenti sui casi importanti.

Ripeti il campione compatibile dopo la correzione, mantenendo anche domande non usate durante la messa a punto. Conserva fallimenti, costi e tempi con le loro condizioni; due domande non stimano una prestazione stabile. Il [registro del costo pilota](articolo-costi-automazione-guida.html#scheda-costo-pilota) collega poi il lavoro agli esiti accettati. La decisione finale deve dire che cosa è stato verificato, che cosa resta aperto e chi può autorizzare il passaggio successivo.
