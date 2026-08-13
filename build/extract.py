"""Convert a hand-written articolo-*.html into a content/articles/*.md record.

This is the Phase 2 migration tool. It reads a shipped article, recovers the
content model from the markup, and writes the Markdown source the generator
renders back. Extraction is never perfect, so the output is a *draft* for
review, and the loop that makes it safe is:

    python3 build/extract.py articolo-<slug>.html
    node build/build.mjs <slug>
    python3 build/migration-diff.py articolo-<slug>.html

The last step reports any word the round trip lost. Nothing should be committed
until it comes back clean or the differences are understood.

Standard library only, like the rest of the build.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}
SKIP_TEXT = {"script", "style", "noscript"}


# ---------------------------------------------------------------------------
# A very small DOM
# ---------------------------------------------------------------------------

class Node:
    __slots__ = ("tag", "attrs", "children", "parent")

    def __init__(self, tag, attrs=None, parent=None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children = []
        self.parent = parent

    # -- queries ---------------------------------------------------------
    @property
    def classes(self):
        return set(self.attrs.get("class", "").split())

    def walk(self):
        for child in self.children:
            if isinstance(child, Node):
                yield child
                yield from child.walk()

    def find(self, tag=None, cls=None):
        for node in self.walk():
            if tag and node.tag != tag:
                continue
            if cls and cls not in node.classes:
                continue
            return node
        return None

    def find_all(self, tag=None, cls=None):
        out = []
        for node in self.walk():
            if tag and node.tag != tag:
                continue
            if cls and cls not in node.classes:
                continue
            out.append(node)
        return out

    def kids(self, tag=None):
        return [c for c in self.children
                if isinstance(c, Node) and (tag is None or c.tag == tag)]

    @property
    def text(self):
        parts = []
        for child in self.children:
            if isinstance(child, str):
                parts.append(child)
            elif child.tag not in SKIP_TEXT:
                parts.append(child.text)
        return re.sub(r"\s+", " ", "".join(parts)).strip()


class DomParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root")
        self.current = self.root
        self.jsonld = []
        self._in_jsonld = False
        self._buffer = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "script" and a.get("type", "").lower() == "application/ld+json":
            self._in_jsonld = True
            self._buffer = []
            return
        node = Node(tag, a, self.current)
        self.current.children.append(node)
        if tag not in VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        self.current.children.append(Node(tag.lower(), a, self.current))

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "script" and self._in_jsonld:
            self._in_jsonld = False
            try:
                self.jsonld.append(json.loads("".join(self._buffer)))
            except json.JSONDecodeError:
                pass
            return
        if tag in VOID:
            return
        node = self.current
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root:
            self.current = node.parent

    def handle_data(self, data):
        if self._in_jsonld:
            self._buffer.append(data)
        else:
            self.current.children.append(data)


def parse(html: str) -> DomParser:
    parser = DomParser()
    parser.feed(html)
    parser.close()
    return parser


# ---------------------------------------------------------------------------
# YAML emitting (the subset build/yaml.mjs understands)
# ---------------------------------------------------------------------------

NEEDS_QUOTE = re.compile(r"(^\s)|(\s$)|(:\s)|(\s#)|(^[\[\]{}>|&*!%@`\"'#-])|(:$)")


def yaml_scalar(value):
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    text = str(value)
    if text == "" or NEEDS_QUOTE.search(text):
        return '"%s"' % text.replace('"', '\\"')
    return text


def yaml_block(key, text, indent=0):
    """Emit a folded block scalar, wrapped at a readable width."""
    pad = " " * indent
    words = text.split()
    lines, current = [], ""
    for word in words:
        if current and len(current) + len(word) + 1 > 78:
            lines.append(current)
            current = word
        else:
            current = f"{current} {word}".strip()
    if current:
        lines.append(current)
    body = "\n".join(f"{pad}  {line}" for line in lines)
    return f"{pad}{key}: >\n{body}"


def yaml_dump(data, indent=0):
    pad = " " * indent
    out = []
    for key, value in data.items():
        if value is None or value == [] or value == {}:
            continue
        if isinstance(value, dict):
            out.append(f"{pad}{key}:")
            out.append(yaml_dump(value, indent + 2))
        elif isinstance(value, list):
            out.append(f"{pad}{key}:")
            for item in value:
                if isinstance(item, dict):
                    lines = yaml_dump(item, indent + 4).split("\n")
                    lines[0] = f"{pad}  - {lines[0].lstrip()}"
                    out.extend(lines)
                else:
                    out.append(f"{pad}  - {yaml_scalar(item)}")
        else:
            out.append(f"{pad}{key}: {yaml_scalar(value)}")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# HTML -> Markdown
# ---------------------------------------------------------------------------

def inline(node) -> str:
    """Serialise a node's children back to Markdown inline syntax."""
    parts = []
    for child in node.children:
        if isinstance(child, str):
            parts.append(child)
            continue
        if child.tag in SKIP_TEXT:
            continue
        inner = inline(child)
        if child.tag in ("strong", "b"):
            parts.append(f"**{inner.strip()}**" if inner.strip() else "")
        elif child.tag in ("em", "i"):
            parts.append(f"*{inner.strip()}*" if inner.strip() else "")
        elif child.tag == "code":
            parts.append(f"`{inner.strip()}`")
        elif child.tag == "a":
            href = child.attrs.get("href", "")
            parts.append(f"[{inner.strip()}]({href})" if href else inner)
        elif child.tag == "br":
            parts.append(" ")
        else:
            parts.append(inner)
    return re.sub(r"[ \t]+", " ", "".join(parts)).strip()


