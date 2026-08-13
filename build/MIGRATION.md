# Article migration — state and next steps

Where the "articles as data, not documents" work stands, and what a new session
needs to pick it up. Lives in `build/` so it is stripped from the Pages
artifact and never ships to niuexa.ai.

Branch: `claude/build-render-backend-oy5i7d` · PR: gunnit/niuexa-website#293 (draft)

---

## What exists now

| File | What it does |
|---|---|
| `content/site.yml` | publisher, GTM id, asset version stamps, breadcrumb labels, CTA defaults |
| `content/authors/*.yml` | `Person` entities for schema author/reviewer |
| `content/articles/*.md` | the content records — front matter + Markdown body |
| `templates/article.html` | the one page skeleton |
| `build/build.mjs` | renders records into `articolo-<slug>.html`, syncs sitemap `<lastmod>` |
| `build/yaml.mjs`, `build/markdown.mjs` | zero-dependency subsets; they raise rather than guess |
| `build/extract.py` | recovers a content record from a hand-written article |
| `build/migration-diff.py` | word-by-word text diff against the committed version |
| `tests/aeo_rules.py`, `tests/test_aeo_static.py` | the 17-rule ruleset over shipped HTML |

Everything is standard library / no npm packages. Node 22 and Python 3.11.

### The commands

```bash
node build/build.mjs                 # render every article
node build/build.mjs <slug>          # render one
node build/build.mjs --check         # fail if committed HTML or sitemap drifted
python3 tests/aeo_rules.py           # print the 17-rule scoreboard
python3 -m unittest discover -s tests
python3 build/extract.py articolo-<slug>.html
python3 build/migration-diff.py --all
```

### The migration loop, in order

```bash
python3 build/extract.py articolo-<slug>.html   # draft the record
$EDITOR content/articles/<slug>.md              # review it — this is the real work
node build/build.mjs <slug>                     # render
python3 build/migration-diff.py articolo-<slug>.html   # must exit 0
```

`migration-diff.py` exits non-zero if the round trip dropped words. **Do not
commit an article until it exits 0, or until every removal it lists is a
deliberate edit you can name.** That check is the only thing standing between
this migration and silently deleting content.

Two traps, both already guarded but worth knowing:

- `extract.py` refuses to run against generated output. Extracting from the
  generator's own work would bake in whatever it dropped. Use `git show` to get
  the hand-written original if a file has already been regenerated.
- `migration-diff.py` compares against `HEAD` by default. Once an article is
  committed as generated, that baseline is the generated version, so it detects
  drift rather than migration loss.

---

## Corpus state: 6 migrated, 55 to go

### Migrated (6)

`change-management-ai-pmi` · `incident-response-ai-pmi` ·
`reporting-ai-decision-brief` · `fonte-unica-assistenti-ai` ·
`due-diligence-fornitori-ai-pmi` · `competenze-ai-operative-pmi`

All keep their original filenames and URLs. Five score 17/17 on the ruleset;
`competenze-ai-operative-pmi` is 16/17 (see Known issues).

### Group A — 29 articles: extractable, but lossy today

These have `.tutorial-header` and extract, but the round trip loses 800–2100
words each. They were extracted, verified, found lossy, and **reverted**.

The loss is concentrated in a handful of recurring `<div>` components that
`block_markdown()` in `build/extract.py` has no handler for. Counted across the
29 articles:

| Component | Occurrences |
|---|---|
| `tool-card` | 156 |
| `pro-tips` | 134 |
| `case-study-intro` | 73 |
| `tool-comparison` | 41 |
| `stat-card` | 36 |
| `checklist-table` | 21 |
| `info-box` | 14 |
| `prompt-bad` / `concept-card` | 11 each |

**This is the highest-leverage next task.** Each component needs either a
Markdown representation the generator can render, or a `:::html` passthrough in
the extractor. Adding handlers for the top five would likely unlock most of the
29 at once. Do them one at a time and re-run `migration-diff.py --all` after
each — the numbers tell you immediately whether it worked.

### Group B — 26 articles: a different layout entirely

`extract.py` rejects these outright. They use `.tutorial-hero` instead of
`.tutorial-header`, and the shapes differ:

- `tutorial-hero`: 26/26
- `content-section`, `related-articles`: 26/26
- `faq-section`: 25/26
- `quick-answer`: 0/26
- `sidebar` (TOC in a sidebar rather than inline): 2/26

They need a second template and a second extraction path before they can be
modelled at all. Decide first whether they should converge on the existing
template or keep a distinct one — that is a design call, not a mechanical one.

---

## The ruleset

Six rules are **gates**: the corpus passes them 61/61 and `test_aeo_static.py`
fails if that regresses.

`AEO-06` no duplicate title/h1 · `AEO-07` in sitemap + linked from a hub ·
`AEO-08` honest dates · `AEO-11` canonical · `AEO-14` GTM + Consent Mode ·
`AEO-15` asset stamps agree · `AEO-16` article schema parses · `AEO-17`
internal links resolve

The rest are **report-only** — they are the migration backlog, and they flip to
gates once the corpus can pass them. Current standing:

| Rule | Passing |
|---|---|
| AEO-01 FAQ schema matches the visible FAQ | 33 / 61 |
| AEO-02 quick answer, 40–60 words, speakable | 9 / 61 |
| AEO-03 `Person` author | 6 / 61 |
| AEO-04 sources for research/governance | 58 / 61 |
| AEO-05 title ≤ 60, description 120–160 | 19 / 61 |
| AEO-09 h2 anchors + table of contents | 6 / 61 |
| AEO-10 image dimensions, og:image 1200×630 + alt | 6 / 61 |
| AEO-12 complete hreflang set | 23 / 61 |
| AEO-13 `lang` matches directory | 60 / 61 |

Every migrated article passes all 17 by construction, so these climb as the
migration proceeds. `AEO-01` at 33/61 is the one worth understanding: on 28
articles the FAQ schema text still disagrees with the visible FAQ, which Google
treats as a structured-data mismatch. Migration fixes it permanently, because
both render from the same `faq[]` list.

---

## Known issues, not yet fixed

- **`competenze-ai-operative-pmi` `og:image` is 1080×1350.** A portrait image
  used as the link-preview image; it crops badly. Needs a landscape asset, not
  a code change. This is the only rule any migrated article fails.
- **`software-migration-plan` is `lang="en"` at the Italian root** (AEO-13's one
  failure). It should either move to `/en/` or be translated. Left alone
  because moving it changes a live URL.
- **`claude-code-review.yml` fails on every PR** with
  `401 OAuth access token has been revoked`. Every run since at least 1 July
  2026 across unrelated branches. Rotating `CLAUDE_CODE_OAUTH_TOKEN` in the
  repository secrets fixes it. Nothing in this branch can.

## Deliberately not done

- **Phase 3, the `/admin` editor.** Decap or Sveltia, both static, configured in
  one YAML file, mounted at `/admin` which `robots.txt` already disallows. Both
  need a small GitHub OAuth proxy when not on Netlify — that is the one piece of
  this project that genuinely wants a backend, and Render's free tier suits it.
  The plan puts this last on purpose: a CMS UI built before the content model
  has settled is a rewrite waiting to happen.
- **Handing `llms.txt` / `llm.txt` and the `research.html` index to the
  generator.** A test currently asserts the two `llms` files stay byte-identical;
  generating them properly is Phase 2 work that only pays off once most articles
  have content records.
- **Wiring the AEO analyzer into the publish step.** Scoring each new article
  before it ships would make this pipeline a reference customer for
  aeo.niuexa.ai. Cheap once articles are generated.
