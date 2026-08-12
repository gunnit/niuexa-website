"""Shared AEO/GEO/SEO analysis over the shipped article HTML.

This module is the Python half of the ruleset described in the content
architecture plan. It reads the ``articolo-*.html`` files exactly as they ship
and reports rule violations. ``build/aeo-lint.mjs`` enforces the same rules over
the Markdown sources *before* rendering; this one runs over the rendered output,
which is what catches template regressions.

Standard library only, so the existing ``tests/`` suite keeps needing nothing to
resolve.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://niuexa.ai"

# Sections whose articles make factual claims that an answer engine may repeat,
# so they must cite their sources visibly (AEO-04).
CITED_SECTIONS = ("ricerca", "research", "governance", "ai governance")

VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}
SKIPPED_TEXT_TAGS = {"script", "style", "noscript"}


def normalize(text: str) -> str:
    """Fold text to a comparable form: curly quotes, entities and spacing."""
    text = unicodedata.normalize("NFKC", text)
    for curly, plain in (("’", "'"), ("‘", "'"), ("“", '"'),
                         ("”", '"'), ("–", "-"), ("—", "-"),
                         (" ", " ")):
        text = text.replace(curly, plain)
    return re.sub(r"\s+", " ", text).strip()


def comparable(text: str) -> str:
    """Normalized, lowercased and stripped of punctuation, for text matching."""
    return re.sub(r"[^\w\s]", "", normalize(text).lower()).strip()


def word_count(text: str) -> int:
    return len(normalize(text).split())


@dataclass
class Heading:
    level: int
    text: str
    anchor: str | None


@dataclass
class Image:
    src: str
    alt: str | None
    width: str | None
    height: str | None


class ArticleParser(HTMLParser):
    """Pulls the handful of structures the ruleset cares about out of a page."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.html_lang: str | None = None
        self.title: str = ""
        self.metas: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.jsonld_raw: list[str] = []
        self.headings: list[Heading] = []
        self.images: list[Image] = []
        self.anchors: list[str] = []
        self.stylesheets: list[str] = []
        self.body_text_parts: list[str] = []
        self.section_classes: list[str] = []

        self._tag_stack: list[str] = []
        self._capture: list[str] | None = None
        self._pending_heading: Heading | None = None
        self._in_title = False
        self._in_jsonld = False
        self._jsonld_buffer: list[str] = []
        self._quick_answer_depth: int | None = None
        self.quick_answer_parts: list[str] = []
        self._faq_item_depth: int | None = None
        self._faq_items: list[dict[str, list[str]]] = []
        self._current_faq: dict[str, list[str]] | None = None
        self._faq_field: str | None = None

    # -- helpers ---------------------------------------------------------
    @staticmethod
    def _attrs(attrs: list[tuple[str, str | None]]) -> dict[str, str]:
        return {k.lower(): (v or "") for k, v in attrs}

    @property
    def depth(self) -> int:
        return len(self._tag_stack)

    # -- HTMLParser hooks ------------------------------------------------
    def handle_starttag(self, tag, attrs):  # noqa: D102
        tag = tag.lower()
        a = self._attrs(attrs)

        if tag not in VOID_ELEMENTS:
            self._tag_stack.append(tag)

        if tag == "html":
            self.html_lang = a.get("lang")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            self.metas.append(a)
        elif tag == "link":
            self.links.append(a)
            if "stylesheet" in a.get("rel", ""):
                self.stylesheets.append(a.get("href", ""))
        elif tag == "script" and a.get("type", "").lower() == "application/ld+json":
            self._in_jsonld = True
            self._jsonld_buffer = []
        elif tag == "img":
            self.images.append(Image(
                src=a.get("src", ""),
                alt=a.get("alt"),
                width=a.get("width"),
                height=a.get("height"),
            ))
        elif tag == "a" and a.get("href"):
            self.anchors.append(a["href"])
        elif re.fullmatch(r"h[1-6]", tag):
            self._pending_heading = Heading(int(tag[1]), "", a.get("id"))
            self._capture = []
        elif tag == "section":
            self.section_classes.append(a.get("class", ""))

        classes = a.get("class", "").split()
        if "quick-answer" in classes and self._quick_answer_depth is None:
            self._quick_answer_depth = self.depth
        if "faq-item" in classes and self._faq_item_depth is None:
            self._faq_item_depth = self.depth
            self._current_faq = {"q": [], "a": []}

        if self._current_faq is not None:
            if tag in ("h2", "h3", "h4", "summary", "dt"):
                self._faq_field = "q"
            elif tag in ("p", "div", "dd"):
                self._faq_field = "a"

    def handle_endtag(self, tag):  # noqa: D102
        tag = tag.lower()
        if tag == "title":
            self._in_title = False
        elif tag == "script" and self._in_jsonld:
            self.jsonld_raw.append("".join(self._jsonld_buffer))
            self._in_jsonld = False
        elif re.fullmatch(r"h[1-6]", tag) and self._pending_heading is not None:
            self._pending_heading.text = normalize("".join(self._capture or []))
            self.headings.append(self._pending_heading)
            self._pending_heading = None
            self._capture = None

        if tag not in VOID_ELEMENTS and tag in self._tag_stack:
            while self._tag_stack and self._tag_stack.pop() != tag:
                pass

        if self._quick_answer_depth is not None and self.depth < self._quick_answer_depth:
            self._quick_answer_depth = None
        if self._faq_item_depth is not None and self.depth < self._faq_item_depth:
            self._faq_item_depth = None
            if self._current_faq is not None:
                self._faq_items.append(self._current_faq)
            self._current_faq = None
            self._faq_field = None

    def handle_data(self, data):  # noqa: D102
        if self._in_title:
            self.title += data
            return
        if self._in_jsonld:
            self._jsonld_buffer.append(data)
            return
        if self._capture is not None:
            self._capture.append(data)

        current = self._tag_stack[-1] if self._tag_stack else ""
        if current in SKIPPED_TEXT_TAGS:
            return

        self.body_text_parts.append(data)
        if self._quick_answer_depth is not None:
            self.quick_answer_parts.append(data)
        if self._current_faq is not None and self._faq_field:
            self._current_faq[self._faq_field].append(data)


