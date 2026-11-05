// Publish the existing browser include literals in the initial HTML too.
// This reads a deliberately restricted static format; it never runs browser JS.
import { createHash } from 'node:crypto';

const INCLUDE_PATHS = { it: 'includes/includes.js', en: 'en/includes/navigation-en.js' };
// Ignore comments and raw-text elements so example markup inside them is untouched.
const TOKENS = /<!--[\s\S]*?-->|<(script|style|noscript|textarea|title|template)\b[^>]*>[\s\S]*?<\/\1\s*>|<div\b[^>]*>\s*<\/div\s*>/gi;
function attributeMatch(tag, name) {
  let offset = tag.match(/^<[\w:-]+/)?.[0].length ?? tag.length;
  while (offset < tag.length) {
    const start = offset;
    while (/\s/.test(tag[offset] ?? '')) offset++;
    if (!tag[offset] || tag[offset] === '>' || tag.startsWith('/>', offset)) return null;
    const found = tag.slice(offset).match(/^[^\s=/>]+/);
    if (!found) throw new Error('Unsupported include HTML attribute');
    offset += found[0].length;
    while (/\s/.test(tag[offset] ?? '')) offset++;
    if (tag[offset] !== '=') continue; // Boolean attribute; no value to inspect.
    offset++;
    while (/\s/.test(tag[offset] ?? '')) offset++;
    const valueStart = offset, quote = ['"', "'"].includes(tag[offset]) ? tag[offset++] : null;
    const contentStart = offset;
    if (quote) {
      const end = tag.indexOf(quote, offset);
      if (end < 0) throw new Error('Unterminated include HTML attribute');
      offset = end;
    } else while (tag[offset] && !/[\s>]/.test(tag[offset])) offset++;
    const value = tag.slice(contentStart, offset).replaceAll('&amp;', '&');
    if (quote) offset++;
    if (found[0].toLowerCase() === name) return { index: start, end: offset, prefix: tag.slice(start, valueStart), value };
  }
  return null;
}
const attribute = (tag, name) => attributeMatch(tag, name)?.value ?? null;
const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

// Lex only: comments, quoted strings, regular expressions and whole template
// literals are single tokens. Literal-looking text inside them is never code.
// Ambiguous slash contexts fail closed rather than guessing at JavaScript syntax.
function scriptTokens(source, file) {
  const tokens = [];
  const expressionBefore = new Set(['=', '(', '[', '{', ',', ':', ';', '!', '?', '+', '-', '*', '%', '&', '|', '^', '~', '<', '>', 'return', 'throw', 'case', 'delete', 'void', 'typeof', 'yield', 'await']);
  let offset = 0;
  const fail = message => { throw new Error(`${file}: unsupported include script (${message})`); };
  function quoted(quote) {
    offset++;
    while (offset < source.length) {
      const char = source[offset++];
      if (char === '\\') offset++;
      else if (char === quote) return;
      else if (char === '\n' || char === '\r') fail('unterminated quoted string');
    }
    fail('unterminated quoted string');
  }
  function template() {
    offset++;
    while (offset < source.length) {
      const char = source[offset++];
      if (char === '\\') offset++;
      else if (char === '`') return;
      else if (char === '$' && source[offset] === '{') {
        offset++;
        let depth = 1, previous = null;
        while (depth) {
          const token = next(previous);
          if (!token) fail('unterminated template expression');
          if (token.value === '{') depth++;
          if (token.value === '}') depth--;
          previous = token;
        }
      }
    }
    fail('unterminated template literal');
  }
  function next(previous) {
    while (offset < source.length) {
      if (/\s/.test(source[offset])) { offset++; continue; }
      if (source.startsWith('//', offset)) { const end = source.indexOf('\n', offset + 2); offset = end < 0 ? source.length : end + 1; continue; }
      if (source.startsWith('/*', offset)) { const end = source.indexOf('*/', offset + 2); if (end < 0) fail('unterminated comment'); offset = end + 2; continue; }
      break;
    }
    if (offset >= source.length) return null;
    const start = offset, char = source[offset];
    if (char === '"' || char === "'") { quoted(char); return { kind: 'string', value: source.slice(start, offset) }; }
    if (char === '`') { template(); return { kind: 'template', value: source.slice(start, offset), body: source.slice(start + 1, offset - 1) }; }
    if (/[A-Za-z_$]/.test(char)) { offset++; while (/[\w$]/.test(source[offset] ?? '')) offset++; return { kind: 'identifier', value: source.slice(start, offset) }; }
    if (/\d/.test(char)) { offset++; while (/[\w.]/.test(source[offset] ?? '')) offset++; return { kind: 'number', value: source.slice(start, offset) }; }
    if (char === '/' && (!previous || expressionBefore.has(previous.value))) {
      offset++;
      let inClass = false, closed = false;
      while (offset < source.length) {
        const current = source[offset++];
        if (current === '\\') { offset++; continue; }
        if (current === '\n' || current === '\r') fail('unterminated regular expression');
        if (current === '[') inClass = true;
        if (current === ']') inClass = false;
        if (current === '/' && !inClass) { closed = true; break; }
      }
      if (!closed) fail('unterminated regular expression');
      while (/[A-Za-z]/.test(source[offset] ?? '')) offset++;
      return { kind: 'regexp', value: source.slice(start, offset) };
    }
    if (char === '/' && [')', '}'].includes(previous?.value)) fail('ambiguous slash after closing delimiter');
    offset++;
    return { kind: 'punctuation', value: char };
  }
  let token, previous = null;
  while ((token = next(previous))) { tokens.push(token); previous = token; }
  return tokens;
}

