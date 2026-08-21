"""Search DuckDuckGo for iconic YouTube clips per major."""
import json
import os
import re
import time
import urllib.parse
import urllib.request

UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "en",
}

QUERIES = {
    "dhw2013": "site:youtube.com fnatic vs NiP DreamHack Winter 2013 grand final highlights",
    "katowice2014": "site:youtube.com Virtus.pro NiP EMS One Katowice 2014 grand final best moments",
    "cologne2014": "site:youtube.com NiP vs fnatic ESL One Cologne 2014 grand final highlights",
    "dhw2014": "site:youtube.com olofboost fnatic LDLC DreamHack Winter 2014",
    "katowice2015": "site:youtube.com fnatic vs NiP ESL One Katowice 2015 grand final highlights",
    "cologne2015": "site:youtube.com fnatic EnVyUs ESL One Cologne 2015 grand final highlights",
    "cluj2015": "site:youtube.com Happy deagle ace DreamHack Cluj-Napoca 2015",
    "columbus2016": "site:youtube.com coldzera jumping AWP MLG Columbus 2016",
    "cologne2016": "site:youtube.com SK Gaming vs Liquid ESL One Cologne 2016 grand final highlights",
    "atlanta2017": "site:youtube.com Astralis vs Virtus.pro ELEAGUE Major Atlanta 2017 grand final highlights",
    "krakow2017": "site:youtube.com Gambit vs Immortals PGL Krakow 2017 grand final highlights",
    "boston2018": "site:youtube.com Cloud9 vs FaZe ELEAGUE Boston 2018 grand final highlights",
    "london2018": "site:youtube.com Astralis vs Natus Vincere FACEIT London 2018 grand final highlights",
    "katowice2019": "site:youtube.com Astralis vs ENCE IEM Katowice 2019 grand final highlights",
    "berlin2019": "site:youtube.com Astralis vs AVANGAR StarLadder Berlin 2019 grand final highlights",
    "stockholm2021": "site:youtube.com NAVI vs G2 PGL Stockholm 2021 grand final highlights",
    "antwerp2022": "site:youtube.com FaZe vs NAVI PGL Antwerp 2022 grand final highlights",
    "rio2022": "site:youtube.com Outsiders vs Heroic IEM Rio 2022 grand final highlights",
    "paris2023": "site:youtube.com Vitality vs GamerLegion BLAST Paris 2023 grand final highlights",
    "copenhagen2024": "site:youtube.com NAVI vs FaZe PGL Copenhagen 2024 grand final highlights",
    "shanghai2024": "site:youtube.com Spirit vs FaZe Shanghai Major 2024 grand final highlights donk",
    "austin2025": "site:youtube.com Vitality vs MongolZ BLAST Austin Major 2025 grand final highlights",
    "budapest2025": "site:youtube.com Vitality vs FaZe StarLadder Budapest Major 2025 grand final highlights",
    "cologne2026": "site:youtube.com Falcons vs FURIA IEM Cologne Major 2026 grand final highlights NiKo",
}


def search(q):
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(q)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        html = r.read().decode("utf-8", errors="ignore")
    results = []
    blocks = re.findall(
        r'<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>(.*?)</a>',
        html,
        re.S,
    )
    for href, title in blocks:
        if "youtube.com/watch" not in href:
            continue
        vid = re.search(r"[?&]v=([A-Za-z0-9_-]{11})", href)
        if not vid:
            continue
        results.append(
            {
                "id": vid.group(1),
                "title": re.sub(r"<[^>]+>", "", title).strip(),
            }
        )
    return results


def main():
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "videos_candidates.json")
    out = {}
    for mid, q in QUERIES.items():
        try:
            res = search(q)
            out[mid] = res
            print(mid, len(res))
            for r in res[:4]:
                print("   ", r["id"], r["title"][:70])
        except Exception as exc:
            print(mid, "ERR", exc)
            out[mid] = []
        time.sleep(1.5)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
