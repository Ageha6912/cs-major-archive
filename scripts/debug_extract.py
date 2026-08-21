import re

import extract_final_maps2 as ex

html = open("data/wiki/PGL_Major_Antwerp_2022.html", encoding="utf-8", errors="replace").read()
champ, runner = "FaZe Clan", "Natus Vincere"
for m in re.finditer(r"scores</th>", html):
    if "FaZe Clan vs. Natus Vincere" not in html[m.start() - 200 : m.start()]:
        continue
    seg = html[m.start() : m.start() + 40000]
    stop = seg.find("Final standings")
    if stop > 0:
        seg = seg[:stop]
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", seg, re.S)
    found = []
    for row in rows:
        cells = re.findall(r"(<t[dh][^>]*>.*?</t[dh]>)", row, re.S)
        if len(cells) < 5:
            continue
        left = ex.win_values(cells[0])
        right = ex.win_values(cells[4])
        map_name = re.sub(r"<[^>]+>", "", cells[2]).strip()
        print("MAP", map_name, "L", left, "R", right)
    break
