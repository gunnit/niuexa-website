import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = new URL('../deferred-video.js', import.meta.url);
const source = existsSync(script) ? readFileSync(script, 'utf8') : '';

function events(target = {}) {
  const listeners = new Map();
  target.addEventListener = (name, fn) => {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(fn);
  };
  target.dispatch = name => { for (const fn of listeners.get(name) || []) fn(); };
  return target;
}

function browser({ reduced = false, saveData = false, hidden = false, observer = true, loading = false, playImpl } = {}) {
  const mediaSource = { dataset: { src: '/img/decorative.mp4' }, attrs: new Map(), writes: 0,
    getAttribute(name) { return name === 'data-src' ? this.dataset.src : this.attrs.get(name) ?? null; },
    setAttribute(name, value) { this.attrs.set(name, value); if (name === 'src') this.writes++; },
    removeAttribute(name) { this.attrs.delete(name); },
  };
  const video = {
    dataset: { deferredVideo: '' }, poster: '/img/static-poster.webp', preload: 'none',
    muted: true, loop: true, playsInline: true, autoplay: false,
    loads: 0, plays: 0, pauses: 0, paused: true,
    querySelectorAll() { return [mediaSource]; },
    load() { this.loads++; },
    play() { this.plays++; this.paused = false; return playImpl ? playImpl(this) : Promise.resolve(); },
    pause() { this.pauses++; this.paused = true; },
    setAttribute(name, value) { this[name] = value; },
    removeAttribute(name) { if (name === 'autoplay') this.autoplay = false; },
  };
  const motion = events({ matches: reduced });
  const connection = events({ saveData });
  const document = events({ hidden, readyState: loading ? 'loading' : 'complete', querySelectorAll: () => [video] });
  const observers = [];
  class IntersectionObserver {
    constructor(callback, options = {}) { this.callback = callback; this.options = options; this.targets = new Set(); this.previous = null; observers.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    // Browser-boundary fixture: a 718px viewport; the supplied rootMargin controls
    // near-viewport intersection separately from actual visible intersection.
    notify(top, height = 400) {
      if (!this.targets.has(video)) return;
      const margin = parseFloat(this.options.rootMargin || '0');
      const pixels = Math.max(0, Math.min(top + height, 718 + margin) - Math.max(top, -margin));
      const isIntersecting = top <= 718 + margin && top + height >= -margin;
      const ratio = pixels / height;
      const thresholdIndex = [this.options.threshold || 0].filter(threshold => ratio >= threshold).length;
      if (!this.previous || this.previous.isIntersecting !== isIntersecting || this.previous.thresholdIndex !== thresholdIndex) {
        this.previous = { isIntersecting, thresholdIndex };
        this.callback([{ target: video, isIntersecting, intersectionRatio: ratio }]);
      }
    }
  }
  const window = { matchMedia: () => motion, navigator: { connection } };
  if (observer) window.IntersectionObserver = IntersectionObserver;
  const context = vm.createContext({ window, document, navigator: window.navigator,
    IntersectionObserver: observer ? IntersectionObserver : undefined, Promise, console });
  vm.runInContext(source, context, { filename: 'deferred-video.js' });
  const position = top => { for (const io of observers) io.notify(top); };
  const visibility = value => { document.hidden = value; document.dispatch('visibilitychange'); };
  return { video, mediaSource, document, motion, connection, observers, context, position, visibility };
}

test('a video at 934px stays static initially, loads near the viewport once, and plays only while visible', async () => {
  const page = browser();
  page.position(934);
  assert.equal(page.mediaSource.getAttribute('src'), null);
  assert.equal(page.video.loads, 0);
  assert.equal(page.video.plays, 0);
  assert.equal(page.video.autoplay, false);
  page.position(780);
  assert.equal(page.mediaSource.getAttribute('src'), '/img/decorative.mp4');
  assert.equal(page.video.loads, 1);
  assert.equal(page.video.plays, 0);
  page.position(600);
  await Promise.resolve();
  assert.equal(page.video.plays, 1);
  page.position(500);
  assert.equal(page.video.plays, 1, 'repeated visible reports do not restart playback');
  page.position(-500);
  assert.equal(page.video.paused, true);
  page.position(600);
  assert.equal(page.video.plays, 2);
  assert.equal(page.video.loads, 1);
  assert.equal(page.mediaSource.writes, 1);
  assert.equal(page.video.poster, '/img/static-poster.webp');
});

for (const preference of ['reduced', 'saveData']) {
  test(`${preference}: initial restriction prevents media sources; preference changes pause/resume without reloading`, () => {
    const page = browser({ [preference]: true });
    page.position(50);
    assert.equal(page.mediaSource.getAttribute('src'), null);
    assert.equal(page.video.loads, 0);
    assert.equal(page.video.plays, 0);
    const pref = preference === 'reduced' ? page.motion : page.connection;
    const key = preference === 'reduced' ? 'matches' : 'saveData';
    pref[key] = false; pref.dispatch('change');
    assert.equal(page.video.loads, 1);
    assert.equal(page.video.plays, 1);
    pref[key] = true; pref.dispatch('change');
    assert.equal(page.video.paused, true);
    pref[key] = false; pref.dispatch('change');
    assert.equal(page.video.plays, 2);
    assert.equal(page.video.loads, 1);
  });
}

test('an initially hidden tab cannot load from observer callbacks or preference changes', () => {
  const page = browser({ hidden: true, reduced: true });
  page.position(50);
  page.motion.matches = false; page.motion.dispatch('change');
  assert.equal(page.mediaSource.getAttribute('src'), null);
  assert.equal(page.video.loads, 0);
  assert.equal(page.video.plays, 0);
  page.visibility(false);
  assert.equal(page.video.loads, 1);
  assert.equal(page.video.plays, 1);
  page.visibility(true);
  assert.equal(page.video.paused, true);
  page.position(-500);
  page.visibility(false);
  assert.equal(page.video.plays, 1, 'returning to a tab does not play an offscreen video');
});

test('play rejection is handled and a later viewport entry can retry', async () => {
  const page = browser({ playImpl: () => Promise.reject(new Error('autoplay blocked')) });
  page.position(50);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.video.plays, 1);
  assert.equal(page.video.paused, true);
  page.position(-500);
  page.position(50);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.video.plays, 2);
  assert.equal(page.video.loads, 1);
});

