"""Compare the readable text of an article before and after migration.

Automated HTML-to-Markdown extraction drops things quietly: an inline table, a
styled callout, a nested list. This compares the rendered *text* of the page
against the version in git, word by word, so anything lost shows up as a
concrete removal rather than as a number.

Run it on every article migrated to the content model:

    python3 build/migration-diff.py articolo-incident-response-ai-pmi.html
    python3 build/migration-diff.py --all          # every migrated article

By default the baseline is the file's last committed state before the working
tree change; pass --ref to compare against a specific commit. Exits non-zero if
any article drops words that were not deliberately replaced.
"""

from __future__ import annotations

import argparse
import difflib
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Structure the generator adds on purpose, which is not a content change.
GENERATED_BLOCKS = (
    re.compile(r'<nav class="article-toc".*?</nav>', re.S),
)


def readable_text(html: str) -> list[str]:
    """The words a reader sees in the article body."""
    if '<div class="content-wrapper">' not in html:
        raise ValueError("page has no .content-wrapper; not an article")
    body = html.split('<div class="content-wrapper">', 1)[1]
    body = body.split("</div></div></article>", 1)[0]
    for pattern in GENERATED_BLOCKS:
        body = pattern.sub(" ", body)
    text = re.sub(r"<[^>]+>", " ", body)
    for curly, plain in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"')):
        text = text.replace(curly, plain)
    return re.sub(r"\s+", " ", text).split()


def baseline(path: Path, ref: str) -> str | None:
    rel = path.relative_to(ROOT).as_posix()
    result = subprocess.run(
        ["git", "show", f"{ref}:{rel}"],
        cwd=ROOT, capture_output=True, text=True,
    )
    return result.stdout if result.returncode == 0 else None


def compare(path: Path, ref: str) -> bool:
    """Report the text differences for one article. True if nothing was lost."""
    before = baseline(path, ref)
    if before is None:
        print(f"{path.name}: no baseline at {ref}; skipped")
        return True

    old = readable_text(before)
    new = readable_text(path.read_text(encoding="utf-8"))
    matcher = difflib.SequenceMatcher(None, old, new)

    removals = []
    changes = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        gone = " ".join(old[i1:i2])
        added = " ".join(new[j1:j2])
        changes.append((tag, gone, added))
        if tag == "delete":
            removals.append(gone)

    print(f"{path.name}: {len(old)} -> {len(new)} words, similarity {matcher.ratio():.3f}")
    for tag, gone, added in changes:
        if gone:
            print(f"    - {gone[:120]}")
        if added:
            print(f"    + {added[:120]}")
    if removals:
        print(f"  {len(removals)} outright removal(s) — confirm each was intended")
    return not removals


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pages", nargs="*", help="article HTML files to compare")
    parser.add_argument("--all", action="store_true", help="every article with a content source")
    parser.add_argument("--ref", default="HEAD", help="git ref to compare against (default HEAD)")
    args = parser.parse_args()

    if args.all:
        pages = sorted(
            ROOT / f"articolo-{md.stem}.html"
            for md in (ROOT / "content" / "articles").glob("*.md")
        )
    else:
        pages = [Path(p) if Path(p).is_absolute() else ROOT / p for p in args.pages]

    if not pages:
        parser.error("pass at least one page, or --all")

    clean = True
    for page in pages:
        if not page.exists():
            print(f"{page}: missing")
            clean = False
            continue
        clean &= compare(page, args.ref)
    return 0 if clean else 1


if __name__ == "__main__":
    sys.exit(main())