@dataclass
class Article:
    path: Path
    slug: str
    raw: str
    parser: ArticleParser
    jsonld: list[dict] = field(default_factory=list)
    jsonld_errors: list[str] = field(default_factory=list)

    # -- derived views ---------------------------------------------------
    @property
    def url(self) -> str:
        return f"{SITE}/{self.path.name}"

    @property
    def text(self) -> str:
        return normalize("".join(self.parser.body_text_parts))

    @property
    def comparable_text(self) -> str:
        return comparable("".join(self.parser.body_text_parts))

    def meta(self, **match: str) -> str | None:
        for m in self.parser.metas:
            if all(m.get(k, "").lower() == v.lower() for k, v in match.items()):
                return m.get("content")
        return None

    @property
    def description(self) -> str:
        return self.meta(name="description") or ""

    @property
    def canonical(self) -> str | None:
        for link in self.parser.links:
            if "canonical" in link.get("rel", "").split():
                return link.get("href")
        return None

    @property
    def hreflangs(self) -> dict[str, str]:
        out = {}
        for link in self.parser.links:
            if "alternate" in link.get("rel", "").split() and link.get("hreflang"):
                out[link["hreflang"].lower()] = link.get("href", "")
        return out

    @property
    def h1s(self) -> list[Heading]:
        return [h for h in self.parser.headings if h.level == 1]

    @property
    def quick_answer(self) -> str:
        return normalize("".join(self.parser.quick_answer_parts))

    @property
    def visible_faq(self) -> list[tuple[str, str]]:
        return [
            (normalize("".join(item["q"])), normalize("".join(item["a"])))
            for item in self.parser._faq_items
            if normalize("".join(item["q"]))
        ]

    def schema_of(self, *types: str) -> list[dict]:
        wanted = {t.lower() for t in types}
        return [b for b in self.jsonld
                if str(b.get("@type", "")).lower() in wanted]

    @property
    def article_schema(self) -> dict | None:
        blocks = self.schema_of("Article", "TechArticle", "BlogPosting", "NewsArticle")
        return blocks[0] if blocks else None

    @property
    def faq_schema(self) -> dict | None:
        blocks = self.schema_of("FAQPage")
        return blocks[0] if blocks else None

    @property
    def breadcrumb_schema(self) -> dict | None:
        blocks = self.schema_of("BreadcrumbList")
        return blocks[0] if blocks else None

    @property
    def schema_faq_pairs(self) -> list[tuple[str, str]]:
        block = self.faq_schema
        if not block:
            return []
        pairs = []
        for entity in block.get("mainEntity", []) or []:
            if not isinstance(entity, dict):
                continue
            answer = entity.get("acceptedAnswer") or {}
            pairs.append((
                normalize(str(entity.get("name", ""))),
                normalize(str(answer.get("text", "")) if isinstance(answer, dict) else ""),
            ))
        return pairs

    @property
    def section(self) -> str:
        schema = self.article_schema or {}
        return str(schema.get("articleSection") or self.meta(property="article:section") or "")

    @property
    def internal_links(self) -> list[str]:
        out = []
        for href in self.parser.anchors:
            if href.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:")):
                continue
            out.append(href)
        return out


