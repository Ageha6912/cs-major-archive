import json

d = json.load(open("data/top20.json", encoding="utf-8"))
for y in ("2013", "2015", "2016", "2024", "2025"):
    print("---", y)
    for e in d[y]:
        print(e["rank"], e["player"], e["team"])
