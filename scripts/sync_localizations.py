#!/usr/bin/env python3
"""Sync PS4 Arabic translation listings from Ta3reb into catalog.json.

Imports metadata and creator/source page links only. It never downloads or mirrors
translation files or commercial game packages.
"""
from __future__ import annotations
import json
import pathlib
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog.json"
BASE = "https://ta3reb.com/"
MAX_PAGES = 20
HEADERS = {"User-Agent": "M4-HUB-localization-catalog/1.0 (+https://majeedomran.github.io/)"}


class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.current_href = None
        self.current_text = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "a":
            attrs = dict(attrs)
            if self.current_href is None:
                self.current_href = attrs.get("href", "")
                self.current_text = []

    def handle_data(self, data):
        if self.current_href is not None:
            self.current_text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self.current_href is not None:
            self.links.append((self.current_href, " ".join(" ".join(self.current_text).split())))
            self.current_href = None
            self.current_text = []


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as response:
        if response.status != 200:
            raise RuntimeError(f"Ta3reb returned HTTP {response.status}: {url}")
        return response.read().decode("utf-8", errors="replace")


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "").casefold()
    return re.sub(r"[^a-z0-9\u0600-\u06ff]+", "", value)


def parse_listing_text(text: str, href: str):
    if "تعريب لعبة" not in text:
        return None
    # Listing query is PS4-filtered; still require the card itself to mention PS4.
    if not re.search(r"\bPS4\b", text, re.I):
        return None
    match = re.search(r"تعريب لعبة\s+(.+?)(?=\s+(?:PS4|PS5|PC|Steam|Android|Switch|Xbox)\b|$)", text, re.I)
    if not match:
        return None
    name = match.group(1).strip(" \u00a0-–|")
    if not name:
        return None
    cusa = re.search(r"\bCUSA\d{5}\b", text, re.I)
    version = re.search(r"\bV\s*([0-9][0-9A-Za-z._-]*)", text, re.I)
    official = "تعريب رسمي" in text
    translation_type = "القوائم والحوارات" if ("القوائم" in text or "الحوارات" in text) else "تعريب"
    return {
        "name": name,
        "name_en": name,
        "platform": "PS4",
        "category": "Official" if official else "Community",
        "localizationType": "official" if official else "community",
        "translationType": translation_type,
        "translationType_en": "Menus and dialogue" if translation_type != "تعريب" else "Arabic translation",
        "cusaId": cusa.group(0).upper() if cusa else "",
        "gameVersion": version.group(1) if version else "",
        "status": "listed",
        "sourceUrl": urllib.parse.urljoin(BASE, href),
        "sourceName": "Ta3reb",
        "description": "بيانات التعريب مأخوذة من فهرس Ta3reb. راجع صفحة المصدر للتفاصيل وطريقة التثبيت والتوافق قبل الاستخدام.",
        "description_en": "Metadata imported from Ta3reb's directory. Check the source page for installation details and compatibility before use.",
    }


def main():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    entries = catalog.setdefault("localizedGames", [])
    by_name = {norm(x.get("name", "")): x for x in entries if isinstance(x, dict)}
    imported = 0
    updated = 0
    empty_pages = 0

    for page in range(1, MAX_PAGES + 1):
        query = {"platform": "PS4"}
        if page > 1:
            query["page"] = str(page)
        url = BASE + "?" + urllib.parse.urlencode(query)
        html = fetch(url)
        parser = AnchorParser()
        parser.feed(html)
        page_items = []
        seen_urls = set()
        for href, label in parser.links:
            if "/game/" not in href or href in seen_urls:
                continue
            seen_urls.add(href)
            item = parse_listing_text(label, href)
            if item:
                page_items.append(item)

        if not page_items:
            empty_pages += 1
            if empty_pages >= 2:
                break
        else:
            empty_pages = 0

        for item in page_items:
            key = norm(item["name"])
            old = by_name.get(key)
            if old:
                # Refresh only source-backed fields; preserve existing user notes.
                for field in ("name_en", "platform", "category", "localizationType",
                              "translationType", "translationType_en", "sourceUrl",
                              "sourceName", "status", "description", "description_en"):
                    old[field] = item[field]
                for field in ("cusaId", "gameVersion"):
                    if item[field]:
                        old[field] = item[field]
                updated += 1
            else:
                entries.append(item)
                by_name[key] = item
                imported += 1
        time.sleep(0.4)

    entries.sort(key=lambda x: (x.get("localizationType") != "official", norm(x.get("name", ""))))
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"imported": imported, "updated": updated, "total": len(entries)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
