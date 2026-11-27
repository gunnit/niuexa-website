"""Keep public lesson players and their search metadata in sync."""

import json
import unittest
from collections import defaultdict
from urllib.parse import urljoin, urlsplit
from xml.etree import ElementTree

from aeo_rules import ArticleParser, ROOT, SITE


class LessonMarkup(ArticleParser):
    def __init__(self, html):
        super().__init__()
        self.tags = defaultdict(list)
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        super().handle_starttag(tag, attrs)
        self.tags[tag].append(dict(attrs))


class CourseVideoTests(unittest.TestCase):
    def test_sitemap_schema_and_player_identify_each_published_lesson(self):
        sitemap = ElementTree.parse(ROOT / "sitemap.xml")
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9",
              "v": "http://www.google.com/schemas/sitemap-video/1.1"}
        videos = {"claude": "lUNumvHEwOw", "copilot": "xoIk1w_VtcY", "gemini": "8iURM74cl-0"}
        sitemap_fields = {"title": "name", "thumbnail_loc": "thumbnailUrl",
                          "player_loc": "embedUrl", "publication_date": "uploadDate"}

        for slug, video_id in videos.items():
            with self.subTest(course=slug):
                filename = f"corso-{slug}-in-pratica.html"
                url = f"{SITE}/{filename}"
                lesson = LessonMarkup((ROOT / filename).read_text(encoding="utf-8"))
                schemas = map(json.loads, lesson.jsonld_raw)
                video, = (node for schema in schemas for node in schema.get("@graph", [schema])
                          if node.get("@type") == "VideoObject")
                entry, = sitemap.findall(f"s:url[s:loc='{url}']/v:video", ns)
                for element, prop in sitemap_fields.items():
                    self.assertEqual(entry.findtext(f"v:{element}", namespaces=ns), video[prop], prop)

                embed = f"https://www.youtube-nocookie.com/embed/{video_id}"
                watch = f"https://www.youtube.com/watch?v={video_id}"
                frame, = (tag for tag in lesson.tags["iframe"] if "srcdoc" in tag)
                link, = (tag for tag in lesson.tags["a"] if "data-watch" in tag)
                self.assertEqual(video["embedUrl"], embed)
                self.assertEqual(frame["src"], embed)
                self.assertEqual(video["sameAs"], watch)
                self.assertEqual(link["href"], watch)

                preview = LessonMarkup(frame["srcdoc"])
                play, = (tag for tag in preview.tags["a"] if "course-preview" in tag.get("class", "").split())
                self.assertEqual(urlsplit(play["href"])._replace(query="").geturl(), embed)
                image, = preview.tags["img"]
                self.assertEqual(urljoin(url, image["src"]), video["thumbnailUrl"])
