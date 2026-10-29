/**
 * Copy consent-guard.js inline into every page that loads Google Tag Manager,
 * right before the GTM loader, so HubSpot and Apollo.io wait for marketing consent
 * whatever the GTM container fires on page load.
 *
 * Usage:
 *   node build/inline-consent-guard.mjs           update every page
 *   node build/inline-consent-guard.mjs --check   exit 1 if a page is missing or has a stale copy
 *
 * build/build.mjs and build/render-events.mjs use withConsentGuard() / consentGuardScript()
 * so the pages they generate carry the same copy.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', '.github', '.claude', 'node_modules', '_site', '_site-review', 'build', 'tests', 'templates', 'qa']);
const GUARD_TAG = /^[ \t]*<script data-consent-guard>[\s\S]*?<\/script>\n?/m;
const GTM_LOADER = /^([ \t]*)<script>\(function\(w,d,s,l,i\)\{[^\n]*'gtm\.start'/m;

/** The guard as one inline line: header comment dropped, indentation joined. */
export function consentGuardScript() {
  const source = readFileSync(join(ROOT, 'consent-guard.js'), 'utf8')
    .replace(/^\/\*[\s\S]*?\*\/\s*/, '')
    .split('\n').map((line) => line.trim()).filter(Boolean).join('');
  return `<script data-consent-guard>${source}</script>`;
}

/** Insert or refresh the guard before the GTM loader; pages without GTM come back unchanged. */
export function withConsentGuard(html, script = consentGuardScript()) {
  const stripped = html.replace(GUARD_TAG, '');
  const loader = stripped.match(GTM_LOADER);
  if (!loader) return html;
  return stripped.slice(0, loader.index) + loader[1] + script + '\n' + stripped.slice(loader.index);
}

function* pages(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* pages(path);
    else if (name.endsWith('.html')) yield path;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const script = consentGuardScript();
  const stale = [];
  for (const path of pages(ROOT)) {
    const html = readFileSync(path, 'utf8');
    const updated = withConsentGuard(html, script);
    if (updated === html) continue;
    stale.push(relative(ROOT, path));
    if (!check) writeFileSync(path, updated, 'utf8');
  }
  if (check && stale.length) {
    console.error(`Consent guard missing or stale in ${stale.length} page(s):\n  ${stale.join('\n  ')}\nRun: node build/inline-consent-guard.mjs`);
    process.exit(1);
  }
  console.log(check ? 'Consent guard is current on every GTM page.' : `Consent guard written to ${stale.length} page(s).`);
}
