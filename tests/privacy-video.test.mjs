import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = readFileSync(new URL('../ai-readiness-tool.js', import.meta.url), 'utf8');
const pagePath = fileURLToPath(new URL('../consulenza-aeo-geo.html', import.meta.url));
const consentKey = 'niuexa_cookie_consent';
const videoId = 'GnM53oLiHxI';

function events(target) {
  const listeners = new Map();
  target.addEventListener = (type, callback) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(callback);
  };
  target.removeEventListener = (type, callback) => listeners.get(type)?.delete(callback);
  target.dispatchEvent = event => {
    for (const callback of listeners.get(event.type) || []) callback.call(target, event);
  };
  return target;
}

// Only browser APIs are substituted. The entire production script runs unchanged;
// iframe navigations are recorded when a src is assigned to a connected frame or
// a frame with a src is attached, matching the browser's network boundary.
function browser({ stored = null, blocked = false, readyState = 'complete' } = {}) {
  const navigations = [];
  const document = events({ readyState, activeElement: null });
  function element(tagName) {
    let src = '';
    const node = events({ tagName, className: '', dataset: {}, children: [], parentNode: null });
    Object.defineProperties(node, {
      isConnected: { get() { return this.parentNode === document || Boolean(this.parentNode?.isConnected); } },
      src: {
        get() { return src; },
        set(value) { src = value; if (this.isConnected && tagName === 'iframe' && src) navigations.push(src); }
      }
    });
    node.matches = selector => {
      const tag = selector.match(/^[a-z]+/)?.[0];
      const classes = [...selector.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
      return (!tag || tag === tagName) && classes.every(name => node.className.split(/\s+/).includes(name)) &&
        (!selector.includes('[data-video-id]') || Boolean(node.dataset.videoId));
    };
    node.querySelectorAll = selector => node.children.flatMap(child => [
      ...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)
    ]);
    node.querySelector = selector => node.querySelectorAll(selector)[0] || null;
    node.appendChild = child => {
      child.remove();
      node.children.push(child);
      child.parentNode = node;
      if (child.isConnected && child.tagName === 'iframe' && child.src) navigations.push(child.src);
      return child;
    };
    node.remove = () => {
      if (node.parentNode) node.parentNode.children = node.parentNode.children.filter(child => child !== node);
      node.parentNode = null;
    };
    node.replaceWith = replacement => {
      const parent = node.parentNode;
      if (!parent) return;
      replacement.remove();
      parent.children.splice(parent.children.indexOf(node), 1, replacement);
      replacement.parentNode = parent;
      node.parentNode = null;
      if (replacement.isConnected && replacement.tagName === 'iframe' && replacement.src) navigations.push(replacement.src);
    };
    node.focus = () => { document.activeElement = node; };
    node.setAttribute = (name, value) => { node[name] = String(value); };
    node.removeAttribute = name => { if (name === 'src') src = ''; else delete node[name]; };
    return node;
  }
  document.head = element('head');
  document.body = element('body');
  document.head.parentNode = document.body.parentNode = document;
  document.querySelectorAll = selector => document.body.querySelectorAll(selector);
  document.querySelector = selector => document.body.querySelector(selector);
  document.createElement = element;
  const facade = element('div');
  facade.className = 'video-facade';
  facade.dataset = { videoId, videoTitle: 'AEO Analyzer: demo dell’analisi' };
  const play = element('button');
  play.className = 'video-facade-play';
  facade.appendChild(play);
  document.body.appendChild(facade);
  document.activeElement = document.body;
  const window = events({});
  const localStorage = {
    getItem(key) {
      if (blocked) throw new Error('Storage blocked');
      assert.equal(key, consentKey);
      return stored;
    }
  };
  const context = vm.createContext({ document, window, localStorage, console });
  vm.runInContext(source, context, { filename: 'ai-readiness-tool.js' });
  return {
    document, facade, play, navigations,
    frames: () => document.querySelectorAll('iframe'),
    consent(detail) { stored = JSON.stringify(detail); window.dispatchEvent({ type: 'niuexa:consent', detail }); },
    click() { play.focus(); play.dispatchEvent({ type: 'click' }); },
    ready() { document.readyState = 'complete'; document.dispatchEvent({ type: 'DOMContentLoaded' }); }
  };
}

function assertGated(page) {
  assert.equal(page.frames().length, 0);
  assert.equal(page.facade.isConnected, true);
  assert.equal(page.navigations.length, 0);
}