export function extractIncludeTemplates(source, file = 'include script') {
  const tokens = scriptTokens(source, file);
  const templates = {};
  for (const [name, key] of [['navigationHTML', 'navigation'], ['footerHTML', 'footer']]) {
    const declarations = [];
    let braces = 0, parentheses = 0;
    for (const [i, token] of tokens.entries()) {
      if (token.value === 'const' && tokens[i + 1]?.kind === 'identifier' && tokens[i + 1].value === name) declarations.push({ i, braces, parentheses });
      if (token.value === '{') braces++;
      if (token.value === '}') braces--;
      if (token.value === '(') parentheses++;
      if (token.value === ')') parentheses--;
    }
    const declaration = declarations[0];
    if (declarations.length !== 1 || declaration.braces !== 0 || declaration.parentheses !== 0 || tokens[declaration.i + 2]?.value !== '=' || tokens[declaration.i + 3]?.kind !== 'template' || tokens[declaration.i + 4]?.value !== ';') {
      throw new Error(`${file}: expected one static ${name} template`);
    }
    const value = tokens[declaration.i + 3].body;
    // Supporting interpolation or JS escape sequences would require evaluating JS.
    // Fail the build instead, so the browser and initial HTML cannot silently drift.
    if (value.includes('${') || value.includes('\\') || value.includes('`')) {
      throw new Error(`${file}: ${name} must contain literal HTML without interpolation or escapes`);
    }
    templates[key] = value;
  }
  return templates;
}

function stampedSource(src, stamp) {
  const hashAt = src.indexOf('#');
  const hash = hashAt < 0 ? '' : src.slice(hashAt);
  const plain = hashAt < 0 ? src : src.slice(0, hashAt);
  const queryAt = plain.indexOf('?');
  const path = queryAt < 0 ? plain : plain.slice(0, queryAt);
  const query = new URLSearchParams(queryAt < 0 ? '' : plain.slice(queryAt + 1));
  query.set('v', stamp);
  return path + '?' + query.toString() + hash;
}

export function createIncludeRenderer(readInclude) {
  const cache = new Map();
  return async function renderIncludes(html, file) {
    const tokens = [...html.matchAll(TOKENS)];
    const placeholders = tokens.flatMap(match => {
      if (!/^<div\b/i.test(match[0])) return [];
      const id = attribute(match[0].slice(0, match[0].indexOf('>') + 1), 'id');
      const kind = ['nav-placeholder', 'navigation-placeholder'].includes(id) ? 'navigation' : id === 'footer-placeholder' ? 'footer' : null;
      return kind ? [{ match, kind }] : [];
    });
    if (!placeholders.length) return html; // Standalone pages and small test fixtures need no include assets.
    for (const kind of ['navigation', 'footer']) {
      if (placeholders.filter(p => p.kind === kind).length > 1) throw new Error(`${file}: duplicate ${kind} placeholders`);
    }
    const lang = attribute(html.match(/<html\b[^>]*>/i)?.[0] ?? '', 'lang')?.toLowerCase().split('-')[0];
    if (!Object.hasOwn(INCLUDE_PATHS, lang)) throw new Error(`${file}: unsupported include language`);
    const base = new URL(file, 'https://niuexa.ai/');
    const scripts = tokens.flatMap(match => {
      if (!/^<script\b/i.test(match[0])) return [];
      const opening = match[0].slice(0, match[0].indexOf('>') + 1);
      const src = attribute(opening, 'src');
      if (!src) return [];
      const url = new URL(src, base);
      return url.origin === base.origin && Object.values(INCLUDE_PATHS).includes(url.pathname.slice(1)) ? [{ match, src, file: url.pathname.slice(1) }] : [];
    });
    if (scripts.length !== 1 || scripts[0].file !== INCLUDE_PATHS[lang]) throw new Error(`${file}: include script does not match ${lang} page language`);
    const script = scripts[0];
    if (!cache.has(script.file)) cache.set(script.file, Promise.resolve(readInclude(script.file)).then(source => ({
      templates: extractIncludeTemplates(source, script.file), stamp: createHash('sha256').update(source).digest('hex').slice(0, 12),
    })));
    const { templates, stamp } = await cache.get(script.file);
    const edits = placeholders.map(({ match, kind }) => {
      const opening = match[0].slice(0, match[0].indexOf('>'));
      const closing = match[0].match(/<\/div\s*>$/i)[0];
      return { start: match.index, end: match.index + match[0].length, value: `${opening} data-niuexa-static-include="${kind}">${templates[kind]}${closing}` };
    });
    const srcAttribute = attributeMatch(script.match[0].slice(0, script.match[0].indexOf('>') + 1), 'src');
    const refreshedScript = script.match[0].slice(0, srcAttribute.index) + `${srcAttribute.prefix}"${escapeAttribute(stampedSource(script.src, stamp))}"` + script.match[0].slice(srcAttribute.end);
    edits.push({ start: script.match.index, end: script.match.index + script.match[0].length, value: refreshedScript });
    for (const edit of edits.sort((a, b) => b.start - a.start)) html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
    return html;
  };
}