def load_articles() -> list[Article]:
    articles = []
    for path in sorted(ROOT.glob("articolo-*.html")):
        raw = path.read_text(encoding="utf-8", errors="ignore")
        parser = ArticleParser()
        parser.feed(raw)
        parser.close()
        article = Article(
            path=path,
            slug=path.stem.removeprefix("articolo-"),
            raw=raw,
            parser=parser,
        )
        for block in parser.jsonld_raw:
            try:
                parsed = json.loads(block)
            except json.JSONDecodeError as exc:
                article.jsonld_errors.append(str(exc))
                continue
            if isinstance(parsed, list):
                article.jsonld.extend(p for p in parsed if isinstance(p, dict))
            elif isinstance(parsed, dict):
                if isinstance(parsed.get("@graph"), list):
                    article.jsonld.extend(p for p in parsed["@graph"] if isinstance(p, dict))
                else:
                    article.jsonld.append(parsed)
        articles.append(article)
    return articles


def sitemap_urls() -> set[str]:
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return set()
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    tree = ElementTree.fromstring(sitemap.read_text(encoding="utf-8"))
    return {
        (loc.text or "").strip()
        for loc in tree.findall(".//sm:url/sm:loc", ns)
    }


def hub_linked_slugs() -> set[str]:
    """Article filenames referenced from any non-article page on the site."""
    linked = set()
    href = re.compile(r'href=["\'][^"\']*?(articolo-[a-z0-9-]+\.html)')
    for page in ROOT.rglob("*.html"):
        if page.name.startswith("articolo-"):
            continue
        if any(part in {".git", "node_modules", ".claude"} for part in page.parts):
            continue
        text = page.read_text(encoding="utf-8", errors="ignore")
        linked.update(href.findall(text))
    return linked


# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------

@dataclass
class Rule:
    id: str
    title: str
    gate: bool = False


@dataclass
class Result:
    rule: Rule
    passing: list[str] = field(default_factory=list)
    failing: list[tuple[str, str]] = field(default_factory=list)

    @property
    def total(self) -> int:
        return len(self.passing) + len(self.failing)


RULES: dict[str, Rule] = {}


def _rule(rule_id: str, title: str, gate: bool = False) -> Rule:
    rule = Rule(rule_id, title, gate)
    RULES[rule_id] = rule
    return rule


AEO01 = _rule("AEO-01", "FAQ schema matches the visible FAQ text")
AEO02 = _rule("AEO-02", "quick_answer present, 40-60 words, marked speakable")
AEO03 = _rule("AEO-03", "Person author with name, url, jobTitle, sameAs")
AEO04 = _rule("AEO-04", "sources[] rendered for research/governance articles")
AEO05 = _rule("AEO-05", "title <= 60 chars, description 120-160")
AEO06 = _rule("AEO-06", "no duplicate title or h1 across the corpus", gate=True)
AEO07 = _rule("AEO-07", "in sitemap.xml and linked from a hub page", gate=True)
AEO08 = _rule("AEO-08", "dateModified present and not before datePublished", gate=True)
AEO09 = _rule("AEO-09", "heading order intact, every h2 anchored and in a TOC")
AEO10 = _rule("AEO-10", "images carry alt/width/height, OG image 1200x630 + alt")
AEO11 = _rule("AEO-11", "canonical present, self-referential or a real merge", gate=True)
AEO12 = _rule("AEO-12", "hreflang set complete and self-referential")
AEO13 = _rule("AEO-13", "html lang matches the article's directory")
AEO14 = _rule("AEO-14", "GTM and Consent Mode present, consent before gtm.js", gate=True)
AEO15 = _rule("AEO-15", "stylesheet version stamps agree across the corpus", gate=True)
AEO16 = _rule("AEO-16", "article-level schema present and parseable", gate=True)
AEO17 = _rule("AEO-17", "internal links resolve to a file in the repo", gate=True)


