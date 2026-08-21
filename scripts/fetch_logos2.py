"""Best-effort logo fetch for all bracket teams missing a local logo."""
import json
import os
import re
import time
import urllib.request

UA = {"User-Agent": "CSMajorArchive/1.0 (research; contact: local)"}
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "logos")

# team -> (en wiki title or "", domain for clearbit, [alt wiki titles])
TEAMS = {
    "9z Team": ("9z Team", "9z.gg", []),
    "AVANGAR": ("AVANGAR", "", []),
    "Apeks": ("Apeks", "apeks.gg", []),
    "Astana Dragons": ("", "", []),
    "Aurora Gaming": ("Aurora Gaming", "auroragaming.gg", []),
    "BIG": ("BIG (esports)", "big-clan.com", ["BIG (esports team)"]),
    "BetBoom Team": ("", "betboom.ru", []),
    "Copenhagen Flames": ("Copenhagen Flames", "", []),
    "Copenhagen Wolves": ("Copenhagen Wolves", "", []),
    "Counter Logic Gaming": ("Counter Logic Gaming", "clg.gg", []),
    "ENCE": ("ENCE", "ence.gg", []),
    "Epsilon eSports": ("", "", ["Epsilon eSports"]),
    "Eternal Fire": ("Eternal Fire", "eternalfire.gg", []),
    "FURIA Esports": ("FURIA Esports", "furia.gg", ["FURIA"]),
    "FlipSid3 Tactics": ("FlipSid3 Tactics", "", []),
    "G2 Esports": ("G2 Esports", "g2esports.com", []),
    "Gambit Gaming": ("Gambit Esports", "", []),
    "GamerLegion": ("GamerLegion", "gamerlegion.gg", []),
    "HellRaisers": ("HellRaisers", "", []),
    "Heroic": ("Heroic (esports)", "heroic.gg", ["Heroic"]),
    "Immortals": ("Immortals (esports)", "immortals.gg", ["Immortals"]),
    "Into the Breach": ("Into the Breach (esports)", "", []),
    "Keyd Stars": ("", "", []),
    "LGB eSports": ("", "", []),
    "MIBR": ("MIBR", "mibr.gg", []),
    "MOUZ": ("MOUZ", "mouz.gg", ["mousesports"]),
    "Monte": ("Monte (esports)", "monte.gg", []),
    "NRG Esports": ("NRG Esports", "nrg.gg", []),
    "North": ("North (esports)", "", []),
    "PENTA Sports": ("PENTA Sports", "", []),
    "Quantum Bellator Fire": ("", "", []),
    "Recursive eSports": ("", "", []),
    "Renegades": ("Renegades", "", []),
    "Team Dignitas": ("Team Dignitas", "dignitas.gg", []),
    "Team Kinguin": ("", "", []),
    "Team Liquid": ("Team Liquid", "teamliquid.com", []),
    "Team SoloMid": ("Team SoloMid", "", []),
    "The MongolZ": ("The MongolZ", "themongolz.gg", []),
    "VeryGames": ("", "", []),
    "compLexity Gaming": ("compLexity Gaming", "complexity.gg", []),
    "mousesports": ("MOUZ", "", ["mousesports"]),
    "paiN Gaming": ("paiN Gaming", "pain.gg", []),
}


def wiki_og(titles):
    for title in titles:
        if not title:
            continue
        for lang in ("en", "fr", "ru", "de"):
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
            time.sleep(0.8)
    return ""


def download(url, path):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if len(data) < 200:
        raise RuntimeError("too small")
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


def safe_name(team):
    return re.sub(r"[^a-z0-9]+", "", team.lower())


def main():
    results = {}
    for team, (title, domain, alts) in TEAMS.items():
        name = safe_name(team)
        if any(f.startswith(name + ".") for f in os.listdir(OUT)):
            results[team] = "already"
            continue
        found = ""
        try:
            found = wiki_og([title] + alts)
        except Exception as exc:
            print(team, "wiki err", exc)
        if found:
            thumb = re.sub(r"/thumb/", "/", found)
            thumb = re.sub(r"/\d+px-[^/]+$", "", thumb)
            ext = os.path.splitext(thumb)[1].split("?")[0] or ".png"
            path = os.path.join(OUT, name + ext.lower())
            try:
                size = download(thumb, path)
                results[team] = os.path.basename(path)
                print(team, "OK(wiki)", os.path.basename(path), size)
                time.sleep(1.2)
                continue
            except Exception as exc:
                print(team, "DL ERR", exc, thumb)
        if domain:
            path = os.path.join(OUT, name + ".png")
            try:
                size = download(f"https://logo.clearbit.com/{domain}", path)
                results[team] = os.path.basename(path)
                print(team, "OK(clearbit)", os.path.basename(path), size)
                time.sleep(0.8)
                continue
            except Exception as exc:
                print(team, "CB ERR", exc)
        results[team] = None
        print(team, "NONE")

    with open(os.path.join(os.path.dirname(__file__), "..", "data", "logo_fetch2.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
