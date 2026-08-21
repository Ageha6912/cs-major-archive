"""Fetch candidate logos for the 16 champion teams.
Strategy: Wikipedia article HTML og:image -> clearbit favicon -> manual leftovers."""
import json
import os
import re
import time
import urllib.request

UA = {"User-Agent": "CSMajorArchive/1.0 (research; contact: local)"}

TEAMS = [
    ("Astralis", "Astralis", "astralis.gg"),
    ("Cloud9", "Cloud9", "cloud9.gg"),
    ("FaZe Clan", "FaZe_Clan", "fazeclan.com"),
    ("Fnatic", "Fnatic", "fnatic.com"),
    ("Gambit Esports", "Gambit_Esports", "gambit.gg"),
    ("Luminosity Gaming", "Luminosity_Gaming", "luminosity.gg"),
    ("Natus Vincere", "Natus_Vincere", "navi.gg"),
    ("Ninjas in Pyjamas", "Ninjas_in_Pyjamas", "nip.gl"),
    ("Outsiders", "", ""),
    ("SK Gaming", "SK_Gaming", "sk-gaming.com"),
    ("Team EnVyUs", "Team_EnVyUs", "envy.gg"),
    ("Team Falcons", "Team_Falcons", "teamfalcons.gg"),
    ("Team LDLC.com", "Team_LDLC.com", "ldlc.com"),
    ("Team Spirit", "Team_Spirit", "teamspirit.gg"),
    ("Team Vitality", "Team_Vitality", "vitality.gg"),
    ("Virtus.pro", "Virtus.pro", "virtus.pro"),
]

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "logos")
os.makedirs(OUT, exist_ok=True)


def wiki_og(title):
    """Fetch article HTML and return the og:image URL (lead image)."""
    if not title:
        return ""
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
    return ""


def download(url, path):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


def safe_name(team):
    return re.sub(r"[^a-z0-9]+", "", team.lower())


def main():
    results = {}
    for team, title, domain in TEAMS:
        found = ""
        try:
            found = wiki_og(title)
        except Exception as exc:
            print(team, "wiki err", exc)
        # normalize thumbnail to 512px
        thumb = re.sub(r"/thumb/", "/", found)
        thumb = re.sub(r"/\d+px-[^/]+$", "", thumb)
        if thumb:
            ext = os.path.splitext(thumb)[1].split("?")[0] or ".png"
            path = os.path.join(OUT, safe_name(team) + ext.lower())
            try:
                size = download(thumb, path)
                results[team] = os.path.basename(path)
                print(team, "OK(wiki)", os.path.basename(path), size)
                time.sleep(2)
                continue
            except Exception as exc:
                print(team, "DL ERR", exc, thumb)
        # clearbit fallback
        if domain:
            cb = f"https://logo.clearbit.com/{domain}"
            path = os.path.join(OUT, safe_name(team) + ".png")
            try:
                size = download(cb, path)
                results[team] = os.path.basename(path)
                print(team, "OK(clearbit)", os.path.basename(path), size)
                time.sleep(1.5)
                continue
            except Exception as exc:
                print(team, "CB ERR", exc)
        results[team] = None
        print(team, "NONE")

    with open(os.path.join(os.path.dirname(__file__), "..", "data", "logo_fetch.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
