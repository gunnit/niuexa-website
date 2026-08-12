/**
 * A Markdown subset renderer that emits the markup this site already uses.
 *
 * This is deliberately not a general Markdown implementation. It renders the
 * constructs the article corpus actually contains, into the exact classes and
 * indentation the hand-written articles use, so a generated page diffs cleanly
 * against the original it replaces.
 *
 * Supported: ## / ### / #### headings, paragraphs, - and 1. lists, GFM pipe
 * tables, **strong**, *em*, `code`, [links](url), and two block directives:
 *
 *   :::figure src="..." alt="..." width="1200" height="630" class="..."
 *   Caption text.
 *   :::
 *
 *   :::html
 *   <arbitrary markup />
 *   :::
 *
 * The :::html directive is the documented escape hatch for the handful of
 * articles that will not round-trip through a template.
 */

const INDENT = '    ';

/** Escape HTML, leaving existing character entities intact. */
export function escapeHtml(text) {
  return text
    .replace(/&(?![a-zA-Z#][a-zA-Z0-9]*;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’“”'"]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/** Parse `key="value"` pairs off a directive's opening line. */
function directiveAttrs(line) {
  const attrs = {};
  for (const [, key, value] of line.matchAll(/([a-z_-]+)="([^"]*)"/g)) {
    attrs[key] = value;
  }
  return attrs;
}

/**
 * Italian typographic quotes, matching the punctuation the corpus already uses.
 *
 * Authors type ASCII quotes; the reader should always get the same curly ones,
 * so this is derived rather than left to whoever is writing that day. Run only
 * over prose: code spans and URLs are held aside by renderInline first.
 */
export function smartQuotes(text) {
  return text
    .replace(/(\w)'(\w)/g, '$1\u2019$2')
    .replace(/(^|[\s(\u00AB\u2014-])"/g, '$1\u201C')
    .replace(/"/g, '\u201D')
    .replace(/'/g, '\u2019');
}

export function renderInline(text) {
  let out = escapeHtml(text);

  // Hold code spans and link targets aside: neither is prose, so neither may
  // be touched by emphasis or by the typographic pass.
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\uE000${codes.length - 1}\uE000`;
  });
  const hrefs = [];
  out = out.replace(/\]\(([^)\s]+)\)/g, (_, href) => {
    hrefs.push(href);
    return `](\uE001${hrefs.length - 1}\uE001)`;
  });

  out = smartQuotes(out);

  out = out.replace(/\[([^\]]+)\]\(\uE001(\d+)\uE001\)/g, (_, label, i) => {
    const href = hrefs[Number(i)];
    const external = /^https?:\/\//.test(href) && !href.includes('niuexa.ai');
    const extra = external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${extra}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');

  return out.replace(/\uE000(\d+)\uE000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function renderTable(rows, indent) {
  const cells = (row) =>
    row
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const header = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  const lines = [
    `${indent}<table class="comparison-table">`,
    `${indent}${INDENT}<thead><tr>${header.map((c) => `<th>${renderInline(c)}</th>`).join('')}</tr></thead>`,
    `${indent}${INDENT}<tbody>`,
  ];
  for (const row of body) {
    lines.push(`${indent}${INDENT}${INDENT}<tr>${row.map((c) => `<td>${renderInline(c)}</td>`).join('')}</tr>`);
  }
  lines.push(`${indent}${INDENT}</tbody>`, `${indent}</table>`);
  return lines.join('\n');
}

function renderList(items, ordered, indent) {
  const tag = ordered ? 'ol' : 'ul';
  const lines = [`${indent}<${tag}>`];
  for (const item of items) {
    lines.push(`${indent}${INDENT}<li>${renderInline(item)}</li>`);
  }
  lines.push(`${indent}</${tag}>`);
  return lines.join('\n');
}

function renderFigure(attrs, caption, indent) {
  const classes = ['article-visual', ...(attrs.class ? attrs.class.split(/\s+/) : [])];
  const loading = attrs.loading ?? 'lazy';
  const parts = [
    `<img src="${attrs.src}" alt="${escapeHtml(attrs.alt ?? '')}"`,
    `width="${attrs.width}" height="${attrs.height}"`,
    `loading="${loading}" decoding="async">`,
  ].join(' ');
  const figcaption = caption ? `<figcaption>${renderInline(caption)}</figcaption>` : '';
  return `${indent}<figure class="${classes.join(' ')}">${parts}${figcaption}</figure>`;
}

/**
 * Render a Markdown body into `.content-section` blocks.
 *
 * Returns one entry per `##` heading: its text, a stable anchor, and the
 * rendered HTML of the section. Content before the first `##` is an error --
 * every article's body must start with a section heading so the table of
 * contents is complete.
 */
export function renderBody(markdown, { indent = ' '.repeat(12), slug = '' } = {}) {
  const lines = (markdown ?? '').replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  const anchors = new Set();
  let current = null;
  let buffer = [];

  const flushParagraph = () => {
    if (!buffer.length) return;
    const text = buffer.join(' ').trim();
    buffer = [];
    if (text && current) current.blocks.push(`${indent}${INDENT}<p>${renderInline(text)}</p>`);
  };

  const requireSection = (line, number) => {
    if (current) return;
    throw new Error(
      `${slug}: content before the first "## " heading at line ${number + 1}: ${JSON.stringify(line)}`,
    );
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      flushParagraph();
      const title = trimmed.slice(3).trim();
      let anchor = slugify(title);
      let suffix = 2;
      while (anchors.has(anchor)) anchor = `${slugify(title)}-${suffix++}`;
      anchors.add(anchor);
      current = { title, anchor, blocks: [], classes: ['content-section'] };
      sections.push(current);
      continue;
    }

    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      flushParagraph();
      requireSection(trimmed, i);
      const level = trimmed.startsWith('#### ') ? 4 : 3;
      const title = trimmed.slice(level + 1).trim();
      // A blank line before each subheading, matching the hand-written articles.
      const lead = current.blocks.length ? '\n' : '';
      current.blocks.push(`${lead}${indent}${INDENT}<h${level}>${renderInline(title)}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith(':::')) {
      flushParagraph();
      requireSection(trimmed, i);
      const kind = trimmed.slice(3).trim().split(/\s+/)[0];
      const opening = trimmed;
      const inner = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== ':::') {
        inner.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) throw new Error(`${slug}: unterminated ::: block opened at line ${i + 1}`);

      if (kind === 'figure') {
        current.blocks.push(
          renderFigure(directiveAttrs(opening), inner.join(' ').trim(), `${indent}${INDENT}`),
        );
      } else if (kind === 'html') {
        current.blocks.push(inner.map((l) => `${indent}${INDENT}${l.trim()}`).join('\n'));
      } else {
        throw new Error(`${slug}: unknown ::: directive ${JSON.stringify(kind)} at line ${i + 1}`);
      }
      continue;
    }

    if (/^\|/.test(trimmed)) {
      flushParagraph();
      requireSection(trimmed, i);
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        rows.push(lines[i].trim());
        i += 1;
      }
      i -= 1;
      if (rows.length < 3) throw new Error(`${slug}: table needs a header, a divider and a row`);
      current.blocks.push(renderTable(rows, `${indent}${INDENT}`));
      continue;
    }

    const bullet = trimmed.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      requireSection(trimmed, i);
      const ordered = /\d/.test(bullet[1]);
      const items = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        const match = next.match(/^([-*]|\d+\.)\s+(.*)$/);
        if (!match || /\d/.test(match[1]) !== ordered) break;
        items.push(match[2]);
        i += 1;
        // Allow a wrapped continuation line inside a list item.
        while (i < lines.length && lines[i].startsWith('  ') && lines[i].trim() && !/^([-*]|\d+\.)\s/.test(lines[i].trim())) {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i += 1;
        }
      }
      i -= 1;
      current.blocks.push(renderList(items, ordered, `${indent}${INDENT}`));
      continue;
    }

    requireSection(trimmed, i);
    buffer.push(trimmed);
  }
  flushParagraph();

  return sections.map((section) => ({
    title: section.title,
    anchor: section.anchor,
    html: [
      `${indent}<section class="${section.classes.join(' ')}">`,
      `${indent}${INDENT}<h2 id="${section.anchor}">${renderInline(section.title)}</h2>`,
      ...section.blocks,
      `${indent}</section>`,
    ].join('\n'),
  }));
}
