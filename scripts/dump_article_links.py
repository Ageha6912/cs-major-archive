import json
import os
import re

path = os.path.join(os.environ.get("TEMP", ""), "liqui_arch.html")
with open(path, encoding="utf-8") as f:
    html = f.read()

year_blocks = re.split(r'id="(20\d\d)"', html)
out = {}
for i in range(1, len(year_blocks), 2):
    year = int(year_blocks[i])
    content = year_blocks[i + 1]
    rows = re.findall(
        r"<tr>\s*<td[^>]*>(\d+)\s*</td>\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*<td[^>]*>(.*?)</td>",
        content,
        re.S,
    )
    entries = []
    for rank, player_html, team_html, link_html in rows:
        m = re.search(r"<b>(.*?)</b>", player_html, re.S)
        player = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else ""
        link = ""
        lm = re.search(r'href="([^"]*hltv\.org[^"]*)"', link_html)
        if lm:
            link = lm.group(1)
        entries.append({"rank": int(rank), "player": player, "link": link})
    out[year] = entries

with open(os.path.join(os.path.dirname(__file__), "..", "data", "top20_links.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

for year in (2013, 2016, 2015):
    for e in out[year]:
        if e["player"] in ("GuardiaN", "dupreeh", "Xyp9x", "Magisk", "Kjaerbye", "dev1ce", "cajunb"):
            print(year, e["rank"], e["player"], e["link"])
