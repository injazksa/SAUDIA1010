"""
Static /p page sync + security file tests for saudia-visa preview.
Compares numbered items on /p/*.html against professions.json DB.
"""
import json
import re
import os
import urllib.parse
import requests
import pytest

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://repo-manager-13.preview.emergentagent.com").rstrip("/")
PUBLIC_DIR = "/app/frontend/public"

# Load professions DB
with open(f"{PUBLIC_DIR}/professions.json", encoding="utf-8") as f:
    DB = json.load(f)

# Build a code -> profession map
def _profs():
    if isinstance(DB, dict):
        for k, v in DB.items():
            yield k, v
    elif isinstance(DB, list):
        for p in DB:
            code = str(p.get("code") or p.get("id") or "")
            yield code, p

CODE_MAP = {c: p for c, p in _profs()}


def fetch_p(name_slug):
    """Fetch a /p/ page via URL-encoded name; returns HTML text"""
    url = f"{BASE}/p/{urllib.parse.quote(name_slug)}?v=99"
    r = requests.get(url, timeout=20)
    return r.status_code, r.text


def extract_numbered_items(html):
    """Extract texts from <span class="flex-1 text-gray-800">...</span>"""
    items = re.findall(
        r'<span[^>]*class="[^"]*flex-1[^"]*text-gray-800[^"]*"[^>]*>(.*?)</span>',
        html, re.DOTALL
    )
    # strip tags & normalize
    cleaned = []
    for it in items:
        t = re.sub(r"<[^>]+>", "", it)
        t = re.sub(r"\s+", " ", t).strip()
        cleaned.append(t)
    return cleaned


def extract_note_box(html):
    """Return note-box block if any"""
    m = re.search(r"<!-- sv-note-box -->(.*?)<!-- /sv-note-box -->", html, re.DOTALL)
    if m:
        return m.group(1)
    # fallback: any bg-blue-50 div
    m = re.search(r'<div[^>]*bg-blue-50[^>]*>(.*?)</div>', html, re.DOTALL)
    return m.group(1) if m else None


def db_docs_for(code):
    """Return the docs list from DB for a code (list of strings)"""
    p = CODE_MAP.get(code)
    if not p:
        return None, None
    docs = p.get("docs") or p.get("documents") or p.get("requirements") or []
    note = p.get("note") or p.get("notes") or ""
    # normalize
    docs = [re.sub(r"\s+", " ", d).strip() for d in docs]
    return docs, note


# ---- SECURITY FILE TESTS ----
class TestSecurityFiles:
    def test_redirects_has_blocks(self):
        with open(f"{PUBLIC_DIR}/_redirects", encoding="utf-8") as f:
            content = f.read()
        for pat in ["/package.json", "/yarn.lock", "/tailwind.config.js",
                    "/design_guidelines.json", "/scripts/*", "/.env", "/.git/*"]:
            assert pat in content, f"Missing {pat} block in _redirects"
        assert "404!" in content

    def test_netlify_toml_has_blocks(self):
        with open("/app/netlify.toml", encoding="utf-8") as f:
            content = f.read()
        for pat in ["/package.json", "/yarn.lock", "/tailwind.config.js",
                    "/design_guidelines.json", "/scripts/*", "/.env"]:
            assert pat in content, f"Missing {pat} in netlify.toml"

    def test_security_txt_exists(self):
        path = f"{PUBLIC_DIR}/.well-known/security.txt"
        assert os.path.exists(path)
        with open(path) as f:
            content = f.read()
        assert "Contact:" in content

    def test_security_txt_fetchable(self):
        r = requests.get(f"{BASE}/.well-known/security.txt", timeout=15)
        assert r.status_code == 200, f"got {r.status_code}"
        assert "Contact" in r.text

    def test_no_secrets_in_public_js(self):
        import subprocess
        # scan for real-looking secrets in served JS files
        result = subprocess.run(
            ["grep", "-riE", r"(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{20,}",
             f"{PUBLIC_DIR}"],
            capture_output=True, text=True
        )
        # Filter false positives (comments, labels, Arabic text)
        lines = [l for l in result.stdout.splitlines()
                 if ".js" in l or ".json" in l or ".html" in l]
        # allow known non-secrets
        real = [l for l in lines if not any(x in l.lower() for x in
                ["placeholder", "example", "your_", "xxxx", "readme", "config.js:"])]
        assert not real, f"Possible secrets found:\n" + "\n".join(real[:10])


# ---- DATA CONSISTENCY TESTS ----
PROFILE_CASES = [
    ("مندوب-مبيعات-332201.html", "332201", 9, "خبرة لمدة سنة"),
    ("مندوب-مشتريات-332302.html", "332302", 9, "سنتين"),
    ("أخصائي-تسويق-243110.html", "243110", 9, None),
    ("عامل-مخزن-933103.html", "933103", 8, "الاعتماد المهني"),
    ("عامل-وضع-ملصقات-932103.html", "932103", 7, "لا تتطلب اعتماد"),
]


@pytest.mark.parametrize("filename,code,expected_count,expected_hint", PROFILE_CASES)
def test_p_page_matches_db(filename, code, expected_count, expected_hint):
    status, html = fetch_p(filename)
    assert status == 200, f"HTTP {status} for {filename}"

    items = extract_numbered_items(html)
    assert items, f"No numbered items extracted from {filename}"

    # No item may start with ملاحظة
    for it in items:
        assert not it.startswith("ملاحظة"), f"Note leaked as numbered item: {it}"

    if expected_count is not None:
        assert len(items) == expected_count, \
            f"{filename}: got {len(items)} items, expected {expected_count}. items={items}"

    # Compare against DB
    db_docs, db_note = db_docs_for(code)
    if db_docs is not None:
        # exact match texts & order
        assert items == db_docs, \
            f"{filename} MISMATCH with DB:\nP: {items}\nDB: {db_docs}"

    # Note box check
    note_html = extract_note_box(html)
    if db_note:
        assert note_html, f"Note box missing on {filename}"
        # normalize both
        note_text = re.sub(r"<[^>]+>", " ", note_html)
        note_text = re.sub(r"\s+", " ", note_text)
        # note title should be present
        assert ("ملاحظة" in note_text) or ("لا تتطلب" in note_text), \
            f"Note text missing content on {filename}: {note_text[:200]}"

    if expected_hint:
        joined = " ".join(items) + " " + (note_html or "")
        assert expected_hint in joined, f"Expected hint '{expected_hint}' not found in {filename}"


# ---- Note-box below list check (blue box present) ----
@pytest.mark.parametrize("filename", [c[0] for c in PROFILE_CASES])
def test_p_page_has_note_box_marker(filename):
    status, html = fetch_p(filename)
    assert status == 200
    # code should mostly have note box; if DB has no note, skip
    code = re.search(r"-(\d+)\.html$", filename).group(1)
    db_docs, db_note = db_docs_for(code)
    if db_note:
        assert "sv-note-box" in html, f"note box marker missing for {filename}"
        assert "bg-blue-50" in html, f"blue note box missing for {filename}"


# ---- Regressions ----
class TestRegressions:
    def test_dalil_1_status(self):
        r = requests.get(f"{BASE}/p/dalil-1.html?v=99", timeout=15)
        assert r.status_code == 200
        # ~50 links
        links = re.findall(r'href="[^"]*/p/[^"]+\.html', r.text)
        assert len(links) >= 40, f"Only {len(links)} links in dalil-1"

    def test_professions_page(self):
        r = requests.get(f"{BASE}/professions.html?v=99", timeout=15)
        assert r.status_code == 200
        assert "professions" in r.text.lower() or "المهن" in r.text
