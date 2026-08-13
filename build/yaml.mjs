/**
 * A YAML subset parser, sufficient for the content model and nothing more.
 *
 * The build stays dependency-free on purpose: CI has nothing to resolve and a
 * supply-chain problem cannot reach the publish path. The cost is that this
 * understands only the YAML the content model actually uses:
 *
 *   - block mappings and nested mappings
 *   - block sequences, including sequences of mappings
 *   - flow sequences of scalars, e.g. [a, b, c]
 *   - folded (>) and literal (|) block scalars, with the - chomp indicator
 *   - single- and double-quoted scalars, and the literals true/false/null
 *   - # comments, on their own line or after a value
 *
 * Anything outside that raises rather than guessing, so unsupported syntax
 * fails the build instead of silently losing content.
 */

class YamlError extends Error {
  constructor(message, line) {
    super(line === undefined ? message : `${message} (line ${line + 1})`);
    this.name = 'YamlError';
  }
}

const scan = (text) =>
  text.split(/\r?\n/).map((raw, index) => ({
    raw,
    index,
    indent: raw.match(/^ */)[0].length,
    body: raw.trim(),
  }));

const isBlank = (line) => line.body === '' || line.body.startsWith('#');

/** Strip a trailing comment that sits outside quotes. */
function stripComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '#' && (i === 0 || /\s/.test(value[i - 1]))) {
      return value.slice(0, i);
    }
  }
  return value;
}

/** Split a flow sequence body on commas that sit outside quotes. */
function splitFlow(value) {
  const parts = [];
  let current = '';
  let quote = null;
  for (const char of value) {
    if (quote) {
      current += char;
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
      current += char;
    } else if (char === ',') {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim() !== '') parts.push(current);
  return parts;
}

function parseScalar(raw, lineNumber) {
  const value = stripComment(raw).trim();
  if (value === '') return null;

  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new YamlError('unterminated flow sequence', lineNumber);
    return splitFlow(value.slice(1, -1)).map((part) => parseScalar(part, lineNumber));
  }
  if (value.startsWith('{')) {
    throw new YamlError('flow mappings are not supported; use a block mapping', lineNumber);
  }
  if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  if (value.startsWith("'") && value.endsWith("'") && value.length > 1) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return Number.parseFloat(value);
  return value;
}

class Parser {
  constructor(lines) {
    this.lines = lines;
    this.cursor = 0;
  }

  peek() {
    while (this.cursor < this.lines.length && isBlank(this.lines[this.cursor])) {
      this.cursor += 1;
    }
    return this.cursor < this.lines.length ? this.lines[this.cursor] : null;
  }

  /** Consume a > or | block scalar owned by a key at `parentIndent`. */
  blockScalar(marker, parentIndent) {
    const folded = marker.startsWith('>');
    const chomp = marker.includes('-');
    const collected = [];
    let blockIndent = null;

    while (this.cursor < this.lines.length) {
      const line = this.lines[this.cursor];
      if (line.body === '') {
        collected.push('');
        this.cursor += 1;
        continue;
      }
      if (line.indent <= parentIndent) break;
      if (blockIndent === null) blockIndent = line.indent;
      collected.push(line.raw.slice(blockIndent));
      this.cursor += 1;
    }

    while (collected.length && collected.at(-1) === '') collected.pop();
    if (!folded) return chomp ? collected.join('\n') : `${collected.join('\n')}\n`;

    // Folded: blank lines become paragraph breaks, everything else joins with
    // a single space.
    const paragraphs = collected
      .join('\n')
      .split(/\n{2,}/)
      .map((chunk) => chunk.split('\n').map((l) => l.trim()).join(' ').trim())
      .filter(Boolean);
    const text = paragraphs.join('\n\n');
    return chomp || text === '' ? text : `${text}\n`;
  }

  sequence(indent) {
    const items = [];
    for (;;) {
      const line = this.peek();
      if (!line || line.indent !== indent || !/^-(\s|$)/.test(line.body)) break;

      const content = line.body.slice(1).trim();
      if (content === '') {
        this.cursor += 1;
        items.push(this.node(indent + 1));
        continue;
      }

      // "- key: value" opens a mapping whose keys align after the dash.
      if (/^(?:"[^"]*"|'[^']*'|[^:#]+):(\s|$)/.test(content)) {
        const keyIndent = indent + 2;
        this.lines[this.cursor] = {
          ...line,
          indent: keyIndent,
          raw: ' '.repeat(keyIndent) + content,
          body: content,
        };
        items.push(this.mapping(keyIndent));
        continue;
      }

      this.cursor += 1;
      items.push(parseScalar(content, line.index));
    }
    return items;
  }

  mapping(indent) {
    const result = {};
    for (;;) {
      const line = this.peek();
      if (!line || line.indent !== indent) break;

      const match = line.body.match(/^("[^"]*"|'[^']*'|[^:#]+?):(?:\s+(.*))?$/);
      if (!match) {
        if (/^-(\s|$)/.test(line.body)) break;
        throw new YamlError(`cannot parse ${JSON.stringify(line.body)}`, line.index);
      }

      const key = parseScalar(match[1], line.index);
      const rest = (match[2] ?? '').trim();
      this.cursor += 1;

      if (/^[|>][-+]?$/.test(rest)) {
        result[key] = this.blockScalar(rest, indent);
      } else if (rest === '' || rest.startsWith('#')) {
        const next = this.peek();
        result[key] = next && next.indent > indent ? this.node(next.indent) : null;
      } else {
        result[key] = parseScalar(rest, line.index);
      }
    }
    return result;
  }

  node(indent) {
    const line = this.peek();
    if (!line) return null;
    return /^-(\s|$)/.test(line.body) ? this.sequence(line.indent) : this.mapping(indent);
  }
}

export function parse(text) {
  const parser = new Parser(scan(text ?? ''));
  const first = parser.peek();
  if (!first) return {};
  const value = parser.node(first.indent);
  const trailing = parser.peek();
  if (trailing) {
    throw new YamlError(`unexpected indentation at ${JSON.stringify(trailing.body)}`, trailing.index);
  }
  return value ?? {};
}

/** Split `---` front matter from the Markdown body that follows it. */
export function parseFrontMatter(text) {
  const match = text.match(/^﻿?(?:---\r?\n)?([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/);
  if (!match) throw new YamlError('file has no --- front matter terminator');
  return { data: parse(match[1]), body: match[2] ?? '' };
}

export { YamlError };
