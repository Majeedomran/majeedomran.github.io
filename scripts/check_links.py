#!/usr/bin/env python3
"""Check catalogue URLs safely and write a machine-readable status report.

Only known project/source hosts are contacted. Redirects are followed manually
and only when the destination host is also allow-listed. Files are never
downloaded; GET fallback requests only a one-byte range.
"""
from __future__ import annotations
import concurrent.futures
import datetime as dt
import json
import pathlib
import socket
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog.json"
REPORT = ROOT / "reports" / "link-status.json"
ALLOWED_HOSTS = {
    "github.com", "www.github.com", "api.github.com",
    "raw.githubusercontent.com", "githubusercontent.com",
    "objects.githubusercontent.com", "release-assets.githubusercontent.com",
    "store.brewology.com", "consolemods.org", "www.consolemods.org",
    "prx0.com", "orbispatches.com", "www.orbispatches.com",
    "ta3reb.com", "www.ta3reb.com", "muarrab.com", "www.muarrab.com",
}
URL_FIELDS = ("sourceUrl", "source_url", "downloadUrl", "download_url", "url")
REDIRECT_CODES = {301, 302, 303, 307, 308}
TIMEOUT = 12
MAX_REDIRECTS = 5


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def safe_url(value: str) -> tuple[bool, str]:
    try:
        parsed = urllib.parse.urlsplit(value)
        if parsed.scheme != "https" or not parsed.hostname:
            return False, "https_required"
        if parsed.username or parsed.password or parsed.port not in (None, 443):
            return False, "unsafe_url"
        if parsed.hostname.lower() not in ALLOWED_HOSTS:
            return False, "host_not_allowlisted"
        return True, ""
    except ValueError:
        return False, "invalid_url"


def request_once(url: str, method: str):
    req = urllib.request.Request(
        url, method=method,
        headers={"User-Agent": "M4-HUB-Link-Monitor/1.0", "Range": "bytes=0-0"}
    )
    try:
        return OPENER.open(req, timeout=TIMEOUT), None
    except urllib.error.HTTPError as exc:
        return exc, None
    except (urllib.error.URLError, TimeoutError, socket.timeout, OSError) as exc:
        return None, exc


def probe(original: str) -> dict:
    current = original
    redirects = []
    for hop in range(MAX_REDIRECTS + 1):
        allowed, reason = safe_url(current)
        if not allowed:
            return {"url": original, "ok": False, "status": reason, "checkedUrl": current, "redirects": redirects}
        response, error = request_once(current, "HEAD")
        if error:
            return {"url": original, "ok": False, "status": "network_error", "detail": str(error)[:180], "redirects": redirects}
        code = getattr(response, "status", response.getcode())
        if code in (403, 405, 501):
            response, error = request_once(current, "GET")
            if error:
                return {"url": original, "ok": False, "status": "network_error", "detail": str(error)[:180], "redirects": redirects}
            code = getattr(response, "status", response.getcode())
        if code in REDIRECT_CODES:
            location = response.headers.get("Location")
            if not location:
                return {"url": original, "ok": False, "status": "redirect_without_location", "httpStatus": code, "redirects": redirects}
            next_url = urllib.parse.urljoin(current, location)
            redirects.append({"from": current, "to": next_url, "httpStatus": code})
            if hop == MAX_REDIRECTS:
                return {"url": original, "ok": False, "status": "too_many_redirects", "redirects": redirects}
            current = next_url
            continue
        ok = 200 <= code < 400
        return {
            "url": original, "ok": ok,
            "status": "reachable" if ok else "http_error",
            "httpStatus": code, "checkedUrl": current, "redirects": redirects
        }
    return {"url": original, "ok": False, "status": "unknown"}


def main():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    targets = {}
    for section, items in catalog.items():
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            label = item.get("name") or item.get("name_en") or item.get("version") or section
            for field in URL_FIELDS:
                value = item.get(field)
                if isinstance(value, str) and value.strip():
                    url = value.strip()
                    entry = targets.setdefault(url, {"url": url, "references": []})
                    entry["references"].append({"section": section, "name": label, "field": field})

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        checked = list(pool.map(probe, targets.keys()))

    by_url = {row["url"]: row for row in checked}
    rows = []
    for url, entry in targets.items():
        row = dict(entry)
        row.update({k: v for k, v in by_url[url].items() if k != "url"})
        rows.append(row)

    counts = {
        "total": len(rows),
        "reachable": sum(1 for x in rows if x["status"] == "reachable"),
        "httpErrors": sum(1 for x in rows if x["status"] == "http_error"),
        "needsReview": sum(1 for x in rows if x["status"] not in ("reachable", "http_error")),
    }
    report = {
        "schemaVersion": 1,
        "application": "M4 HUB",
        "checkedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "policy": "Checks HTTPS source/download URLs only; does not download files or certify safety, authenticity, or firmware compatibility.",
        "summary": counts,
        "results": rows,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(counts, ensure_ascii=False))


if __name__ == "__main__":
    main()
