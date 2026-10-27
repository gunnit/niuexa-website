# Permesso?
### A 75-second film for AEO Analyzer by NIUEXA

**Logline.** Every night a quiet reader asks permission at every door in Torino. One door has said no for two years, and its owner never knew.

**The truth it dramatises.** Before an AI search or answer crawler reads a site, it checks robots.txt: it asks first. A rule added by a plugin, a template or a well-meaning developer can turn those readers away while the owner thinks the site is open. AEO Analyzer's AI Bot Permissions check finds it, and it also says when a block is a legitimate choice (training crawlers) rather than a mistake.

**Why "Permesso?"** In Italy you don't walk into someone's home or shop without saying "Permesso?" (May I?). It's the most Italian word for the most important thing an AI crawler does.

---

## Characters

**La Lettrice (the Reader).** Not a robot. A tall woman of no clear age in a long charcoal 1950s wool coat, a felt hat with a soft brim and leather gloves. She is slightly translucent at the edges, and printed words drift into her like moths into light. She is never named and never shown speaking on camera; we hear her inner voice, warm and low, English with a soft Italian accent, unhurried. She enters only when invited. She touches the brim of her hat when she's turned away.

**Teresa.** 38, runs a small hat shop she took over from her grandfather (fictional: *Cappelleria Orsolina*, `cappelleriaorsolina.example`; the name needs a business-name check). Practical, good at her craft, busy. Not naive: she never knew the sign was there because she didn't put it up.

**The Fitter.** Seen for two seconds in a flashback: a man in grey overalls screwing an enamel sign onto her door. He is the plugin.

## Look and sound

- **Black and white, the way the Reader sees.** High-contrast 35mm look, fine grain, anamorphic flares from streetlamps, wet cobblestones, tram wires, the porticoes of Via Po, San Salvario at 3 a.m., the Mole Antonelliana on the skyline. References: Wenders' *Wings of Desire* (angels who see in black and white and listen to the city), the night streets of *La Dolce Vita*. Homage, not copy.
- **Colour is earned.** The first colour in the film is the AEO Analyzer screen glowing in Teresa's black-and-white shop. The second is the moment the Reader steps inside: colour floods out from the doorway. Teal, oxblood and mustard felt, brass, the warm wood of hat blocks. Last of all, her own hat turns brand teal.
- **Words as light.** Everything the Reader reads (menus, timetables, shop signs, tags) lifts off as soft glowing letters and drifts into her coat. That's how we show crawling without a single diagram.
- **Sound.** A slow waltz in 3/4 for solo piano and cello, minor key, with room to breathe. Torino at night: a distant tram bell, rain on stone, a scooter far away. The Reader's footsteps make no sound; arriving words make a whisper like a page turning. When the colour floods, the strings bloom into the major key.

---

## Script (75s hero, 16:9)

