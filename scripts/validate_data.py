import json

majors = json.load(open("data/majors.json", encoding="utf-8"))
fm = json.load(open("data/final_maps.json", encoding="utf-8"))
top20 = json.load(open("data/top20.json", encoding="utf-8"))
vids = json.load(open("data/videos.json", encoding="utf-8"))

issues = []
for m in majors:
    mid = m["id"]
    if len(m["participants"]) != m["teams"]:
        issues.append(f"{mid}: participants {len(m['participants'])} != teams {m['teams']}")
    if not m["semifinalists"] or len(m["semifinalists"]) != 2:
        issues.append(f"{mid}: semifinalists {m['semifinalists']}")
    if not m["quarterfinalists"] or len(m["quarterfinalists"]) != 4:
        issues.append(f"{mid}: quarterfinalists {m['quarterfinalists']}")
    if not m["champion"]["roster"] or len(m["champion"]["roster"]) < 5:
        issues.append(f"{mid}: champ roster {m['champion']['roster']}")
    if not m["runnerUp"]["roster"] or len(m["runnerUp"]["roster"]) < 5:
        issues.append(f"{mid}: runner roster {m['runnerUp']['roster']}")
    if mid not in fm or not fm[mid]:
        issues.append(f"{mid}: no final maps")
    if mid not in vids or not vids[mid]:
        issues.append(f"{mid}: no videos")

for y, entries in top20.items():
    if len(entries) != 20:
        issues.append(f"top20 {y}: {len(entries)}")

print("issues:", len(issues))
for i in issues:
    print(" ", i)

cities = sorted({m["location"] for m in majors})
print("unique cities:", len(cities))
print("champions:", sorted({m["champion"]["team"] for m in majors}))
