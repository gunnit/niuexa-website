"""Company facts must read the same on every published page.

The October 2026 audit found the founding date, the Turin address and two
product claims drifting between pages. There is no single source these pages
are rendered from yet, so this gate pins the canonical spelling of each fact
and fails when a page reintroduces a known variant.
"""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Published HTML only: no build artefacts, worktrees, redirect stubs or drafts.
SKIP_DIRS = {"_site", "_site-review", "node_modules", ".claude", "palazzo", ".git", "templates"}


def published_pages():
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        text = path.read_text(encoding="utf-8")
        if 'http-equiv="refresh"' in text:
            continue
        yield path.relative_to(ROOT).as_posix(), text


# Variants that must not come back, with the canonical form they were replaced by.
FORBIDDEN = [
    (re.compile(r"via Andreis 18/16/M", re.I), "Via Vittorio Andreis 18"),
    (re.compile(r'"foundingDate":\s*"2026-\d{2}-\d{2}"'), '"foundingDate": "2026"'),
    (re.compile(r"risponde in oltre 50 lingue|more than 50 languages", re.I), "answers in the languages of the uploaded content"),
    (re.compile(r"(vendite|supporto)@niuexa\.ai"), "info@niuexa.ai"),
    (re.compile(r"1\.000 executive"), "no unsourced training-volume claim"),
    (re.compile(r'<meta name="robots" content="index[^"]*">'), "noindex on /books/ and nocode-toolkit"),
]

# Every page that states the legal identity must state it the same way.
LEGAL_NAME = "NIUEXA S.R.L."
VAT = "13489560014"
TURIN = "Via Vittorio Andreis 18"


class SiteFactsTests(unittest.TestCase):
    def test_known_variants_do_not_return(self):
        problems = []
        for page, text in published_pages():
            for pattern, canonical in FORBIDDEN:
                if pattern.pattern.startswith('<meta name="robots"') and not (page.startswith("books/") or page == "nocode-toolkit.html"):
                    continue
                if pattern.search(text):
                    problems.append(f"{page}: {pattern.pattern!r} (use {canonical})")
        self.assertEqual([], problems)

    def test_legal_identity_is_spelled_consistently(self):
        problems = []
        for page, text in published_pages():
            if VAT in text and LEGAL_NAME not in text:
                problems.append(f"{page}: VAT without the legal name {LEGAL_NAME}")
            if "Andreis" in text and TURIN not in text:
                problems.append(f"{page}: Turin address differs from '{TURIN}'")
        self.assertEqual([], problems)

    def test_llms_txt_mirrors_the_canonical_facts(self):
        text = (ROOT / "llms.txt").read_text(encoding="utf-8")
        for fact in (LEGAL_NAME, VAT, TURIN, "Via Rutilia 10", "2024", "AUSED"):
            self.assertIn(fact, text)
        self.assertNotIn("Twilio", text)
        self.assertNotIn("Same services page", text)


if __name__ == "__main__":
    unittest.main()
