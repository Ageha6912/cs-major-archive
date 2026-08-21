import json

d = json.load(open("data/videos_candidates.json", encoding="utf-8"))
for mid in ("cluj2015", "dhw2014", "katowice2015", "stockholm2021", "shanghai2024"):
    print("====", mid, len(d[mid]))
    for i, v in enumerate(d[mid]):
        mins = v["length"] // 60
        secs = v["length"] % 60
        print(f'{i:2d} {v["id"]} {mins}:{secs:02d} {v["author"][:18]:18s} {v["title"][:76]}')