| time | picture | VO (the Reader) / dialogue | on-screen text | sound |
|---|---|---|---|---|
| 0:00-0:05 | Aerial drift over Torino at night, black and white. The Mole Antonelliana, rooftops, a tram crawling along wet rails. Tiny points of light rise from the streets below, like embers going the wrong way. | "Every night, I read the city." | | Piano enters, one note at a time. Distant tram bell. |
| 0:05-0:11 | Under the porticoes of Via Po. The Reader walks toward camera. As she passes a café sign, a timetable and a bookshop window, their letters lift off as light and drift into her coat. | "Menus. Timetables. Opening hours. The little stories on the back of a card." | | Soft page-turn whispers as each word arrives. |
| 0:11-0:17 | A trattoria door with a hand-lettered card: APERTO. She pauses, tilts her head. Then she steps through the glass, and the chalkboard menu's words stream into her. | (softly, at the door) "Permesso?" / "In the morning, people ask me things. So I read everything I'm allowed to." | | Cello joins. |
| 0:17-0:22 | A side street in San Salvario, 3 a.m. A small hat shop, warm light still on inside, hats on wooden blocks in the window. She stops. | "But in Italy, you never enter without asking." | | Rain begins, very light. |
| 0:22-0:27 | Close: the brass door handle. Hanging from it, an old blue enamel sign: PRIVATO. She reads it. A beat. She touches the brim of her hat and steps back into the dark. | "Permesso?" (no answer) | | The music stops. Rain only. |
| 0:27-0:37 | Seasons, same locked-off frame, 2.5s each: snow on the porticoes; a storm, umbrellas; chestnut blossom; empty August heat. Each time the Reader arrives, reads PRIVATO, touches her brim and bows. Through the glass we watch Teresa's year: steaming felt over a block, fitting a hat on a customer, tearing calendar pages. | "Some doors are meant to stay closed. I respect that." | | The waltz returns, slower each season. |
| 0:37-0:43 | The last night. She lingers at the glass, gloved hand on it, and frost blooms around her fingers. Inside, a hundred handwritten tags hang from the hats, unreadable to her: soft blur. | "But this one..." (beat) "I don't think she knows." | | Piano holds one unresolved chord. Frost crackle. |
| 0:43-0:48 | Morning, inside the shop. A customer, seen over the shoulder, pays at the counter. Teresa wraps a hat box. | Customer (Italian): "Strano. Ho chiesto all'assistente un cappellaio qui vicino. Lei non c'era." | Subtitle: *"Funny. I asked my assistant for a hatmaker nearby. You weren't there."* | Shop bell. Paper rustle. |
| 0:48-0:54 | Teresa at a laptop on the counter. She types `cappelleriaorsolina.example` into AEO Analyzer. The screen is the **first colour in the film**: the navy UI and brand gradient glow on her face. A row expands. | | `AI Bot Permissions · HIGH` / `robots.txt blocks 3 AI search crawlers on this page: OAI-SearchBot, PerplexityBot, Claude-SearchBot` / `DEMO DATA · FICTIONAL SHOP` | The music drops to a single held cello note. One soft UI tick. |
| 0:54-0:58 | Match cut to the door. The enamel letters of PRIVATO slide and re-form into the rule they always were. Insert (2s, slightly bleached): two years earlier, the Fitter screwing the sign on. | | Sign becomes: `User-agent: OAI-SearchBot` `User-agent: Claude-SearchBot` `User-agent: PerplexityBot` `Disallow: /` · Insert tag: `2024 · plugin: "Block AI bots"` | Metallic slide, a screwdriver squeak. |
| 0:58-1:02 | On the laptop, Teresa deletes the three lines. She keeps her training-crawler rule; the report says so plainly. That evening she turns the shop sign, takes down PRIVATO, and hangs a small handwritten card: AVANTI. | | UI: `Training crawlers blocked here (GPTBot, ClaudeBot): that is your policy choice. It does not hide this page from AI search.` / Card: `AVANTI` | Backspace taps. A small brass hook click. |
| 1:02-1:08 | Night. The Reader comes round the corner, stops, reads AVANTI. The smallest smile. She steps through the glass, and **colour floods outward from her feet**: teal, oxblood and mustard felt, brass, warm wood. The words on the tags lift into her as light, now in colour. Her own hat turns teal. | (almost a whisper) "Permesso?" | | The strings bloom into the major key. A long, warm swell. |
| 1:08-1:12 | Cut to black. Two lines set in Space Grotesk, one after the other. | | `She always asks first.` / `Is your website saying no?` | Silence, then the last chord decays. |
| 1:12-1:15 | End card on navy. | | `AEO Analyzer by NIUEXA` / `See what your website tells AI, and what to change.` / `aeo.niuexa.ai` / NIUEXA logo | One soft final note. |

**Total VO:** about 60 words. It leaves the film room to breathe and works muted with burned-in captions.

---

## Cutdowns

- **30s:** aerial and "Every night, I read the city." (3s); PRIVATO, "Permesso?", the brim touch (5s); seasons with "Some doors are meant to stay closed. I respect that." (6s); "I don't think she knows." (3s); laptop colour and sign-to-code (5s); AVANTI and the colour flood (5s); end card (3s).
- **15s:** PRIVATO and "Permesso?" (3s), seasons (3s), laptop colour and sign-to-code (3s), AVANTI and the colour flood (3s), "Is your website saying no?" and end card (3s).
- **9:16:** doors are vertical, so the film reframes naturally. The aerial becomes a slow tilt down the Mole, and the laptop becomes a phone on the counter. Captions are burned in for muted autoplay.

---

## Why it works

- **People feel for the reader and look at their own door.** Nobody is the villain. A plugin did it, years ago, with good intentions.
- **It's literally true.** Search and answer crawlers check robots.txt before they read. The on-screen message is the product's real wording, and the crawler names are the product's real list.
- **It respects the choice.** "Some doors are meant to stay closed. I respect that." The product itself tells Teresa that blocking training crawlers is her policy choice. That answers the "lecture" risk inside the story.
- **No promise.** The film ends when she's allowed to read, not with Teresa getting cited.
- **Only NIUEXA could make it.** A Torino night, an Italian word and a hat shop, from a Torino company.

## Production plan (AI footage + HyperFrames)

**Roughly 65% generated footage, 35% HyperFrames.**

