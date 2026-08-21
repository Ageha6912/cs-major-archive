"""Fetch per-major Wikipedia articles using links from the main majors page."""
import os
import re
import urllib.request
from urllib.parse import quote

BASE = "https://en.wikipedia.org/wiki/"
MAIN = r"https://en.wikipedia.org/wiki/Counter-Strike_Major_Championships"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "wiki")
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

EDITIONS = [
    "Jönköping 2013",
    "Katowice 2014",
    "Cologne 2014",
    "Jönköping 2014",
    "Katowice 2015",
    "Cologne 2015",
    "Cluj-Napoca 2015",
    "Columbus 2016",
    "Cologne 2016",
    "Atlanta 2017",
    "Kraków 2017",
    "Boston 2018",
    "London 2018",
    "Katowice 2019",
    "Berlin 2019",
    "Stockholm 2021",
    "Antwerp 2022",
    "Rio 2022",
    "Paris 2023",
    "Copenhagen 2024",
    "Shanghai 2024",
    "Austin 2025",
    "Budapest 2025",
    "Cologne 2026",
]

OVERRIDES = {
    "Columbus 2016": "MLG_Major_Championship:_Columbus",
    "Kraków 2017": "PGL_Major:_Krak%C3%B3w_2017",
    "Katowice 2019": "IEM_Katowice_Major_2019",
    "Cologne 2015": "ESL_One_Cologne_2015",
    "Shanghai 2024": "Perfect_World_Shanghai_Major_2024",
}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    main_html = fetch(MAIN)
    links = {}
    for ed in EDITIONS:
        idx = main_html.find(ed)
        if idx == -1:
            print("NOT FOUND:", ed)
            continue
        slug = OVERRIDES.get(ed)
        if slug is None:
            chunk = main_html[max(0, idx - 1000) : idx + 100]
            m = re.findall(r'href="[^"]*?/wiki/([^"]+)"', chunk)
            if m:
                slug = m[-1]
            else:
                print("NO LINK:", ed)
                continue
        links[ed] = slug

    for ed, slug in links.items():
        slug_clean = slug.replace("/", "_").replace(":", "-")
        path = os.path.join(OUT_DIR, slug_clean + ".html")
        if os.path.exists(path):
            print("cached:", ed)
            continue
        try:
            html = fetch(BASE + quote(slug, safe=":/%"))
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(html)
            print("fetched:", ed, "->", slug)
        except Exception as exc:  # noqa: BLE001
            print("ERROR:", ed, slug, exc)


if __name__ == "__main__":
    main()
