import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { createIncludeRenderer, extractIncludeTemplates } from '../build/render-includes.mjs';

const root = resolve(import.meta.dirname, '..');
const put = (dir, file, body) => { mkdirSync(dirname(join(dir, file)), { recursive: true }); writeFileSync(join(dir, file), body); };
const markup = lang => `<!doctype html><html lang="${lang}"><head><script>window.dataLayer=[];</script></head><body><div id="nav-placeholder"></div><main id="main-content"><h1>Unchanged article</h1></main><div id="footer-placeholder"></div><script src="${lang === 'en' ? '/en/includes/navigation-en.js' : '/includes/includes.js'}?v=old"></script></body></html>`;
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'niuexa-static-includes-'));
  for (const file of ['package-pages.mjs', 'package-cloudflare.mjs', 'event-content.mjs', 'render-includes.mjs']) {
    const source = join(root, 'build', file);
    if (existsSync(source)) { mkdirSync(join(dir, 'build'), { recursive: true }); copyFileSync(source, join(dir, 'build', file)); }
  }
  for (const [lang, file] of [['it', 'includes/includes.js'], ['en', 'en/includes/navigation-en.js']]) {
    put(dir, file, `const navigationHTML = \`<nav class="navbar" aria-label="${lang}"><a href="/${lang === 'en' ? 'en/' : ''}">${lang}</a></nav>\`;\nconst footerHTML = \`<footer class="footer"><a href="/${lang === 'en' ? 'en/' : ''}privacy-policy.html">${lang} privacy</a></footer>\`;\nthrow new Error('Never execute a browser include while packaging');\n`);
  }
  return dir;
}

