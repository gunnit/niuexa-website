# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing site for **Niuexa**, an Italian AI consulting company (Milan/Turin). It covers consulting services, training, products, a large SEO/AEO content library, and lead-generation funnels. Built with vanilla HTML/CSS/JS — **no build step, no framework, no package manager** — and deployed to GitHub Pages on the custom domain `niuexa.ai` (`CNAME`).

Scale: ~160 HTML pages (~135 Italian, ~35 English), 16 stylesheets, 15 JS files.

## Development Commands

### Local development
```bash
python -m http.server 8000        # recommended — root-relative URLs (/img/…, /en/…) need a server
npx http-server                   # alternative
```
Opening files with `file://` breaks navigation, includes and images, because the shared markup uses absolute paths.

### Tests
```bash
python3 -m unittest discover -s tests    # 7 tests, ~0.1s — no pytest, no dependencies
```
`tests/` holds two static-analysis suites that scan the HTML/JS as text. They are the only automated checks in the repo and they **will fail if new pages break the tracking conventions**:
- `test_tracking_static.py` — every page with a Web3Forms form must load `conversion-tracking.js`; `generate_lead` and legacy `assessment_request*` events must never be emitted inline; the thank-you lead event must be session-deduplicated.
- `test_marketing_consent.py` — marketing consent stays separate from analytics consent in `cookie-banner.js`, and the LinkedIn Insight Tag stays consent-gated.

Everything else is manual: serve locally, click through navigation and forms, and check responsive/mobile layouts.

### Deployment
Push to `master`/`main` → `.github/workflows/github-pages.yml` publishes the repo root as-is. No build. Custom domain via `CNAME`; `404.html` is served automatically for missing URLs.

## Repository Map

```
/                       Italian site root — every page is a top-level .html file
├── index.html, chi-siamo.html, consulting.html, training.html, products.html,
│   impara.html, research.html, eventi.html, carriere.html, contatti.html,
│   resources.html, community.html, newsletter.html, roi-calculator.html, …
├── articolo-*.html     ~50 long-form SEO/AEO articles (the largest page family)
├── tutorial-*.html     7 hands-on tutorials (several pair with a quiz)
├── landing-*.html      standalone campaign landing pages (no shared nav include)
├── thank-you-*.html    post-conversion pages that fire the lead event
├── ai-consulting/      4-page Italian SEO cluster (casi-studio, roi, strategia, step-by-step)
├── books/              4 lead-magnet funnels, each a folder of companion pages
│   ├── ai-agents-field-guide/  mcp-blueprint/  no-code-ai-bible/  one-person-empire/
├── en/                 English mirror: pages, en/includes/, en/sitemap.xml, en/robots.txt, en/llms.txt
├── includes/includes.js        Italian navigation + footer (shared markup)
├── quiz-data/*.json            certification quiz banks
├── downloads/                  gated PDFs
├── img/                        assets — img/articles/<slug>/, img/storia/, img/agents/, img/eventi/
├── tests/                      Python static-analysis tests
└── .claude/skills/impeccable/  local design skill (stripped from the deploy artifact)
```

## Shared Runtime

### Two navigation includes — check which one a page uses
Navigation and footer markup live as template literals inside JS files and are injected into `<div id="nav-placeholder">` / `<div id="footer-placeholder">` on `DOMContentLoaded`.

| Include | Used by |
|---|---|
| `includes/includes.js` | 96 Italian pages |
| `en/includes/navigation-en.js` | 26 English pages **and** 25 Italian funnel pages: `books/**`, `resources.html`, `community.html`, `newsletter.html`, `nocode-toolkit.html`, `ai-operator-*.html`, `articolo-software-migration-plan.html` |
| *(none — self-contained markup)* | `landing-*.html`, `login.html` |

The two files are near-duplicates (English labels and `/en/` links in the second). **A change to navigation or footer usually has to be made in both.** `includes.js` also owns `setActiveNavItem()` (highlights by URL), dropdown/hamburger behaviour with ARIA state, reveal animations, and `makeScrollRegionsFocusable()` (runtime WCAG 2.1.1 fix that gives keyboard focus to horizontally scrollable `pre`/`table`/`figure` elements and re-checks on resize).

`nav-placeholder` and `navigation-placeholder` are both accepted as the nav mount point. Injection failures fall back to an inline error box with a retry button.

### Script load order (end of `<body>`)
```html
<script src="script.js?v=20260428"></script>
<script src="includes/includes.js?v=20260428"></script>
<script src="conversion-tracking.js?v=20260707"></script>
<script src="cookie-banner.js?v=20260428"></script>
```
`cookie-banner.js` is on 159/160 pages, GTM on all 160.

