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
        r"<tr>\s*<td[^>]*>(\d+)\s*</td>\s*<td>(.*?)</td>\s*<td>(.*?)</td>",
        content,
        re.S,
    )
    entries = []
    for rank, player_html, team_html in rows:
        m = re.search(r"<b>(.*?)</b>", player_html, re.S)
        player = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else ""
        teams = re.findall(r'<img alt="([^"]+)"', team_html)
        if not teams:
            teams = re.findall(r'title="([^"]+)"', team_html)
        entries.append(
            {
                "rank": int(rank),
                "player": player,
                "team": teams[0] if teams else "",
                "teams": teams,
            }
        )
    out[year] = entries

with open(os.path.join(os.path.dirname(__file__), "..", "data", "top20_liqui.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

for year in sorted(out):
    print(year, len(out[year]))
    for e in out[year]:
        print("  ", e["rank"], e["player"], "|", " / ".join(e["teams"]))
