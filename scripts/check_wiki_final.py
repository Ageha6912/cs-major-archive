import re
import sys

path = sys.argv[1]
html = open(path, encoding="utf-8", errors="replace").read()
for key in ("Grand final", "Grand Final", "Final", "Bracket", "bracket"):
    j = html.find(key)
    if j >= 0:
        seg = html[j : j + 4000]
        text = re.sub(r"<[^>]+>", " ", seg)
        text = re.sub(r"\s+", " ", text)
        print(f"== {key} @ {j} ==")
        print(text[:2200])
        print()
