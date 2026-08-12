/**
 * Render content/articles/<slug>.md into articolo-<slug>.html.
 *
 * Every AEO signal on a generated page -- the schema, the canonical, the
 * breadcrumb, the FAQ, the table of contents, the Person author -- is derived
 * from the content record here. None of it is authored by hand, so none of it
 * can drift between articles or be forgotten on a new one.
 *
 * Usage:
 *   node build/build.mjs              render every article
 *   node build/build.mjs <slug> ...   render only these
 *   node build/build.mjs --check      render to memory and diff against disk
 *
 * --check exits non-zero if any generated page differs from what is committed,
 * which is what keeps "commit the generated HTML" honest in CI.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse as parseYaml, parseFrontMatter } from './yaml.mjs';
import { renderBody, renderInline, escapeHtml, smartQuotes } from './markdown.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const INDENT = '    ';

const attr = (value) => escapeHtml(String(value ?? '')).replace(/"/g, '&quot;');
const stripTags = (html) => html.replace(/<[^>]+>/g, '');

/** JSON-LD in one house style, so no article's schema is formatted differently. */
const jsonld = (value, indent = INDENT) => {
  const body = JSON.stringify(value, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : `${indent}${line}`))
    .join('\n');
  return `${indent}<script type="application/ld+json">\n${indent}${body}\n${indent}</script>`;
};

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/**
 * Keys whose values are identifiers, URLs or lookup labels, and so must survive
 * the typographic pass byte-for-byte.
 */
const LITERAL_KEYS = new Set([
  'slug', 'lang', 'type', 'published', 'modified', 'author', 'reviewed_by',
  'url', 'src', 'href', 'id', 'same_as', 'w', 'h', 'visuals', 'canonical',
  'primary_href', 'secondary_href', 'breadcrumb', 'keywords', 'markdown',
  'gtm_id', 'logo', 'locale', 'robots', 'breadcrumbs', 'assets',
]);

/**
 * Normalise ASCII quotes to Italian typographic quotes once, at load time.
 *
 * Doing it here rather than in each renderer is what makes rule AEO-01 hold by
 * construction: the visible FAQ and the FAQPage schema read the same already
 * normalised string, so they cannot disagree about punctuation.
 */
export function applyTypography(value, key = null) {
  if (typeof value === 'string') return key && LITERAL_KEYS.has(key) ? value : smartQuotes(value);
  if (Array.isArray(value)) {
    return key && LITERAL_KEYS.has(key) ? value : value.map((item) => applyTypography(item, key));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, LITERAL_KEYS.has(k) ? v : applyTypography(v, k)]),
    );
  }
  return value;
}

export function loadSite() {
  return applyTypography(parseYaml(readFileSync(join(CONTENT, 'site.yml'), 'utf8')));
}

export function loadAuthors() {
  const dir = join(CONTENT, 'authors');
  if (!existsSync(dir)) return {};
  const authors = {};
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
    const record = applyTypography(parseYaml(readFileSync(join(dir, file), 'utf8')));
    authors[record.id ?? file.replace(/\.yml$/, '')] = record;
  }
  return authors;
}

