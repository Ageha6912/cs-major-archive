import json
import re

html = open("data/wiki/PGL_Major_Antwerp_2022.html", encoding="utf-8", errors="replace").read()
i = html.find("FaZe Clan vs. Natus Vincere scores</th>")
print("i", i)
seg = html[i : i + 9000]
rows = re.findall(r"<tr[^>]*>(.*?)</tr>", seg, re.S)
print("rows", len(rows))
for row in rows[:4]:
    cells = re.findall(r"(<t[dh][^>]*>.*?</t[dh]>)", row, re.S)
    print("n cells", len(cells))
    for c in cells[:2]:
        m = re.search(r"data-mw='(.*?)'\s*>", c, re.S)
        print("  has data-mw:", bool(m), c[:60])
        if m:
            try:
                d = json.loads(m.group(1))
                print("  parts:", d.get("parts"))
            except Exception as e:
                print("  json err", e)
