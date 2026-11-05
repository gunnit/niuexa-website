import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const page = readFileSync(new URL('../consulenza-aeo-geo.html', import.meta.url), 'utf8');
const captionPath = new URL('../assets/video/niuexa-aeo-geo-pas-v4.it.vtt', import.meta.url);

test('the commercial exposes optional native Italian captions alongside its visible transcript', () => {
  const video = page.match(/<video\b[^>]*id="aeo-commercial"[^>]*>([\s\S]*?)<\/video>/)?.[1];
  const track = video?.match(/<track\b[^>]*>/)?.[0];
  assert.ok(track, 'the existing burned-in subtitles also need a selectable text track');
  assert.match(track, /kind="captions"/);
  assert.match(track, /srclang="it"/);
  assert.match(track, /src="assets\/video\/niuexa-aeo-geo-pas-v4\.it\.vtt"/);
  assert.doesNotMatch(track, /\bdefault\b/, 'avoid duplicating the existing burned-in captions by default');
  assert.match(page, /href="assets\/video\/niuexa-aeo-geo-pas-v4\.it\.vtt"/);
});

test('the timed captions preserve all spoken transcript text without overlaps or outlasting the verified video', () => {
  assert.ok(existsSync(captionPath), 'publish the verified subtitle source as WebVTT');
  const text = readFileSync(captionPath, 'utf8');
  assert.ok(text.startsWith('WEBVTT\n\n'));
  const cues = text.trim().split(/\n\s*\n/).slice(1).map(block => {
    const [, start, end, words] = block.match(/^\d+\n(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\n([\s\S]+)$/) || [];
    assert.ok(words, `invalid WebVTT cue: ${block}`);
    const seconds = value => value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
    return { start: seconds(start), end: seconds(end), words };
  });
  assert.ok(cues.length > 0);
  let previousEnd = 0;
  for (const cue of cues) {
    assert.ok(cue.start >= previousEnd && cue.end > cue.start);
    assert.ok(cue.end <= 23.1, 'captions must stay within the verified 23.1-second commercial');
    previousEnd = cue.end;
  }
  const transcript = page.match(/<summary>Leggi il testo del video<\/summary>\s*<p>([^<]+)<\/p>/)?.[1];
  const normalize = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  assert.equal(normalize(cues.map(cue => cue.words).join(' ')), normalize(transcript));
});