def figure_directive(fig) -> str:
    img = fig.find("img")
    if img is None:
        return ""
    caption = fig.find("figcaption")
    classes = [c for c in fig.attrs.get("class", "").split() if c != "article-visual"]
    attrs = [
        f'src="{img.attrs.get("src", "")}"',
        f'alt="{img.attrs.get("alt", "")}"',
        f'width="{img.attrs.get("width", "")}"',
        f'height="{img.attrs.get("height", "")}"',
    ]
    if img.attrs.get("loading") and img.attrs["loading"] != "lazy":
        attrs.append(f'loading="{img.attrs["loading"]}"')
    if classes:
        attrs.append(f'class="{" ".join(classes)}"')
    lines = [":::figure " + " ".join(attrs)]
    if caption is not None:
        lines.append(inline(caption))
    lines.append(":::")
    return "\n".join(lines)


def table_markdown(table) -> str:
    head = table.find("thead")
    body = table.find("tbody") or table
    rows = []
    if head is not None:
        header = [inline(th) for th in head.find_all("th")]
        rows.append("| " + " | ".join(header) + " |")
        rows.append("| " + " | ".join("---" for _ in header) + " |")
    for tr in body.find_all("tr"):
        cells = [inline(td) for td in tr.kids("td")]
        if cells:
            rows.append("| " + " | ".join(cells) + " |")
    return "\n".join(rows)


def block_markdown(node) -> str:
    """Convert one block-level child of a .content-section."""
    if node.tag == "p":
        return inline(node)
    if node.tag in ("h3", "h4"):
        return ("### " if node.tag == "h3" else "#### ") + inline(node)
    if node.tag == "ul":
        return "\n".join(f"- {inline(li)}" for li in node.kids("li"))
    if node.tag == "ol":
        return "\n".join(f"{i}. {inline(li)}"
                         for i, li in enumerate(node.kids("li"), start=1))
    if node.tag == "figure":
        return figure_directive(node)
    if node.tag == "table":
        return table_markdown(node)
    if node.tag == "div" and node.classes & {"highlight-box", "info-box", "warning-box"}:
        # Preserve bespoke callouts verbatim; the template has no equivalent.
        return ":::html\n" + serialize(node) + "\n:::"
    return ""


def serialize(node) -> str:
    """Re-emit a node as HTML, for the raw_html escape hatch."""
    if isinstance(node, str):
        return node
    attrs = "".join(f' {k}="{v}"' for k, v in node.attrs.items())
    inner = "".join(serialize(c) for c in node.children)
    if node.tag in VOID:
        return f"<{node.tag}{attrs}>"
    return f"<{node.tag}{attrs}>{inner}</{node.tag}>"


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

def meta(dom, **match):
    for node in dom.root.find_all("meta"):
        if all(node.attrs.get(k, "").lower() == v.lower() for k, v in match.items()):
            return node.attrs.get("content")
    return None


def schema_of(dom, *types):
    wanted = {t.lower() for t in types}
    for block in dom.jsonld:
        if isinstance(block, dict) and str(block.get("@type", "")).lower() in wanted:
            return block
    return None