export function loadArticles(slugs = null) {
  const dir = join(CONTENT, 'articles');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .filter((slug) => !slugs || slugs.includes(slug))
    .sort()
    .map((slug) => {
      const { data, body } = parseFrontMatter(readFileSync(join(dir, `${slug}.md`), 'utf8'));
      if (data.slug && data.slug !== slug) {
        throw new Error(`${slug}.md declares slug: ${data.slug}; they must match`);
      }
      return { ...applyTypography(data), slug, markdown: body };
    });
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

const personSchema = (author) => ({
  '@type': 'Person',
  name: author.name,
  url: author.url,
  jobTitle: author.job_title,
  ...(author.same_as?.length ? { sameAs: author.same_as } : {}),
  ...(author.knows_about?.length ? { knowsAbout: author.knows_about } : {}),
});

function readingTime(article, sections, site) {
  if (article.reading_time) return article.reading_time;
  const words = [
    article.quick_answer ?? '',
    ...sections.map((s) => stripTags(s.html)),
    ...(article.faq ?? []).flatMap((f) => [f.q, f.a]),
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const wpm = site.defaults?.reading_time_wpm ?? 200;
  return `${Math.max(1, Math.round(words / wpm))} minuti di lettura`;
}

function breadcrumbTrail(article, site) {
  const labels = article.breadcrumb?.length ? article.breadcrumb : ['Home', 'Ricerca'];
  const trail = labels.map((label) => {
    const path = site.breadcrumbs?.[label];
    if (path === undefined) throw new Error(`${article.slug}: unknown breadcrumb ${JSON.stringify(label)}`);
    // The home page is "" in site.yml so its canonical URL stays https://niuexa.ai/
    return { label, href: path === '' ? '/' : path, url: `${site.site.url}/${path}` };
  });
  trail.push({
    label: article.breadcrumb_label ?? article.title,
    href: `articolo-${article.slug}.html`,
    url: `${site.site.url}/articolo-${article.slug}.html`,
    current: true,
  });
  return trail;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderHeadMeta(article, ctx) {
  const { site, url, ogImage } = ctx;
  const lines = [
    `${INDENT}<title>${escapeHtml(article.meta_title ?? `${article.title} | ${site.site.name}`)}</title>`,
    `${INDENT}<meta name="description" content="${attr(article.description)}">`,
  ];
  if (article.keywords?.length) {
    lines.push(`${INDENT}<meta name="keywords" content="${attr(article.keywords.join(', '))}">`);
  }
  lines.push(
    `${INDENT}<meta name="author" content="${attr(ctx.author.name)}">`,
    `${INDENT}<meta name="robots" content="${attr(site.defaults.robots)}">`,
    '',
    `${INDENT}<meta property="og:type" content="article">`,
    `${INDENT}<meta property="og:url" content="${url}">`,
    `${INDENT}<meta property="og:title" content="${attr(article.og_title ?? article.h1 ?? article.title)}">`,
    `${INDENT}<meta property="og:description" content="${attr(article.og_description ?? article.description)}">`,
  );
  if (ogImage) {
    lines.push(
      `${INDENT}<meta property="og:image" content="${site.site.url}/${ogImage.src}">`,
      `${INDENT}<meta property="og:image:width" content="${ogImage.w}">`,
      `${INDENT}<meta property="og:image:height" content="${ogImage.h}">`,
      `${INDENT}<meta property="og:image:alt" content="${attr(ogImage.alt)}">`,
    );
  }
  lines.push(
    `${INDENT}<meta property="og:locale" content="${site.site.locale}">`,
    `${INDENT}<meta property="article:published_time" content="${article.published}">`,
    `${INDENT}<meta property="article:modified_time" content="${article.modified ?? article.published}">`,
    `${INDENT}<meta property="article:author" content="${attr(ctx.author.name)}">`,
    `${INDENT}<meta property="article:section" content="${attr(article.section)}">`,
    '',
    `${INDENT}<meta name="twitter:card" content="summary_large_image">`,
    `${INDENT}<meta name="twitter:title" content="${attr(article.twitter_title ?? article.og_title ?? article.h1 ?? article.title)}">`,
    `${INDENT}<meta name="twitter:description" content="${attr(article.twitter_description ?? article.og_description ?? article.description)}">`,
  );
  if (ogImage) {
    lines.push(
      `${INDENT}<meta name="twitter:image" content="${site.site.url}/${ogImage.src}">`,
      `${INDENT}<meta name="twitter:image:alt" content="${attr(ogImage.alt)}">`,
    );
  }
  return lines.join('\n');
}

function renderHeadLinks(article, ctx) {
  const { site, url } = ctx;
  const a = site.assets;
  const lines = [
    `${INDENT}<link rel="canonical" href="${article.canonical ?? url}">`,
    `${INDENT}<link rel="alternate" hreflang="it" href="${url}">`,
    `${INDENT}<link rel="alternate" hreflang="it-it" href="${url}">`,
    `${INDENT}<link rel="alternate" hreflang="x-default" href="${url}">`,
    `${INDENT}<link rel="icon" type="image/x-icon" href="img/favicon 256.ico">`,
    `${INDENT}<link rel="manifest" href="site.webmanifest">`,
    `${INDENT}<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `${INDENT}<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `${INDENT}<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`,
    `${INDENT}<link rel="stylesheet" href="styles.css?v=${a.styles_css}">`,
    `${INDENT}<link rel="stylesheet" href="tutorial.css?v=${a.tutorial_css}">`,
  ];
  if (article.visuals) {
    lines.push(`${INDENT}<link rel="stylesheet" href="article-visuals.css?v=${a.article_visuals_css}">`);
  }
  return lines.join('\n');
}

function renderSchema(article, ctx) {
  const { site, url, ogImage, trail } = ctx;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': article.type ?? 'Article',
    headline: article.h1 ?? article.title,
    description: article.description,
    author: personSchema(ctx.author),
    publisher: {
      '@type': 'Organization',
      name: site.publisher.name,
      url: site.publisher.url,
      logo: { '@type': 'ImageObject', url: site.publisher.logo },
    },
    datePublished: article.published,
    dateModified: article.modified ?? article.published,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(ogImage ? { image: [`${site.site.url}/${ogImage.src}`] } : {}),
    articleSection: article.section,
    ...(article.keywords?.length ? { keywords: article.keywords } : {}),
    inLanguage: `${site.site.lang}-${site.site.lang.toUpperCase()}`,
    ...(ctx.reviewer ? { reviewedBy: personSchema(ctx.reviewer) } : {}),
    ...(article.sources?.length
      ? {
          citation: article.sources.map((s) => ({
            '@type': 'CreativeWork',
            name: s.title,
            url: s.url,
            ...(s.publisher ? { publisher: { '@type': 'Organization', name: s.publisher } } : {}),
          })),
        }
      : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.tutorial-description', '.quick-answer'],
    },
  };

  const blocks = [jsonld(articleSchema)];

  // The FAQ schema and the visible FAQ are rendered from the same faq[] list,
  // so they cannot disagree (rule AEO-01).
  if (article.faq?.length) {
    blocks.push(
      jsonld({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    );
  }

  blocks.push(
    jsonld({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.label,
        item: crumb.url,
      })),
    }),
  );

  return blocks.join('\n');
}

function renderHeader(article, ctx) {
  const pad = ' '.repeat(8);
  const trail = ctx.trail;
  const crumbs = trail
    .map((crumb) =>
      crumb.current
        ? `<span>${escapeHtml(crumb.label)}</span>`
        : `<a href="${crumb.href}">${escapeHtml(crumb.label)}</a>`,
    )
    .join(' / ');
  const stats = [ctx.readingTime, article.audience, article.format]
    .filter(Boolean)
    .map((s) => `<span class="stat">${escapeHtml(s)}</span>`)
    .join('');
  return [
    `${pad}<section class="tutorial-header"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb">${crumbs}</nav><div class="tutorial-intro">`,
    `${pad}${INDENT}<div class="tutorial-badge">${escapeHtml(article.badge ?? article.section)}</div>`,
    `${pad}${INDENT}<h1>${renderInline(article.h1 ?? article.title)}</h1>`,
    `${pad}${INDENT}<p class="tutorial-description">${renderInline(article.standfirst ?? article.description)}</p>`,
    `${pad}${INDENT}<div class="tutorial-stats">${stats}</div>`,
    `${pad}</div></div></section>`,
  ].join('\n');
}

function renderToc(sections, faqAnchor) {
  const pad = ' '.repeat(12);
  const entries = [...sections.map((s) => ({ anchor: s.anchor, title: s.title }))];
  if (faqAnchor) entries.push({ anchor: faqAnchor.anchor, title: faqAnchor.title });
  const items = entries
    .map((e) => `${pad}${INDENT}${INDENT}<li><a href="#${e.anchor}">${escapeHtml(e.title)}</a></li>`)
    .join('\n');
  return [
    `${pad}<nav class="article-toc" aria-labelledby="article-toc-heading">`,
    `${pad}${INDENT}<h2 id="article-toc-heading">Indice</h2>`,
    `${pad}${INDENT}<ul>`,
    items,
    `${pad}${INDENT}</ul>`,
    `${pad}</nav>`,
  ].join('\n');
}

function renderQuickAnswer(article) {
  const pad = ' '.repeat(12);
  const heading = article.quick_answer_heading ?? `Risposta rapida: ${article.title.toLowerCase()}`;
  return [
    `${pad}<section class="content-section quick-answer">`,
    `${pad}${INDENT}<h2 id="risposta-rapida">${escapeHtml(heading)}</h2>`,
    `${pad}${INDENT}<p>${renderInline(article.quick_answer.trim())}</p>`,
    `${pad}</section>`,
  ].join('\n');
}

function renderHero(hero) {
  const pad = ' '.repeat(12);
  const caption = hero.caption ? `<figcaption>${renderInline(hero.caption)}</figcaption>` : '';
  return (
    `${pad}<figure class="article-visual article-visual-hero">` +
    `<img src="${hero.src}" alt="${attr(hero.alt)}" width="${hero.w}" height="${hero.h}" ` +
    `loading="eager" decoding="async">${caption}</figure>`
  );
}

function renderSources(article) {
  const pad = ' '.repeat(12);
  const items = article.sources
    .map((s) => {
      const external = /^https?:\/\//.test(s.url) && !s.url.includes('niuexa.ai');
      const rel = external ? ' target="_blank" rel="noopener"' : '';
      const note = s.note ? `, ${renderInline(s.note)}` : '';
      return `${pad}${INDENT}${INDENT}<li><a href="${s.url}"${rel}>${escapeHtml(s.title)}</a>${note}</li>`;
    })
    .join('\n');
  return [
    `${pad}<section class="content-section">`,
    `${pad}${INDENT}<h2 id="fonti">Fonti e perimetro</h2>`,
    `${pad}${INDENT}<p>${renderInline(article.sources_intro ?? 'Questo contenuto è informato dalle fonti seguenti:')}</p>`,
    `${pad}${INDENT}<ul>`,
    items,
    `${pad}${INDENT}</ul>`,
    ...(article.sources_disclaimer
      ? [`${pad}${INDENT}<p>${renderInline(article.sources_disclaimer)}</p>`]
      : []),
    `${pad}</section>`,
  ].join('\n');
}

function renderFaq(article, anchor) {
  const pad = ' '.repeat(12);
  const items = article.faq
    .map(
      (item) =>
        `${pad}${INDENT}<div class="faq-item"><h3>${escapeHtml(item.q)}</h3><p>${renderInline(item.a)}</p></div>`,
    )
    .join('\n');
  return [
    `${pad}<section class="content-section faq-section">`,
    `${pad}${INDENT}<h2 id="${anchor.anchor}">${escapeHtml(anchor.title)}</h2>`,
    items,
    `${pad}</section>`,
  ].join('\n');
}

function renderRelated(article, ctx) {
  const pad = ' '.repeat(12);
  const cards = article.related
    .map((entry) => {
      const card = ctx.resolveRelated(entry);
      return (
        `${pad}${INDENT}<a href="${card.href}" class="related-card">` +
        `<span class="related-category">${escapeHtml(card.category)}</span>` +
        `<h3>${escapeHtml(card.title)}</h3></a>`
      );
    })
    .join('\n');
  return [
    `${pad}<section class="content-section"><h2 id="approfondimenti">Approfondimenti correlati</h2><div class="related-articles">`,
    cards,
    `${pad}</div></section>`,
  ].join('\n');
}

function renderCta(article, site) {
  const pad = ' '.repeat(8);
  const cta = { ...site.defaults.cta, ...(article.cta ?? {}) };
  return (
    `${pad}<section class="cta-section"><div class="container">` +
    `<h2 id="cta">${escapeHtml(cta.heading)}</h2><p>${renderInline(cta.body)}</p>` +
    `<a href="${cta.primary_href}" class="btn btn-primary">${escapeHtml(cta.primary_label)}</a>` +
    `<a href="${cta.secondary_href}" class="btn btn-secondary" style="margin-left:15px;">${escapeHtml(cta.secondary_label)}</a>` +
    `</div></section>`
  );
}

// ---------------------------------------------------------------------------
// Page assembly
// ---------------------------------------------------------------------------

export function renderArticle(article, { site, authors, allArticles = [] }) {
  const url = `${site.site.url}/articolo-${article.slug}.html`;
  const author = authors[article.author];
  if (!author) {
    throw new Error(`${article.slug}: unknown author ${JSON.stringify(article.author)}`);
  }
  const reviewer = article.reviewed_by ? authors[article.reviewed_by] : null;
  if (article.reviewed_by && !reviewer) {
    throw new Error(`${article.slug}: unknown reviewer ${JSON.stringify(article.reviewed_by)}`);
  }

  const sections = renderBody(article.markdown, { slug: article.slug });
  const ogImage = article.og_image ?? null;
  const trail = breadcrumbTrail(article, site);
  const faqAnchor = article.faq?.length
    ? { anchor: 'faq', title: article.faq_heading ?? `FAQ su ${article.title.toLowerCase()}` }
    : null;

  const byTitle = new Map(allArticles.map((a) => [a.slug, a]));
  const resolveRelated = (entry) => {
    if (typeof entry !== 'string') return entry;
    const target = byTitle.get(entry);
    if (!target) {
      throw new Error(`${article.slug}: related slug ${JSON.stringify(entry)} has no content record`);
    }
    return {
      href: `articolo-${target.slug}.html`,
      category: target.badge ?? target.section,
      title: target.title,
    };
  };

  const ctx = {
    site,
    url,
    author,
    reviewer,
    ogImage,
    sections,
    trail,
    resolveRelated,
    readingTime: readingTime(article, sections, site),
  };

  const body = [
    ...(article.hero ? [renderHero(article.hero)] : []),
    renderToc(
      [
        ...(article.quick_answer ? [{ anchor: 'risposta-rapida', title: 'Risposta rapida' }] : []),
        ...sections,
      ],
      faqAnchor,
    ),
    ...(article.quick_answer ? [renderQuickAnswer(article)] : []),
    ...sections.map((s) => s.html),
    ...(article.sources?.length ? [renderSources(article)] : []),
    ...(faqAnchor ? [renderFaq(article, faqAnchor)] : []),
    ...(article.related?.length ? [renderRelated(article, ctx)] : []),
  ].join('\n\n');

  const template = readFileSync(join(ROOT, 'templates', 'article.html'), 'utf8');
  return template
    .replaceAll('{{LANG}}', article.lang ?? site.site.lang)
    .replaceAll('{{GTM_ID}}', site.analytics.gtm_id)
    .replaceAll('{{INCLUDES_V}}', site.assets.includes_js)
    .replaceAll('{{COOKIE_BANNER_V}}', site.assets.cookie_banner_js)
    .replace('{{HEAD_META}}', renderHeadMeta(article, ctx))
    .replace('{{HEAD_LINKS}}', renderHeadLinks(article, ctx))
    .replace('{{HEAD_SCHEMA}}', renderSchema(article, ctx))
    .replace('{{HEADER}}', renderHeader(article, ctx))
    .replace('{{BODY}}', body)
    .replace('{{CTA}}', renderCta(article, site));
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function build({ slugs = null, check = false } = {}) {
  const site = loadSite();
  const authors = loadAuthors();
  const allArticles = loadArticles();
  const targets = slugs ? allArticles.filter((a) => slugs.includes(a.slug)) : allArticles;

  const changed = [];
  for (const article of targets) {
    const html = renderArticle(article, { site, authors, allArticles });
    const out = join(ROOT, `articolo-${article.slug}.html`);
    const existing = existsSync(out) ? readFileSync(out, 'utf8') : null;
    if (existing === html) continue;
    changed.push(article.slug);
    if (!check) writeFileSync(out, html, 'utf8');
  }
  return { rendered: targets.map((a) => a.slug), changed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const slugs = args.filter((a) => !a.startsWith('-'));
  try {
    const { rendered, changed } = build({ slugs: slugs.length ? slugs : null, check });
    if (check) {
      if (changed.length) {
        console.error(
          `Generated HTML is out of date for ${changed.length} article(s):\n  ${changed.join('\n  ')}\n` +
            'Run: node build/build.mjs',
        );
        process.exit(1);
      }
      console.log(`${rendered.length} article(s) match their committed HTML.`);
    } else {
      console.log(
        `Rendered ${rendered.length} article(s); ${changed.length} written` +
          (changed.length ? `:\n  ${changed.join('\n  ')}` : '.'),
      );
    }
  } catch (error) {
    console.error(`build failed: ${error.message}`);
    process.exit(1);
  }
}