### Cache-busting
Shared assets carry a `?v=YYYYMMDD` query string (`styles.css?v=20260807`, `script.js?v=20260428`, …). **When editing a shared asset, bump the stamp across the pages that load it** — otherwise returning visitors keep the cached copy. Values currently in use: `20260428` (script/includes/cookie-banner), `20260707` (conversion-tracking), `20260807` (styles.css).

### JavaScript files
| File | Role |
|---|---|
| `script.js` | site-wide: scroll effects, animations, contact form handling |
| `includes/includes.js`, `en/includes/navigation-en.js` | shared nav + footer (see above) |
| `cookie-banner.js` | GDPR consent UI, Consent Mode updates, LinkedIn Insight gating |
| `conversion-tracking.js` | UTM/click-id capture, normalized GA4 events |
| `consulting.js`, `research.js`, `impara.js`, `eventi.js`, `contatti.js` | page-specific behaviour |
| `roi-calculator.js`, `ai-readiness-tool.js` | interactive calculators/assessments |
| `certification.js` | quiz engine reading `quiz-data/*.json` |
| `tutorial.js` | tutorial page behaviour |
| `landing-agent.js` | shared logic for the `landing-*-agent.html` pages |
| `scroll-world.js` | reusable scroll-scrubbed video "camera flight" engine (`mountScrollWorld(el, config)`) |
| `chi-siamo-world.js` | the `scroll-world` configuration for `chi-siamo.html` |

There is **no** `training.js` — `training.html` uses `script.js` plus `training.css` only.

### Stylesheets
`styles.css` (130 KB) holds the design tokens, layout primitives, navigation, footer and shared components. Page stylesheets extend it and should only carry what is unique: `consulting.css`, `training.css`, `research.css`, `impara.css`, `eventi.css`, `contatti.css`, `products.css`, `carriere.css`, `certification.css`, `tutorial.css`, `roi-calculator.css`, `ai-readiness-assessment-lp.css`, `landing-agent.css`, `books.css` (24 funnel pages), `article-visuals.css` (8 illustrated articles).

## Analytics, Consent and Conversions

This is the most convention-bound part of the codebase, and the test suite enforces it.

- **Google Tag Manager** (`GTM-KG9S42S4`) is the single container on every page. All Google tags (GA4, Google Ads) are configured inside GTM — never hard-coded into pages.
- **Google Consent Mode**: every page sets `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` to `denied` with `wait_for_update: 500`, *before* GTM loads. `cookie-banner.js` calls `updateConsentMode(analyticsGranted, marketingGranted)` after the visitor chooses. Analytics and marketing are **independent** choices.
- **LinkedIn Insight Tag** (partner `10532561`) loads from `cookie-banner.js` only after marketing consent — never as a static tag, never with a `<noscript>` pixel.
- **`conversion-tracking.js`** captures UTMs and click IDs (`gclid`, `gbraid`, `wbraid`) into `localStorage` (`niuexa_attribution_v1`), fills Web3Forms hidden fields, and emits the normalized event set: `form_start`, `form_submit`, `generate_lead`, `cta_click`. Thank-you-page lead events are deduplicated per session via `sessionStorage` keys prefixed `niuexa_lead_event_`.
- **Never emit `generate_lead` (or the legacy `assessment_request` events) inline in a page** — the tests fail on it.
- **Forms**: Web3Forms (`api.web3forms.com/submit`) on 27 pages; HubSpot embed (`js-eu1.hsforms.net`) on 2. Any page with a Web3Forms form must also load `conversion-tracking.js`.
- `index.html` additionally loads an async AEO Analyzer autofix script from `aeo-analyzer-production.onrender.com`.

## Design System

All tokens live in `:root` in `styles.css`. `STYLESHEET_GUIDE.md` documents the system in prose; where the two disagree, `styles.css` is the source of truth (for example, the guide mentions a `--font-mono` token that does not actually exist).

