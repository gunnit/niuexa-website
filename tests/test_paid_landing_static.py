from __future__ import annotations

import json
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LANDING_PAGE = ROOT / "landing-niuexa.html"
LANDING_PAGES = (
    ROOT / "landing-niuexa.html",
    ROOT / "en" / "landing-niuexa.html",
)


class LandingPageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.text_parts: list[str] = []
        self.attribute_values: list[str] = []
        self.json_ld_blocks: list[str] = []
        self._inside_json_ld = False
        self._json_ld_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        self.attribute_values.extend(value for _, value in attrs if value)
        if tag == "script" and attributes.get("type") == "application/ld+json":
            self._inside_json_ld = True
            self._json_ld_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._inside_json_ld:
            self.json_ld_blocks.append("".join(self._json_ld_parts))
            self._inside_json_ld = False

    def handle_data(self, data: str) -> None:
        if self._inside_json_ld:
            self._json_ld_parts.append(data)
        else:
            self.text_parts.append(data)

    @property
    def public_copy(self) -> str:
        return " ".join(self.text_parts + self.attribute_values).lower()


class PaidLandingStaticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.parser = LandingPageParser()
        cls.parser.feed(LANDING_PAGE.read_text(encoding="utf-8"))

    def test_paid_landing_does_not_promise_unverified_results(self) -> None:
        forbidden_claims = (
            "leader in italia",
            "garantiscono roi",
            "roi garantito",
            "100-150%",
            "100+ ore risparmiate",
            "25+ casi di successo",
            "300% roi medio",
        )

        for claim in forbidden_claims:
            with self.subTest(claim=claim):
                self.assertNotIn(claim, self.parser.public_copy)

    def test_paid_landing_does_not_publish_unverified_rating_markup(self) -> None:
        schemas = [json.loads(block) for block in self.parser.json_ld_blocks]

        self.assertTrue(schemas, "landing page must keep its structured data")
        self.assertTrue(
            all("aggregateRating" not in schema for schema in schemas),
            "paid landing page must not publish a rating without review evidence",
        )

    def test_paid_landing_does_not_imply_unverified_vendor_partnerships(self) -> None:
        self.assertNotIn("i nostri partner", self.parser.public_copy)
        self.assertNotIn("partner ai", self.parser.public_copy)

    def test_roberto_corrections_are_applied_to_both_landing_pages(self) -> None:
        forbidden_copy = (
            "info@niuexa.ai",
            "business unit di bebit",
            "business unit of bebit",
            "bu di bebit",
            "11215720019",
            "i marchi appartengono ai rispettivi titolari",
            "processi manuali e ripetitivi",
            "manual and repetitive processes",
        )

        for page in LANDING_PAGES:
            copy = page.read_text(encoding="utf-8").lower()
            for forbidden in forbidden_copy:
                with self.subTest(page=page.name, forbidden=forbidden):
                    self.assertNotIn(forbidden, copy)

    def test_landing_pages_publish_current_niuexa_company_details(self) -> None:
        required_details = ("niuexa s.r.l.", "13489560014", "to-1366737")

        for page in LANDING_PAGES:
            copy = page.read_text(encoding="utf-8").lower()
            for detail in required_details:
                with self.subTest(page=page.name, detail=detail):
                    self.assertIn(detail, copy)

    def test_header_and_footer_use_official_ai_solutions_logo(self) -> None:
        logo_path = "img/landing/niuexa-ai-solutions.webp"
        self.assertTrue((ROOT / logo_path).is_file())

        for page in LANDING_PAGES:
            copy = page.read_text(encoding="utf-8").lower()
            expected_src = logo_path if page == LANDING_PAGE else f"/{logo_path}"
            with self.subTest(page=page.name):
                self.assertGreaterEqual(copy.count(expected_src), 2)
                self.assertGreaterEqual(copy.count("niuexa ai solutions"), 2)

    def test_landing_pages_use_real_niuexa_event_photo(self) -> None:
        photo_paths = (
            "img/landing/niuexa-session-milano-800.webp",
            "img/landing/niuexa-session-milano-1600.webp",
        )
        for photo_path in photo_paths:
            self.assertTrue((ROOT / photo_path).is_file())

        for page in LANDING_PAGES:
            copy = page.read_text(encoding="utf-8").lower()
            with self.subTest(page=page.name):
                self.assertIn("niuexa-session-milano-800.webp", copy)
                self.assertIn("niuexa-session-milano-1600.webp", copy)

    def test_landing_stylesheet_cache_is_busted_for_logo_layout(self) -> None:
        for page in LANDING_PAGES:
            copy = page.read_text(encoding="utf-8").lower()
            with self.subTest(page=page.name):
                self.assertIn("landing-niuexa.css?v=20260910", copy)


if __name__ == "__main__":
    unittest.main()
