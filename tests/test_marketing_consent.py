import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "cookie-banner.js"


class MarketingConsentTests(unittest.TestCase):
    def test_marketing_consent_is_separate_from_analytics(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("marketingLabel", text)
        self.assertIn('id="marketing-cookies"', text)
        self.assertIn("marketing: true", text)
        self.assertIn("marketing: false", text)
        self.assertIn("marketingConsent", text)

    def test_linkedin_insight_tag_is_consent_gated(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("loadLinkedInInsightTag", text)
        self.assertIn("10532561", text)
        self.assertIn("snap.licdn.com/li.lms-analytics/insight.min.js", text)
        self.assertNotIn("<noscript", text)

    def test_google_ad_consent_uses_marketing_choice(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("updateConsentMode(analyticsGranted, marketingGranted)", text)
        self.assertIn("analytics_storage: analyticsState", text)
        self.assertIn("ad_storage: marketingState", text)
        self.assertIn("ad_user_data: marketingState", text)
        self.assertIn("ad_personalization: marketingState", text)


if __name__ == "__main__":
    unittest.main()
