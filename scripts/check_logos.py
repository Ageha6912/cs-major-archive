import os
import re

src = open("src/data.ts", encoding="utf-8").read()
block = src[src.index("export const TEAM_LOGOS") : src.index("export const EMBLEM")]
teams = re.findall(r"'([^']+)': '/logos/", block)
refs = re.findall(r": '(/logos/[^']+)'", block)
files = set(os.listdir("public/logos"))
bad = [r for r in refs if os.path.basename(r) not in files]
print("teams with logos:", len(teams))
print("bad refs:", bad)
