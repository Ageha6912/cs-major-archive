import os
import re

TEAMS = [
    "Ninjas in Pyjamas",
    "VeryGames",
    "Astana Dragons",
    "Virtus.pro",
    "Fnatic",
    "compLexity Gaming",
    "Recursive eSports",
    "Natus Vincere",
    "Copenhagen Wolves",
    "Western Wolves",
    "SY_b",
    "Epsilon",
    "Team LDLC.com",
    "LDLC",
    "über G33KZ",
    "AGAiN",
    "Universal Soldiers",
    "ESC Gaming",
    "Titan",
    "Team EnVyUs",
    "EnVyUs",
    "Team SoloMid",
    "GODSENT",
    "Team Dignitas",
    "Dignitas",
    "G2 Esports",
    "mousesports",
    "Astralis",
    "Team Liquid",
    "SK Gaming",
    "Luminosity",
    "Team Falcons",
    "Cloud9",
]

for year, rank in [
    (2013, 4), (2013, 8), (2013, 14), (2013, 15), (2013, 16),
    (2013, 18), (2013, 19), (2013, 20),
    (2015, 6), (2015, 13), (2015, 18),
    (2016, 10), (2016, 14), (2016, 16),
]:
    path = os.path.join(os.environ.get("TEMP", ""), f"hltv_{year}_{rank}.html")
    with open(path, encoding="utf-8", errors="ignore") as f:
        text = f.read()
    m = re.search(r"<title>(.*?)</title>", text, re.S)
    title = re.sub(r"\s+", " ", m.group(1)).strip() if m else "?"
    print(f"=== {year} #{rank}: {title}")
    i = text.find('legacy-con">')
    if i >= 0:
        intro = text[i + len('legacy-con">') : i + 2200]
        intro = re.sub(r"<[^>]+>", " ", intro)
        intro = re.sub(r"\s+", " ", intro).strip()
        print("  INTRO:", intro[:700])
