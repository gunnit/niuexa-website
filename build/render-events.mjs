// Run node build/render-events.mjs after editing event-content.mjs.
// Generated HTML is committed, crawlable and has no client-side content dependency.
// What the pages say depends on today's date in Milan: an event stays open for
// requests until the end of its day, then its page says it took place and points
// to the next date. .github/workflows/event-pages-refresh.yml re-renders every
// night and publishes when that changes anything.
// --today=YYYY-MM-DD renders as of another day; EVENTS_ROOT renders into another
// directory (tests use both, so they never touch the committed pages).
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {EVENTS,MOVED} from './event-content.mjs';
// Venue per Roberto's 20 September 2026 email. His 6 October email dropped the SIGNALS name
// ("confonde") and moved all event copy from Lei to tu.
const series='DECIFRARE IL FUTURO';
const venue={name:'Ufficio Libera',short:'Libera',street:'Via Rutilia 10/8',postalCode:'20141',city:'Milano'};
const venueLine=`${venue.street}, ${venue.postalCode} ${venue.city}`;
const romeDate=d=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;};
const today=process.argv.find(a=>a.startsWith('--today='))?.slice(8)??romeDate(new Date());
if(!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`--today must be YYYY-MM-DD, got "${today}"`);
// "Next" is the first open event, so EVENTS must stay in date order.
EVENTS.forEach((e,i)=>{if(i&&e.date<=EVENTS[i-1].date) throw new Error(`event-content.mjs: ${e.slug} must come after ${EVENTS[i-1].slug} (dates in order)`);});
const isPast=e=>e.date<today;
const open=EVENTS.filter(e=>!isPast(e));
const next=open[0];
const root=process.env.EVENTS_ROOT?resolve(process.env.EVENTS_ROOT):resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const write=(p,s)=>writeFileSync(resolve(root,p),s);
// The hub is patched in place: a pattern that stops matching must fail the render, not skip silently.
const patch=(s,re,to)=>{if(!re.test(s)) throw new Error(`eventi-ai-aziende/index.html: no match for ${re}`);return s.replace(re,typeof to==='function'?to:()=>to);};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const hub='/eventi-ai-aziende/';
const path=e=>`${hub}${e.slug}/`;
const signup=e=>`${hub}?event=${e.date}#registration`;
const cta=e=>`<a class="event-cta" href="${signup(e)}">Richiedi la partecipazione <span aria-hidden="true">↗</span></a>`;
// Where a page that has gone past its date sends people instead.
const onward=next?`<a class="event-cta" href="${path(next)}">Il prossimo incontro: ${next.label} <span aria-hidden="true">↗</span></a>`:`<a class="event-cta" href="${hub}">Tutti gli incontri <span aria-hidden="true">↗</span></a>`;
const logo='<img src="/img/landing/niuexa-ai-solutions.webp" width="600" height="139" alt="Niuexa AI Solutions">';
for(const [i,e] of EVENTS.entries()){
 const past=isPast(e);
 const url='https://niuexa.ai'+path(e);
 const title=`${e.title} | ${e.label} Milano | NIUEXA`;
 const faqs=past?[
  ['Dove e quando si è svolto l’incontro?',`L’incontro si è svolto il ${e.label} alle 18:30, ora locale di Milano (Europe/Rome), presso l’${venue.name}, ${venueLine}.`],
  ['È ancora possibile partecipare?',next?`No, l’incontro si è concluso. Il prossimo incontro NIUEXA è il ${next.label}: la partecipazione si richiede dal modulo unico degli incontri.`:'No. L’incontro si è concluso, come l’intero ciclo di incontri dell’autunno 2026.']
 ]:[
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
<aside class="event-facts" aria-label="Informazioni e partecipazione"><p class="eyebrow">INCONTRO ${String(i+1).padStart(2,'0')} / AUTUNNO 2026</p><time datetime="${e.date}T18:30:00${e.offset}">${e.label}</time><p class="event-time">Ore 18:30 <span>Europe/Rome</span></p><p><strong>${venue.name}</strong><br>${venueLine}</p>${past?`${onward}<p class="cta-note">Incontro concluso: le richieste di partecipazione sono chiuse.</p>`:`${cta(e)}<p class="cta-note">La richiesta non equivale alla conferma del posto.</p>`}</aside></div>
</div></section>
<section class="detail-body" id="abstract" aria-labelledby="abstract-title"><div class="detail-section-label"><p class="eyebrow">IL TEMA DELL’INCONTRO</p><h2 id="abstract-title">${past?'Il programma <br>dell’incontro.':'Di cosa <br>parleremo.'}</h2></div><div><div class="event-abstract">${e.abstract.map(p=>`<p>${p}</p>`).join('')}</div><div class="event-audience"><h3>A chi si rivolge</h3><p>${e.audience}</p></div></div></section>
<section class="detail-learning" aria-labelledby="learning-title"><div class="detail-learning-inner"><p class="eyebrow">TRE CHIAVI DI LETTURA</p><h2 id="learning-title">Le domande diventano criteri.</h2><ol class="learning-list">${e.takeaways.map(([h,p])=>`<li class="learning-item"><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol><p class="reading-link">Per approfondire: <a href="${e.reading}">${e.readingLabel}</a>.</p></div></section>
<section class="event-info" id="faq" aria-labelledby="faq-title"><div><p class="eyebrow">${past?'DOPO L’INCONTRO':'PRIMA DI INCONTRARCI'}</p><h2 id="faq-title">Le informazioni,<br>senza sottintesi.</h2><p>Un incontro NIUEXA sull’AI in azienda. <a href="/chi-siamo.html">Conosci il team</a>.</p></div><div class="event-answers">${faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>
<section class="detail-closing" aria-labelledby="closing-title"><div><p class="eyebrow">${e.label.toLocaleUpperCase('it-IT')} · MILANO</p>${past?`<h2 id="closing-title">L’incontro si è svolto<br>il ${e.label}.</h2></div><div>${onward}<p>${next?'La partecipazione si richiede dal modulo unico degli incontri.':'Il ciclo di incontri dell’autunno 2026 si è concluso.'}</p></div>`:`<h2 id="closing-title">Porta le tue domande.<br>Il confronto parte da qui.</h2></div><div>${cta(e)}<p>Un solo modulo, con questo incontro già selezionato.</p></div>`}</section>
<nav class="other-events" aria-label="Gli altri incontri"><h2>Continua il percorso.</h2>${EVENTS.filter(other=>other!==e).map(other=>`<a href="${path(other)}"><span>${other.label}${isPast(other)?' · concluso':''}</span><strong>${other.title}</strong><span aria-hidden="true">↗</span></a>`).join('')}</nav>
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
// After the last date the block names the closing date instead of a next one.
const shown=next??EVENTS.at(-1);
html=patch(html,/<div class="next-date">[\s\S]*?<\/div>/,`<div class="next-date"><span>${next?'PROSSIMO APPUNTAMENTO':'ULTIMO INCONTRO DEL CICLO'}</span><time datetime="${shown.date}T18:30:00${shown.offset}">${shown.label}</time><a href="#calendar" aria-label="Scopri tutte le date">Tutte le date <span aria-hidden="true">↓</span></a></div>`);
// Dates in the hub's text come from EVENTS, so a moved date cannot leave the old one behind:
// "6 ottobre, 27 ottobre e 17 novembre 2026", or with "il " before each date.
if(EVENTS.length<2||EVENTS.length>6) throw new Error('event-content.mjs: the hub text is written for 2 to 6 events');
const sameYear=EVENTS.every(e=>e.date.slice(0,4)===EVENTS.at(-1).date.slice(0,4));
const dayMonth=e=>sameYear?e.label.replace(/ \d{4}$/,''):e.label;
const dateList=(article='')=>`${EVENTS.slice(0,-1).map(e=>article+dayMonth(e)).join(', ')} e ${article}${EVENTS.at(-1).label}`;
const howMany=['','','due','tre','quattro','cinque','sei'][EVENTS.length];
// Once no date is open, nothing on the hub may still invite a request.
html=patch(html,/<meta name="description" content="[^"]*">/,`<meta name="description" content="Eventi AI per aziende a Milano: ${dateList()}, ore 18:30 presso l’${venue.name}. ${next?'Invia la tua richiesta di partecipazione.':'Gli incontri si sono conclusi.'}">`);
html=patch(html,/<meta name="twitter:description" content="[^"]*">/,`<meta name="twitter:description" content="${dateList()}, ore 18:30 presso l’${venue.name} a ${venue.city}. ${next?'Richiedi la partecipazione.':'Il ciclo si è concluso.'}">`);
html=patch(html,/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="Decifrare il futuro. Incontri NIUEXA sull’AI in azienda il ${dateList()}, ore 18:30, ${venue.name}, ${venue.city}.">`);
html=patch(html,/"description": "[^"]*"/,`"description": "Decifrare il futuro: incontri NIUEXA sull’intelligenza artificiale in azienda, ${dateList()}, ore 18:30 (Europe/Rome), ${venue.name}, ${venueLine}."`);
html=patch(html,/<p class="lead">[\s\S]*?<\/p>/,`<p class="lead">Decifrare il futuro: gli incontri NIUEXA sull’intelligenza artificiale in azienda, ${dateList('il ')}. Tre date per partire dalle domande delle imprese, prima della tecnologia.</p>`);
html=patch(html,/<a class="skip" href="#[a-z]+">[^<]*<\/a>/,next?'<a class="skip" href="#registration">Vai al modulo</a>':'<a class="skip" href="#calendar">Vai alle date</a>');
html=patch(html,/<a class="header-link" href="#[a-z]+">[^<]*<span aria-hidden="true">[↗↓]<\/span><\/a>/,next?'<a class="header-link" href="#registration">La tua partecipazione <span aria-hidden="true">↗</span></a>':'<a class="header-link" href="#calendar">Tutte le date <span aria-hidden="true">↓</span></a>');
// The form markup is pinned by tests/event-details.test.mjs, so a closed series hides it
// with a class (event-details.css) instead of changing it; heading and note explain why.
html=patch(html,/<section class="registration[^"]*" id="registration"/,`<section class="registration${next?'':' is-closed'}" id="registration"`);
html=patch(html,/<div class="form-topline"><span>[^<]*<\/span>/,`<div class="form-topline"><span>${next?'LA TUA PARTECIPAZIONE':'RICHIESTE CHIUSE'}</span>`);
html=patch(html,/Questa pagina (?:raccoglie|ha raccolto le) richieste di partecipazione agli incontri NIUEXA\./,`Questa pagina ${next?'raccoglie':'ha raccolto le'} richieste di partecipazione agli incontri NIUEXA.`);
html=patch(html,/<p class="eyebrow">[^<]*<\/p><h2 id="faq-title">/,`<p class="eyebrow">${next?'PRIMA DI INCONTRARCI':'DOPO GLI INCONTRI'}</p><h2 id="faq-title">`);
// The FAQ is in the JSON-LD and on the page; both get the same question and answer.
const faq=(questions,q,a)=>{
 const name=`(?:${questions.map(x=>x.replaceAll('?','\\?')).join('|')})`;
 html=patch(html,new RegExp(`"name": "${name}",(\\s*"acceptedAnswer": \\{\\s*"@type": "Answer",\\s*"text": )"[^"]*"`),(m,between)=>`"name": "${q}",${between}"${a}"`);
 html=patch(html,new RegExp(`<summary>${name}</summary><p>[^<]*</p>`),`<summary>${q}</summary><p>${a}</p>`);
};
faq(['Quali sono le date degli eventi NIUEXA nel 2026?'],'Quali sono le date degli eventi NIUEXA nel 2026?',next?`Il ciclo di incontri NIUEXA dell’autunno 2026 prevede ${howMany} date: ${dateList('il ')}. Nel modulo di questa pagina puoi scegliere tra le date non ancora passate.`:`Il ciclo di incontri NIUEXA dell’autunno 2026 si è svolto in ${howMany} date: ${dateList('il ')}.`);
faq(['Come si richiede la partecipazione?'],'Come si richiede la partecipazione?',next?'Scegli una data e inserisci nome, cognome, azienda, email e cellulare. Il messaggio di richiesta ricevuta indica che il servizio di invio ha accettato i dati: non conferma un posto né la consegna di un’email.':'Le richieste sono chiuse: gli incontri del ciclo si sono conclusi. Per informazioni scrivi a ai@niuexa.ai.');
const where=['Dove si svolgono gli incontri e a che ora?','Dove si sono svolti gli incontri e a che ora?'];
faq(where,next?where[0]:where[1],`Tutti e ${howMany} gli incontri ${next?'si svolgono':'si sono svolti'} in presenza alle 18:30, ora locale di Milano (Europe/Rome), presso l’${venue.name}, ${venueLine}.`);
html=patch(html,/<h2 id="registration-title">[\s\S]*?<\/h2>/,next?'<h2 id="registration-title">Il prossimo incontro<br>parte da te.</h2>':'<h2 id="registration-title">Gli incontri d’autunno<br>si sono conclusi.</h2>');
html=patch(html,/<p class="form-intro">[\s\S]*?<\/p>/,next?'<p class="form-intro">Scegli una data e invia la tua richiesta di partecipazione.</p>':'<p class="form-intro">Le richieste di partecipazione sono chiuse. Per informazioni scrivi a <a href="mailto:ai@niuexa.ai">ai@niuexa.ai</a>.</p>');
html=patch(html,/<span id="selected-date">[^<]*<\/span>/,`<span id="selected-date">${next?next.label:'Richieste chiuse'}</span>`);
html=patch(html,/<div class="dates" aria-label="Date degli incontri">[\s\S]*?<\/div>\s*<\/section>/,`<div class="dates" aria-label="Date degli incontri">\n${EVENTS.map(e=>`<article class="topic-card"><a href="${path(e)}" class="calendar-date"><span class="month">${e.month}</span><span class="day">${e.day}</span><span class="date-description">${e.title}<small><time datetime="${e.date}">${e.label}</time> · 18:30 · ${venue.short} · ${venue.city}${isPast(e)?' · concluso':''}</small></span><span class="date-arrow" aria-hidden="true">↗</span></a><p>${e.excerpt}</p><div class="topic-actions"><a href="${path(e)}" aria-label="Scopri l’incontro: ${e.title}">Scopri l’incontro</a>${isPast(e)?'':`<a href="${signup(e)}" aria-label="Richiedi la partecipazione: ${e.title}">Richiedi la partecipazione ↗</a>`}</div></article>`).join('\n')}\n </div>\n</section>`);
html=patch(html,/<section class="event-info programme"[\s\S]*?<\/section>/,`<section class="event-info programme" aria-labelledby="programme-title"><div><p class="eyebrow">UN PERCORSO, TRE PROSPETTIVE</p><h2 id="programme-title">Dalla visibilità<br>al lavoro quotidiano.</h2><p>Tre incontri per collegare le domande del mercato alle scelte operative dell’impresa. Il filo conduttore è uno: partire dai processi e dalle persone, prima degli strumenti.</p></div><ol class="programme-list"><li><h3>Farsi riconoscere</h3><p>Il ${dayMonth(EVENTS[0])}, dalla SEO ad AEO e GEO: come rendere comprensibile l’offerta aziendale nella ricerca e nelle risposte AI.</p></li><li><h3>Rendere efficienti i processi</h3><p>Il ${dayMonth(EVENTS[1])}, come individuare i processi in cui un agente AI crea valore e definire criteri per misurarlo.</p></li><li><h3>Semplificare il marketing</h3><p>Il ${dayMonth(EVENTS[2])}, come affidare ad agenti AI parte del lavoro di marketing, mantenendo il controllo su messaggi, dati e approvazioni.</p></li></ol></section>`);
// Rebuild every option from EVENTS so a moved or past date never leaves a stale option behind.
html=patch(html,/(<select id="event-date" name="event">)[\s\S]*?(<\/select>)/,(m,start,end)=>start+open.map(e=>`<option value="${e.date}">${e.label} · ${e.title}</option>`).join('')+end);
html=html.replaceAll(' Il programma riportato in questa pagina è una proposta, con contenuti e relatori da confermare.','');
write('eventi-ai-aziende/index.html',html);
let sitemap=read('sitemap.xml');
// Drop topic URLs that are no longer in EVENTS (retired slugs redirect and are noindex).
sitemap=sitemap.replace(/  <url><loc>https:\/\/niuexa\.ai\/eventi-ai-aziende\/([a-z0-9-]+)\/<\/loc><\/url>\n/g,(m,slug)=>EVENTS.some(e=>e.slug===slug)?m:'');
for(const e of EVENTS){const url='https://niuexa.ai'+path(e);if(!sitemap.includes(`<loc>${url}</loc>`)) sitemap=sitemap.replace('</urlset>',`  <url><loc>${url}</loc></url>\n</urlset>`);}
write('sitemap.xml',sitemap);
let llms=read('llms.txt');
llms=llms.replace(/## Eventi AI per aziende\n[\s\S]*?\n## Core Services/,`## Eventi AI per aziende\n- [Decifrare il futuro: incontri NIUEXA, autunno 2026](https://niuexa.ai/eventi-ai-aziende/): ${next?'modulo unico per richiedere la partecipazione, non conferma del posto':'ciclo concluso, richieste di partecipazione chiuse'}. Tutte le date alle 18:30 (Europe/Rome), ${venue.name}, ${venueLine}.\n${EVENTS.map(e=>`- [${e.title}](https://niuexa.ai${path(e)}): ${e.label}${isPast(e)?', incontro concluso':''}. ${e.excerpt}`).join('\n')}\n\n## Core Services`);
write('llms.txt',llms);write('llm.txt',llms);
console.log(`Rendered ${EVENTS.length} event pages (${open.length} open as of ${today}), ${MOVED.length} redirects, hub topics and sitemap.`);