def extract(path: Path, site_breadcrumbs: dict) -> tuple[dict, str, list[str]]:
    html = path.read_text(encoding="utf-8")
    dom = parse(html)
    slug = path.stem.removeprefix("articolo-")
    warnings = []

    # Extracting from generated output would round-trip the generator's own
    # decisions back into the source and quietly bake in anything it dropped.
    # Always extract from the hand-written original.
    if 'class="article-toc"' in html:
        raise ValueError(
            f"{path.name} was produced by build/build.mjs; extract from the "
            "hand-written original instead (git show <ref>:<file>)"
        )

    article_schema = schema_of(dom, "Article", "TechArticle", "BlogPosting") or {}
    faq_schema = schema_of(dom, "FAQPage") or {}
    crumb_schema = schema_of(dom, "BreadcrumbList") or {}

    header = dom.root.find(cls="tutorial-header")
    if header is None:
        raise ValueError(f"{path.name}: no .tutorial-header; not a template-conformant article")
    wrapper = dom.root.find(cls="content-wrapper")
    if wrapper is None:
        raise ValueError(f"{path.name}: no .content-wrapper")

    h1 = header.find("h1")
    badge = header.find(cls="tutorial-badge")
    standfirst = header.find(cls="tutorial-description")
    stats = [s.text for s in header.find_all("span", "stat")]

    data = {
        "slug": slug,
        "lang": "it",
        "type": article_schema.get("@type", "Article"),
        "title": None,          # filled below
        "meta_title": (dom.root.find("title").text if dom.root.find("title") else None),
        "h1": inline(h1) if h1 is not None else None,
        "description": meta(dom, name="description"),
        "standfirst": inline(standfirst) if standfirst is not None else None,
        "section": meta(dom, property="article:section") or article_schema.get("articleSection"),
        "badge": badge.text if badge is not None else None,
        "published": (meta(dom, property="article:published_time")
                      or article_schema.get("datePublished", ""))[:10] or None,
        "modified": (meta(dom, property="article:modified_time")
                     or article_schema.get("dateModified", ""))[:10] or None,
        "author": "gregor-maric",
        "reviewed_by": "roberto-botto",
    }

    if stats:
        data["reading_time"] = stats[0]
        if len(stats) > 1:
            data["audience"] = stats[1]
        if len(stats) > 2:
            data["format"] = stats[2]
    data["visuals"] = "article-visuals.css" in html

    # Breadcrumb trail from the schema; the last entry is the current page.
    crumbs = [str(item.get("name", ""))
              for item in crumb_schema.get("itemListElement", []) or []]
    # A handful of articles label the same hubs in English, in schema only and
    # with no visible breadcrumb. The site is Italian; normalise them.
    aliases = {"Research": "Ricerca", "Learn": "Impara"}
    renamed = [c for c in crumbs[:-1] if c in aliases]
    if renamed:
        crumbs = [aliases.get(c, c) for c in crumbs[:-1]] + crumbs[-1:]
        warnings.append(
            "normalised English breadcrumb label(s) to Italian: "
            + ", ".join(f"{c} -> {aliases[c]}" for c in renamed)
        )
    if crumbs:
        data["breadcrumb"] = crumbs[:-1]
        data["breadcrumb_label"] = crumbs[-1]
        unknown = [c for c in data["breadcrumb"] if c not in site_breadcrumbs]
        if unknown:
            warnings.append(f"breadcrumb label(s) not in content/site.yml: {', '.join(unknown)}")
    else:
        nav = header.find(cls="breadcrumb")
        data["breadcrumb"] = ["Home", "Ricerca"]
        data["breadcrumb_label"] = nav.find("span").text if nav and nav.find("span") else None
        warnings.append("no BreadcrumbList schema; assumed [Home, Ricerca]")

    # The visible title is the breadcrumb label where one exists: it is the
    # short form an editor already chose for this article.
    data["title"] = data["breadcrumb_label"] or data["h1"]

    for key, prop in (("og_title", "og:title"), ("og_description", "og:description")):
        data[key] = meta(dom, property=prop)
    data["twitter_description"] = meta(dom, name="twitter:description")

    og_image = meta(dom, property="og:image")
    if og_image:
        data["og_image"] = {
            "src": og_image.replace("https://niuexa.ai/", ""),
            "alt": meta(dom, property="og:image:alt") or (data["h1"] or slug),
            "w": int(meta(dom, property="og:image:width") or 1200),
            "h": int(meta(dom, property="og:image:height") or 630),
        }
        if not meta(dom, property="og:image:alt"):
            warnings.append("og:image had no alt; reused the h1")
        if not meta(dom, property="og:image:width"):
            warnings.append("og:image had no dimensions; assumed 1200x630 — verify")

    # A canonical pointing at another page means this article was deliberately
    # merged into it; the generator must preserve that, not self-canonicalise.
    for link in dom.root.find_all("link"):
        if "canonical" in link.attrs.get("rel", "").split():
            href = link.attrs.get("href", "")
            if href and not href.endswith(f"articolo-{slug}.html"):
                data["canonical"] = href
                warnings.append(f"canonicalised to {href.rsplit('/', 1)[-1]}; kept")
            break

    keywords = meta(dom, name="keywords")
    if keywords:
        data["keywords"] = [k.strip() for k in keywords.split(",") if k.strip()]

    hero = wrapper.find(cls="article-visual-hero")
    if hero is not None:
        img = hero.find("img")
        cap = hero.find("figcaption")
        data["hero"] = {
            "src": img.attrs.get("src", ""),
            "alt": img.attrs.get("alt", ""),
            "w": int(img.attrs.get("width") or 1200),
            "h": int(img.attrs.get("height") or 630),
        }
        if cap is not None:
            data["hero"]["caption"] = inline(cap)

    body_parts = []
    for section in wrapper.kids("section"):
        classes = section.classes
        heading = section.find("h2")
        heading_text = inline(heading) if heading is not None else ""

        if "quick-answer" in classes:
            data["quick_answer_heading"] = heading_text
            paragraphs = [inline(p) for p in section.kids("p")]
            data["quick_answer"] = " ".join(p for p in paragraphs if p)
            continue

        if "faq-section" in classes:
            data["faq_heading"] = heading_text
            items = []
            for item in section.find_all("div", "faq-item"):
                question = item.find("h3") or item.find("h4")
                answer = item.find("p")
                if question is not None and answer is not None:
                    items.append({"q": inline(question), "a": inline(answer)})
            data["faq"] = items
            continue

        if section.find(cls="related-articles") is not None:
            related = []
            for card in section.find_all("a", "related-card"):
                category = card.find(cls="related-category")
                title = card.find("h3")
                related.append({
                    "href": card.attrs.get("href", ""),
                    "category": category.text if category is not None else "",
                    "title": inline(title) if title is not None else "",
                })
            data["related"] = related
            continue

        if re.match(r"^fonti\b", heading_text, re.I):
            data["sources_heading"] = heading_text
            paragraphs = [inline(p) for p in section.kids("p")]
            if paragraphs:
                data["sources_intro"] = paragraphs[0]
            if len(paragraphs) > 1:
                data["sources_disclaimer"] = paragraphs[-1]
            # Paragraphs between the intro and the disclaimer are prose the
            # template has no slot for; keeping them is what stops the migration
            # from silently deleting a whole section.
            if len(paragraphs) > 2:
                data["sources_paragraphs"] = paragraphs[1:-1]

            sources = []
            for li in section.find_all("li"):
                link = li.find("a")
                if link is None:
                    continue
                label = inline(link)
                note = inline(li)
                note = note.replace(f"[{label}]({link.attrs.get('href', '')})", "").strip()
                sources.append({
                    "title": label,
                    "url": link.attrs.get("href", ""),
                    "note": note.lstrip(",").strip() or None,
                })
            if not sources:
                # Cited in prose rather than in a list. Harvest the links so the
                # schema still carries citation; the prose renders them visibly.
                for paragraph in section.kids("p"):
                    for link in paragraph.find_all("a"):
                        sources.append({
                            "title": inline(link),
                            "url": link.attrs.get("href", ""),
                        })
                if sources:
                    warnings.append(
                        f"{len(sources)} source(s) cited in prose, not a list; "
                        "harvested for schema citation and the prose kept verbatim"
                    )
            data["sources"] = sources
            continue

        # An ordinary content section.
        blocks = []
        for child in section.kids():
            if child is heading:
                continue
            rendered = block_markdown(child)
            if rendered:
                blocks.append(rendered)
            elif child.tag not in ("h2",):
                warnings.append(f"dropped <{child.tag}> in section {heading_text[:40]!r}")
        if heading_text:
            body_parts.append(f"## {heading_text}\n\n" + "\n\n".join(blocks))

    cta = dom.root.find(cls="cta-section")
    if cta is not None:
        heading = cta.find("h2")
        paragraph = cta.find("p")
        buttons = cta.find_all("a")
        data["cta"] = {
            "heading": inline(heading) if heading is not None else "",
            "body": inline(paragraph) if paragraph is not None else "",
        }
        if len(buttons) > 0:
            data["cta"]["primary_label"] = inline(buttons[0])
            data["cta"]["primary_href"] = buttons[0].attrs.get("href", "")
        if len(buttons) > 1:
            data["cta"]["secondary_label"] = inline(buttons[1])
            data["cta"]["secondary_href"] = buttons[1].attrs.get("href", "")

    # The schema FAQ and the visible FAQ often disagree in the hand-written
    # corpus. The visible text is what readers see, so it wins; note the drift.
    schema_questions = [str(q.get("name", "")) for q in faq_schema.get("mainEntity", []) or []]
    visible_questions = [item["q"] for item in data.get("faq", [])]
    if schema_questions and schema_questions != visible_questions:
        warnings.append(
            "FAQ schema disagreed with the visible FAQ; kept the visible text "
            f"({len(visible_questions)} visible vs {len(schema_questions)} in schema)"
        )
    if not data.get("faq"):
        warnings.append("no visible FAQ found; rule AEO-01 needs at least three")

    return data, "\n\n".join(body_parts).strip() + "\n", warnings