test('packaging delivers localized navigation and footer in initial HTML without executing browser scripts', () => {
  const dir = fixture();
  try {
    for (const [file, lang] of [['index.html', 'it'], ['en/index.html', 'en'], ['books/example/page.html', 'en']]) put(dir, file, markup(lang));
    const standalone = '<html lang="it"><body><nav>Standalone event navigation</nav><h1>Event</h1></body></html>';
    put(dir, 'standalone.html', standalone);
    execFileSync(process.execPath, ['build/package-pages.mjs'], { cwd: dir, stdio: 'pipe' });
    for (const [file, lang] of [['index.html', 'it'], ['en/index.html', 'en'], ['books/example/page.html', 'en']]) {
      const result = readFileSync(join(dir, '_site', file), 'utf8');
      assert.match(result, /<nav class="navbar"/);
      assert.ok(result.includes(`>${lang} privacy</a>`), file);
      assert.ok(result.includes(`href="/${lang === 'en' ? 'en/' : ''}privacy-policy.html"`), file);
      assert.match(result, /data-niuexa-static-include="navigation"/);
      assert.match(result, /data-niuexa-static-include="footer"/);
      assert.match(result, /<main id="main-content"><h1>Unchanged article<\/h1><\/main>/);
      assert.match(result, /<script>window.dataLayer=\[\];<\/script>/);
      assert.equal(readFileSync(join(dir, file), 'utf8'), markup(lang), 'source HTML must remain unchanged');
    }
    assert.equal(readFileSync(join(dir, '_site/standalone.html'), 'utf8'), standalone);
    assert.ok(!existsSync(join(dir, '_site/build')), 'build-only code stays out of the public package');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('the public package includes VTT captions but excludes raw SRT working files', () => {
  const dir = fixture();
  try {
    put(dir, 'index.html', '<h1>Standalone</h1>');
    put(dir, 'assets/video/captions.it.vtt', 'WEBVTT\n\n00:00.000 --> 00:01.000\nExample\n');
    put(dir, 'assets/video/captions.srt', '1\n00:00:00,000 --> 00:00:01,000\nWorking source\n');
    execFileSync(process.execPath, ['build/package-pages.mjs'], { cwd: dir, stdio: 'pipe' });
    assert.ok(existsSync(join(dir, '_site/assets/video/captions.it.vtt')));
    assert.ok(!existsSync(join(dir, '_site/assets/video/captions.srt')));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('literal extraction rejects interpolation and escapes without running any historical JavaScript', () => {
  const source = 'throw new Error("Do not run");\nconst navigationHTML = `<nav>Menu</nav>`;\nconst footerHTML = `<footer>Legal</footer>`;';
  assert.deepEqual(extractIncludeTemplates(source), { navigation: '<nav>Menu</nav>', footer: '<footer>Legal</footer>' });
  assert.throws(() => extractIncludeTemplates(source.replace('Menu', '${globalThis.sideEffect()}')), /without interpolation or escapes/);
  assert.throws(() => extractIncludeTemplates(source.replace('Menu', 'A\\nB')), /without interpolation or escapes/);
  assert.throws(() => extractIncludeTemplates(source + '\nconst footerHTML = `<footer>Duplicate</footer>`;'), /expected one static footerHTML/);
});

test('comments and other strings cannot supply a missing or unsupported live include declaration', () => {
  const fake = 'const navigationHTML = `<nav>Obsolete</nav>`;';
  const footer = 'const footerHTML = `<footer>Legal</footer>`;';
  for (const hidden of [`// ${fake}\n`, `/* ${fake} */\n`, `const example = ${JSON.stringify(fake)};\n`, `const example = \`const navigationHTML = "Obsolete";\`;\n`, `const example = /${fake.replaceAll('/', '\\/')}/;\n`]) {
    assert.throws(() => extractIncludeTemplates(hidden + 'const navigationHTML = buildNavigation();\n' + footer), /static navigationHTML/);
    assert.throws(() => extractIncludeTemplates(hidden + footer), /static navigationHTML/);
    const valid = extractIncludeTemplates(hidden + 'const navigationHTML = `<nav>Current</nav>`;\n' + footer);
    assert.equal(valid.navigation, '<nav>Current</nav>');
  }
  assert.throws(() => extractIncludeTemplates('const navigationHTML = `<nav>One</nav>`;\nconst navigationHTML = buildNavigation();\n' + footer), /static navigationHTML/);
});

test('unquoted script sources and preceding data-src attributes are stamped consistently', async () => {
  const source = 'const navigationHTML = `<nav>Menu</nav>`; const footerHTML = `<footer>Legal</footer>`;';
  const render = createIncludeRenderer(() => source);
  const stamp = createHash('sha256').update(source).digest('hex').slice(0, 12);
  for (const tag of ['<script src=/includes/includes.js?v=old></script>', '<script data-src="/example.js" src="/includes/includes.js?v=old"></script>', '<script data-note=" src=/example.js" src="/includes/includes.js?v=old"></script>']) {
    const result = await render(markup('it').replace('<script src="/includes/includes.js?v=old"></script>', tag), 'index.html');
    assert.match(result, new RegExp(`\\ssrc=["']?/includes/includes\\.js\\?v=${stamp}["']?(?:>|\\s)`));
    if (tag.includes('data-src')) assert.ok(result.includes('data-src="/example.js"'));
    if (tag.includes('data-note')) assert.ok(result.includes('data-note=" src=/example.js"'));
  }
});

test('unrelated pages, comments and code examples do not load or inject include templates', async () => {
  const html = '<html lang="it"><body><!-- <div id="nav-placeholder"></div> --><script>const example = "<div id=\'footer-placeholder\'></div>";</script><h1>Standalone</h1></body></html>';
  const render = createIncludeRenderer(() => { throw new Error('No include dependency for this page'); });
  assert.equal(await render(html, 'standalone.html'), html);
});

test('template language mismatches and duplicate navigation containers fail the build', async () => {
  const render = createIncludeRenderer(() => 'const navigationHTML = `<nav>IT</nav>`; const footerHTML = `<footer>IT</footer>`;');
  await assert.rejects(render(markup('en').replace('/en/includes/navigation-en.js', '/includes/includes.js'), 'books/example/page.html'), /does not match en/);
  await assert.rejects(render(markup('it').replace('<main', '<div id="navigation-placeholder"></div><main'), 'index.html'), /duplicate navigation/);
});

test('the published include version follows its source and rendering is idempotent', async () => {
  const source = 'const navigationHTML = `<nav class="navbar">Menu</nav>`; const footerHTML = `<footer>Legal</footer>`;';
  const render = createIncludeRenderer(() => source);
  const html = markup('en').replace('/en/includes/navigation-en.js?v=old', '../../en/includes/navigation-en.js?v=old&amp;preview=1');
  const result = await render(html, 'books/example/page.html');
  const stamp = createHash('sha256').update(source).digest('hex').slice(0, 12);
  assert.ok(result.includes(`src="../../en/includes/navigation-en.js?v=${stamp}&amp;preview=1"`));
  assert.equal(await render(result, 'books/example/page.html'), result);
});

function element(attributes = {}) {
  const attrs = new Map(Object.entries(attributes)), classes = new Set(), listeners = new Map();
  return {
    writes: 0,
    getAttribute: key => attrs.get(key) ?? null,
    hasAttribute: key => attrs.has(key),
    setAttribute: (key, value) => attrs.set(key, String(value)),
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x), toggle(x, force) { const next = force ?? !classes.has(x); if (next) classes.add(x); else classes.delete(x); return next; } },
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); },
    fire(type) { for (const fn of listeners.get(type) ?? []) fn.call(this, { preventDefault() {}, stopPropagation() {}, target: this }); },
    set innerHTML(value) { this.writes++; this.html = value; },
    focus() {}, closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
  };
}

for (const script of ['includes/includes.js', 'en/includes/navigation-en.js']) {
 for (const staticMarkup of [true, false]) {
  test(`${script} initializes ${staticMarkup ? 'published static markup' : 'local fallback markup'} only once`, () => {
    const nav = element(staticMarkup ? { 'data-niuexa-static-include': 'navigation' } : {}), footer = element(staticMarkup ? { 'data-niuexa-static-include': 'footer' } : {});
    const hamburger = element(), menu = element(), link = element({ 'data-page': 'home', href: '/' });
    menu.querySelector = () => link;
    const document = element();
    document.getElementById = id => ({ 'nav-placeholder': nav, 'footer-placeholder': footer }[id] ?? null);
    document.querySelector = selector => ({ '.hamburger': hamburger, '.nav-menu': menu }[selector] ?? null);
    document.querySelectorAll = selector => ['.nav-link', '.nav-link, .dropdown-link', '.nav-link:not(.dropdown-toggle), .dropdown-link'].includes(selector) ? [link] : [];
    const window = element(); window.location = { pathname: script.startsWith('en/') ? '/en/' : '/' };
    const context = vm.createContext({ document, window, console, setTimeout() {}, clearTimeout() {} });
    vm.runInContext(readFileSync(join(root, script), 'utf8'), context);
    context.loadIncludes(); context.loadIncludes();
    assert.equal(nav.writes, staticMarkup ? 0 : 1, 'preserve published nodes and initialize a local source preview once');
    assert.equal(footer.writes, staticMarkup ? 0 : 1, 'preserve published nodes and initialize a local source preview once');
    hamburger.fire('click');
    assert.equal(menu.classList.contains('active'), true, 'a repeated initialization must not toggle the menu twice');
    assert.equal(hamburger.getAttribute('aria-expanded'), 'true');
    link.fire('click');
    assert.equal(menu.classList.contains('active'), false);
  });
 }
}
