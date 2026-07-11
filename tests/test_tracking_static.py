import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class TrackingStaticTests(unittest.TestCase):
    def test_forms_load_shared_conversion_tracking(self):
        missing = []
        for page in ROOT.rglob("*.html"):
            text = page.read_text(encoding="utf-8", errors="ignore")
            if "api.web3forms.com/submit" in text and "conversion-tracking.js" not in text:
                missing.append(page.relative_to(ROOT).as_posix())
        self.assertEqual([], missing)

    def test_generate_lead_is_not_emitted_inline(self):
        offenders = []
        pattern = re.compile(r"gtag\s*\(\s*['\"]event['\"]\s*,\s*['\"]generate_lead['\"]")
        for page in ROOT.rglob("*.html"):
            if pattern.search(page.read_text(encoding="utf-8", errors="ignore")):
                offenders.append(page.relative_to(ROOT).as_posix())
        self.assertEqual([], offenders, "generate_lead must be emitted only by conversion-tracking.js")

    def test_legacy_assessment_events_are_not_emitted_inline(self):
        offenders = []
        pattern = re.compile(r"assessment_request(?:_thank_you)?")
        for page in ROOT.rglob("*.html"):
            if pattern.search(page.read_text(encoding="utf-8", errors="ignore")):
                offenders.append(page.relative_to(ROOT).as_posix())
        self.assertEqual([], offenders, "use normalized form_start/form_submit/generate_lead events")

    def test_thank_you_lead_event_has_session_deduplication(self):
        script = (ROOT / "conversion-tracking.js").read_text(encoding="utf-8")
        self.assertIn("sessionStorage", script)
        self.assertIn("niuexa_lead_event_", script)


if __name__ == "__main__":
    unittest.main()
