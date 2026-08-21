import json
import os
import re

html_path = os.path.join(os.environ.get("TEMP", ""), "jetpunk.html")
with open(html_path, encoding="utf-8") as f:
    html = f.read()

# Each year block starts with a header cell "Player (YYYY)".
blocks = re.split(r"Player \((\d{4})\)</div>", html)
# blocks[0] is preamble; then alternating year, content
out = {}
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
        name = re.sub(r"\s+", " ", name).replace("\u2060", "").strip()
        entries.append({"rank": int(rank), "player": name})
    out[year] = entries

with open(os.path.join(os.path.dirname(__file__), "..", "data", "top20.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

for year in sorted(out):
    print(year, len(out[year]), [e["player"] for e in out[year]])
