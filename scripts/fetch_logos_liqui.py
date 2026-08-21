"""Fetch missing team logos from Liquipedia via web.archive.org."""
import json
import os
import re
import time
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"}
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "logos")

TEAMS = {
    "compLexity Gaming": "Complexity_Gaming",
    "VeryGames": "VeryGames",
    "LGB eSports": "LGB_eSports",
    "Astana Dragons": "Astana_Dragons",
    "Recursive eSports": "Recursive_eSports",
    "Epsilon eSports": "Epsilon_eSports",
    "Copenhagen Flames": "Copenhagen_Flames",
    "North": "North",
    "NRG Esports": "NRG_Esports",
    "BIG": "BIG",
    "Immortals": "Immortals",
    "Monte": "Monte",
    "Into the Breach": "Into_the_Breach",
    "9z Team": "9z_Team",
    "BetBoom Team": "BetBoom_Team",
    "Keyd Stars": "Keyd_Stars",
    "Quantum Bellator Fire": "Quantum_Bellator_Fire",
    "Team Kinguin": "Team_Kinguin",
}


def fetch(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def snapshot_url(page):
    api = f"http://archive.org/wayback/available?url=liquipedia.net/counterstrike/{page}&timestamp=20240101"
    data = json.loads(fetch(api).decode("utf-8"))
    snap = data.get("archived_snapshots", {}).get("closest")
    if not snap or snap.get("status") != "200":
        return ""
    return snap["url"]


def safe_name(team):
    return re.sub(r"[^a-z0-9]+", "", team.lower())


def main():
    results = {}
    for team, page in TEAMS.items():
        name = safe_name(team)
        if any(f.startswith(name + ".") for f in os.listdir(OUT)):
            results[team] = "already"
            continue
        try:
            snap = snapshot_url(page)
            if not snap:
                print(team, "NO SNAPSHOT")
                results[team] = None
                continue
            html = fetch(snap).decode("utf-8", errors="ignore")
            m = re.search(r'https?://[^"\']*liquipedia\.net/commons/images/[^"\']+', html)
            if not m:
                m = re.search(r'src="/web/[^"\']*liquipedia\.net/commons/images/([^"\']+)"', html)
                if m:
                    img = "https://liquipedia.net/commons/images/" + m.group(1)
                else:
                    print(team, "NO IMG")
                    results[team] = None
                    continue
            else:
                img = m.group(0)
                img = re.sub(r"https?://web\.archive\.org/web/\d+(?:im_)?/", "", img)
            ext = os.path.splitext(img)[1].split("?")[0] or ".png"
            path = os.path.join(OUT, name + ext.lower())
            data = fetch(img)
            with open(path, "wb") as f:
                f.write(data)
            results[team] = os.path.basename(path)
            print(team, "OK", os.path.basename(path), len(data), img[-70:])
        except Exception as exc:
            print(team, "ERR", exc)
            results[team] = None
        time.sleep(1.0)

    with open(os.path.join(os.path.dirname(__file__), "..", "data", "logo_fetch3.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