test('a pending play cannot restart animation after the tab hides or reduced motion is enabled', async () => {
  for (const stop of ['hidden', 'reduced']) {
    let resolvePlay;
    const page = browser({ playImpl: video => new Promise(resolve => {
      resolvePlay = () => { video.paused = false; resolve(); };
    }) });
    page.position(50);
    assert.equal(page.video.plays, 1);
    if (stop === 'hidden') page.visibility(true);
    else { page.motion.matches = true; page.motion.dispatch('change'); }
    assert.equal(page.video.paused, true);
    resolvePlay();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(page.video.paused, true);
  }
});

test('touching the viewport edge does not play, but moving into it does', () => {
  const page = browser();
  page.position(718);
  assert.equal(page.video.plays, 0);
  page.position(700);
  assert.equal(page.video.plays, 1);
});

test('a playing video pauses below the visible threshold before reaching the viewport edge', () => {
  const page = browser();
  page.position(600);
  assert.equal(page.video.paused, false);
  page.position(716);
  assert.equal(page.video.paused, true, 'two visible pixels are below the 1% playback threshold');
  page.position(718);
  assert.equal(page.video.paused, true, 'zero-area edge contact stays paused without another observer callback');
  page.position(700);
  assert.equal(page.video.plays, 2);
  assert.equal(page.video.paused, false);
});