1. **Look development.** Generate reference sheets for the Reader and Teresa and keyframes for four locations: the Via Po porticoes, the trattoria, the hat shop exterior, the hat shop interior. Lock them as reference elements so every shot uses the same faces, coat, hat and door.
2. **Generated shots.** About 18 shots of 4 to 6 seconds each: still keyframe first, then image-to-video. **Everything is generated in colour** and graded to black and white in HyperFrames, so the colour flood is a controlled reveal on the real colour plate rather than a second generation.
3. **HyperFrames builds:**
   - the black-and-white grade, grain and the Reader's translucent edges;
   - the words-as-light particles, real letters sampled from each sign;
   - the PRIVATO-to-code letter morph;
   - the AEO Analyzer screens, rebuilt in HTML with demo data for the fictional shop;
   - the radial colour-flood shader;
   - subtitles, captions, end card and all three cutdowns from one timeline.
4. **Audio.** An AI voice for the Reader (an original voice, no soundalike) and a second for the customer's Italian line. Waltz for piano and cello (library track or commissioned) and a sound-design pass.

**Main risks and how we handle them:**
- *Keeping the Reader consistent across seasons.* Mostly medium and wide shots, three-quarter or from behind, hat brim shading her face, gloved hands. The silhouette carries her identity.
- *AI hands and lip-sync.* She never speaks on camera, the customer is seen from behind, and the hand on the glass is gloved.
- *Real crawler names on screen.* They are shown only as product output in a demo report, never as companies speaking.

## Before production

1. Business-name check for "Cappelleria Orsolina" (or pick another name).
2. Confirm the report wording on a real scan of a demo robots.txt. The film quotes the current message format of the AI Bot Permissions check.
3. VO casting: AI voice for the first cut (agreed), with the option to re-record later.

---

## Versione italiana (master consigliato)

Same picture and timings as the script above; only the voice, supers and UI text change. The product's Italian interface uses "tu" (aeo.niuexa.ai: "Scopri perché l'AI non consiglia il tuo sito."), so the ad does too. It also avoids "Lei" being misread as "she" (the Reader).

| time | VO (La Lettrice) / dialogo | testo a schermo |
|---|---|---|
| 0:00-0:05 | "Ogni notte leggo la città." | |
| 0:05-0:11 | "Menù. Orari. Insegne. Le piccole storie scritte sul retro di un biglietto." | |
| 0:11-0:17 | (alla porta) "Permesso?" / "La mattina, la gente mi chiede le cose. Così leggo tutto quello che mi è permesso." | |
| 0:17-0:22 | "Ma in casa d'altri non si entra senza chiedere." | |
| 0:22-0:27 | "Permesso?" (nessuna risposta) | Cartello: `PRIVATO` |
| 0:27-0:37 | "Certe porte devono restare chiuse. Lo rispetto." | |
| 0:37-0:43 | "Ma questa..." (pausa) "Non credo che lo sappia." | |
| 0:43-0:48 | Cliente: "Strano. Ho chiesto all'assistente un cappellaio qui vicino. Lei non c'era." | |
| 0:48-0:54 | | `AI Bot Permissions · ALTA` / `robots.txt blocca 3 crawler di ricerca AI su questa pagina: OAI-SearchBot, PerplexityBot, Claude-SearchBot` / `DATI DEMO · NEGOZIO DI FANTASIA` |
| 0:54-0:58 | | Il cartello diventa: `User-agent: OAI-SearchBot` `User-agent: Claude-SearchBot` `User-agent: PerplexityBot` `Disallow: /` · Flashback: `2024 · plugin: «Blocca i bot AI»` |
| 0:58-1:02 | | UI: `Esclusi dall'addestramento dei modelli: GPTBot, ClaudeBot. È una tua scelta e non influisce sulla ricerca AI.` / Biglietto: `AVANTI` |
| 1:02-1:08 | (quasi un sussurro) "Permesso?" | |
| 1:08-1:12 | | `Chiede sempre permesso.` / `Il tuo sito le sta dicendo di no?` |
| 1:12-1:15 | | `AEO Analyzer by NIUEXA` / `Scopri cosa dice il tuo sito all'AI, e cosa cambiare.` / `aeo.niuexa.ai` |

The training-crawler line is the product's own Italian string. Confirm the blocked-crawler line and the severity label on a real scan with the Italian interface.

**International version:** keep the Italian voice and add English subtitles (the charm survives, like *Wings of Desire*), or swap in the English VO from the main script. The footage is shared; each language is a re-render in HyperFrames, not a rebuild.