function assertPlayer(page, autoplay) {
  assert.equal(page.frames().length, 1);
  const player = page.frames()[0];
  const url = new URL(player.src);
  assert.equal(url.origin, 'https://www.youtube-nocookie.com');
  assert.equal(url.pathname, '/embed/' + videoId);
  assert.equal(url.searchParams.get('autoplay'), autoplay ? '1' : null);
  assert.equal(player.title, page.facade.dataset.videoTitle);
  assert.equal(player.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.equal(player.allowFullscreen, true);
  return player;
}

test('without consent the demo remains a local facade, before and after DOM readiness', () => {
  for (const readyState of ['loading', 'complete']) {
    const page = browser({ readyState });
    assertGated(page);
    if (readyState === 'loading') page.ready();
    assertGated(page);
  }
});

test('reject and analytics-only choices never authorize a YouTube request', () => {
  for (const choice of [{ analytics: false, marketing: false }, { analytics: true, marketing: false }]) {
    const page = browser();
    page.consent(choice);
    assertGated(page);
    assertGated(browser({ stored: JSON.stringify(choice) }));
  }
});

test('accepting marketing loads exactly one privacy-enhanced player without autoplay or moving focus', () => {
  const page = browser();
  const focused = page.document.activeElement;
  page.consent({ analytics: true, marketing: true });
  assertPlayer(page, false);
  page.consent({ analytics: true, marketing: true });
  assert.equal(page.navigations.length, 1);
  assert.equal(page.document.activeElement, focused);
});

test('returning marketing consent loads once without autoplay across either script timing', () => {
  for (const readyState of ['loading', 'complete']) {
    const page = browser({ readyState, stored: JSON.stringify({ necessary: true, analytics: false, marketing: true }) });
    if (readyState === 'loading') { assertGated(page); page.ready(); }
    const focused = page.document.activeElement;
    assertPlayer(page, false);
    page.consent({ analytics: true, marketing: true });
    assert.equal(page.navigations.length, 1);
    assert.equal(page.document.activeElement, focused);
  }
});

test('explicit play loads once with autoplay and transfers keyboard focus to the player', () => {
  const page = browser();
  page.click();
  const player = assertPlayer(page, true);
  assert.equal(page.document.activeElement, player);
  page.consent({ marketing: true });
  assert.equal(page.navigations.length, 1);
});

test('invalid and inaccessible stored consent fail closed but explicit play still works', () => {
  for (const options of [
    { blocked: true }, { stored: '{invalid' }, { stored: 'null' }, { stored: 'true' },
    { stored: '{}' }, { stored: '{"analytics":true}' }, { stored: '{"marketing":"true"}' },
    { stored: '{"marketing":1}' }, { stored: '{"analytics":"yes","marketing":true}' }
  ]) {
    const page = browser(options);
    assertGated(page);
    page.consent({ marketing: 'true' });
    assertGated(page);
    page.click();
    assertPlayer(page, true);
    assert.equal(page.navigations.length, 1);
  }
});

for (const activation of ['new consent', 'returning consent', 'explicit play']) {
  test(`marketing revocation unloads a player loaded by ${activation} and restores usable play`, () => {
    const page = browser({ stored: activation === 'returning consent' ? '{"analytics":false,"marketing":true}' : null });
    if (activation === 'new consent') page.consent({ marketing: true });
    if (activation === 'explicit play') page.click();
    const player = assertPlayer(page, activation === 'explicit play');
    page.consent({ analytics: true, marketing: false });
    assert.equal(page.frames().length, 0, 'revoking marketing must remove the active third-party frame');
    assert.equal(player.isConnected, false);
    assert.equal(page.facade.isConnected, true);
    assert.equal(page.navigations.length, 1);
    page.consent({ analytics: false, marketing: false });
    assert.equal(page.navigations.length, 1, 'repeated rejection cannot reload the player');
    page.click();
    assertPlayer(page, true);
    assert.equal(page.navigations.length, 2, 'restored play has one working listener');
    assert.equal(page.document.activeElement, page.frames()[0]);
  });
}

test('the actual landing HTML cannot request YouTube assets before script or user activation', () => {
  const parse = `
import json, sys
from html.parser import HTMLParser
from pathlib import Path
class Page(HTMLParser):
 def __init__(self):
  super().__init__(); self.requests=[]; self.facades=[]; self.buttons=[]; self.scripts=[]
 def handle_starttag(self, tag, attrs):
  attrs=dict(attrs)
  if 'video-facade' in attrs.get('class','').split(): self.facades.append(attrs)
  if 'video-facade-play' in attrs.get('class','').split(): self.buttons.append({'tag':tag, **attrs})
  if tag=='script': self.scripts.append(attrs)
  if tag in ['iframe','script','img','source','video','audio','embed','input']:
   for key in ['src','srcset','poster']:
    if attrs.get(key): self.requests.append(attrs[key])
  if tag=='object' and attrs.get('data'): self.requests.append(attrs['data'])
  if tag=='link' and set(attrs.get('rel','').split()) & {'preconnect','dns-prefetch','preload','prefetch','stylesheet'}:
   self.requests.append(attrs.get('href',''))
page=Page(); page.feed(Path(sys.argv[1]).read_text())
print(json.dumps({key:getattr(page,key) for key in ['requests','facades','buttons','scripts']}))
`;
  const page = JSON.parse(execFileSync('python3', ['-c', parse, pagePath], { encoding: 'utf8' }));
  assert.equal(page.facades.length, 1);
  assert.equal(page.facades[0]['data-video-id'], videoId);
  assert.equal(page.buttons.length, 1);
  assert.equal(page.buttons[0].tag, 'button', 'native button supports Enter and Space activation');
  assert.equal(page.buttons[0].type, 'button');
  assert.equal(page.buttons[0]['aria-describedby'], 'video-privacy-note');
  assert.equal(page.scripts.filter(script => script.src &&
    new URL(script.src, 'https://niuexa.ai/').pathname === '/ai-readiness-tool.js').length, 1);
  for (const request of page.requests) {
    assert.doesNotMatch(request, /(?:youtube(?:-nocookie)?\.com|youtu\.be|ytimg\.com|googlevideo\.com)/i);
  }
});
