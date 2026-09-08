"""AEO/GEO/SEO rules checked against the article HTML exactly as it ships.

Phase 0 of the content architecture plan: measure before changing anything.

Two kinds of rule live here.

* **Gates** are rules the whole corpus already satisfies. They are asserted, so
  the suite fails the moment an article regresses below today's baseline.
* **Report-only** rules are the migration backlog. They are printed as a
  scoreboard and do not fail the build, because failing on them today would
  just mean a permanently red suite. They flip to gates in Phase 2, once the
  generator owns the markup and the backlog has been burned down.

Run the scoreboard on its own with::

    python3 tests/aeo_rules.py
"""

import unittest

from aeo_rules import ROOT, evaluate, load_articles, scoreboard

EXPECTED_ARTICLE_COUNT = 65


class AeoStaticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.articles = load_articles()
        cls.results = evaluate(cls.articles)

    def test_corpus_is_discovered(self) -> None:
        self.assertEqual(
            EXPECTED_ARTICLE_COUNT,
            len(self.articles),
            "article count changed; update EXPECTED_ARTICLE_COUNT deliberately",
        )

    def test_gate_rules_hold(self) -> None:
        """Rules the corpus passes 65/65 today must not regress."""
        broken = []
        for rule_id in sorted(self.results):
            result = self.results[rule_id]
            if not result.rule.gate or not result.failing:
                continue
            detail = "; ".join(f"{slug} ({reason})" for slug, reason in result.failing[:5])
            broken.append(f"{rule_id} {result.rule.title}: {detail}")
        self.assertEqual([], broken)

    def test_llms_txt_copies_stay_identical(self) -> None:
        """llms.txt and llm.txt are two hand-synced copies of one file."""
        canonical = (ROOT / "llms.txt").read_text(encoding="utf-8")
        alias = (ROOT / "llm.txt").read_text(encoding="utf-8")
        self.assertEqual(
            canonical,
            alias,
            "llm.txt has drifted from llms.txt; they must stay byte-identical "
            "until the generator owns both",
        )

    def test_scoreboard_is_reported(self) -> None:
        """Always passes. Prints the Phase 0 backlog so it stays visible."""
        print(scoreboard(self.results))
        self.assertTrue(self.results)


if __name__ == "__main__":
    unittest.main()
