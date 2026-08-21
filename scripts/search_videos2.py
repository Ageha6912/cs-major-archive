"""Search YouTube via invidious for iconic clips per major."""
import json
import os
import time
import urllib.parse
import urllib.request

API = "https://invidious.materialio.us/api/v1/search"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

QUERIES = {
    "dhw2013": ["fnatic NiP DreamHack Winter 2013 grand final", "DreamHack Winter 2013 CSGO final highlights"],
    "katowice2014": ["Virtus.pro NiP EMS One Katowice 2014 final", "EMS One Katowice 2014 best moments CSGO"],
    "cologne2014": ["NiP fnatic ESL One Cologne 2014 grand final", "friberg ace fnatic Cologne 2014"],
    "dhw2014": ["olofboost DreamHack Winter 2014", "LDLC NiP DreamHack Winter 2014 final"],
    "katowice2015": ["fnatic NiP ESL One Katowice 2015 final highlights", "olofmeister ESL One Katowice 2015"],
    "cologne2015": ["fnatic EnVyUs ESL One Cologne 2015 grand final highlights"],
    "cluj2015": ["Happy deagle ace DreamHack Cluj Napoca 2015", "EnVyUs Natus Vincere Cluj 2015 final"],
    "columbus2016": ["coldzera jumping AWP MLG Columbus 2016", "Luminosity NaVi MLG Columbus 2016 final"],
    "cologne2016": ["SK Gaming Team Liquid ESL One Cologne 2016 final", "SK Gaming Cologne 2016 major champions"],
    "atlanta2017": ["Astralis Virtus.pro ELEAGUE Atlanta 2017 final", "ELEAGUE Major 2017 grand final highlights"],
    "krakow2017": ["Gambit Immortals PGL Krakow 2017 grand final", "Dosia Krakow Major 2017"],
    "boston2018": ["Cloud9 FaZe ELEAGUE Boston 2018 grand final", "Cloud9 win Boston Major 2018"],
    "london2018": ["Astralis Natus Vincere FACEIT London 2018 final", "Astralis London Major 2018 champions"],
    "katowice2019": ["Astralis ENCE IEM Katowice 2019 grand final", "Astralis Katowice 2019 major highlights"],
    "berlin2019": ["Astralis AVANGAR StarLadder Berlin 2019 final", "Astralis Berlin Major 2019 four majors"],
    "stockholm2021": ["NaVi G2 PGL Stockholm 2021 grand final highlights", "s1mple PGL Stockholm 2021 major"],
    "antwerp2022": ["FaZe NaVi PGL Antwerp 2022 grand final highlights", "karrigan Antwerp Major 2022 FaZe champions"],
    "rio2022": ["Outsiders Heroic IEM Rio 2022 grand final highlights", "Jame IEM Rio Major 2022"],
    "paris2023": ["Vitality GamerLegion BLAST Paris Major 2023 final", "ZywOo BLAST Paris Major 2023"],
    "copenhagen2024": ["NaVi FaZe PGL Copenhagen 2024 grand final highlights", "jL Copenhagen Major 2024 MVP"],
    "shanghai2024": ["Spirit FaZe Shanghai Major 2024 grand final highlights", "donk Shanghai Major 2024 MVP"],
    "austin2025": ["Vitality MongolZ BLAST Austin Major 2025 final highlights", "ZywOo Austin Major 2025 MVP"],
    "budapest2025": ["Vitality FaZe StarLadder Budapest Major 2025 final highlights", "Budapest Major 2025 BO5 final"],
    "cologne2026": ["Falcons FURIA IEM Cologne Major 2026 final highlights", "NiKo first major champion Cologne 2026"],
}


def search(q):
    url = API + "?" + urllib.parse.urlencode({"q": q, "type": "video", "sort_by": "relevance"})
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25) as r:
        data = json.loads(r.read().decode("utf-8"))
    out = []
    for v in data:
        if not v.get("videoId"):
            continue
        out.append(
            {
                "id": v["videoId"],
                "title": v.get("title", ""),
                "author": v.get("author", ""),
                "length": v.get("lengthSeconds", 0),
            }
        )
    return out


def main():
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "videos_candidates.json")
    out = {}
    for mid, queries in QUERIES.items():
        res = []
        for q in queries:
            try:
                res.extend(search(q))
                print(mid, "|", q[:50], "->", len(res))
            except Exception as exc:
                print(mid, "| ERR", q[:40], exc)
            time.sleep(1.0)
        # dedupe by id
        seen = set()
        uniq = []
        for r in res:
            if r["id"] in seen:
                continue
            seen.add(r["id"])
            uniq.append(r)
        out[mid] = uniq
        print("=", mid, "total", len(uniq))
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
