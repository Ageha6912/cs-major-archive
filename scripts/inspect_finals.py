import re
import sys

html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
for anchor in ("Finals_scores", "Finals scores", 'id="Finals"', "Grand_final", "Grand final"):
    i = html.find(anchor)
    if i >= 0:
        seg = html[i : i + 9000]
        text = re.sub(r"<[^>]+>", "|", seg)
        text = re.sub(r"\|+", "|", text)
        text = re.sub(r"\s+", " ", text)
        print("== anchor:", anchor, "@", i)
        print(text[:3200])
        print()
