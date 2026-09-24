// Run node build/render-events.mjs after editing event-content.mjs.
// Generated HTML is committed, crawlable and has no client-side content dependency.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {EVENTS,MOVED} from './event-content.mjs';
// Series name and venue per Roberto's 20 September 2026 email.
const series='SIGNALS – DECIFRARE IL FUTURO';
const venue={name:'Ufficio Libera',short:'Libera',street:'Via Rutilia 10/8',postalCode:'20141',city:'Milano'};
const venueLine=`${venue.street}, ${venue.postalCode} ${venue.city}`;
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const write=(p,s)=>writeFileSync(resolve(root,p),s);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const hub='/eventi-ai-aziende/';
const path=e=>`${hub}${e.slug}/`;
const signup=e=>`${hub}?event=${e.date}#registration`;
const cta=e=>`<a class="event-cta" href="${signup(e)}">Richieda la partecipazione <span aria-hidden="true">↗</span></a>`;
const logo='<img src="/img/landing/niuexa-ai-solutions.webp" width="600" height="139" alt="Niuexa AI Solutions">';
for(const [i,e] of EVENTS.entries()){
 const url='https://niuexa.ai'+path(e);
 const title=`${e.title} | ${e.label} Milano | NIUEXA`;
 const faqs=[
  ['Dove e quando si svolge l’incontro?',`L’incontro si svolge il ${e.label} alle 18:30, ora locale di Milano (Europe/Rome), presso l’${venue.name}, ${venueLine}.`],
  ['Come si richiede la partecipazione?','Il pulsante di partecipazione apre il modulo unico degli incontri NIUEXA con la data di questo evento già selezionata. Sono richiesti nome, cognome, azienda, email e cellulare.'],
  ['L’invio della richiesta conferma il posto?','No. Il messaggio di richiesta ricevuta indica che il servizio di invio ha accettato i dati: non conferma un posto né la consegna di un’email.']
 ];
 const graph=[{'@type':'Event','@id':url+'#event',name:e.title,description:e.abstract.join(' '),url,startDate:`${e.date}T18:30:00${e.offset}`,eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',location:{'@type':'Place',name:venue.name,address:{'@type':'PostalAddress',streetAddress:venue.street,postalCode:venue.postalCode,addressLocality:venue.city,addressCountry:'IT'}},organizer:{'@type':'Organization',name:'NIUEXA',url:'https://niuexa.ai/'}},{'@type':'FAQPage','@id':url+'#faq',mainEntity:faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))}];
 const html=`<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'">
<meta name="robots" content="index, follow, max-image-preview:large">
<title>${esc(title)}</title>
<meta name="description" content="${esc(e.description)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(e.description)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="NIUEXA">
<meta property="og:image" content="https://niuexa.ai/img/landing/niuexa-session-milano-800.webp">
<meta property="og:image:alt" content="Archivio NIUEXA: un precedente incontro, non questo appuntamento">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(e.description)}">
<meta name="twitter:image" content="https://niuexa.ai/img/landing/niuexa-session-milano-800.webp">
<link rel="icon" href="/img/favicon%20256.ico">
<link rel="stylesheet" href="/event-registration.css">
<link rel="stylesheet" href="/event-details.css">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph},null,2)}</script>
</head>
<body class="event-detail">
<a class="skip" href="#abstract">Vai al contenuto</a>
<header class="header"><a href="/" aria-label="NIUEXA, consulenza AI">${logo}</a><span class="header-edition">${series}</span><a class="header-link" href="${hub}">Tutti gli incontri <span aria-hidden="true">↗</span></a></header>
<main>
<section class="detail-hero" aria-labelledby="event-title"><div class="detail-hero-inner">
<nav class="event-breadcrumb" aria-label="Percorso"><a href="${hub}">Eventi AI per aziende</a><span aria-hidden="true"> / </span><span>${e.label}</span></nav>
<div class="detail-heading"><div><p class="eyebrow">${e.category}</p><h1 id="event-title">${e.title}</h1><p class="detail-subtitle">${e.subtitle}</p></div>
<aside class="event-facts" aria-label="Informazioni e partecipazione"><p class="eyebrow">SIGNALS ${String(i+1).padStart(2,'0')} / AUTUNNO 2026</p><time datetime="${e.date}T18:30:00${e.offset}">${e.label}</time><p class="event-time">Ore 18:30 <span>Europe/Rome</span></p><p><strong>${venue.name}</strong><br>${venueLine}</p>${cta(e)}<p class="cta-note">La richiesta non equivale alla conferma del posto.</p></aside></div>
</div></section>
<section class="detail-body" id="abstract" aria-labelledby="abstract-title"><div class="detail-section-label"><p class="eyebrow">IL TEMA DELL’INCONTRO</p><h2 id="abstract-title">Di cosa <br>parleremo.</h2></div><div><div class="event-abstract">${e.abstract.map(p=>`<p>${p}</p>`).join('')}</div><div class="event-audience"><h3>A chi si rivolge</h3><p>${e.audience}</p></div></div></section>
<section class="detail-learning" aria-labelledby="learning-title"><div class="detail-learning-inner"><p class="eyebrow">TRE CHIAVI DI LETTURA</p><h2 id="learning-title">Le domande diventano criteri.</h2><ol class="learning-list">${e.takeaways.map(([h,p])=>`<li class="learning-item"><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol><p class="reading-link">Per approfondire: <a href="${e.reading}">${e.readingLabel}</a>.</p></div></section>
<section class="event-info" id="faq" aria-labelledby="faq-title"><div><p class="eyebrow">PRIMA DI INCONTRARCI</p><h2 id="faq-title">Le informazioni,<br>senza sottintesi.</h2><p>Un incontro NIUEXA sull’AI in azienda. <a href="/chi-siamo.html">Conosca il team</a>.</p></div><div class="event-answers">${faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>
<section class="detail-closing" aria-labelledby="closing-title"><div><p class="eyebrow">${e.label.toLocaleUpperCase('it-IT')} · MILANO</p><h2 id="closing-title">Porti le Sue domande.<br>Il confronto parte da qui.</h2></div><div>${cta(e)}<p>Un solo modulo, con questo incontro già selezionato.</p></div></section>
<nav class="other-events" aria-label="Gli altri incontri"><h2>Continui il percorso.</h2>${EVENTS.filter(other=>other!==e).map(other=>`<a href="${path(other)}"><span>${other.label}</span><strong>${other.title}</strong><span aria-hidden="true">↗</span></a>`).join('')}</nav>
</main>
<footer>${logo}<p>Intelligenza artificiale.<br>Con un punto di vista umano.</p><span>NIUEXA S.R.L. · P.IVA 13489560014<br><a href="${hub}">Tutti gli incontri</a> · <a href="${hub}#dati-personali">Dati e privacy</a></span></footer>
</body>
</html>
`;
 mkdirSync(resolve(root,'eventi-ai-aziende',e.slug),{recursive:true});
 write(`eventi-ai-aziende/${e.slug}/index.html`,html);
}
// GitHub Pages has no server redirects: retired URLs get an instant refresh + canonical (same pattern as event-registration.html).
for(const [from,to] of MOVED){
 const e=EVENTS.find(item=>item.slug===to);
 if(!e) throw new Error(`MOVED target not in EVENTS: ${to}`);
 mkdirSync(resolve(root,'eventi-ai-aziende',from),{recursive:true});
 write(`eventi-ai-aziende/${from}/index.html`,`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(e.title)} | NIUEXA</title><link rel="canonical" href="https://niuexa.ai${path(e)}"><meta http-equiv="refresh" content="0;url=${path(e)}"></head><body><a href="${path(e)}">${e.title}</a></body></html>\n`);
}
let html=read('eventi-ai-aziende/index.html');
if(!html.includes('href="/event-details.css"')) html=html.replace('<link rel="stylesheet" href="/event-registration.css">','<link rel="stylesheet" href="/event-registration.css">\n  <link rel="stylesheet" href="/event-details.css">');
html=html.replace(/<div class="dates" aria-label="Date degli incontri">[\s\S]*?<\/div>\s*<\/section>/,`<div class="dates" aria-label="Date degli incontri">\n${EVENTS.map(e=>`<article class="topic-card"><a href="${path(e)}" class="calendar-date"><span class="month">${e.month}</span><span class="day">${e.day}</span><span class="date-description">${e.title}<small>${e.label} · 18:30 · ${venue.short} · ${venue.city}</small></span><span class="date-arrow" aria-hidden="true">↗</span></a><p>${e.excerpt}</p><div class="topic-actions"><a href="${path(e)}" aria-label="Scopra l’incontro: ${e.title}">Scopra l’incontro</a><a href="${signup(e)}" aria-label="Richieda la partecipazione: ${e.title}">Richieda la partecipazione ↗</a></div></article>`).join('\n')}\n </div>\n</section>`);
html=html.replace(/<section class="event-info programme"[\s\S]*?<\/section>/,`<section class="event-info programme" aria-labelledby="programme-title"><div><p class="eyebrow">UN PERCORSO, TRE PROSPETTIVE</p><h2 id="programme-title">Dalla visibilità<br>al lavoro quotidiano.</h2><p>Tre incontri per collegare le domande del mercato alle scelte operative dell’impresa. Il filo conduttore è uno: partire dai processi e dalle persone, prima degli strumenti.</p></div><ol class="programme-list"><li><h3>Farsi riconoscere</h3><p>Il 6 ottobre, dalla SEO ad AEO e GEO: come rendere comprensibile l’offerta aziendale nella ricerca e nelle risposte AI.</p></li><li><h3>Rendere efficienti i processi</h3><p>Il 27 ottobre, come individuare i processi in cui un agente AI crea valore e definire criteri per misurarlo.</p></li><li><h3>Semplificare il marketing</h3><p>Il 17 novembre, come affidare ad agenti AI parte del lavoro di marketing, mantenendo il controllo su messaggi, dati e approvazioni.</p></li></ol></section>`);
// Rebuild every option from EVENTS so a moved date never leaves a stale option behind.
html=html.replace(/(<select id="event-date" name="event">)[\s\S]*?(<\/select>)/,(m,open,close)=>open+EVENTS.map(e=>`<option value="${e.date}">${e.label} · ${e.title}</option>`).join('')+close);
html=html.replaceAll(' Il programma riportato in questa pagina è una proposta, con contenuti e relatori da confermare.','');
write('eventi-ai-aziende/index.html',html);
let sitemap=read('sitemap.xml');
// Drop topic URLs that are no longer in EVENTS (retired slugs redirect and are noindex).
sitemap=sitemap.replace(/  <url><loc>https:\/\/niuexa\.ai\/eventi-ai-aziende\/([a-z0-9-]+)\/<\/loc><\/url>\n/g,(m,slug)=>EVENTS.some(e=>e.slug===slug)?m:'');
for(const e of EVENTS){const url='https://niuexa.ai'+path(e);if(!sitemap.includes(`<loc>${url}</loc>`)) sitemap=sitemap.replace('</urlset>',`  <url><loc>${url}</loc></url>\n</urlset>`);}
write('sitemap.xml',sitemap);
let llms=read('llms.txt');
llms=llms.replace(/## Eventi AI per aziende\n[\s\S]*?\n## Core Services/,`## Eventi AI per aziende\n- [SIGNALS – Decifrare il futuro: incontri NIUEXA, autunno 2026](https://niuexa.ai/eventi-ai-aziende/): modulo unico per richiedere la partecipazione, non conferma del posto. Tutte le date alle 18:30 (Europe/Rome), ${venue.name}, ${venueLine}.\n${EVENTS.map(e=>`- [${e.title}](https://niuexa.ai${path(e)}): ${e.label}. ${e.excerpt}`).join('\n')}\n\n## Core Services`);
write('llms.txt',llms);write('llm.txt',llms);
console.log(`Rendered ${EVENTS.length} event pages, ${MOVED.length} redirects, hub topics and sitemap.`);