```css
/* Brand — fills, borders, gradients */
--primary-blue: #237DA6;   --dark-blue: #1F64AE;   --light-blue: #E3F0F5;
--primary-green: #43AE68;  --dark-green: #2C8A4C;  --light-green: #E6F5EC;
--brand-teal: #0E9C9A;     --cyan: #06B6D4;        --logo-blue: #1F64AE;

/* Text tokens — AA-safe on LIGHT surfaces */
--blue-text: #1F6E94;      /* 5.15:1 on --light-gray */
--green-text: #2C7A45;     /* 5.28:1 */
--signal: #0E7A78;         /* teal text/links */
--error-text: #B02A37;     --warning-text: #92400E;

/* Text tokens — AA-safe on DARK surfaces */
--signal-on-dark: #4FD1C5; --green-on-dark: #5CC98A; --muted-on-dark: #ADB5BD;

/* Neutrals */
--white: #FFFFFF;  --light-gray: #F1F5F8;  --medium-gray: #54697A;
--dark-gray: #14324A;  /* navy ink */      --black: #0A1A26;

/* Status pairs — each surface carries its --*-text partner at ≥4.5:1 */
--error: #DC3545;  --warning: #B45309;  --success: #2C7A45;
--error-surface: #FDEDEE;  --warning-surface: #FDF4E7;  --success-surface: #E6F5EC;
--signal-surface: #EAF6F5; --info-surface: #E9F2F6;

/* Structure */
--border-light: #E2E8F0;  --border-medium: #CBD5E0;

/* Gradients */
--gradient-primary: linear-gradient(115deg, var(--primary-blue) 0%, var(--brand-teal) 50%, var(--primary-green) 100%);
--gradient-cta: linear-gradient(115deg, #1C5C9E 0%, #0B6B69 50%, #25683B 100%);
--gradient-secondary: linear-gradient(135deg, var(--dark-blue), var(--dark-green));
--gradient-light: linear-gradient(135deg, var(--light-blue), var(--light-green));
--gradient-hero-dark: linear-gradient(135deg, var(--black) 0%, #0F2638 55%, var(--dark-gray) 100%);

/* Typography */
--font-primary: 'Space Grotesk', system-ui, sans-serif;    /* headings, brand */
--font-secondary: 'Hanken Grotesk', system-ui, sans-serif; /* body */

/* Spacing & motion */
--section-padding: 80px 0;  --container-padding: 0 20px;
--transition-fast: 0.3s ease;  --transition-medium: 0.5s ease;  --transition-slow: 0.8s ease;
```

### The one rule that breaks things: fill tokens are never text tokens
Every brand fill fails WCAG AA as text on some surface. Pick the token by surface:

| Surface | Blue text | Green text | Teal text | Muted text |
|---|---|---|---|---|
| Light (white, `--light-gray`, `--light-blue`, `--light-green`) | `--blue-text` | `--green-text` | `--signal` | `--medium-gray` |
| Dark (`--dark-gray`, dark gradients, cookie banner) | `--white` | `--green-on-dark` | `--signal-on-dark` | `--muted-on-dark` |

Known traps:
- `--primary-blue` on `--light-gray` is 4.21:1 — fails.
- `--dark-green` carries white text at 4.33:1 — fails.
- **`--gradient-primary` cannot carry white text** (4.61 / 3.37 / 2.80 across its stops). Anything with white text on a gradient — buttons, pills, hero fields, CTA panels — must use `--gradient-cta` (6.83 / 6.32 / 6.73). Keep `--gradient-primary` for text-free fills.

### Other styling rules
- **Never hard-code a colour.** Use the `:root` tokens. Recent sweeps removed one-off hexes across every stylesheet; new ones regress that work.
- **Never hard-code a font family.** Use `var(--font-primary)` / `var(--font-secondary)`. The Google Fonts link on all 159 pages loads `Space Grotesk + Hanken Grotesk + JetBrains Mono`; JetBrains Mono has no token and is currently used only by `landing-agent.css` and a few inline blocks.
- **Buttons**: use `.btn-primary` / `.btn-secondary` / `.btn-large` from `styles.css` rather than new implementations.
- **Heroes**: `120px 0 80px` padding, standardized gradient backgrounds.
- Page stylesheets extend `styles.css`; check for an existing token or component before adding one.

## Accessibility Conventions

The site went through a full WCAG AA audit across all 159 pages; these patterns are load-bearing, not decorative.

- **Skip link + landmark**: every page has `<a href="#main-content" class="skip-link">` (from the nav include) and an element with `id="main-content"`. All 159 pages currently satisfy this.
- **Contrast**: AA (4.5:1) for body text everywhere — see the token table above.
- **Reduced motion**: `styles.css` has `prefers-reduced-motion` blocks; new animations need to respect them.
- **Nav semantics**: dropdown triggers are `<button>` with `aria-expanded`/`aria-haspopup`/`aria-controls`; the hamburger carries `aria-label` + `aria-expanded`; decorative glyphs are `aria-hidden`.
- **CLS**: images carry explicit `width`/`height`; the include injection is synchronous specifically to avoid a layout jump.
- **Scrollable regions**: handled at runtime by `makeScrollRegionsFocusable()` — do not hand-add `tabindex`/`role="region"` to `pre`/`table` elements.
- **Heading order** and unique landmark names are enforced; keep `h1 → h2 → h3` sequential when adding sections.

## SEO and AEO

