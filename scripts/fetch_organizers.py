"""Fetch tournament organizer logos from Wikipedia."""
import os
import re
import time
import urllib.request

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "organizers")
os.makedirs(OUT, exist_ok=True)

ORG = {
    "esl": ("ESL (company)", "esl.com"),
    "iem": ("Intel Extreme Masters", "intel.com"),
    "dreamhack": ("DreamHack", "dreamhack.com"),
    "mlg": ("Major League Gaming", "mlg.com"),
    "eleague": ("ELEAGUE", "turner.com"),
    "pgl": ("PGL (esports)", "pgl.gg"),
    "faceit": ("FACEIT", "faceit.com"),
    "starladder": ("StarLadder", "starladder.com"),
    "blast": ("BLAST Premier", "blastpremier.com"),
    "perfectworld": ("Perfect World", "perfectworld.com"),
}


def wiki_og(title):
    for lang in ("en", "fr", "ru"):
        url = f"https://{lang}.wikipedia.org/wiki/{title.replace(' ', '_')}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"})
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                html = r.read().decode("utf-8", errors="ignore")
        except Exception:
            continue
        m = re.search(r'property="og:image" content="([^"]+)"', html)
        if m:
            return m.group(1)
        time.sleep(1)
    return ""


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


for key, (title, domain) in ORG.items():
    found = wiki_og(title)
    if not found:
        print(key, "NO IMG")
        continue
    thumb = re.sub(r"/thumb/", "/", found)
    thumb = re.sub(r"/\d+px-[^/]+$", "", thumb)
    ext = os.path.splitext(thumb)[1].split("?")[0] or ".png"
    path = os.path.join(OUT, key + ext.lower())
    try:
        size = download(thumb, path)
        print(key, "OK", os.path.basename(path), size)
    except Exception as exc:
        print(key, "ERR", exc)
    time.sleep(1.5)
