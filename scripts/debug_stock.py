import json
import re

html = open("data/wiki/PGL_Major_Stockholm_2021.html", encoding="utf-8", errors="replace").read()
i = html.find("G2 Esports vs. Natus Vincere scores")
seg = html[i : i + 4200]
rows = re.findall(r"<tr[^>]*>(.*?)</tr>", seg, re.S)
for row in rows:
    cells = re.findall(r"(<t[dh][^>]*>.*?</t[dh]>)", row, re.S)
    vals = []
    for c in cells:
        m = re.search(r"data-mw='(.*?)'", c, re.S)
        if m:
            try:
                d = json.loads(m.group(1))
                v = d["parts"][1]["template"]["params"].get("1", {})
                vals.append(v.get("wt", "") if isinstance(v, dict) else v)
            except Exception:
                vals.append("?")
        else:
            vals.append(re.sub(r"<[^>]+>", "", c).strip())
    print(vals)