ORDER = [
    "slug", "lang", "type", "title", "meta_title", "h1", "description",
    "standfirst", "section", "badge", "published", "modified",
    "author", "reviewed_by",
    "reading_time", "audience", "format", "visuals",
    "canonical", "breadcrumb", "breadcrumb_label",
    "og_title", "og_description", "twitter_description",
    "og_image", "hero",
    "quick_answer_heading", "quick_answer",
    "keywords", "faq_heading", "faq",
    "sources_heading", "sources_intro", "sources_paragraphs", "sources_disclaimer", "sources",
    "related", "cta",
]


def render_markdown(data: dict, body: str) -> str:
    ordered = {k: data[k] for k in ORDER if k in data and data[k] not in (None, [], {})}
    quick = ordered.pop("quick_answer", None)

    chunks = []
    pending = {}
    for key, value in ordered.items():
        pending[key] = value
        if key == "quick_answer_heading" and quick:
            chunks.append(yaml_dump(pending))
            chunks.append(yaml_block("quick_answer", quick))
            pending = {}
    if pending:
        chunks.append(yaml_dump(pending))
    if quick and "quick_answer_heading" not in ordered:
        chunks.append(yaml_block("quick_answer", quick))

    return "\n".join(chunks) + "\n---\n\n" + body


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pages", nargs="+", help="article HTML files to extract")
    parser.add_argument("--out", default="content/articles",
                        help="directory for the generated Markdown")
    parser.add_argument("--force", action="store_true",
                        help="overwrite an existing content record")
    args = parser.parse_args()

    site = (ROOT / "content" / "site.yml").read_text(encoding="utf-8")
    breadcrumbs = set(re.findall(r"^  (\w+):", site.split("breadcrumbs:")[1].split("\n\n")[0],
                                 re.M)) if "breadcrumbs:" in site else set()

    failures = 0
    for name in args.pages:
        path = Path(name) if Path(name).is_absolute() else ROOT / name
        out = ROOT / args.out / f"{path.stem.removeprefix('articolo-')}.md"
        if out.exists() and not args.force:
            print(f"{path.name}: {out.relative_to(ROOT)} already exists; skipped (--force to overwrite)")
            continue
        try:
            data, body, warnings = extract(path, breadcrumbs)
        except Exception as error:  # noqa: BLE001 - report and continue the batch
            print(f"{path.name}: EXTRACTION FAILED - {error}")
            failures += 1
            continue
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render_markdown(data, body), encoding="utf-8")
        shown = out.relative_to(ROOT) if out.is_relative_to(ROOT) else out
        print(f"{path.name} -> {shown}")
        for warning in warnings:
            print(f"    warn: {warning}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