test('hiding the tab cancels an outstanding play even when the media still reports paused', async () => {
  let finish;
  const page = browser({ playImpl: video => {
    video.paused = true;
    return new Promise(resolve => { finish = resolve; });
  } });
  page.position(50);
  const before = page.video.pauses;
  page.visibility(true);
  assert.equal(page.video.pauses, before + 1);
  finish();
  await Promise.resolve();
});

test('without IntersectionObserver the static poster never starts downloading video', () => {
  const page = browser({ observer: false });
  page.position(50);
  page.visibility(true); page.visibility(false);
  page.motion.dispatch('change'); page.connection.dispatch('change');
  assert.equal(page.mediaSource.getAttribute('src'), null);
  assert.equal(page.video.loads, 0);
  assert.equal(page.video.plays, 0);
  assert.equal(page.video.poster, '/img/static-poster.webp');
});

test('initialization waits for the DOM and does not bind the same video twice', () => {
  const page = browser({ loading: true });
  assert.equal(page.observers.length, 0);
  page.document.dispatch('DOMContentLoaded');
  assert.equal(page.observers.length, 2);
  vm.runInContext(source, page.context);
  page.document.dispatch('DOMContentLoaded');
  page.position(50);
  assert.equal(page.video.loads, 1);
  assert.equal(page.video.plays, 1);
});

test('the six real page videos keep a no-JavaScript poster and cannot preload media from HTML', () => {
  const files = ['index.html', 'en/index.html', 'chi-siamo.html', 'en/about-us.html'];
  const parse = `
import json,sys
from html.parser import HTMLParser
from pathlib import Path
class Videos(HTMLParser):
 def __init__(self):
  super().__init__(); self.videos=[]; self.current=None; self.scripts=[]
 def handle_starttag(self, tag, attrs):
  attrs=dict(attrs)
  if tag=='video' and 'data-deferred-video' in attrs:
   self.current={'attrs':attrs,'sources':[]}; self.videos.append(self.current)
  elif tag=='source' and self.current is not None: self.current['sources'].append(attrs)
  elif tag=='script' and 'deferred-video.js' in attrs.get('src',''): self.scripts.append(attrs)
 def handle_endtag(self,tag):
  if tag=='video': self.current=None
out=[]
for path in sys.argv[1:]:
 p=Videos(); p.feed(Path(path).read_text()); out.append({'videos':p.videos,'scripts':p.scripts})
print(json.dumps(out))
`;
  const pages = JSON.parse(execFileSync('python3', ['-c', parse, ...files.map(file => fileURLToPath(new URL('../' + file, import.meta.url)))], { encoding: 'utf8' }));
  assert.deepEqual(pages.map(page => page.videos.length), [2, 2, 1, 1]);
  pages.forEach((page, i) => {
    assert.equal(page.scripts.length, 1, files[i]);
    assert.ok('defer' in page.scripts[0]);
    for (const { attrs, sources } of page.videos) {
      assert.equal(attrs.preload, 'none');
      assert.equal(attrs['aria-hidden'], 'true');
      for (const key of ['autoplay', 'src']) assert.equal(key in attrs, false, files[i] + ': ' + key);
      for (const key of ['muted', 'loop', 'playsinline']) assert.ok(key in attrs, files[i] + ': ' + key);
      assert.ok(Number(attrs.width) > 0 && Number(attrs.height) > 0);
      assert.ok(sources.length > 0);
      for (const source of sources) {
        assert.equal('src' in source, false, files[i]);
        assert.ok(source['data-src']);
      }
      for (const asset of [attrs.poster, ...sources.map(source => source['data-src'])]) {
        assert.ok(asset, files[i] + ': missing poster/source');
        const url = new URL(asset, 'https://niuexa.ai/' + files[i]);
        assert.ok(existsSync(new URL('..' + url.pathname, import.meta.url)), files[i] + ': missing ' + asset);
      }
    }
  });
});
