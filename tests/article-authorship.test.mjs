import test from 'node:test';
import assert from 'node:assert/strict';
import { loadArticles, loadAuthors, loadSite, renderArticle } from '../build/build.mjs';

const original = loadArticles(['due-diligence-fornitori-ai-pmi'])[0];
const authors = loadAuthors();
const editorial = {
  type: 'Organization',
  name: 'Niuexa',
  url: 'https://niuexa.ai/chi-siamo.html',
};
function render(overrides = {}, authorRecords = authors) {
  return renderArticle({ ...original, ...overrides }, { site: loadSite(), authors: authorRecords });
}
function articleSchema(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1])).find(schema => schema['@type'] === 'Article');
}

test('an editorial organization is attributed visibly and never fabricated as a person or reviewer', () => {
  const html = render({ author: 'editorial', reviewed_by: null }, { ...authors, editorial });
  const schema = articleSchema(html);
  assert.deepEqual(schema.author, {
    '@type': 'Organization', name: 'Niuexa', url: 'https://niuexa.ai/chi-siamo.html',
  });
  assert.equal('reviewedBy' in schema, false);
  assert.match(html, /A cura di <a href="https:\/\/niuexa\.ai\/chi-siamo\.html">Niuexa<\/a>/);
});

test('a human author and actual recorded reviewer retain their existing entity data', () => {
  const schema = articleSchema(render());
  assert.equal(schema.author['@type'], 'Person');
  assert.equal(schema.author.name, 'Gregor Maric');
  assert.equal(schema.author.jobTitle, 'CEO & Co-Fondatore di Niuexa');
  assert.equal(schema.reviewedBy.name, 'Roberto Botto');
});

test('an article can omit an inapplicable speakable annotation without losing its visible answer', () => {
  const html = render({ speakable: false });
  assert.equal('speakable' in articleSchema(html), false);
  assert.match(html, /class="content-section quick-answer"/);
});
