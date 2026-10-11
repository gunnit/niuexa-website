// Recognize only Cloudflare Fonts' link -> inline @font-face transformation.
// Everything outside those exact source-link positions remains byte-identical.
const tokens = /<!--[\s\S]*?-->|<(script|style|noscript|textarea|title|template)\b[^>]*>[\s\S]*?<\/\1\s*>|<link\b[^>]*>/gi;

function attributes(tag) {
  const attrs = new Map();
  const body = tag.replace(/^<link\b/i, '').replace(/\/?\s*>$/, '');
  const pattern = /\s+([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`=]+)))?/gy;
  let offset = 0, match;
  while ((match = pattern.exec(body))) {
    const name = match[1].toLowerCase();
    if (attrs.has(name)) return null;
    attrs.set(name, (match[2] ?? match[3] ?? match[4] ?? '').replace(/&amp;/g, '&'));
    offset = pattern.lastIndex;
  }
  return body.slice(offset).trim() ? null : attrs;
}

function requestFonts(href) {
  let url;
  try { url = new URL(href); } catch { return null; }
  if (url.origin !== 'https://fonts.googleapis.com' || url.pathname !== '/css2' || url.hash) return null;
  if ([...url.searchParams.keys()].some(key => !['family', 'display'].includes(key))) return null;
  const display = url.searchParams.get('display') || 'auto';
  if (!['auto', 'block', 'swap', 'fallback', 'optional'].includes(display)) return null;
  const faces = new Map();
  for (const family of url.searchParams.getAll('family')) {
    // Fail closed for axes/queries we have not verified with this site's Fonts output.
    const match = /^([A-Za-z][A-Za-z0-9 ]*):wght@([1-9]\d{0,2}(?:;[1-9]\d{0,2})*)$/.exec(family);
    if (!match) return null;
    for (const weight of match[2].split(';')) faces.set(`${match[1]}:${weight}`, match[1].toLowerCase().replaceAll(' ', '-'));
  }
  return faces.size ? { faces, display } : null;
}

function fontPaths(css, request) {
  const paths = new Set(), seen = new Set();
  const blocks = [...css.matchAll(/@font-face\s*\{([^{}]*)\}/g)];
  if (!blocks.length || css.replace(/@font-face\s*\{[^{}]*\}/g, '').trim()) return null;
  for (const [, block] of blocks) {
    const declarations = new Map();
    for (const part of block.split(';').map(x => x.trim()).filter(Boolean)) {
      const match = /^([a-z-]+)\s*:\s*(.+)$/.exec(part);
      if (!match || declarations.has(match[1])) return null;
      declarations.set(match[1], match[2].trim());
    }
    const keys = ['font-family', 'font-style', 'font-weight', 'src', 'unicode-range', 'font-display'];
    if (declarations.size !== keys.length || keys.some(key => !declarations.has(key))) return null;
    const family = /^(['"])([A-Za-z][A-Za-z0-9 ]*)\1$/.exec(declarations.get('font-family'))?.[2];
    const face = `${family}:${declarations.get('font-weight')}`;
    const slug = request.faces.get(face);
    if (!slug || declarations.get('font-style') !== 'normal' || declarations.get('font-display') !== request.display) return null;
    const source = /^url\((\/cf-fonts\/v\/([a-z0-9-]+)\/\d+\.\d+\.\d+\/([a-z][a-z0-9-]*)\/wght\/normal\.woff2)\)$/.exec(declarations.get('src'));
    if (!source || source[2] !== slug) return null;
    const ranges = declarations.get('unicode-range').split(',').map(x => x.trim());
    if (!ranges.every(range => /^U\+[0-9A-F?]{1,6}(?:-[0-9A-F]{1,6})?$/.test(range))) return null;
    // Every requested face must include the Latin glyphs used on this site.
    if (source[3] === 'latin' && ranges.includes('U+0000-00FF')) seen.add(face);
    paths.add(source[1]);
  }
  return seen.size === request.faces.size ? [...paths] : null;
}

export function compareHostedContent(expected, actual, cloudflareFonts = false) {
  if (!expected || !actual) return { matches: false, fontPaths: [] };
  if (expected.equals(actual)) return { matches: true, fontPaths: [] };
  if (!cloudflareFonts) return { matches: false, fontPaths: [] };
  const source = expected.toString('utf8'), delivered = actual.toString('utf8');
  if (!Buffer.from(source).equals(expected) || !Buffer.from(delivered).equals(actual)) return { matches: false, fontPaths: [] };
  let offset = 0, deliveredOffset = 0;
  const paths = new Set();
  for (const token of source.matchAll(tokens)) {
    if (!/^<link\b/i.test(token[0])) continue;
    const attrs = attributes(token[0]);
    if (!attrs) continue;
    const href = attrs.get('href'), rel = attrs.get('rel');
    const preconnect = rel === 'preconnect' && /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/?$/.test(href);
    const request = rel === 'stylesheet' ? requestFonts(href) : null;
    if (!preconnect && !request) continue;
    const unchanged = source.slice(offset, token.index);
    if (!delivered.startsWith(unchanged, deliveredOffset)) return { matches: false, fontPaths: [] };
    deliveredOffset += unchanged.length;
    if (delivered.startsWith(token[0], deliveredOffset)) {
      deliveredOffset += token[0].length; // Cloudflare may keep a source link.
    } else if (!preconnect) {
      const replacement = /^<style type="text\/css">([^<]*)<\/style>/.exec(delivered.slice(deliveredOffset));
      const found = replacement && fontPaths(replacement[1], request);
      if (!found) return { matches: false, fontPaths: [] };
      for (const path of found) paths.add(path);
      deliveredOffset += replacement[0].length;
    }
    offset = token.index + token[0].length;
  }
  if (delivered.slice(deliveredOffset) !== source.slice(offset)) return { matches: false, fontPaths: [] };
  // Removing only preconnects, or a stylesheet with no valid replacement, is not
  // proof of the expected transformation.
  return { matches: paths.size > 0, fontPaths: [...paths] };
}
