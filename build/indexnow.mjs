// Notify changes to public URLs only, after the deployment has been checked live.
// node build/indexnow.mjs <before-sha> <after-sha> [--dry-run]
// node build/indexnow.mjs --all [--dry-run]  # explicit full public retry/backfill
// Redirects, noindex transitions and deletions are changes too; a receipt is not indexing.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { urlFor } from './package-cloudflare.mjs';

const HOST = 'niuexa.ai';
const KEY = '59d901b42caac9fceecf85148888c406';
const root = resolve(import.meta.dirname, '..');
const site = join(root, '_site');
const keyLocation = `https://${HOST}/${KEY}.txt`;
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const pause = ms => new Promise(done => setTimeout(done, ms));

function currentPages(dir = site, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) return [];
    const file = prefix + entry.name;
    if (entry.isDirectory()) return currentPages(join(dir, entry.name), file + '/');
    return entry.isFile() && file.endsWith('.html') && file !== '404.html' ? [file] : [];
  });
}

// Read only the literal publication data from a prior commit. Never import or
// execute historical JS. Tokenizing keeps comments and text inside strings from
// masquerading as event slugs or allowlist entries. Unknown shapes fail closed.
function arrayTokens(source, name, set = false) {
  const tokens = (source.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\/\*[\s\S]*?\*\/|[A-Za-z_$][\w$]*|[^\s]/g) || [])
    .filter(t => !t.startsWith('//') && !t.startsWith('/*'));
  const i = tokens.findIndex((t, n) => t === 'const' && tokens[n + 1] === name && tokens[n + 2] === '=');
  const start = i + (set ? 6 : 3);
  if (i < 0 || (set && tokens.slice(i + 3, start).join('') !== 'newSet(') || tokens[start] !== '[') throw new Error(`Cannot read historical publication data: ${name}`);
  let depth = 0;
  for (let j = start; j < tokens.length; j++) {
    if (tokens[j] === '[') depth++;
    if (tokens[j] === ']' && --depth === 0) return tokens.slice(start + 1, j);
  }
  throw new Error(`Unclosed historical publication data: ${name}`);
}
function literal(token) {
  if (!/^(['"])[a-zA-Z0-9._/-]+\1$/.test(token || '')) throw new Error('Unsupported historical publication path');
  return token.slice(1, -1);
}
function stringList(tokens) {
  return tokens.filter(t => t !== ',').map(literal);
}
function pairs(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length;) {
    if (tokens[i] === ',') { i++; continue; }
    if (tokens[i] !== '[' || tokens[i + 2] !== ',' || tokens[i + 4] !== ']') throw new Error('Unsupported historical redirect mapping');
    out.push([literal(tokens[i + 1]), literal(tokens[i + 3])]); i += 5;
  }
  return out;
}
function priorPages(ref) {
  const read = file => git('show', `${ref}:${file}`);
  const packager = read('build/package-pages.mjs');
  const publicDirs = new Set(stringList(arrayTokens(packager, 'publicDirs', true)));
  if (!stringList(arrayTokens(packager, 'rootExtensions', true)).includes('.html')) throw new Error('Historical packager does not publish HTML');
  const eventSource = read('build/event-content.mjs');
  const eventPages = new Set(['eventi-ai-aziende/index.html']);
  const events = arrayTokens(eventSource, 'EVENTS');
  let depth = 0;
  for (let i = 0; i < events.length; i++) {
    if (events[i] === '{') depth++;
    if (events[i] === '}') depth--;
    if (depth === 1 && events[i] === 'slug' && events[i + 1] === ':') eventPages.add(`eventi-ai-aziende/${literal(events[i + 2])}/index.html`);
  }
  for (const [from] of pairs(arrayTokens(eventSource, 'MOVED'))) eventPages.add(`eventi-ai-aziende/${from}/index.html`);
  const allowed = file => {
    const parts = file.split('/');
    if (!file.endsWith('.html') || file === '404.html' || parts.some(p => !p || p.startsWith('.')) || parts.at(-1) === 'event-registration.html') return false;
    if (parts.length === 1) return true;
    if (!publicDirs.has(parts[0])) return false;
    return parts[0] !== 'eventi-ai-aziende' || eventPages.has(file);
  };
  const files = new Set(git('ls-tree', '-r', '-z', ref).split('\0').filter(Boolean).flatMap(line => {
    const [info, file] = line.split('\t');
    return /^100(644|755) blob /.test(info) && allowed(file) ? [file] : [];
  }));
  const renamed = pairs(arrayTokens(read('build/package-cloudflare.mjs'), 'RENAMED'));
  for (const [from] of renamed) if (allowed(from)) files.add(from);
  return { files, renamed };
}
function commit(ref) {
  return git('rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`).trim();
}

async function request(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(15000) });
      // Read within the timeout too, so a stalled body cannot hang the workflow.
      const body = await response.text();
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await pause(1000 * (attempt + 1)); continue;
      }
      return { status: response.status, body };
    } catch (err) {
      if (attempt === 2) throw err;
      await pause(1000 * (attempt + 1));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const all = args.includes('--all');
  const refs = args.filter(a => !['--dry-run', '--all'].includes(a));
  if (refs.some(a => a.startsWith('-')) || (all ? refs.length !== 0 : refs.length !== 2)) throw new Error('usage: node build/indexnow.mjs <before-sha> <after-sha> [--dry-run], or --all [--dry-run]');
  const current = new Set(currentPages());
  if (!all && commit(refs[1]) !== commit('HEAD')) throw new Error('The packaged checkout must match the after commit');
  let selected;
  if (all || /^0+$/.test(refs[0])) {
    selected = current;
  } else {
    const before = commit(refs[0]), after = commit(refs[1]);
    const previous = priorPages(before);
    // Disabling rename detection deliberately returns BOTH the old and new paths.
    const changed = new Set(git('diff', '--name-only', '--no-renames', '--diff-filter=ADMT', '-z', before, after, '--').split('\0').filter(Boolean));
    selected = new Set([...changed].filter(file => current.has(file) || previous.files.has(file)));
    // Publication-policy changes can remove a page without deleting its source.
    for (const file of previous.files) if (!current.has(file)) selected.add(file);
    for (const file of current) if (!previous.files.has(file)) selected.add(file);
    // A generated rename redirect can change without its own tracked HTML file.
    if (changed.has('build/package-cloudflare.mjs')) {
      for (const [from] of previous.renamed) if (previous.files.has(from)) selected.add(from);
      for (const [from] of pairs(arrayTokens(readFileSync(join(root, 'build/package-cloudflare.mjs'), 'utf8'), 'RENAMED'))) if (current.has(from)) selected.add(from);
    }
  }
  const urls = [...selected].map(file => `https://${HOST}${urlFor(file).split('/').map(encodeURIComponent).join('/')}`).sort();
  if (!urls.length) { console.log('No public page changes to notify.'); return; }
  console.log(`${dryRun ? 'Would submit' : 'Submitting'} ${urls.length} public URL change(s):\n  ${urls.join('\n  ')}`);
  if (dryRun) return;
  if (readFileSync(join(root, `${KEY}.txt`), 'utf8').trim() !== KEY) throw new Error('Local IndexNow key file does not match KEY');
  const ownership = await request(keyLocation);
  if (ownership.status !== 200 || ownership.body.trim() !== KEY) throw new Error(`Live IndexNow ownership verification failed (${ownership.status}); no URLs submitted`);
  for (let start = 0; start < urls.length; start += 10000) {
    const response = await request('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList: urls.slice(start, start + 10000) }),
    });
    if (![200, 202].includes(response.status)) throw new Error(`IndexNow notification failed: HTTP ${response.status}`);
    console.log(response.status === 200 ? 'IndexNow 200: URLs received; crawling and indexing are not confirmed.' : 'IndexNow 202: received, key validation pending; indexing is not confirmed.');
  }
}
await main().catch(err => { console.error(err.message); process.exitCode = 1; });