def current_asset_versions() -> dict[str, str]:
    """The stamp each stylesheet is referenced with on most pages sitewide.

    Majority rather than newest on purpose: a single page bumping a stamp is the
    outlier, and calling the other 60 pages stale would invert the finding.
    """
    counts: dict[str, dict[str, int]] = {}
    pattern = re.compile(r'href="([a-z0-9-]+\.css)\?v=(\d{8})"')
    for page in ROOT.rglob("*.html"):
        if any(part in {".git", "node_modules", ".claude"} for part in page.parts):
            continue
        for name, version in pattern.findall(page.read_text(encoding="utf-8", errors="ignore")):
            counts.setdefault(name, {})[version] = counts.setdefault(name, {}).get(version, 0) + 1
    return {
        name: max(versions.items(), key=lambda kv: (kv[1], kv[0]))[0]
        for name, versions in counts.items()
    }


def evaluate(articles: list[Article] | None = None) -> dict[str, Result]:
    articles = articles or load_articles()
    results = {rid: Result(rule) for rid, rule in RULES.items()}
    sitemap = sitemap_urls()
    hubs = hub_linked_slugs()
    versions = current_asset_versions()

    titles: dict[str, list[str]] = {}
    h1s: dict[str, list[str]] = {}
    for a in articles:
        titles.setdefault(comparable(a.parser.title), []).append(a.slug)
        for h in a.h1s:
            h1s.setdefault(comparable(h.text), []).append(a.slug)

    # A page whose canonical points elsewhere has been deliberately merged into
    # another page. It is then *correct* for it to be out of the sitemap and to
    # share a title with its canonical target.
    canonical_target: dict[str, str] = {}
    for a in articles:
        target = a.canonical or ""
        if target and target != a.url:
            canonical_target[a.slug] = target.rsplit("/", 1)[-1]
    by_slug = {a.slug: a for a in articles}

    for a in articles:
        def record(rule: Rule, ok: bool, reason: str = "") -> None:
            if ok:
                results[rule.id].passing.append(a.slug)
            else:
                results[rule.id].failing.append((a.slug, reason))

        # AEO-01 -- schema FAQ must be the visible FAQ.
        schema_faq = a.schema_faq_pairs
        visible_faq = a.visible_faq
        if not schema_faq:
            record(AEO01, False, "no FAQPage schema")
        else:
            visible_q = {comparable(q) for q, _ in visible_faq}
            body = a.comparable_text
            drift = []
            for question, answer in schema_faq:
                if comparable(question) not in visible_q:
                    drift.append(f"question not visible: {question[:60]!r}")
                elif answer and comparable(answer) not in body:
                    drift.append(f"answer text not in DOM: {question[:50]!r}")
            record(AEO01, not drift, "; ".join(drift[:3]) or "")

        # AEO-02 -- the extractable answer.
        qa = a.quick_answer
        if not qa:
            record(AEO02, False, "no .quick-answer block")
        else:
            words = word_count(qa)
            speakable = json.dumps((a.article_schema or {}).get("speakable", ""))
            problems = []
            if not 40 <= words <= 60:
                problems.append(f"{words} words (want 40-60)")
            if ".quick-answer" not in speakable:
                problems.append("not covered by speakable")
            record(AEO02, not problems, ", ".join(problems))

        # AEO-03 -- a named human author.
        author = (a.article_schema or {}).get("author")
        authors = author if isinstance(author, list) else [author] if author else []
        person = next((x for x in authors
                       if isinstance(x, dict) and str(x.get("@type", "")).lower() == "person"), None)
        if not person:
            record(AEO03, False, "no Person author")
        else:
            missing = [f for f in ("name", "url", "jobTitle", "sameAs") if not person.get(f)]
            record(AEO03, not missing, f"Person missing {', '.join(missing)}" if missing else "")

        # AEO-04 -- citations where claims are made.
        needs_sources = any(k in a.section.lower() for k in CITED_SECTIONS)
        if not needs_sources:
            record(AEO04, True)
        else:
            cited = (a.article_schema or {}).get("citation")
            external = [h for h in a.parser.anchors if h.startswith("http") and "niuexa.ai" not in h]
            if cited:
                record(AEO04, True)
            elif external:
                record(AEO04, False, f"{len(external)} sources rendered but none in schema citation")
            else:
                record(AEO04, False, "no sources rendered or in schema")

        # AEO-05 -- length budgets.
        title_len = len(normalize(a.parser.title))
        desc_len = len(normalize(a.description))
        problems = []
        if title_len > 60:
            problems.append(f"title {title_len} chars")
        if not 120 <= desc_len <= 160:
            problems.append(f"description {desc_len} chars")
        record(AEO05, not problems, ", ".join(problems))

        # AEO-06 -- no cannibalization. A clash is resolved when either side
        # canonicalizes to the other.
        canonical = a.canonical or ""
        merged_away = a.slug in canonical_target

        def resolved_with(partners: list[str]) -> bool:
            for partner in partners:
                if partner == a.slug:
                    continue
                if merged_away and canonical_target[a.slug] == by_slug[partner].path.name:
                    return True
                if canonical_target.get(partner) == a.path.name:
                    return True
            return False

        clashes = []
        title_partners = titles.get(comparable(a.parser.title), [])
        if len(title_partners) > 1 and not resolved_with(title_partners):
            clashes.append("shared title")
        for h in a.h1s:
            partners = h1s.get(comparable(h.text), [])
            if len(partners) > 1 and not resolved_with(partners):
                clashes.append("shared h1")
        record(AEO06, not clashes, ", ".join(sorted(set(clashes))))

        # AEO-07 -- discoverable. A page merged into another must be *absent*
        # from the sitemap, not present in it.
        problems = []
        if merged_away:
            if a.url in sitemap:
                problems.append(f"canonicalized to {canonical_target[a.slug]} but still in sitemap.xml")
        else:
            if a.url not in sitemap:
                problems.append("absent from sitemap.xml")
            if a.path.name not in hubs:
                problems.append("not linked from any hub page")
        record(AEO07, not problems, ", ".join(problems))

        # AEO-08 -- honest dates.
        schema = a.article_schema or {}
        published = str(schema.get("datePublished", ""))[:10]
        modified = str(schema.get("dateModified", ""))[:10]
        if not published:
            record(AEO08, False, "no datePublished")
        elif not modified:
            record(AEO08, False, "no dateModified")
        elif modified < published:
            record(AEO08, False, f"dateModified {modified} precedes datePublished {published}")
        else:
            record(AEO08, True)

        # AEO-09 -- navigable structure.
        problems = []
        levels = [h.level for h in a.parser.headings]
        if levels.count(1) != 1:
            problems.append(f"{levels.count(1)} h1 elements")
        previous = 0
        for h in a.parser.headings:
            if previous and h.level > previous + 1:
                problems.append(f"h{previous}->h{h.level} skip at {h.text[:32]!r}")
                break
            previous = h.level
        h2s = [h for h in a.parser.headings if h.level == 2]
        unanchored = [h for h in h2s if not h.anchor]
        if unanchored:
            problems.append(f"{len(unanchored)}/{len(h2s)} h2 without an id")
        if not re.search(r'class="[^"]*\b(toc|table-of-contents)\b', a.raw):
            problems.append("no table of contents")
        record(AEO09, not problems, "; ".join(problems[:3]))

        # AEO-10 -- media hygiene.
        problems = []
        bad_imgs = [i for i in a.parser.images if not i.alt or not i.width or not i.height]
        if bad_imgs:
            problems.append(f"{len(bad_imgs)}/{len(a.parser.images)} img missing alt/width/height")
        og_w = a.meta(property="og:image:width")
        og_h = a.meta(property="og:image:height")
        if not a.meta(property="og:image"):
            problems.append("no og:image")
        elif (og_w, og_h) != ("1200", "630"):
            problems.append(f"og:image {og_w}x{og_h}")
        if a.meta(property="og:image") and not a.meta(property="og:image:alt"):
            problems.append("og:image without alt")
        record(AEO10, not problems, ", ".join(problems))

        # AEO-11 -- canonical present, and either self-referential or pointing
        # at a page that actually exists.
        if not canonical:
            record(AEO11, False, "no canonical")
        elif canonical == a.url:
            record(AEO11, True)
        else:
            target = ROOT / canonical.rsplit("/", 1)[-1]
            record(AEO11, target.exists(),
                   f"canonical points at missing page {canonical}")

        # AEO-12 -- hreflang.
        hl = a.hreflangs
        expected = {"it", "it-it", "x-default"}
        missing = sorted(expected - set(hl))
        wrong = sorted(k for k, v in hl.items() if k in expected and v != a.url)
        problems = []
        if missing:
            problems.append(f"missing hreflang {', '.join(missing)}")
        if wrong:
            problems.append(f"hreflang not self-referential: {', '.join(wrong)}")
        record(AEO12, not problems, "; ".join(problems))

        # AEO-13 -- language.
        expected_lang = "en" if a.path.parent.name == "en" else "it"
        record(AEO13, (a.parser.html_lang or "").lower().startswith(expected_lang),
               f"lang={a.parser.html_lang!r}, expected {expected_lang!r}")

        # AEO-14 -- tracking block present and ordered.
        gtm = a.raw.find("googletagmanager.com/gtm.js")
        consent = a.raw.find("gtag('consent','default'")
        if consent == -1:
            consent = a.raw.find("gtag('consent', 'default'")
        problems = []
        if gtm == -1:
            problems.append("no GTM loader")
        if consent == -1:
            problems.append("no Consent Mode default")
        if "GTM-KG9S42S4" not in a.raw:
            problems.append("wrong or missing GTM container id")
        record(AEO14, not problems, ", ".join(problems))

        # AEO-15 -- asset version stamps agree with the rest of the corpus.
        stale = []
        for href in a.parser.stylesheets:
            match = re.fullmatch(r"([a-z0-9-]+\.css)\?v=(\d{8})", href)
            if not match:
                if href.endswith(".css") and not href.startswith("http"):
                    stale.append(f"{href} unversioned")
                continue
            name, version = match.groups()
            if versions.get(name, version) != version:
                stale.append(f"{name} v={version} (corpus uses {versions[name]})")
        record(AEO15, not stale, ", ".join(stale))

        # AEO-16 -- article schema parses and exists.
        if a.jsonld_errors:
            record(AEO16, False, f"invalid JSON-LD: {a.jsonld_errors[0][:60]}")
        else:
            record(AEO16, a.article_schema is not None, "no Article/TechArticle schema")

        # AEO-17 -- internal links resolve. Root-relative hrefs are resolved
        # against the site root, not the filesystem root.
        broken = []
        for href in a.internal_links:
            target = href.split("#", 1)[0].split("?", 1)[0]
            if not target:
                continue
            base = ROOT if target.startswith("/") else a.path.parent
            candidate = (base / target.lstrip("/")).resolve()
            if not candidate.exists():
                broken.append(target)
        record(AEO17, not broken, f"broken: {', '.join(sorted(set(broken))[:3])}")

    return results


def scoreboard(results: dict[str, Result]) -> str:
    lines = ["", "AEO ruleset over the shipped article HTML", "=" * 74,
             f"{'Rule':<8} {'Pass':>9}  {'Mode':<7} Description", "-" * 74]
    for rule_id in sorted(results):
        result = results[rule_id]
        rule = result.rule
        count = f"{len(result.passing)}/{result.total}"
        mode = "gate" if rule.gate else "report"
        lines.append(f"{rule_id:<8} {count:>9}  {mode:<7} {rule.title}")
    lines.append("-" * 74)
    failing = [r for r in results.values() if r.failing]
    lines.append(f"{len(failing)} of {len(results)} rules have at least one violation.")
    lines.append("")
    for rule_id in sorted(results):
        result = results[rule_id]
        if not result.failing:
            continue
        lines.append(f"{rule_id} - {result.rule.title} ({len(result.failing)} failing)")
        for slug, reason in result.failing[:6]:
            lines.append(f"    {slug}: {reason}" if reason else f"    {slug}")
        if len(result.failing) > 6:
            lines.append(f"    ... and {len(result.failing) - 6} more")
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    print(scoreboard(evaluate()))
