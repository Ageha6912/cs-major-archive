import json
import os
import re

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(root, "data", "top20_liqui.json"), encoding="utf-8") as f:
    liqui = json.load(f)

html_path = os.path.join(os.environ.get("TEMP", ""), "jetpunk.html")
with open(html_path, encoding="utf-8") as f:
    html = f.read()

blocks = re.split(r"Player \((\d{4})\)</div>", html)
jetpunk = {}
for i in range(1, len(blocks), 2):
    year = int(blocks[i])
    content = blocks[i + 1]
    rows = re.findall(
        r"<div class='h'>(\d+)</div>.*?<div class='h'>([^<]+)</div>.*?<div class='h'>(.+?)</div>",
        content,
        re.S,
    )
    entries = []
    for rank, flag, name in rows:
        entries.append(
            {
                "rank": int(rank),
                "country": flag.strip(),
                "player": re.sub(r"\s+", " ", name).replace("\u2060", "").strip(),
            }
        )
    jetpunk[year] = entries

# 2025 quiz page
html25_path = os.path.join(os.environ.get("TEMP", ""), "jetpunk2025.html")
if os.path.exists(html25_path):
    with open(html25_path, encoding="utf-8") as f:
        html25 = f.read()
    blocks25 = re.split(r"Player \((\d{4})\)</div>", html25)
    for i in range(1, len(blocks25), 2):
        year = int(blocks25[i])
        content = blocks25[i + 1]
        rows = re.findall(
            r"<div class='h'>(\d+)</div>.*?<div class='h'>([^<]+)</div>.*?<div class='h'>(.+?)</div>",
            content,
            re.S,
        )
        entries = []
        for rank, flag, name in rows:
            entries.append(
                {
                    "rank": int(rank),
                    "country": flag.strip(),
                    "player": re.sub(r"\s+", " ", name).replace("\u2060", "").strip(),
                }
            )
        jetpunk[year] = entries

FIX_TEAM = {
    (2015, 3): "Team SoloMid",
    (2015, 12): "Team SoloMid",
    (2015, 15): "Team SoloMid",
    # 2013 (year-end team per HLTV article intros)
    (2013, 8): "Fnatic",
    (2013, 16): "Astana Dragons",
    (2013, 18): "Copenhagen Wolves",
    (2013, 20): "Copenhagen Wolves",
    # 2014 (apEX ended the year on LDLC)
    (2014, 15): "Team LDLC.com",
    # 2015 (mid-year French shuffle to Team EnVyUs)
    (2015, 6): "Team EnVyUs",
    (2015, 13): "Team EnVyUs",
    (2015, 18): "Team EnVyUs",
    # 2015 allu joined NiP in August
    (2015, 19): "Ninjas in Pyjamas",
}

out = {}
for year in sorted(liqui):
    year = int(year)
    if year < 2013:
        continue
    by_rank = {e["rank"]: e for e in liqui[str(year)]}
    years = []
    source = jetpunk.get(year, [])
    if not source:
        source = [{"rank": e["rank"], "player": e["player"], "country": ""} for e in liqui[str(year)]]
    for e in source:
        li = by_rank.get(e["rank"])
        team = (li["team"] if li else "") or ""
        if (year, e["rank"]) in FIX_TEAM:
            team = FIX_TEAM[(year, e["rank"])]
        if team == "?":
            team = ""
        years.append(
            {
                "rank": e["rank"],
                "player": e["player"],
                "country": e["country"],
                "team": team,
            }
        )
    out[year] = years

with open(os.path.join(root, "data", "top20.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

for year in sorted(out):
    print(year, len(out[year]), "missing teams:", [e["rank"] for e in out[year] if not e["team"]])