- **Meta**: full Open Graph + X Card set, canonical URL, geo meta, and AI-specific meta (`ai-content-type`, `ai-description`, `chatgpt-guidance`, `ai-expertise`) on the main pages.
- **Structured data**: multiple `application/ld+json` blocks per page (Organization, Service, FAQPage, Article…).
- **Hreflang**: Italian pages declare `it`, `it-IT`, `en` (→ `/en/…`) and `x-default`; English pages mirror it.
- **Sitemaps**: `sitemap.xml` (148 URLs) and `en/sitemap.xml` (23 URLs) are hand-maintained — **add new pages manually**.
- **`robots.txt`** explicitly allows AI crawlers (GPTBot, ChatGPT-User, Google-Extended, PerplexityBot, ClaudeBot, anthropic-ai, CCBot, cohere-ai, Meta-ExternalAgent, YouBot, Bytespider) and disallows `/quiz-data/`.
- **`llms.txt` and `llm.txt` are byte-identical copies** at the root (plus `en/llms.txt`). Edit both — they are the AEO summary of services, products, articles and contacts.

## Content Systems

- **Quizzes**: `quiz-data/*.json` (`ai-seo`, `generazione-immagini-ai`, `generazione-video-ai`, `umanizzare-testi-ai`) drive `certification.js`. Each file carries metadata, questions, passing score and time limit. Disallowed in `robots.txt` so answers aren't indexed.
- **Articles**: `articolo-<slug>.html`, self-contained, Italian, heavy on structured data. Illustrated ones add `article-visuals.css` and keep images in `img/articles/<slug>/`.
- **Books/funnels**: `books/<book-slug>/` companion pages sharing `books.css` and the English nav include.
- **Images**: `img/` — organized by purpose (`img/articles/<slug>/`, `img/storia/` + `img/storia/vid/` for the chi-siamo scroll-world, `img/agents/`, `img/eventi/`). Mix of PNG/JPG/WebP/MP4/WebM; always give `alt`, `width` and `height`.
- **Language**: Italian (`lang="it"`) is the primary market; `/en/` is a partial mirror, not a full translation.

## Adding a New Page — Checklist

1. Copy the `<head>` block from a comparable page: GTM snippet first, Consent Mode defaults, meta/OG/canonical/hreflang, favicons, `styles.css?v=…`.
2. Add `<div id="nav-placeholder">`, an element with `id="main-content"`, and `<div id="footer-placeholder">`.
3. Load the **correct** nav include for the page family (Italian vs English/funnel — see the table above).
4. Load `script.js`, the include, `cookie-banner.js`, and `conversion-tracking.js` **if the page has a Web3Forms form**.
5. Use existing tokens and components; no new hexes or font names.
6. Register the page in `sitemap.xml` (or `en/sitemap.xml`), and in `llms.txt` **and** `llm.txt` if it matters for AEO.
7. Add nav/footer links in both include files when the page belongs in the menus.
8. Run `python3 -m unittest discover -s tests`.

## GitHub Actions

- `github-pages.yml` — deploy on push to `master`/`main` (+ `workflow_dispatch`). Note: `upload-pages-artifact` only excludes `.git` and `.github`, so the workflow explicitly runs `rm -rf .claude` before packaging. **Anything else at the repo root ships to the live site** — keep local notes and audit artifacts out (`.gitignore` already covers `WEBSITE_AUDIT_REPORT.md`, `PRODUCT.md`, screenshots, `.audit/`, …).
- `claude.yml` — responds to `@claude` mentions in issues/PR comments.
- `claude-code-review.yml` — automatic review on PR open/synchronize.

## Local Tooling

`.claude/skills/impeccable/` is a local design/UI-audit skill (Node scripts for contrast and anti-pattern detection, live browser iteration). It is developer tooling only and is stripped from the Pages artifact — never link to it from a page.

## External API References

Reference material for client work; none of these APIs are called from this site's code.

### OpenAI
- **Realtime API (GA)**: model `gpt-realtime`; sessions up to 60 min; 32,768-token window, 4,096-token max response; WebRTC, WebSocket and SIP. The Realtime **Beta** was deprecated on 27 February 2026.
- **Assistants API**: sunsets **26 August 2026** — migrate to the Responses API + Conversations API.
- **GPT-5 family**: `gpt-5`, `gpt-5-mini`, `gpt-5-nano`; supports minimal reasoning effort for fast responses.
- **Connectors** (MCP wrappers for Google apps, Dropbox, … via the Responses API) and **saved prompts** reusable across Realtime sessions.

### Firecrawl
Web Data API that converts sites into LLM-ready markdown or structured data. Endpoints: `/scrape`, `/crawl`, `/map`, `/search`, `/extract`. SDKs: `firecrawl-py`, `firecrawl-js`, Go, Rust, REST.

```python
from firecrawl import Firecrawl
app = Firecrawl(api_key="fc-YOUR_API_KEY")
result = app.scrape('example.com')
```

Handles JS-heavy and protected pages, waits for dynamic content, parses PDFs/DOCX/HTML, respects `robots.txt`, and supports interactive actions (click, scroll, type, wait).

## Important Development Instructions
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- always commit and push changes
